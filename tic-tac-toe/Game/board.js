const SIDE_LENGTH = 3;
const COUNT_SPOTS = SIDE_LENGTH ** 2;

const PLAYERS = ['⨉', '○'];
const PLAYER_NAMES = [];

const INCREMENTS = [1, 3, 2, 4];
const STARTS = [[0, 3, 6], [0, 1, 2], [2], [0]];

class Board {
    static get SIDE_LENGTH() {
        return SIDE_LENGTH;
    }

    static get COUNT_SPOTS() {
        return COUNT_SPOTS;
    }

    constructor(spotElements, mode, statusDisplayer, calculationDisplayer) {
        this.spots = [];

        for (let i = 0; i < COUNT_SPOTS; i++)
            this.spots.push(undefined);

        this.spotElements = Array.from(spotElements);

        this.spotCallbacks = [];

        for (let i = 0; i < this.spotElements.length; i++) {
            let spotCallback = (mode === 'PVP') ? this.getSpotCallback(i) : this.getComputerSpotCallback(i);

            this.spotCallbacks.push(spotCallback);

            this.spotElements[i].addEventListener('click', spotCallback);
        }

        this.currentPlayer = 0;
        this.computerFirst;

        switch (mode) {
            case 'PVP':
                PLAYER_NAMES.push('Player 1');
                PLAYER_NAMES.push('Player 2');
                break;
            case 'PVE':
                PLAYER_NAMES.push('Player');
                PLAYER_NAMES.push('Computer');
                this.computerFirst = false;
                break;
            case 'EVP':
                PLAYER_NAMES.push('Computer');
                PLAYER_NAMES.push('Player');
                this.computerFirst = true;
                break;
        }

        this.statusDisplayer = statusDisplayer;

        if (mode === 'PVP')
            calculationDisplayer.style.display = 'none';
        else {
            this.calculationDisplayer = calculationDisplayer;
            this.numberCalculations = 0;
        }

        if (this.computerFirst)
            this.makeComputerMove();

        this.displayCurrentPlayer();
    }

    getSpotCallback(index) {
        return () => {
            this.placeAtIndex(index);

            this.spotElements[index].removeEventListener('click', this.spotCallbacks[index]);
        }
    }

    getComputerSpotCallback(index) {
        return () => {

            if (!this.placeAtIndex(index)) {
                this.makeComputerMove();
            }


            this.spotElements[index].removeEventListener('click', this.spotCallbacks[index]);
        }
    }

    makeComputerMove() {
        this.numberCalculations = 0;

        this.placeAtIndex(this.getOptimalMove(true, true));

        this.calculationDisplayer.innerHTML = `Calculated<br>${this.numberCalculations} cases`;
    }

    placeAtIndex(index) {
        this.spotElements[index].style.cursor = 'default';

        this.spots[index] = this.currentPlayer;

        this.changeCurrentPlayer();

        this.displayCurrentPlayer();

        this.updateSpot(index);

        let result = this.checkWin();

        if (result !== undefined) {
            this.removeAllEventListener();

            this.displayFinalState(result);

            return true;
        }

        return false;
    }

    displayCurrentPlayer() {
        this.statusDisplayer.innerText = PLAYER_NAMES[this.currentPlayer] + '\'s Turn';
    }

    displayFinalState(result) {
        switch (result) {
            case -1:
                this.statusDisplayer.innerText = 'Draw';
                break;
            default:
                this.statusDisplayer.innerText = PLAYER_NAMES[result] + ' Won';
                break;
        }
    }

    removeAllEventListener() {
        for (let i = 0; i < this.spots.length; i++) {
            if (this.spots[i] === undefined) {
                this.spotElements[i].removeEventListener('click', this.spotCallbacks[i]);
                this.spotElements[i].style.cursor = 'default';
            }
        }
    }

    changeCurrentPlayer() {
        this.currentPlayer = (this.currentPlayer === 0) ? 1 : 0;
    }

    updateSpot(index) {
        this.spotElements[index].innerHTML = PLAYERS[this.spots[index]];
    }

    checkWin() {
        let hasEmptySpot = false;

        for (let i = 0; i < INCREMENTS.length; i++) { // for each direction (row, column, diagonal)
            for (let j = 0; j < STARTS[i].length; j++) { // for each starting position
                let player1Win = true;
                let player2Win = true;

                for (let k = 0; k < SIDE_LENGTH; k++) { // for each spot on the line
                    let spot = this.spots[STARTS[i][j] + k * INCREMENTS[i]];

                    if (spot === undefined) {
                        player1Win = false;
                        player2Win = false;
                        hasEmptySpot = true;
                        break;
                    }

                    if (spot === 0)
                        player2Win = false;
                    else
                        player1Win = false;
                }

                if (player1Win)
                    return 0;

                if (player2Win)
                    return 1;
            }
        }

        if (hasEmptySpot) // not finished
            return undefined;

        return -1; // draw
    }

    getOptimalMove(isFirstLayer, isComputer) {
        this.numberCalculations++;

        if (!isFirstLayer) {
            let result = this.checkWin();

            if (result !== undefined) {
                if (result === -1)
                    return 0;

                return ((result === 0) === this.computerFirst) ? 1 : -1;
            }
        }

        let bestScore;
        let bestIndex;

        for (let i = 0; i < this.spots.length; i++) {
            if (this.spots[i] === undefined) {
                this.spots[i] = (isComputer === this.computerFirst) ? 0 : 1;
                bestScore = this.getOptimalMove(false, !isComputer);
                this.spots[i] = undefined;

                bestIndex = i;
                break;
            }
        }

        for (let i = bestIndex + 1; i < this.spots.length; i++) {
            if (this.spots[i] === undefined) {
                this.spots[i] = (isComputer === this.computerFirst) ? 0 : 1;
                let score = this.getOptimalMove(false, !isComputer);
                this.spots[i] = undefined;

                let isNewBest = (isComputer) ? (score > bestScore) : (score < bestScore);

                if (isNewBest) {
                    bestScore = score;
                    bestIndex = i;
                }
            }
        }

        return (isFirstLayer) ? bestIndex : bestScore;
    }
}