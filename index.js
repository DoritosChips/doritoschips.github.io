const MAIN_COLOR = '#52B8FE';
const BG_COLOR = '#1E1E1E';
const bombImage = document.getElementById('bomb');
const flagImage = document.getElementById('flag');
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const newGameButton = document.getElementById('newGameButton');
const resumeButton = document.getElementById('resumeButton');
const menuButton = document.getElementById('menuButton');
const restartButton = document.getElementById('restartButton');
const leftArrow = document.getElementById('leftArrow');
const rightArrow = document.getElementById('rightArrow');
const sizeText = document.getElementById('size');
const timeText = document.getElementById('time');
const gameOverHeader = document.getElementById('gameOverHeader');
const okButton = document.getElementById('okButton');
const SIZES_NAMES = ['Small', 'Medium', 'Large']
const SIZES = [10, 16, 20]
let SIZE;
let GRID_SIZE;
let sizeIndex = 0;
let interval;
let seconds;
let tens;
let minutes;

let canvas, ctx;
let field, visibleField, taggedField, handledField;
let gameOver;
let gameStarted = false;
let gameInitialized = false;

CanvasRenderingContext2D.prototype.fillRoundRect = function (x, y, width, height, radius, corners) {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    this.beginPath();
    this.moveTo(x + radius, y);
    if (corners[0]) {
        this.arcTo(x + width, y, x + width, y + height, radius);
    }
    else {
        this.lineTo(x + width, y);
    }
    if (corners[1]) {
        this.arcTo(x + width, y + height, x, y + height, radius);
    }
    else {
        this.lineTo(x + width, y + width);
    }
    if (corners[2]) {
        this.arcTo(x, y + height, x, y, radius);
    }
    else {
        this.lineTo(x, y + width);
    }
    if (corners[3]) {
        this.arcTo(x, y, x + width, y, radius);
    }
    else {
        this.lineTo(x, y);
    }
    this.closePath();
    this.fill();
}

function drawField() {
    if (!gameStarted) {
        ctx.fillStyle = MAIN_COLOR;
        ctx.fillRoundRect(0, 0, canvas.width, canvas.height, GRID_SIZE / 8, [true, true, true, true]);
        return;
    }

    ctx.fillStyle = BG_COLOR;
    ctx.fillRoundRect(0, 0, canvas.width, canvas.height, GRID_SIZE / 8, [true, true, true, true]);

    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            let cornersToRound = [false, false, false, false];
            let cornersNotToRect = [false, false, false, false];
            if (!visibleField[[x, y]]) {
                if ((visibleField[[x + 1, y]] || !field[[x + 1, y]])  && (visibleField[[x, y - 1]] || !field[[x, y - 1]])) {
                    cornersToRound[0] = true;
                }
                if ((visibleField[[x + 1, y]] || !field[[x + 1, y]])  && (visibleField[[x, y + 1]] || !field[[x, y + 1]])) {
                    cornersToRound[1] = true;
                }
                if ((visibleField[[x - 1, y]] || !field[[x - 1, y]])  && (visibleField[[x, y + 1]] || !field[[x, y + 1]])) {
                    cornersToRound[2] = true;
                }
                if ((visibleField[[x - 1, y]] || !field[[x - 1, y]])  && (visibleField[[x, y - 1]] || !field[[x, y - 1]])) {
                    cornersToRound[3] = true;
                }

                ctx.fillStyle = BG_COLOR;
                ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
                ctx.fillStyle = MAIN_COLOR;
                ctx.fillRoundRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE, GRID_SIZE / 8, cornersToRound);
            } else if (!taggedField[[x, y]]){
                if (!visibleField[[x + 1, y]]  && !visibleField[[x, y - 1]]) {
                    cornersToRound[0] = true;
                }
                if (!visibleField[[x + 1, y]]  && !visibleField[[x, y + 1]]) {
                    cornersToRound[1] = true;
                }
                if (!visibleField[[x - 1, y]]  && !visibleField[[x, y + 1]]) {
                    cornersToRound[2] = true;
                }
                if (!visibleField[[x - 1, y]]  && !visibleField[[x, y - 1]]) {
                    cornersToRound[3] = true;
                }

                cornersNotToRect[0] = visibleField[[x + 1, y - 1]] || !field[[x + 1, y - 1]];
                cornersNotToRect[1] = visibleField[[x + 1, y + 1]] || !field[[x + 1, y + 1]];
                cornersNotToRect[2] = visibleField[[x - 1, y + 1]] || !field[[x - 1, y + 1]];
                cornersNotToRect[3] = visibleField[[x - 1, y - 1]] || !field[[x - 1, y - 1]];

                ctx.fillStyle = MAIN_COLOR;
                ctx.fillRoundRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE, GRID_SIZE / 8, cornersNotToRect);
                ctx.fillStyle = BG_COLOR;
                ctx.fillRoundRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE, GRID_SIZE / 8 - 1, cornersToRound);
            }
            if (taggedField[[x, y]]) {
                ctx.fillStyle = 'grey';
                ctx.fillRoundRect(x * GRID_SIZE + (GRID_SIZE * 0.1), y * GRID_SIZE + (GRID_SIZE * 0.1), GRID_SIZE * 0.8, GRID_SIZE * 0.8, GRID_SIZE / 8 - 1, [true, true, true, true]);
                if (!(gameOver && field[[x, y]] === 'M')) {
                    ctx.drawImage(flagImage, x * GRID_SIZE + (GRID_SIZE * 0.25), y * GRID_SIZE + (GRID_SIZE * 0.25), GRID_SIZE * 0.5, GRID_SIZE * 0.5);
                }
            }

            if (field[[x, y]] === 'M') {
                if (visibleField[[x, y]]) {
                    ctx.fillStyle = 'red';
                    ctx.fillRoundRect(x * GRID_SIZE + (GRID_SIZE * 0.1), y * GRID_SIZE + (GRID_SIZE * 0.1), GRID_SIZE * 0.8, GRID_SIZE * 0.8, GRID_SIZE / 8, [true, true, true, true]);
                }
                if (gameOver) {
                    ctx.drawImage(bombImage, x * GRID_SIZE + (GRID_SIZE * 0.23), y * GRID_SIZE + (GRID_SIZE * 0.22), GRID_SIZE * 0.55, GRID_SIZE * 0.55);
                }
            }

            if (visibleField[[x, y]] && field[[x, y]] !== 'M') {
                ctx.fillStyle = 'white';
                ctx.font = (GRID_SIZE * 0.6).toString() + 'px Bahnschrift';

                switch (field[[x, y]]) {
                    case 1:
                        ctx.fillText('1', x * GRID_SIZE + (GRID_SIZE * 0.39), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.3));
                        break;
                    case 2:
                        ctx.fillText('2', x * GRID_SIZE + (GRID_SIZE * 0.33), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.3));
                        break;
                    case 3:
                        ctx.fillText('3', x * GRID_SIZE + (GRID_SIZE * 0.345), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.29));
                        break;
                    case 4:
                        ctx.fillText('4', x * GRID_SIZE + (GRID_SIZE * 0.32), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.3));
                        break;
                    case 5:
                        ctx.fillText('5', x * GRID_SIZE + (GRID_SIZE * 0.33), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.28));
                        break;
                    case 6:
                        ctx.fillText('6', x * GRID_SIZE + (GRID_SIZE * 0.345), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.3));
                        break;
                    case 7:
                        ctx.fillText('7', x * GRID_SIZE + (GRID_SIZE * 0.345), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.277));
                        break;
                    case 8:
                        ctx.fillText('8', x * GRID_SIZE + (GRID_SIZE * 0.325), (y + 1) * GRID_SIZE - (GRID_SIZE * 0.285));
                        break;
                }

                // ctx.beginPath();
                // for (let x = 0; x < canvas.width; x += GRID_SIZE) {
                //     ctx.moveTo(x, 0);
                //     ctx.lineTo(x, canvas.height);
                // }
                // for (let y = 0; y < canvas.height; y += GRID_SIZE) {
                //     ctx.moveTo(0, y);
                //     ctx.lineTo(canvas.width, y);
                // }
                // ctx.strokeStyle = 'white';
                // ctx.stroke();
            }
        }
    }
}

