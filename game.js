

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const version = '0.0.7';

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 25;
const circleRadius = 10; // Change this to change the size of the circle
const rectangleSpeed = 2; // Change this to make the rectangle move faster or slower

const rectangleColor = '#307bad'; // Solarized pastel blue
const triangleColor = '#c94a48'; // Solarized red
const circleColor = '#76bd52'; // Solarized green

const circleEdgeMargin = 50; // The circle will not spawn in that number of pixels from the canvas
const triangleEdgeMargin = 70; // The triangle will not spawn in that number of pixels from the canvas

// polygons
let trianglesObj = [];
let rectangleObj;
let circleObj;

// game variables
let counter = 0;
let lives = 3;
let gameRunning = false;
let gameOverMessageFlag = false;
let lifeLostMessageFlag = false;

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
    if (!gameRunning) {
        gameRunning = true;
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

canvas.addEventListener('touchend', function () {
    touchDown = false;
}, false);

function calculateRectanglePosition() {
    let newX = rectangleObj.x
    let newY = rectangleObj.y

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
    else if (keys.ArrowUp || keys.w || keys.W) newY -= rectangleSpeed;
    else if (keys.ArrowDown || keys.s || keys.S) newY += rectangleSpeed;
    else if (keys.ArrowLeft || keys.a || keys.A) newX -= rectangleSpeed;
    else if (keys.ArrowRight || keys.d || keys.D) newX += rectangleSpeed;

    // Check if the new position is inside the canvas
    if (newX >= baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        rectangleObj.x = newX;
    }
    if (newY >= baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        rectangleObj.y = newY;
    }
    rectangleObj.update();
}


function updateGame() {
    calculateRectanglePosition();
    moveTriangles(trianglesObj, rectangleObj);

    drawRectangle(ctx, rectangleObj);
    drawCircle(ctx, circleObj);
    drawTriangles(ctx, trianglesObj);

    displayCounter(ctx, counter);
    displayLives(ctx, lives);
    displayFps(ctx, fpsCounter.calculateFPS());

    if(checkCollisionWithCircle(circleObj, rectangleObj)) {
        // Increase the counter
        counter++;

        if (counter % 5 === 0) {
            // Add a new triangle to the triangles array
            trianglesObj.push(newRandomTriangle());
        }

        // Move the circle to a new random position
        circleObj = newRandomCircle();
    }
    if (checkCollisionWithTriangles(trianglesObj, rectangleObj)) {
        lostLife();
    }
}

function lostLife() {
    lives--;
    lifeLostMessageFlag = true
    resetTrianglesPositions(trianglesObj);
    resetRectanglePosition();
    setTimeout(() => {
        lifeLostMessageFlag = false;
    }, 900);
}

function resetTrianglesPositions(trianglesObj) {
    trianglesObj.forEach(triangle => {
        triangle.x = randomSideX(triangleEdgeMargin);
        triangle.y = randomSideY(triangleEdgeMargin);
    });
}

function randomSideY(boarder) {
    return [boarder, canvas.height - boarder][Math.floor(Math.random() * 2)];
}

function randomSideX(boarder) {
    return [boarder, canvas.width - boarder][Math.floor(Math.random() * 2)];
}

function resetRectanglePosition() {
    rectangleObj = newCenteredRectangle();
}


function newRandomCircle() {
    let circleX = Math.random() * (canvas.width - circleEdgeMargin);
    let circleY = Math.random() * (canvas.height - circleEdgeMargin);
    return new Circle(circleX, circleY, circleRadius, circleColor);
}

function newCenteredRectangle() {
    let centeredX = canvas.width / 2;
    let centeredY = canvas.height / 2;
    return new Rectangle(centeredX, centeredY, baseSize, baseSize, rectangleColor);
}

function newRandomTriangle() {
    const triangleX = randomSideX(triangleEdgeMargin);
    const triangleY = randomSideY(triangleEdgeMargin);
    return new Triangle(triangleX, triangleY, triangleColor);
}

function gameLoop() {
    clearCanvas();

    if (!gameRunning) {
        displayStartGame();
    } else if (lives > 0) {
        updateGame();
        if (lifeLostMessageFlag) {
            displayLifeLostMessage(ctx, lives);
        }
        requestAnimationFrame(gameLoop);
    } else {
        executeGameOver();
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Executes the game over logic.
 */
function executeGameOver() {
    gameOverMessageFlag = true;

    displayGameOver();
    // change game over state to false after 1 second
    setTimeout(() => {
        gameOverMessageFlag = false;
        displayText(ctx, 'click to continue', canvas.width / 2, canvas.height / 2 + 100, 'red', 20);

        // add event listener to restart the game
        canvas.addEventListener('click', function () {
            resetGameState();
            gameLoop();
        }, { once: true });
    }, 1000);
}

function displayStartGame() {
    displayGameIntro(ctx);
    displayInstructions(ctx);
    displayVersion(ctx);
}

function resetGameState() {
    rectangleObj = newCenteredRectangle();
    trianglesObj = [];
    trianglesObj.push(newRandomTriangle());
    circleObj = newRandomCircle();

    counter = 0;
    lives = 3;
    gameRunning = false;
}

window.onload = function () {
    resetGameState();
    gameLoop();
}

