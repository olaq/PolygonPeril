const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const version = '0.0.2';

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 25;
const amplitude = 5; // Change this to make the pulsating effect more or less pronounced
const frequency = 0.02; // Change this to make the pulsating effect faster or slower
const circleRadius = 10; // Change this to change the size of the circle
const rectangleSpeed = 2; // Change this to make the rectangle move faster or slower

const rectangleColor = '#b58900'; // Solarized pastel blue
const triangleColor = '#dc322f'; // Solarized red
const circleColor = 'lime'; 

// polygons
let triangleObj;
let rectangleObj;
let circleObj;

// game variables
let counter = 0;
let lives = 3;
let gameStarted = false;

// FPS counter
const fpsCounter = new FPSCounter();

// Keyboard input
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    W: false,
    A: false,
    S: false,
    D: false
};

// mouse position
let targetX
let targetY
let mouseDown = false;
let touchDown = false;

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

canvas.addEventListener('mousedown', function () {
    mouseDown = true;
});

canvas.addEventListener('mouseup', function () {
    mouseDown = false;
});

canvas.addEventListener('mousemove', function (event) {
    if (mouseDown) {
        targetX = event.clientX;
        targetY = event.clientY;
    }
});

canvas.addEventListener('touchstart', function (event) {
    touchDown = true;
    targetX = event.touches[0].clientX;
    targetY = event.touches[0].clientY;
}, false);

canvas.addEventListener('touchmove', function (event) {
    targetX = event.touches[0].clientX;
    targetY = event.touches[0].clientY;
}, false);

canvas.addEventListener('touchend', function (event) {
    touchDown = false;
}, false);

function calculateRectanglePosition() {
    let newX = rectangleObj.x
    let newY = rectangleObj.y
    if (keys.ArrowUp || keys.w || keys.W) newY -= rectangleSpeed;
    if (keys.ArrowDown || keys.s || keys.S) newY += rectangleSpeed;
    if (keys.ArrowLeft || keys.a || keys.A) newX -= rectangleSpeed;
    if (keys.ArrowRight || keys.d || keys.D) newX += rectangleSpeed;
    if (mouseDown || touchDown) {
        // Calculate the direction vector
        let dx = targetX - rectangleObj.x;
        let dy = targetY - rectangleObj.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let directionX = dx / distance;
        let directionY = dy / distance;

        newX += directionX * rectangleSpeed;
        newY += directionY * rectangleSpeed;
    }

    // Check if the new position is inside the canvas
    if (newX >= 0 + baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        rectangleObj.x = newX;
    }
    if (newY >= 0 + baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        rectangleObj.y = newY;
    }
    rectangleObj.update();
}

function drawRectangle() {
    let rectangle = rectangleObj.calculatePolygon();

    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(rectangle[0].x, rectangle[0].y);
    ctx.lineTo(rectangle[1].x, rectangle[1].y);
    ctx.lineTo(rectangle[2].x, rectangle[2].y);
    ctx.lineTo(rectangle[3].x, rectangle[3].y);
    ctx.closePath();
    ctx.fill();
}

function drawCircle() {
    ctx.beginPath();
    ctx.arc(circleObj.x, circleObj.y, circleObj.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = circleObj.color;
    ctx.fill();
}

function calculateRandomCirclePosition() {
    circleObj.x = Math.random() * (canvas.width - 50);
    circleObj.y = Math.random() * (canvas.height - 50);
}

function checkOverlapRectangleCircle() {
    const dx = circleObj.x - rectangleObj.x;
    const dy = circleObj.y - rectangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circleObj.radius + baseSize) {
        // Increase the counter
        counter++;

        // Move the circle to a new random position
        calculateRandomCirclePosition();
    }
}

function drawTriangle() {
    let triangle = triangleObj.calculatePolygon();
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.closePath();
    ctx.fillStyle = triangleObj.color;
    ctx.fill();
}

function moveTriangle() {
    const dx = rectangleObj.x - triangleObj.x;
    const dy = rectangleObj.y - triangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Increase the speed of the triangle with the counter
        const triangleSpeed = 0.1 + counter * 0.05;

        triangleObj.x = triangleObj.x + directionX * triangleSpeed;
        triangleObj.y = triangleObj.y + directionY * triangleSpeed;
    }
}