function init() {
    SIZE = SIZES[sizeIndex];
    GRID_SIZE = 800 / SIZE;

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.height = SIZE * GRID_SIZE;

    field = {};
    visibleField = {};
    handledField = {};
    taggedField = {};

    gameInitialized = true;
    gameOver = gameStarted = false;
    drawField();
}

function startTimer() {
    tens++;

    if (tens > 99) {
        seconds++;
        tens = 0;
    }

    if (seconds > 59) {
        minutes++;
        seconds = 0;
    }
}

function startGame(startX, startY) {
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            if (Math.random() < 0.18) {
                field[[x, y]] = 'M';
            } else {
                field[[x, y]] = ' ';
            }
            if (startX - 1 <= x && x <= startX + 1 && startY - 1 <= y && y <= startY + 1) {
                field[[x, y]] = ' ';
            }
            visibleField[[x, y]] = false;
            handledField[[x, y]] = false;
            taggedField[[x, y]] = false;
        }
    }
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            if (field[[x, y]] !== 'M') {
                let c = 0;
                for (let x1 = -1; x1 < 2; x1++) {
                    for (let y1 = -1; y1 < 2; y1++) {
                        if (field[[x + x1, y + y1]] === 'M'){
                            c += 1
                        }
                    }
                }
                if (c !== 0) {
                    field[[x, y]] = c;
                } else {
                    field[[x, y]] = ' ';
                }
            }
        }
    }

    gameOver = false;
    gameStarted = true;
    drawField();
    minutes = seconds = tens = 0;
    clearInterval(interval);
    interval = setInterval(startTimer, 10);
}

function handleCell(x, y) {
    handledField[[x, y]] = visibleField[[x, y]] = true;
    if (field[[x, y]] === ' ') {
        for (let x1 = -1; x1 < 2; x1++) {
            for (let y1 = -1; y1 < 2; y1++) {
                if (!handledField[[x + x1, y + y1]]) {
                    handleCell(x + x1, y + y1);
                }
            }
        }
    }
}

