let signal; // signal sent (long or short)
let letterMorse = ''; // letter sent (in morse code)
let letter; // letter sent
let keyPressed; // user key press
let spaceOrChar = false;  // false = check for character, true = check for space
let ac = new AudioContext(); // audio context
let volume = 0.36; // audio volume
let volumeDisplayed; // volumeDisplayed is converted from the actual volume, it gets displayed on the webpage
let letterRecord = ''; // record of current input word in letter
let morseRecord = ''; // record of current input word in morse code
let letterRecords = []; // record of input words in letter
let morseRecords = []; // record of input words in morse code
let keybindModified; // check if keybind is changed after the settings pannel is open

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
const INSTRUCTIONS_TEXT = 'Instructions: Press SIGNAL_KEY or the button below to send signal';

// elements that will be set once the body element loads

beepInit();

let wholeList;
let eachLine;

const preventDefaultKeys = [' ', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown']; // if any of these keys is the signal key, when it's pressed, the page won't move

// ================================================================================================================================
// Objects

const tick = {

    keyUp: {
        value: 0,
        intervalId: null,
        timerStarted: false,

        startTimer: function () {
            this.value = 0;

            this.intervalId = setInterval(function () {

                tick.keyUp.value++;

                if (!spaceOrChar && tick.keyUp.value >= dit.long) {

                    parseLetter();
                    printSpaceChar();

                    recordChar();

                    letterMorse = '';
                    spaceOrChar = true;

                    tick.keyUp.stopTimer();
                    tick.keyUp.startTimer();

                } else if (spaceOrChar && tick.keyUp.value >= dit.space) {

                    printSpaceWord();
                    spaceOrChar = false;

                    if (!easterEgg.played && easterEgg.keywordFound()) {
                        easterEgg.play();
                    }

                    recordWord();

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
        intervalId: null,
        timerStarted: false,

        startTimer: function () {
            this.value = 0;
            this.intervalId = setInterval(function () {
                tick.keyDown.value++;
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



const dit = {

    value: 4,
    long: null,
    space: null,

    update: function () {
        this.long = this.value * this.TO_LONG;
        this.space = this.value * this.TO_SPACE;
    },

    MIN: 1,
    TO_LONG: 3,
    TO_SPACE: 7
}



const easterEgg = {

    played: false,

    keywordFound: function () {
        return (this.KEYWORDS.includes(letterRecord));
    },

    play: function () {
        this.played = true;
        this.SFX.play();
        this.crewmate.display();

    },

    crewmate: {
        pos: 0,
        intervalId: null,
        i: 0,

        display: function () {
            AMONG_US_ELEMENT.style.display = 'block';

            this.intervalId = setInterval(function () {

                easterEgg.crewmate.pos += easterEgg.crewmate.POS_INCREMENT;
                AMONG_US_ELEMENT.style.left = easterEgg.crewmate.pos + easterEgg.crewmate.POS_UNIT;
                easterEgg.crewmate.i++;

                if (easterEgg.crewmate.i == easterEgg.crewmate.ITERATION_MAX) {
                    AMONG_US_ELEMENT.style.display = 'none';
                    clearInterval(easterEgg.crewmate.intervalId);
                }

            }, tick.LENGTH);

        },

        POS_UNIT: 'vw',
        POS_INCREMENT: 2,
        ITERATION_MAX: 50,
    },

    SFX: new Audio('./assets/among-us-role-reveal.mp3'),
    KEYWORDS: ['AMONGUS', 'AMOGUS']
}

// ================================================================================================================================
// Key Press

document.addEventListener('keydown', function (event) {

    keyPressed = event.key;

    preventPageScrolling(event);

    // if the pointer is focused on the keybind box in settings
    if (document.activeElement == SIGNAL_KEY_ELEMENT) {
        console.log(keybindModified);
        if (keyPressed == 'Enter' && keybindModified) {
            updateSettings(event);
        } else {
            keybindModified = true;
            changeKeyBind(event);
        }
    }

    if (keyPressed == signalKey) {

        if (!event.repeat) {
            beepStart();
        }

        spaceOrChar = false;
        tick.keyUp.stopTimer();
        if (!tick.keyDown.timerStarted) {
            tick.keyDown.startTimer();
        }
    }
});

function buttonDown() {

    beepStart();

    spaceOrChar = false;

    tick.keyUp.stopTimer();
    tick.keyDown.startTimer();
}

document.addEventListener('keyup', function () {

    if (keyPressed == signalKey) {
        tick.keyDown.stopTimer();

        beepStop();

        if (!tick.keyUp.timerStarted) {
            tick.keyUp.startTimer();
        }

        setSignal();
        recordSignal();
    }
});

function buttonUp() {

    tick.keyDown.stopTimer();

    beepStop();

    if (!tick.keyUp.timerStarted) {
        tick.keyUp.startTimer();
    }

    setSignal();
    recordSignal();
}


// ================================================================================================================================
// Functions

function initialise() {
    assignElements();
    populateMorseChart();
    showHideChart();
    dit.update();

    INSTRUCTIONS_ELEMENT.innerHTML = INSTRUCTIONS_TEXT.replace('SIGNAL_KEY', signalKeyText);
}

function assignElements() {
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
}

function populateMorseChart() {
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
}

function clearText() {
    INPUT_ELEMENT.innerHTML = '';
    OUTPUT_ELEMENT.innerHTML = '';
}

function printSpaceChar() {
    INPUT_ELEMENT.innerHTML += ' ';
    OUTPUT_ELEMENT.innerHTML += letter;
}

function printSpaceWord() {
    INPUT_ELEMENT.innerHTML += ' / ';
    OUTPUT_ELEMENT.innerHTML += ' ';
}

function recordChar() {
    letterRecord += letter;
    morseRecord += ' ';
}

function recordWord() {
    letterRecords.push(letterRecord);
    letterRecord = '';

    morseRecord = morseRecord.slice(0, -1);
    morseRecords.push(morseRecord);
    morseRecord = '';
}

function setSignal() {
    if (tick.keyDown.value >= dit.long) {
        signal = '-';
    } else {
        signal = '.';
    }
}

function recordSignal() {
    INPUT_ELEMENT.innerHTML += signal;
    letterMorse += signal;
    morseRecord += signal;
}

function preventPageScrolling(event) {
    for (let i = 0; i < preventDefaultKeys.length; i++) {
        if (signalKey == preventDefaultKeys[i] && keyPressed == preventDefaultKeys[i]) {
            event.preventDefault();
        }
    }
}

function changeKeyBind(event) {
    event.preventDefault();
    signalKeyChosen = keyPressed;
    signalKeyText = event.code;
    SIGNAL_KEY_ELEMENT.value = event.code;
}

function backspace() {
    if (letterRecords.length != 0) {
        INPUT_ELEMENT.innerHTML = INPUT_ELEMENT.innerHTML.slice(0, -morseRecords[morseRecords.length - 1].length - 4);
        morseRecords.pop();
        OUTPUT_ELEMENT.innerHTML = OUTPUT_ELEMENT.innerHTML.slice(0, -letterRecords[letterRecords.length - 1].length - 1);
        letterRecords.pop();
    }
}

function parseLetter() {
    letter = MORSE[letterMorse];

    if (letter === undefined) {
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
    // show settings pannel
    SETTINGS_ELEMENT.style.display = 'block';
    OPEN_SETTINGS_ELEMENT.style.display = 'none';

    // show current property values
    updateVolume();
    VOLUME_ELEMENT.value = volumeDisplayed;
    DIT_ELEMENT.value = dit.value;
    SIGNAL_KEY_ELEMENT.value = signalKeyText;

    // set input attributes
    VOLUME_ELEMENT.setAttribute('min', VOLUME_MIN);
    VOLUME_ELEMENT.setAttribute('max', VOLUME_MAX);
    VOLUME_ELEMENT.setAttribute('step', 1);
    DIT_ELEMENT.setAttribute('min', dit.MIN);

    keybindModified = false;
}

function hideSettings() {
    SETTINGS_ELEMENT.style.display = 'none';
    OPEN_SETTINGS_ELEMENT.style.display = 'block';
}

function updateVolume(mode) {
    if (mode) {
        volume = VOLUME_ELEMENT.value / VOLUME_RATIO; // update actual volume
    } else { // update displayed volume
        volumeDisplayed = volume * VOLUME_RATIO;
    }
}

function updateSettings(event) {
    event.preventDefault();

    // update volume
    updateVolume(true);
    beepInit();

    // update dit
    dit.value = DIT_ELEMENT.value;
    dit.long = dit.value * dit.TO_LONG;
    dit.space = dit.value * dit.TO_SPACE;

    // update signal key
    if (signalKeyChosen !== undefined) {
        signalKey = signalKeyChosen;
    }

    // update morse chart
    showHideChart();

    // update instructions
    INSTRUCTIONS_ELEMENT.innerHTML = INSTRUCTIONS_TEXT.replace('SIGNAL_KEY', signalKeyText);

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

// ================================================================================================================================
// Morse to Letter Chart

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