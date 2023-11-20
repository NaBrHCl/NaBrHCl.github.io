const HTML_BOARD = document.getElementById('tic-tac-toe');
const ELEMENT_TAG = 'div';
const CELL_CLASS_NAME = 'spot';

let urlParams = new URLSearchParams(window.location.search);

let gameMode = urlParams.get('mode');

drawBoard(HTML_BOARD);

let cells = document.getElementsByClassName(CELL_CLASS_NAME);
let statusDisplayer = document.getElementById('turn-or-result');
let calculationDisplayer = document.getElementById('count-calculations');

let board = new Board(cells, gameMode, statusDisplayer, calculationDisplayer);

function drawBoard(root) {
    for (let i = 0; i < Board.COUNT_SPOTS; i++) {
        let cell = document.createElement(ELEMENT_TAG);

        cell.className = CELL_CLASS_NAME;

        root.appendChild(cell);
    }
}