const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const version = '0.0.9';

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 25;
const circleRadius = 10; // Change this to change the size of the circle
const specialCircleRadius = 13; // Change this to change the size of the special circle
const hexRadius = 40; // Change this to change the size of the hex
const rectangleSpeed = 2; // Change this to make the rectangle move faster or slower
const minimumSpawnDistance = 80; // The villains will not spawn in that number of pixels from the rectangle

const rectangleColor = '#307bad'; // Solarized pastel blue
const triangleColor = '#c94a48'; // Solarized red
const circleColor = '#76bd52'; // Solarized green
const specialCircleColor = '#e5aa19'; // gold
const hexColor = '#e3ab73'; // Solarized green

const circleEdgeMargin = 60; // The circle will not spawn in that number of pixels from the canvas
const triangleEdgeMargin = 70; // The triangle will not spawn in that number of pixels from the canvas
const hexEdgeMargin = 50; // The hex will not spawn in that number of pixels from the canvas


// polygons
let rectangleObj;
let circleObj;
let trianglesObj = [];
let hexesObj = [];
let heartObj;

// game variables
let counter = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let gameOverMessageFlag = false;
let lifeLostMessageFlag = false;
let dangerIncreaseMessageFlag = false;
let newObstacleMessageFlag = false;
let levelUpMessageFlag = false;
let newLifeMessageFlag = false;

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
    speed = rectangleSpeed + 0.1 * level;
    let newX = rectangleObj.x
    let newY = rectangleObj.y

    if (mouseDown || touchDown) {
        // Calculate the direction vector
        let dx = targetX - rectangleObj.x;
        let dy = targetY - rectangleObj.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let directionX = dx / distance;
        let directionY = dy / distance;

        newX += directionX * speed;
        newY += directionY * speed;
    } else if (keys.ArrowUp || keys.w || keys.W) newY -= speed;
    else if (keys.ArrowDown || keys.s || keys.S) newY += speed;
    else if (keys.ArrowLeft || keys.a || keys.A) newX -= speed;
    else if (keys.ArrowRight || keys.d || keys.D) newX += speed;

    // Check if the new position is inside the canvas
    if (newX >= baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        rectangleObj.x = newX;
    }
    if (newY >= baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        rectangleObj.y = newY;
    }
    rectangleObj.update();
}

function showMessages() {
    if (lifeLostMessageFlag) {
        displayLifeLostMessage(ctx, lives);
    }
    if (dangerIncreaseMessageFlag) {
        displayDangerIncreaseMessage(ctx);
    }
    if (newObstacleMessageFlag) {
        displayNewObstacleMessage(ctx, counter);
    }
    if (levelUpMessageFlag) {
        displayLevelUpMessage(ctx, counter);
    }
    if (newLifeMessageFlag) {
        displayNewLifeMessage(ctx);
    }
}

function levelUp() {
    level++;
    levelUpMessageFlag = true
    setTimeout(() => {
        levelUpMessageFlag = false;
    }, 900);
}

function newLife() {
    lives++;
    heartObj = null;
    newLifeMessageFlag = true
    setTimeout(() => {
        newLifeMessageFlag = false;
    }, 900);
}

function updateGame() {
    calculateRectanglePosition();
    moveTriangles(trianglesObj, rectangleObj);
    moveHexes(hexesObj, rectangleObj);

    drawRectangle(ctx, rectangleObj);
    drawCircle(ctx, circleObj);
    drawTriangles(ctx, trianglesObj);
    drawHexes(ctx, hexesObj);
    drawHeart(ctx, heartObj);

    displayCounter(ctx, counter);
    displayLives(ctx, lives);
    displayFps(ctx, fpsCounter.calculateFPS());

    if (checkCollisionWithCircle(circleObj, rectangleObj)) {
        if (circleObj.special === true) {
            levelUp();
        }
        nextPhase();
    }
    if (checkCollisionWithTriangles(trianglesObj, rectangleObj)
        || checkCollisionWithHexes(hexesObj, rectangleObj)) {
        lostLife();
    }

    if (checkCollisionWithHeart(heartObj, rectangleObj)) {
        newLife();
    }

    showMessages();
}