function checkOverlapTriangleRectangle() {

    let rectangle = rectangleObj.calculatePolygon();
    let triangle = triangleObj.calculatePolygon();

    // Check if the rectangle and triangle overlap using SAT
    if (polygonsOverlap(rectangle, triangle)) {
        // // log triangle and rectangle
        // console.log('triangle', triangle);
        // console.log('rectangle', rectangle);

        // ctx.clearRect(0, 0, canvas.width, canvas.height);

        // // Draw triangle shadow
        // ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        // ctx.beginPath();
        // ctx.moveTo(triangle[0].x, triangle[0].y);
        // ctx.lineTo(triangle[1].x, triangle[1].y);
        // ctx.lineTo(triangle[2].x, triangle[2].y);
        // ctx.closePath();
        // ctx.fill();

        // // Draw rectangle shadow
        // ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        // ctx.beginPath();
        // ctx.moveTo(rectangle[0].x, rectangle[0].y);
        // ctx.lineTo(rectangle[1].x, rectangle[1].y);
        // ctx.lineTo(rectangle[2].x, rectangle[2].y);
        // ctx.lineTo(rectangle[3].x, rectangle[3].y);
        // ctx.closePath();
        // ctx.fill();

        // debugger; // Pause execution here


        // Reset the position of the rectangle to the center
        rectangleObj.x = canvas.width / 2;
        rectangleObj.y = canvas.height / 2;

        // Remove one life
        lives--;

        // Reset the position of the triangle to a random corner
        triangleObj.x = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
        triangleObj.y = [50, canvas.height - 50][Math.floor(Math.random() * 2)];
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

function displayCounter() {
    displayText(ctx, `Points: ${counter}`, canvas.width - 10, 30, 'grey', 20, 'right')
}

function displayLives() {
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '\u2764 ';
    }
    displayText(ctx, livesText, 10, 30, 'red', 20, 'left');
}

function displayFps() {
    displayText(ctx, 'FPS: ' + fpsCounter.calculateFPS(), 10, canvas.height - 15, 'grey', 14, 'left');
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

function displayVersion(ctx) {
    displayText(ctx, version, canvas.width - 10, canvas.height - 15, 'grey', 14, 'right');
}

function preapreBackground(ctx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateGame() {

    displayCounter();
    displayLives();
    displayFps();

    calculateRectanglePosition();
    drawRectangle();
    drawCircle();
    moveTriangle();
    drawTriangle();

    checkOverlapRectangleCircle();
    checkOverlapTriangleRectangle();
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        displayStartGame();
    } else if (lives > 0) {
        updateGame();
        requestAnimationFrame(gameLoop);
    } else {
        displayGameOver();
    }
}

function displayStartGame() {
    preapreBackground(ctx);
    displayGameIntro(ctx);
    displayInstructions(ctx);
    displayVersion(ctx);
}

function displayGameOver() {
    displayText(ctx, 'GAME OVER', canvas.width / 2, canvas.height / 2, 'red', 50);
    displayText(ctx, `Points: ${counter}`, canvas.width / 2, canvas.height / 2 + 50, 'red', 30);
    displayText(ctx, 'click to continue', canvas.width / 2, canvas.height / 2 + 100, 'red', 20);
}

window.onload = function () {
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let circleX = Math.random() * (canvas.width - 50);
    let circleY = Math.random() * (canvas.height - 50);
    let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
    let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];


    rectangleObj = new Rectangle(x, y, baseSize, baseSize, rectangleColor);
    triangleObj = new Triangle(triangleX, triangleY, triangleColor);
    circleObj = new Circle(circleX, circleY, circleRadius, circleColor);


    displayStartGame();
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
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let circleX = Math.random() * (canvas.width - 50);
        let circleY = Math.random() * (canvas.height - 50);
        let triangleX = Math.random() * (canvas.width - 50);
        let triangleY = Math.random() * (canvas.height - 50);

        rectangleObj = new Rectangle(x, y, baseSize, baseSize, rectangleColor);
        triangleObj = new Triangle(triangleX, triangleY, triangleColor);
        circleObj = new Circle(circleX, circleY, circleRadius, circleColor);

        counter = 0;
        lives = 3;

        // restart the game
        gameStarted = false;
        gameLoop();
    }
});
