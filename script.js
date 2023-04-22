let intervalIdDown; // id of the key down loop
let intervalIdUp; // id of the key up loop
let tickDown; // time length of key down
let tickUp; // time length of key up
let signal; // signal sent (long or short)
let letterMorse = ''; // letter sent (in morse code)
let letter; // letter sent
let keyPressed; // user key press
let upTimerStarted = false; // if key up loop has started already
let keyUpMode = false;  // false = check for letter, true = check for space
let AC; // audio context
let BEEP; // oscillator
const PAUSE = 10; // how frequently is each action performed, in milliseconds
const KEY = 'c'; // the key for input, the program only reacts to this key

const INPUT_ELEMENT = 'input'; // name of the input element
const OUTPUT_ELEMENT = 'output'; // name of the output element

// time length margin of short / long signal measured in milliseconds.
// any signal shorter than this is a short signal, any signal longer than or equal to this is a long signal
const LONG_MARGIN = 8;

// time length margin of space signal measured in milliseconds.
// if the key is released and the user doesn't press it within this time length, the signal will be considered as space
const SPACE_MARGIN = 12;

AC = new AudioContext();

beepInit();

function clearText() {
    document.getElementById(INPUT_ELEMENT).innerHTML = '';
    document.getElementById(OUTPUT_ELEMENT).innerHTML = '';
}

document.addEventListener('keydown', function (event) {

    if (!event.repeat) {
        beepStart();
    }

    keyPressed = event.key;

    if (keyPressed == KEY) {
        keyUpMode = false;
        stopKeyUpTimer();
        startKeydownTimer();
    }

});

function buttonDown() {

    beepStart();

    keyUpMode = false;
    stopKeyUpTimer();
    startKeydownTimer();

}

document.addEventListener('keyup', function () {

    beepStop();

    stopKeyDownTimer();

    if (keyPressed == KEY) {
        if (!upTimerStarted) {
            startKeyUpTimer();
        }

        if (tickDown >= LONG_MARGIN) {
            signal = '-';
        } else {
            signal = '.';
        }

        document.getElementById(INPUT_ELEMENT).innerHTML += signal;
        letterMorse += signal;
    }
});

function buttonUp() {

    beepStop();

    stopKeyDownTimer();

    if (!upTimerStarted) {
        startKeyUpTimer();
    }

    if (tickDown >= LONG_MARGIN) {
        signal = '-';
    } else {
        signal = '.';
    }

    document.getElementById(INPUT_ELEMENT).innerHTML += signal;
    letterMorse += signal;
}

function startKeydownTimer() {
    tickDown = 0;
    intervalIdDown = setInterval(function () {
        tickDown++;
    }, PAUSE);
}

function stopKeyDownTimer() {
    clearInterval(intervalIdDown);
}

function startKeyUpTimer() {
    upTimerStarted = true;

    tickUp = 0;

    intervalIdUp = setInterval(function () {
        tickUp++;

        if (tickUp >= SPACE_MARGIN) {

            if (!keyUpMode) {
                parseLetter();
                document.getElementById(OUTPUT_ELEMENT).innerHTML += letter;
                document.getElementById(INPUT_ELEMENT).innerHTML += ' ';
                letterMorse = '';
                keyUpMode = true;
                stopKeyUpTimer();
                startKeyUpTimer();
            } else {
                document.getElementById(OUTPUT_ELEMENT).innerHTML += ' ';
                document.getElementById(INPUT_ELEMENT).innerHTML += ' / ';
                keyUpMode = false;
                stopKeyUpTimer();
            }
        }

    }, PAUSE);
}

function parseLetter() {
    letter = MORSE[letterMorse];

    if (typeof letter == 'undefined') {
        letter = '*';
    }
}

function stopKeyUpTimer() {
    clearInterval(intervalIdUp);
    upTimerStarted = false;
}

function beepInit () {
    BEEP = AC.createOscillator();
    BEEP.type = 'sine';
    BEEP.frequency.value = 800;
    BEEP.connect(AC.destination);    
}

async function beepStart() {
    BEEP.start();
}

async function beepStop() {
    BEEP.stop();
    beepInit();
    // BEEP = AC.createOscillator();
    // BEEP.type = 'sine';
    // BEEP.frequency.value = 800;
    // BEEP.connect(AC.destination);
}

const MORSE = {
    '.-': 'A',
    '-...': 'B',
    '-.-.': 'C',
    '-..': 'D',
    '.': 'E',
    '..-.': 'F',
    '--.': 'G',
    '....': 'H',
    '..': 'I',
    '.---': 'J',
    '-.-': 'K',
    '.-..': 'L',
    '--': 'M',
    '-.': 'N',
    '---': 'O',
    '.--.': 'P',
    '--.-': 'Q',
    '.-.': 'R',
    '...': 'S',
    '-': 'T',
    '..-': 'U',
    '...-': 'V',
    '.--': 'W',
    '-..-': 'X',
    '-.--': 'Y',
    '--..': 'Z',
    '.----': '1',
    '..---': '2',
    '...--': '3',
    '....-': '4',
    '.....': '5',
    '-....': '6',
    '--...': '7',
    '---..': '8',
    '----.': '9',
    '-----': '0',
    '.-.-.-': '.',
    '--..--': ',',
    '..--..': '?',
    '.----.': '\'',
    '.-..-.': '\"',
    '-.-.--': '!',
    '-..-.': '/',
    '---...': ':',
    '-.-.-.': ';',
    '-.--.': '(',
    '-.--.-': ')',
    '-...-': '=',
    '-....-': '-',
    '..--.-': '_',
    '.-.-.': '+',
    '.--.-.': '@'
};