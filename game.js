// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let time = 0;
let x, y;
let speed = 2; // Change this to make the rectangle move faster or slower


const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

window.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

function moveRectangle() {

    // Move the rectangle based on which keys are pressed
    if (keys.ArrowUp) y -= speed;
    if (keys.ArrowDown) y += speed;
    if (keys.ArrowLeft) x -= speed;
    if (keys.ArrowRight) x += speed;

    // log the keys that are pressed
    console.log(keys);
    // log the rectangle position
    console.log(`x: ${x}, y: ${y}`);
}

function drawPulsatingRectangle() {
    // Calculate the size of the square using a sine wave to make it pulsate
    const baseSize = 50;
    const amplitude = 5; // Change this to make the pulsating effect more or less pronounced
    const frequency = 0.02; // Change this to make the pulsating effect faster or slower
    const squareSize = baseSize + amplitude * Math.sin(frequency * time);

    const radius = 5; // Change this to change the roundness of the corners

    // Adjust the x and y coordinates so the rectangle stays centered around the given x and y
    const centeredX = x - squareSize / 2;
    const centeredY = y - squareSize / 2;

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(centeredX + radius, centeredY);
    ctx.lineTo(centeredX + squareSize - radius, centeredY);
    ctx.arcTo(centeredX + squareSize, centeredY, centeredX + squareSize, centeredY + radius, radius);
    ctx.lineTo(centeredX + squareSize, centeredY + squareSize - radius);
    ctx.arcTo(centeredX + squareSize, centeredY + squareSize, centeredX + squareSize - radius, centeredY + squareSize, radius);
    ctx.lineTo(centeredX + radius, centeredY + squareSize);
    ctx.arcTo(centeredX, centeredY + squareSize, centeredX, centeredY + squareSize - radius, radius);
    ctx.lineTo(centeredX, centeredY + radius);
    ctx.arcTo(centeredX, centeredY, centeredX + radius, centeredY, radius);
    ctx.closePath();
    ctx.fill();
}


function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    moveRectangle();
    drawPulsatingRectangle();

    time++;

    requestAnimationFrame(gameLoop);
}



window.onload = function () {
    x = canvas.width / 2;
    y = canvas.height / 2;

}

gameLoop();

canvas.addEventListener('click', () => {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
        canvas.msRequestFullscreen();
    }
});