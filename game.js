// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 50;
const amplitude = 5; // Change this to make the pulsating effect more or less pronounced
const frequency = 0.02; // Change this to make the pulsating effect faster or slower

let time = 0;
let x, y;
let centeredX, centeredY
let squareSize;
let speed = 2; // Change this to make the rectangle move faster or slower

let circleX, circleY;

// Initialize the triangle position to a random corner
let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];


let counter = 0;
let lives = 3;
let gameStarted = false;

const circleRadius = 10; // Change this to change the size of the circle


const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

canvas.addEventListener('click', function () {
    if (!gameStarted && document.fullscreenElement) {
        gameStarted = true;
        gameLoop();
    }
});

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

function calculateRectanglePosition() {
    // Calculate the new position
    let newX = x;
    let newY = y;
    if (keys.ArrowUp) newY -= speed;
    if (keys.ArrowDown) newY += speed;
    if (keys.ArrowLeft) newX -= speed;
    if (keys.ArrowRight) newX += speed;

    // Check if the new position is inside the canvas
    if (newX >= 0 + baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        x = newX;
    }
    if (newY >= 0 + baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        y = newY;
    }

    // // log the keys that are pressed
    // console.log(keys);
    // // log the rectangle position
    // console.log(`x: ${x}, y: ${y}`);
}

function drawPulsatingRectangle() {
    squareSize = baseSize + amplitude * Math.sin(frequency * time);
    const radius = 5; // Change this to change the roundness of the corners

    // Adjust the x and y coordinates so the rectangle stays centered around the given x and y
    centeredX = x - squareSize / 2;
    centeredY = y - squareSize / 2;

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

function drawCircle() {
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
}

function calculateCirclePosition() {
    // Calculate a random position for the circle
    circleX = Math.random() * (canvas.width - 50);
    circleY = Math.random() * (canvas.height - 50);
}

function checkOverlap() {
    const dx = circleX - x;
    const dy = circleY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circleRadius / 2 + squareSize / 2) {
        // Increase the counter
        counter++;

        // Move the circle to a new random position
        calculateCirclePosition();
    }
}

function drawCounter() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'grey';
    ctx.textAlign = 'right';
    ctx.fillText(`Counter: ${counter}`, canvas.width - 10, 30);
}

function drawTriangle() {
    ctx.beginPath();
    ctx.moveTo(triangleX, triangleY);
    ctx.lineTo(triangleX - 50, triangleY + 50);
    ctx.lineTo(triangleX + 50, triangleY + 50);
    ctx.closePath();

    ctx.fillStyle = 'red';
    ctx.fill();
}

function moveTriangle() {
    const dx = x - triangleX;
    const dy = y - triangleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Increase the speed of the triangle with the counter
        const triangleSpeed = 0.1 + counter * 0.05;

        triangleX += directionX * triangleSpeed;
        triangleY += directionY * triangleSpeed;
    }
}

function drawLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'left';
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '\u2764 ';
    }
    ctx.fillText(livesText, 10, 30);
}

function checkOverlapTriangleRectangle() {
    const dx = x - triangleX;
    const dy = y - triangleY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < squareSize / 2 + 50) { // assuming the triangle has a size of 50
        // Reset the position of the rectangle to the center
        x = canvas.width / 2;
        y = canvas.height / 2;

        // Remove one life
        lives--;

        // Reset the position of the triangle to a random corner
        triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
        triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];
    }
}




function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('Click to play the game', canvas.width / 2, canvas.height / 2);
    } else if (lives > 0) {
        calculateRectanglePosition();
        drawPulsatingRectangle();
        drawCircle();
        drawCounter();
        moveTriangle();
        drawTriangle();
        drawLives();
        checkOverlapTriangleRectangle();
        checkOverlap();
        time++;
        requestAnimationFrame(gameLoop);
    } else {
        ctx.font = '50px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.fillText(`Points: ${counter}`, canvas.width / 2, canvas.height / 2 + 50);
        ctx.fillText('click to continue', canvas.width / 2, canvas.height / 2 + 100);
    }
}



window.onload = function () {
    x = canvas.width / 2;
    y = canvas.height / 2;

    // Calculate a random position for the circle and triangle
    circleX = Math.random() * (canvas.width - 50);
    circleY = Math.random() * (canvas.height - 50);
    triangleX = Math.random() * (canvas.width - 50);
    triangleY = Math.random() * (canvas.height - 50);

    // Start the game loop
    gameLoop();
}

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

canvas.addEventListener('click', function () {
    if (lives <= 0) {
        // Reset the game variables
        x = canvas.width / 2;
        y = canvas.height / 2;
        circleX = Math.random() * (canvas.width - 50);
        circleY = Math.random() * (canvas.height - 50);
        triangleX = Math.random() * (canvas.width - 50);
        triangleY = Math.random() * (canvas.height - 50);
        counter = 0;
        lives = 3;

        // Start the game loop again
        gameLoop();
    }
});