function lostLife() {
    lives--;
    lifeLostMessageFlag = true
    resetTrianglesPositions(trianglesObj);
    resetHexPositions(hexesObj);
    resetRectanglePosition();
    setTimeout(() => {
        lifeLostMessageFlag = false;
    }, 900);
}

function nextPhase() {
    counter++;

    if (counter % 5 === 0) {
        if (counter % 15 === 0) {
            hexesObj.push(newRandomHex());
            newObstacleMessageFlag = true
            setTimeout(() => {
                newObstacleMessageFlag = false;
            }, 900);
        } else {
            trianglesObj.push(newRandomTriangle());
            dangerIncreaseMessageFlag = true
            setTimeout(() => {
                dangerIncreaseMessageFlag = false;
            }, 900);
        }
    }

    if (counter % 10 === 0) {
        circleObj = newRandomCircleSpecial(rectangleObj);
    } else {
        circleObj = newRandomCircle(rectangleObj);
    }

    if (counter % 20 === 0) {
        heartObj = newRandomHeart(rectangleObj);
    }
}

function resetTrianglesPositions(trianglesObj) {
    trianglesObj.forEach(triangle => {
        triangle.x = randomSideX(triangleEdgeMargin);
        triangle.y = randomSideY(triangleEdgeMargin);
    });
}

function resetHexPositions(hexesObj) {
    hexesObj.forEach(hex => {
        hex.x = randomSideX(hexEdgeMargin);
        hex.y = randomSideY(hexEdgeMargin);
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

function randomCircleX(rectangleObj) {
    let circleX = Math.random() * (canvas.width - circleEdgeMargin);
    while (circleX > rectangleObj.x - minimumSpawnDistance && circleX < rectangleObj.x + minimumSpawnDistance) {
        console.log('Retrying due to close spawn: circleX', circleX, 'rectangleObj.x', rectangleObj.x)
        circleX = Math.random() * (canvas.width - circleEdgeMargin);
    }
    return circleX;
}

function randomCircleY(rectangleObj) {
    let circleY = Math.random() * (canvas.height - circleEdgeMargin);
    while (circleY > rectangleObj.y - minimumSpawnDistance && circleY < rectangleObj.y + minimumSpawnDistance) {
        console.log('Retrying due to close spawn: circleY', circleY, 'rectangleObj.y', rectangleObj.y)
        circleY = Math.random() * (canvas.height - circleEdgeMargin);
    }
    return circleY;
}

function newRandomCircle(rectangleObj) {
    let circleX = randomCircleX(rectangleObj);
    let circleY = randomCircleY(rectangleObj);
    return new Circle(circleX, circleY, circleRadius, circleColor);
}

function newRandomCircleSpecial(rectangleObj) {
    let circleX = randomCircleX(rectangleObj);
    let circleY = randomCircleY(rectangleObj);
    return new Circle(circleX, circleY, specialCircleRadius, specialCircleColor, true);
}

function newRandomHeart(rectangleObj) {
    let heartX = randomCircleX(rectangleObj);
    let heartY = randomCircleX(rectangleObj);
    return new Heart(heartX, heartY, circleRadius);
}

function newRandomHex() {
    let hexX = Math.random() * (canvas.width - hexEdgeMargin);
    let hexY = Math.random() * (canvas.height - hexEdgeMargin);
    return new Hex(hexX, hexY, hexColor, hexRadius);
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
        }, {once: true});
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
    trianglesObj.push(newRandomTriangle(rectangleObj));
    circleObj = newRandomCircle(rectangleObj);
    hexesObj = [];

    counter = 0;
    lives = 3;
    level = 1;
    gameRunning = false;
}

window.onload = function () {
    resetGameState();
    gameLoop();
}

