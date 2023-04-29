let signal; // signal sent (long or short)
let letterMorse = ''; // letter sent (in morse code)
let letter; // letter sent
let keyPressed; // user key press
let keyUpMode = false;  // false = check for letter, true = check for space
let ac = new AudioContext(); // audio context
let volume = 0.36; // audio volume
let volumeDisplayed; // volumeDisplayed is converted from the actual volume, it gets displayed on the webpage
let letterRecord = ''; // record of current input word in letter
let morseRecord = ''; // record of current input word in morse code
let letterRecords = []; // record of input words in letter
let morseRecords = []; // record of input words in morse code

let easterEggPlayed = false; // easter egg will only play once
let amongUsPos = 0; // position of among us picture
let easterEggIteration = 0;
let intervalEasterEgg;
const EASTER_EGG_TEXT = ['AMONGUS', 'AMOGUS']; // if any of 
const sus = new Audio('./assets/among-us-role-reveal.mp3');

let gn = ac.createGain(); // gain node
gn.gain.value = volume; // volume
gn.connect(ac.destination);

let beep; // oscillator
let signalKey = 'c'; // the key for input, the program only reacts to this key
let signalKeyText = 'KeyC'; // what the signal key is called, in plain text
let signalKeyChosen; // the key for input that the user changes to in settings
const VOLUME_RATIO = 100; // volumeDisplayed / volume
const VOLUME_MIN = 0;
const VOLUME_MAX = 100;
const DIT_MIN = 1;

// elements that will be set once the body element loads

let dit = 4; // time length unit

// time length margin of short / long signal measured in milliseconds.
// any signal shorter than this is a short signal, any signal longer than or equal to this is a long signal
let longMargin = dit * 3;

// time length margin of space signal measured in milliseconds.
// if the key is released and the user doesn't press it within this time length, the signal will be considered as space
let spaceMargin = dit * 7;

beepInit();

let wholeList;
let eachLine;

const preventDefaultKeys = [' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']; // if any of these keys is the signal key, when it's pressed, the page won't move

const tick = {

    keyUp: {
        value: 0,
        intervalId: 0,
        timerStarted: false,
        startTimer: function () {
            this.value = 0;

            this.intervalId = setInterval(function () {
                tick.keyUp.value++;

                if (!keyUpMode && tick.keyUp.value >= longMargin) {

                    parseLetter();
                    OUTPUT_ELEMENT.innerHTML += letter;

                    letterRecord += letter;
                    morseRecord += ' ';
                    INPUT_ELEMENT.innerHTML += ' ';
                    letterMorse = '';
                    keyUpMode = true;

                    tick.keyUp.stopTimer();
                    tick.keyUp.startTimer();

                } else if (keyUpMode && tick.keyUp.value >= spaceMargin) {

                    OUTPUT_ELEMENT.innerHTML += ' ';
                    INPUT_ELEMENT.innerHTML += ' / ';
                    keyUpMode = false;

                    if (!easterEggPlayed) {
                        EASTER_EGG_TEXT.forEach(function (EASTER_EGG_STRING) {
                            if (letterRecord == EASTER_EGG_STRING) {
                                sus.play();
                                easterEggPlayed = true;
                                AMONG_US_ELEMENT.style.display = 'block';
                                intervalEasterEgg = setInterval(function () {
                                    amongUsPos += 2;
                                    AMONG_US_ELEMENT.style.left = amongUsPos + 'vw';
                                    easterEggIteration++;
                                    if (easterEggIteration == 50) {
                                        clearInterval(intervalEasterEgg);
                                        AMONG_US_ELEMENT.style.display = 'none';
                                    }
                                }, tick.LENGTH);
                            }
                        });
                    }

                    letterRecords.push(letterRecord);
                    letterRecord = '';
                    morseRecord = morseRecord.slice(0, -1);
                    morseRecords.push(morseRecord);
                    morseRecord = '';

                    tick.keyUp.stopTimer();
                }

            }, tick.LENGTH);

            this.timerStarted = true;

        },
        stopTimer: function () {
            clearInterval(this.intervalId);
            this.timerStarted = false;
        }
    },

    keyDown: {
        value: 0,
        intervalId: 0,
        timerStarted: false,
        startTimer: function () {
            this.value = 0;
            this.intervalId = setInterval(function () {
                tick.keyDown.value ++;
            }, tick.LENGTH);
            this.timerStarted = true;
        },
        stopTimer: function () {
            clearInterval(this.intervalId);
            this.timerStarted = false;
        }

    },

    LENGTH: 10 // how frequently is each action performed, in milliseconds
}

function initialise() {
    INPUT_ELEMENT = document.getElementById('input');
    OUTPUT_ELEMENT = document.getElementById('output');
    VOLUME_ELEMENT = document.getElementById('volume');
    DIT_ELEMENT = document.getElementById('dit');
    SIGNAL_KEY_ELEMENT = document.getElementById('signal-key');
    SETTINGS_ELEMENT = document.getElementById('settings');
    OPEN_SETTINGS_ELEMENT = document.getElementById('open-settings');
    INSTRUCTIONS_ELEMENT = document.getElementById('instructions');
    CHART_ELEMENT = document.getElementById('chart');
    LIST_LEFT_ELEMENT = document.getElementById('list-left');
    LIST_RIGHT_ELEMENT = document.getElementById('list-right');

    AMONG_US_ELEMENT = document.getElementById('among-us');

    let morseCode = Object.keys(MORSE);
    let morseLetter = Object.values(MORSE);
    let linePos;
    let eachLine;

    for (let i = 0; i < morseCode.length; i++) {
        if (i == 0) {
            linePos = document.getElementById('list-left-A');
        } else if (i == morseCode.length / 4) {
            linePos = document.getElementById('list-right-A');
        } else if (i == morseCode.length / 2) {
            linePos = document.getElementById('list-left-B');
        } else if (i == morseCode.length * 3 / 4) {
            linePos = document.getElementById('list-right-B');
        }

        eachLine = document.createElement('div');
        eachLine.textContent = morseLetter[i] + '  ' + morseCode[i];
        linePos.appendChild(eachLine);
    }

    showHideChart();
}

