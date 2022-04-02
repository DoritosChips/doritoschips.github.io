const canvas = document.querySelector('.mainCanvas');
const width = canvas.width = 800;
const height = canvas.height = 800;
const fps = 144;
const size = 25;
const scoreLabel = document.getElementById('score')

ctx = canvas.getContext('2d');
ctx.fillStyle = 'black'
ctx.fillRect(0, 0, width, height)

let x = 0, y = 0;
let snake = [[x, y]];
let xdir = 0, ydir = 0;
let length = 1;
let apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height- size))];
apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size,];
while (inCheck(snake, apple[0], apple[1])) {
    apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height- size))];
    apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size,];
}
let speed = Math.floor(fps / 6);
let maxSpeed = Math.floor(fps / 15);
let time = 0;
let restart = false;
let record;
let cookie = document.cookie;
if (cookie.includes("record")) {
    record = parseInt(cookie.split('; ').find(row => row.startsWith('record=')).split('=')[1]);
}
else {
    document.cookie = encodeURIComponent("record") + '=' + encodeURIComponent(0);
    record = 0;
}  
let dirs = [1, 1, 1, 1];
let paused = false;

scoreLabel.innerText = "Score: 0. Record: " + String(record);

function mainLoop() {
    if (restart) {
        x = 0, y = 0;
        snake = [[x, y]];
        xdir = 0, ydir = 0;
        length = 1;
        apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height- size))];
        apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size,];
        while (inCheck(snake, apple[0], apple[1])) {
            apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height- size))];
            apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size,];
        }
        speed = Math.floor(fps / 6);
        scoreLabel.innerText = "Score: 0. Record: " + String(record);
        dirs = [1, 1, 1, 1];
        restart = false;
        paused = false;
    }
    else if (paused || inCheck(snake, x, y)){
        return;
    }
    
    scoreLabel.innerText = "Score: " + String(length - 1) + ". Record: " + String(record);

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = 'rgb(0, 255, 0)';
    snake.forEach(i => ctx.fillRect(i[0], i[1], size - 1, size - 1))

    ctx.fillStyle = 'rgb(255, 0, 0)';
    ctx.fillRect(apple[0], apple[1], size - 1, size - 1)

    time += 1
    if (time % speed == 0) {
        x += xdir * size;
        y += ydir * size;
        if (x > width - size + 1)
            x = 0;
        else if (x < 0)
            x = width - size;
        if (y > width - size + 1)
            y = 0;
        else if (y < 0)
            y = width - size;

        snake.push([x, y]);
        snake = snake.slice(-length);

        if (x == apple[0] & y == apple[1]) {
            length += 1;
            record = Math.max(length - 1, record);
            scoreLabel.innerText = "Score: " + String(length - 1) + ". Record: " + String(record);
            document.cookie = encodeURIComponent("record") + '=' + encodeURIComponent(record);
            speed -= 1;
            speed = Math.max(speed, maxSpeed)
            apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height - size))];
            apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size];
            while (inCheck(snake, apple[0], apple[1])) {
                apple = [Math.floor(Math.random() * (width - size)), Math.floor(Math.random() * (height- size))];
                apple = [apple[0] - apple[0] % size, apple[1] - apple[1] % size,];
            }
        }
    }
}

function inCheck(snake, x, y) {
    result = false;
    snake.slice(0, -1).forEach(i => {
        if (i[0] == x & i[1] == y) {
            result = true;
        }
    });
    return result;
}

function keyPressed(e) {
    switch (e.key) {
        case 'ArrowUp':
            if (dirs[0] & !paused) {
                ydir = -1;
                xdir = 0;
                dirs = [1, 0, 1, 1];
            }
            break;
        case 'ArrowDown':
            if (dirs[1] & !paused) {
                ydir = 1;
                xdir = 0;
                dirs = [0, 1, 1, 1];
            }
            break;
        case 'ArrowLeft':
            if (dirs[2] & !paused) {
                xdir = -1;
                ydir = 0;
                dirs = [1, 1, 1, 0];
            }
            break;
        case 'ArrowRight':
            if (dirs[3] & !paused) {
                xdir = 1; 
                ydir = 0;
                dirs = [1, 1, 0, 1];
            }
            break;
        case 'r':
            restart = true;
            break;
        case 'Escape':
            if (!inCheck(snake, x, y)) {
                scoreLabel.innerText = "Paused";
                paused = !paused;
            }
    }
}

document.addEventListener('keydown', keyPressed);

setInterval(function () {mainLoop();}, 1000 / fps);
