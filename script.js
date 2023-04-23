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
let ac = new AudioContext(); // audio context
let volume = 0.36;
let volumeDisplayed;

let gn = ac.createGain(); // gain node
gn.gain.value = volume; // volume
gn.connect(ac.destination);

let beep; // oscillator
let signalKey = 'c'; // the key for input, the program only reacts to this key
const PAUSE = 10; // how frequently is each action performed, in milliseconds
const VOLUME_RATIO = 100; // volumeDisplayed / volume
const VOLUME_MIN = 0;
const VOLUME_MAX = 100;
const DIT_MIN = 1;

const INPUT_ELEMENT = 'input'; // name of the input element
const OUTPUT_ELEMENT = 'output'; // name of the output element
const VOLUME_ELEMENT = 'volume'; // name of the volume element
const DIT_ELEMENT = 'dit'; // name of the dit element

let dit = 4; // time length unit

// time length margin of short / long signal measured in milliseconds.
// any signal shorter than this is a short signal, any signal longer than or equal to this is a long signal
let longMargin = dit * 3;

// time length margin of space signal measured in milliseconds.
// if the key is released and the user doesn't press it within this time length, the signal will be considered as space
let spaceMargin = dit * 7;

beepInit();

function clearText() {
    document.getElementById(INPUT_ELEMENT).innerHTML = '';
    document.getElementById(OUTPUT_ELEMENT).innerHTML = '';
}

document.addEventListener('keydown', function (event) {

    keyPressed = event.key;

    if (!event.repeat && keyPressed == signalKey) {
        beepStart();
    }

    if (keyPressed == signalKey) {
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

    if (keyPressed == signalKey) {
        beepStop();
    }

    stopKeyDownTimer();

    if (keyPressed == signalKey) {
        if (!upTimerStarted) {
            startKeyUpTimer();
        }

        if (tickDown >= longMargin) {
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

    if (tickDown >= longMargin) {
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

        if (!keyUpMode && tickUp >= longMargin) {
            parseLetter();
            document.getElementById(OUTPUT_ELEMENT).innerHTML += letter;
            document.getElementById(INPUT_ELEMENT).innerHTML += ' ';
            letterMorse = '';
            keyUpMode = true;
            stopKeyUpTimer();
            startKeyUpTimer();
        } else if (keyUpMode && tickUp >= spaceMargin) {
            document.getElementById(OUTPUT_ELEMENT).innerHTML += ' ';
            document.getElementById(INPUT_ELEMENT).innerHTML += ' / ';
            keyUpMode = false;
            stopKeyUpTimer();
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

function beepInit() {
    beep = ac.createOscillator();
    beep.type = 'sine';
    beep.frequency.value = 800;
    beep.connect(gn).connect(ac.destination);
}

async function beepStart() {
    beep.start();
}

async function beepStop() {
    beep.stop();
    beepInit();
}

function displaySettings() {
    document.getElementById('settings').style.display = 'block';
    document.getElementById('open-settings').style.display = 'none';

    updateVolume();
    document.getElementById(VOLUME_ELEMENT).setAttribute('placeholder', volumeDisplayed);
    document.getElementById(DIT_ELEMENT).setAttribute('placeholder', dit);

    document.getElementById(VOLUME_ELEMENT).setAttribute('min', 0);
    document.getElementById(VOLUME_ELEMENT).setAttribute('max', 100);
    document.getElementById(VOLUME_ELEMENT).setAttribute('step', 1);
    document.getElementById(DIT_ELEMENT).setAttribute('min', 1);
}

function hideSettings() {
    document.getElementById('settings').style.display = 'none';
    document.getElementById('open-settings').style.display = 'block';
}

function updateVolume(mode) {
    if (mode) {
        volume = document.getElementById(VOLUME_ELEMENT).value / VOLUME_RATIO;
    } else {
        volumeDisplayed = volume * VOLUME_RATIO;
    }
}

function updateSettings(event) {
    event.preventDefault();
    updateVolume(true);
    dit = document.getElementById(DIT_ELEMENT).value;
    hideSettings();
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