function clearText() {
    INPUT_ELEMENT.innerHTML = '';
    OUTPUT_ELEMENT.innerHTML = '';
}

document.addEventListener('keydown', function (event) {

    keyPressed = event.key;

    for (let i = 0; i < preventDefaultKeys.length; i++) {
        if (signalKey == preventDefaultKeys[i] && keyPressed == preventDefaultKeys[i]) {
            event.preventDefault();
        }
    }

    if (document.activeElement == SIGNAL_KEY_ELEMENT) {
        event.preventDefault();
        signalKeyChosen = keyPressed;
        signalKeyText = event.code;
        SIGNAL_KEY_ELEMENT.value = event.code;
    }

    if (!event.repeat && keyPressed == signalKey) {
        beepStart();
    }

    if (keyPressed == signalKey) {
        keyUpMode = false;
        tick.keyUp.stopTimer();
        if (!tick.keyDown.timerStarted) {
            tick.keyDown.startTimer();
        }
    }
});

function buttonDown() {

    beepStart();

    keyUpMode = false;
    tick.keyUp.stopTimer();
    tick.keyDown.startTimer();
}

document.addEventListener('keyup', function () {

    if (keyPressed == signalKey) {
        beepStop();
    }

    tick.keyDown.stopTimer();

    if (keyPressed == signalKey) {
        if (!tick.keyUp.timerStarted) {
            tick.keyUp.startTimer();
        }

        if (tick.keyDown.value >= longMargin) {
            signal = '-';
        } else {
            signal = '.';
        }

        INPUT_ELEMENT.innerHTML += signal;
        morseRecord += signal;
        letterMorse += signal;
    }
});

function buttonUp() {

    beepStop();

    keyDown.stopTimer();

    if (!tick.keyUp.timerStarted) {
        tick.keyUp.startTimer();
    }

    if (tick.keyDown.value >= longMargin) {
        signal = '-';
    } else {
        signal = '.';
    }

    INPUT_ELEMENT.innerHTML += signal;
    letterMorse += signal;
    morseRecord += signal;
}

function backspace() {
    INPUT_ELEMENT.innerHTML = INPUT_ELEMENT.innerHTML.slice(0, -morseRecords[morseRecords.length - 1].length - 4);
    morseRecords.pop();
    OUTPUT_ELEMENT.innerHTML = OUTPUT_ELEMENT.innerHTML.slice(0, -letterRecords[letterRecords.length - 1].length - 1);
    letterRecords.pop();
}

function parseLetter() {
    letter = MORSE[letterMorse];

    if (typeof letter == 'undefined') {
        letter = '*';
    }
}

function beepInit() {
    beep = ac.createOscillator();
    beep.type = 'sine';
    beep.frequency.value = 800;
    gn.gain.value = volume;
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
    SETTINGS_ELEMENT.style.display = 'block';
    OPEN_SETTINGS_ELEMENT.style.display = 'none';

    updateVolume();
    VOLUME_ELEMENT.value = volumeDisplayed;
    DIT_ELEMENT.value = dit;
    SIGNAL_KEY_ELEMENT.value = signalKeyText;

    VOLUME_ELEMENT.setAttribute('min', 0);
    VOLUME_ELEMENT.setAttribute('max', 100);
    VOLUME_ELEMENT.setAttribute('step', 1);
    DIT_ELEMENT.setAttribute('min', 1);

    signalKeyChosen = signalKey;
}

function hideSettings() {
    SETTINGS_ELEMENT.style.display = 'none';
    OPEN_SETTINGS_ELEMENT.style.display = 'block';
}

function updateVolume(mode) {
    if (mode) {
        volume = VOLUME_ELEMENT.value / VOLUME_RATIO;
    } else {
        volumeDisplayed = volume * VOLUME_RATIO;
    }
}

function updateSettings(event) {
    event.preventDefault();
    updateVolume(true);
    beepInit();
    dit = DIT_ELEMENT.value;
    longMargin = dit * 3;
    spaceMargin = dit * 7;

    signalKey = signalKeyChosen;

    showHideChart();

    INSTRUCTIONS_ELEMENT.innerHTML = 'Instructions: Press ' + signalKeyText + ' or the button below to send signal';
    hideSettings();
}

function showHideChart() {
    if (CHART_ELEMENT.checked) {
        LIST_LEFT_ELEMENT.style.visibility = 'visible';
        LIST_RIGHT_ELEMENT.style.visibility = 'visible';
    } else {
        LIST_LEFT_ELEMENT.style.visibility = 'hidden';
        LIST_RIGHT_ELEMENT.style.visibility = 'hidden';
    }
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