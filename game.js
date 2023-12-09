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
let targetX = x;
let targetY = y;
let mouseDown = false;

let circleX, circleY;

// Initialize the triangle position to a random corner
let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];


let counter = 0;
let lives = 3;
let gameStarted = false;

const circleRadius = 10; // Change this to change the size of the circle

const fpsCounter = new FPSCounter();

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

canvas.addEventListener('mousedown', function() {
    mouseDown = true;
});

canvas.addEventListener('mouseup', function() {
    mouseDown = false;
});

canvas.addEventListener('mousemove', function(event) {
    if (mouseDown) {
        // Calculate the canvas-relative mouse coordinates
        let rect = canvas.getBoundingClientRect();
        targetX = event.clientX - rect.left;
        targetY = event.clientY - rect.top;
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
    if (mouseDown) {
        // Calculate the direction vector
        let dx = targetX - x;
        let dy = targetY - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let directionX = dx / distance;
        let directionY = dy / distance;

        newX += directionX * speed;
        newY += directionY * speed;
    }
    

    // Check if the new position is inside the canvas
    if (newX >= 0 + baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        x = newX;
    }
    if (newY >= 0 + baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        y = newY;
    }
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

function checkOverlapRectangleCircle() {
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
    ctx.fillText(`Points: ${counter}`, canvas.width - 10, 30);
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
    // Represent the rectangle as a polygon
    let rectangle = [
        { x: x, y: y },
        { x: x + squareSize, y: y },
        { x: x + squareSize, y: y + squareSize },
        { x: x, y: y + squareSize }
    ];

    // Represent the triangle as a polygon
    let triangle = [
        { x: triangleX, y: triangleY },
        { x: triangleX + 50, y: triangleY },
        { x: triangleX + 25, y: triangleY + 50 }
    ];

    // Check if the rectangle and triangle overlap using SAT
    if (polygonsOverlap(rectangle, triangle)) {
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

function getAxes(polygon) {
    let axes = [];
    for (let i = 0; i < polygon.length; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1 === polygon.length ? 0 : i + 1];
        let edge = { x: p1.x - p2.x, y: p1.y - p2.y };
        axes.push({ x: -edge.y, y: edge.x });
    }
    return axes;
}

function projectPolygon(axis, polygon) {
    let min = axis.x * polygon[0].x + axis.y * polygon[0].y;
    let max = min;
    for (let i = 1; i < polygon.length; i++) {
        let p = axis.x * polygon[i].x + axis.y * polygon[i].y;
        if (p < min) {
            min = p;
        } else if (p > max) {
            max = p;
        }
    }
    return { min, max };
}

function polygonsOverlap(polygon1, polygon2) {
    let axes = getAxes(polygon1).concat(getAxes(polygon2));
    for (let i = 0; i < axes.length; i++) {
        let axis = axes[i];
        let projection1 = projectPolygon(axis, polygon1);
        let projection2 = projectPolygon(axis, polygon2);
        if (projection1.max < projection2.min || projection2.max < projection1.min) {
            return false;
        }
    }
    return true;
}


function displayText(ctx, text, x, y, color = 'white', fontSize = 20, align = 'center') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

function displayGameIntro(ctx) {
    displayText(ctx, 'Polygon Peril', canvas.width / 2, canvas.height / 2 - 100, 'red', 70);
    displayText(ctx, 'Survive the Shape Shift!', canvas.width / 2, canvas.height / 2 - 50, 'red', 30);
    displayText(ctx, 'Click to play the game', canvas.width / 2, canvas.height / 2, 'red', 20);
}

function displayInstructions(ctx) {
    displayText(ctx, 'Instructions:', canvas.width / 2, canvas.height / 2 + 50);
    displayText(ctx, '1. Avoid the triangle.', canvas.width / 2, canvas.height / 2 + 80);
    displayText(ctx, '2. Collect the circles to gain points.', canvas.width / 2, canvas.height / 2 + 110);
    displayText(ctx, '3. You have 3 lives. Good luck!', canvas.width / 2, canvas.height / 2 + 140);
}

function preapreBackground(ctx) {
    // Fill the background with black color
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGame() {
    calculateRectanglePosition();
    drawPulsatingRectangle();
    drawCircle();
    drawCounter();
    moveTriangle();
    drawTriangle();
    drawLives();
    checkOverlapTriangleRectangle();
    checkOverlapRectangleCircle();
    time++;
    // Display the FPS
    displayText(ctx, 'FPS: ' + fpsCounter.calculateFPS(), 10, canvas.height - 15, 'grey', 14, 'left');

}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        preapreBackground(ctx);
        displayGameIntro(ctx);
        displayInstructions(ctx);
    } else if (lives > 0) {
        updateGame();

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
    goFullScreen();
});

function goFullScreen() {
    if (canvas.requestFullscreen) {
        canvas.requestFullscreen();
    } else if (canvas.mozRequestFullScreen) { // Firefox
        canvas.mozRequestFullScreen();
    } else if (canvas.webkitRequestFullscreen) { // Chrome, Safari and Opera
        canvas.webkitRequestFullscreen();
    } else if (canvas.msRequestFullscreen) { // IE/Edge
        canvas.msRequestFullscreen();
    }
}

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
