const GENERATION_INTERVAL_MIN = 160;
const GENERATION_INTERVAL_RANGE = 40;

const GENERATION_QUANTITY_MIN = 1;
const GENERATION_QUANTITY_RANGE = 2;

const SNOWFLAKE_LEFT_MIN = 10;
const SNOWFLAKE_LEFT_RANGE = 80;

const SNOWFLAKE_DELTA_MIN = -10;
const SNOWFLAKE_DELTA_RANGE = 20;

const SNOWFLAKE_OPACITY_MIN = 0.6;
const SNOWFLAKE_OPACITY_RANGE = 0.4;

const SNOWFLAKE_DURATION_MIN = 6;
const SNOWFLAKE_DURATION_RANGE = 1;

setInterval(function () {
    for (let i = 0; i < Math.floor(generateRandomNumber(GENERATION_QUANTITY_MIN, GENERATION_QUANTITY_RANGE)); i++)
        createSnowFlake();
}, generateRandomNumber(GENERATION_INTERVAL_MIN, GENERATION_INTERVAL_RANGE));

setTimeout(function () {
    document.body.style.backgroundColor = '#446CA2';
}, 20000);

document.getElementById('card').addEventListener('click', function (event) {
    this.style.transitionDuration = '1s';
    this.style.transform = 'rotateY(-180deg)';
    this.style.scale = 2.5;

    setTimeout(() => {
        this.style.cursor = 'default';
    }, 200);
});

setTimeout(function() {
    showSleigh();
}, 32000);

document.getElementById('play-icon').addEventListener('click', function(event) {
    this.style.display = 'none';
    let video = document.getElementById('rick-roll');

    video.style.display = 'block';
    video.play();
});

function showSleigh() {
    let sleigh = document.getElementById('sleigh');
    setTimeout(function () {
        sleigh.style.top = '-20vh';
        sleigh.style.left = '80vw';
    }, 1);
}

function generateRandomNumber(min, range) {
    return Math.random() * range + min;
}

function createSnowFlake() {
    let snowflake = document.createElement('div');

    snowflake.className = 'snowflake';
    snowflake.style.top = '-6vh';

    let leftStart = generateRandomNumber(SNOWFLAKE_LEFT_MIN, SNOWFLAKE_LEFT_RANGE);
    snowflake.style.left = leftStart + 'vw';
    let transitionDuration = generateRandomNumber(SNOWFLAKE_DURATION_MIN, SNOWFLAKE_DURATION_RANGE);
    snowflake.style.transitionDuration = transitionDuration + 's';
    snowflake.style.opacity = generateRandomNumber(SNOWFLAKE_OPACITY_MIN, SNOWFLAKE_OPACITY_RANGE);

    snowflake.innerText = '●';
    document.body.appendChild(snowflake);

    setTimeout(function () {
        snowflake.style.top = '112vh';
        snowflake.style.left = (leftStart + generateRandomNumber(SNOWFLAKE_DELTA_MIN, SNOWFLAKE_DELTA_RANGE)) + 'vw';
        setTimeout(function () {
            snowflake.remove();
        }, transitionDuration * 1000);
    }, 1);
}