function winCheck() {
    for (let x = 0; x < SIZE; x++) {
        for (let y = 0; y < SIZE; y++) {
            if (((!visibleField[[x, y]]) && (!taggedField[[x, y]])) || ((field[[x, y]] === 'M') && (!taggedField[[x, y]])) || (field[[x, y]] !== 'M' && taggedField[[x, y]])) {
                return false;
            }
        }
    }
    return true;
}

function generateTimeText(seconds, tens) {
    let minutesText = minutes.toString();
    let secondsText = seconds.toString();
    let tensText = tens.toString();
    if (secondsText.length === 1) {
        secondsText = '0' + secondsText;
    }
    if (tensText.length === 1) {
        tensText = '0' + tensText;
    }
    if (minutesText.length === 1) {
        minutesText = '0' + minutesText;
    }
    return 'Time: ' + minutesText + ':' + secondsText + ':' + tensText;
}

document.onmousedown = e => {
    if (gameOver || !gameInitialized) {
        return;
    }

    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    let y = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    if (x > SIZE - 1 || x < 0 || y > SIZE - 1 || y < 0) {
        return;
    }

    if (e.which === 1) {
        if (!gameStarted) {
            startGame(x, y);
        }

        if (taggedField[[x, y]]) {
            return;
        }

        if (visibleField[[x, y]]) {
            let taggedCellsAround = [];
            let invisibleCellsAround = [];
            for (let x1 = -1; x1 <= 1; x1++) {
                for (let y1 = -1; y1 <= 1; y1++) {
                    if (taggedField[[x + x1, y + y1]]) {
                        taggedCellsAround.push([x + x1, y + y1]);
                    } else if (!visibleField[[x + x1, y + y1]] && field[[x + x1, y + y1]]) {
                        invisibleCellsAround.push([x + x1, y + y1]);
                    }
                }
            }
            if (invisibleCellsAround.length + taggedCellsAround.length === field[[x, y]]) {
                for (let cell of invisibleCellsAround) {
                    taggedField[cell] = true;
                }
            } else if (taggedCellsAround.length >= field[[x, y]]) {
                for (let cell of invisibleCellsAround) {
                    if (field[cell] === 'M') {
                        visibleField[cell] = true;
                        gameOver = true;
                        drawField();
                        clearInterval(interval);
                        gameOverHeader.innerText = 'You lose :(';
                        gameOverScreen.style.display = 'block';
                        menuButton.style.display = restartButton.style.display = 'none';
                        timeText.innerText = generateTimeText(seconds, tens);
                        return;
                    }
                }
                for (let cell of invisibleCellsAround) {
                    visibleField[cell] = true;
                    handleCell(cell[0], cell[1]);
                }
            }
        } else {
            visibleField[[x, y]] = true;

            if (field[[x, y]] === 'M') {
                visibleField[[x, y]] = true;
                gameOver = true;
                drawField();
                clearInterval(interval);
                gameStarted = gameInitialized = false;
                gameOverHeader.innerText = 'You lose :(';
                gameOverScreen.style.display = 'block';
                menuButton.style.display = restartButton.style.display = 'none';
                timeText.innerText = generateTimeText(seconds, tens);
                return;
            }

            handleCell(x, y);
        }
    } else if (e.which === 3) {
        if (!visibleField[[x, y]]) {
            taggedField[[x, y]] = !taggedField[[x, y]];
        }
    }

    drawField();

    if (winCheck()) {
        gameOver = true;
        gameStarted = gameInitialized = false;
        clearInterval(interval);
        gameOverHeader.innerText = 'You win!';
        gameOverScreen.style.display = 'block';
        menuButton.style.display = restartButton.style.display = 'none';
        timeText.innerText = generateTimeText(seconds, tens);
    }
}

newGameButton.onclick = () => {
    menuScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    resumeButton.style.display = 'inline-block';

    init();
}
resumeButton.onclick = () => {
    menuScreen.style.display = 'none';
    gameScreen.style.display = 'block';
}

menuButton.onclick = () => {
    resumeButton.style.display = 'inline-block';
    gameScreen.style.display = 'none';
    menuScreen.style.display = 'block';
}

restartButton.onclick = () => {
    init();
}

leftArrow.onclick = () => {
    sizeIndex--;
    if (sizeIndex < 0) {
        sizeIndex = 2;
    }
    sizeText.innerText = SIZES_NAMES[sizeIndex];
}
rightArrow.onclick = () => {
    sizeIndex++;
    if (sizeIndex > 2) {
        sizeIndex = 0;
    }
    sizeText.innerText = SIZES_NAMES[sizeIndex];
}

okButton.onclick = () => {
    gameOverScreen.style.display = 'none';
    menuButton.style.display = restartButton.style.display = 'block';
}

document.onkeydown = (e) => {
    switch (e.keyCode) {
        case 82:
            if (gameScreen.style.display === 'block' && gameOverScreen.style.display === 'none') {
                restartButton.click();
            }
            break;
        case 27:
            if (gameScreen.style.display === 'block' && gameOverScreen.style.display === 'none') {
                menuButton.click();
            }
            break;
    }
}
