let intervalIdDown; // id of the key down loop
let intervalIdUp; // id of the key up loop
let tickDown; // time length of key down
let tickUp; // time length of key up
let signal; // signal sent (long or short)
let keyPressed; // user key press
let upTimerStarted = false; // if key up loop has started already
const PAUSE = 10; // how frequently is each action performed, in milliseconds
const KEY = 'c'; // the key for input, the program only reacts to this key

// time length margin of short / long signal measured in milliseconds.
// any signal shorter than this is a short signal, any signal longer than or equal to this is a long signal
const LONG_MARGIN = 12;

// time length margin of space signal measured in milliseconds.
// if the key is released and the user doesn't press it within this time length, the signal will be considered as space
const SPACE_MARGIN = 12;

document.addEventListener('keydown', function (event) {
    keyPressed = event.key;

    if (keyPressed == KEY) {
        stopKeyUpTimer();
        startKeydownTimer();
    }
});

document.addEventListener('keyup', function () {

    stopKeyDownTimer();

    if (keyPressed == KEY) {
        if (!upTimerStarted) {
            startKeyUpTimer();
        }

        if (tickDown >= LONG_MARGIN) {
            signal = '_';
        } else {
            signal = '.';
        }

        document.getElementById('signal').innerHTML += signal;
    }
});

function startKeydownTimer() {
    tickDown = 0;
    intervalIdDown = setInterval(function () {
        tickDown++;
    }, PAUSE);
}

function stopKeyDownTimer() {
    clearInterval(intervalIdDown);
    console.log('key held down for ' + tickDown + ' ticks');
}

function startKeyUpTimer() {
    upTimerStarted = true;

    tickUp = 0;

    intervalIdUp = setInterval(function () {
        tickUp++;

        if (tickUp >= SPACE_MARGIN) {
            document.getElementById('signal').innerHTML += ' / ';
            stopKeyUpTimer();
        }

    }, PAUSE);
}

function stopKeyUpTimer() {
    clearInterval(intervalIdUp);
    upTimerStarted = false;
}