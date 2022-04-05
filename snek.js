"use sctrict";

const canvas = document.querySelector('.mainCanvas');
const width = canvas.width = 800;
const height = canvas.height = 800;
const fps = 60;
const size = 40;
let head, snake, length, apple, speed, maxSpeed, time, restart = true, paused, start;

ctx = canvas.getContext('2d');
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, width, height)

class Direction {
    constructor(direction = 0) {
        this.direction = direction;
    }
}

class Block {
    constructor(x = getRandomX(), y = getRandomY()) {
        this.x = x;
        this.y = y;
    }
}

let xDirection = new Direction;
let yDirection = new Direction;

function getRandomX() {
    x = Math.floor(Math.random() * (width - size));
    return x - x % size;
}

function getRandomY() {
    y = Math.floor(Math.random() * (height- size))
    return y - y % size;
}

let record;
let cookie = document.cookie;
if (cookie.includes("record")) {
    record = parseInt(cookie.split('; ').find(row => row.startsWith('record=')).split('=')[1]);
}
else {
    document.cookie = encodeURIComponent("record") + '=' + encodeURIComponent(0);
    record = 0;
}

function initGame() {
    // for (let h = 0; h < height; h++) {
    //     for (let w = 0; w < width; w++) {
    //         if (h % 2 == 0 && w % 2 == 0 || h % 2 != 0 && w % 2 != 0)
    //             ctx.fillStyle = 'rgb(44, 44, 44)';
    //         else
    //             ctx.fillStyle = 'rgb(34, 34, 34)';
    //         ctx.fillRect(h * size, w * size, size, size);
    //     }
    // }
    head = new Block();
    snake = [];
    length = 1;
    apple = new Block();
    while (inCheck(snake, apple)) {
        apple.x = getRandomX();
        apple.y = getRandomY();
    }
    speed = Math.floor(fps / 6);
    maxSpeed = Math.floor(fps / 15);
    time = 0;
    restart = false;
    paused = false;
}

function mainLoop(timestamp) {
    if (restart) {
        initGame();
    }
    else if (paused || inCheck(snake, head)){
        ctx.font = '50px century gothic';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        if (paused)
            ctx.fillText('Paused', width / 2, height / 2);
        else if (inCheck(snake, head)) {
            ctx.fillText('Game Over...', width / 2, height / 2 - size);
            ctx.fillText('Press "r" to restart.', width / 2, height / 2 + size);
        }
        window.requestAnimationFrame(mainLoop);
        return;
    }

    if (start === undefined) {
        start = timestamp;
    }
    const elapsed = timestamp - start;
    if (elapsed < 1 / fps) {
        window.requestAnimationFrame(mainLoop);
        return;
    }
    else {
        start = timestamp;
    }
    
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgb(0, 40, 200)';
    snake.forEach(block => ctx.fillRect(block.x, block.y, size, size));
    ctx.fillRect(head.x, head.y, size, size);

    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(apple.x, apple.y, size, size);

    time += 1
    if (time % speed == 0) {
        if (length > 1) {
            snake.push(new Block(head.x, head.y));
            snake = snake.slice(-(length - 1));
        }

        head.x += xDirection.direction * size;
        head.y += yDirection.direction * size;
        if (head.x > width - size + 1)
            head.x = 0;
        else if (head.x < 0)
            head.x = width - size;
        if (head.y > height - size + 1)
            head.y = 0;
        else if (head.y < 0)
            head.y = height - size;

        if (head.x == apple.x && head.y == apple.y) {
            length += 1;
            record = Math.max(length - 1, record);
            document.cookie = encodeURIComponent("record") + '=' + encodeURIComponent(record);
            speed = Math.max(speed - 1, maxSpeed);
            apple = new Block();
            while (inCheck(snake, apple)) {
                apple.x = getRandomX();
                apple.y = getRandomY();
            }
        }
    }
    ctx.font = '20px century gothic';
    ctx.textAlign = 'start';
    ctx.fillStyle = 'white';
    ctx.fillText(`Score: ${length - 1}. Record ${record}`, 10, 25);
    window.requestAnimationFrame(mainLoop);
}

function inCheck(blockList, blockChecked) {
    result = false;
    blockList.forEach(block => {
        if (block.x == blockChecked.x && block.y == blockChecked.y) {
            result = true;
        }
    });
    return result;
}

function keyPressed(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (yDirection.direction != 1 & !paused) {
                yDirection.direction = -1;
                xDirection.direction = 0;
            }
            break;
        case 'ArrowDown':
            if (yDirection.direction != -1 & !paused) {
                yDirection.direction = 1;
                xDirection.direction = 0;
            }
            break;
        case 'ArrowLeft':
            if (xDirection.direction != 1 & !paused) {
                xDirection.direction = -1;
                yDirection.direction = 0;
            }
            break;
        case 'ArrowRight':
            if (xDirection.direction != -1 & !paused) {
                xDirection.direction = 1;
                yDirection.direction = 0;
            }
            break;
        case 'r':
            restart = true;
            break;
        case 'Escape':
            if (!inCheck(snake, head)) {
                paused = !paused;
            }
    }
}

document.addEventListener('keydown', keyPressed);

window.requestAnimationFrame(mainLoop);