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

const dyingTime = 500; // time it takes to fade out after death
const maxGlowIntensity = 30;
const glowDuration = 500; // Duration of the glow effect in milliseconds


// polygons
let rectangleObj;
let circleObj;
let trianglesObj = [];
let hexesObj = [];
let heartObj;

// game variables
const gameState = {
    counter: 0,
    lives: 3,
    level: 1,
    gameRunning: false,
    messageFlags: {
        gameOver: false,
        lifeLost: false,
        dangerIncrease: false,
        newObstacle: false,
        levelUp: false,
        newLife: false
    },
    glow: {
        intensity: 0,
        isGlowing: false
    },
    death: {
        isDead: false,
        opacity: 1
    }
};

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
    if (!gameState.gameRunning) {
        gameState.gameRunning = true;
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

// Add a resize event listener to update canvas size
window.addEventListener('resize', function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
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
    event.preventDefault(); // Prevent default behavior
    touchDown = false;
}, false);

function calculateRectanglePosition() {
    let speed = rectangleSpeed + 0.1 * gameState.level; 
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
    if (gameState.messageFlags.lifeLost) {
        displayLifeLostMessage(ctx, gameState.lives);
    }
    if (gameState.messageFlags.dangerIncrease) {
        displayDangerIncreaseMessage(ctx);
    }
    if (gameState.messageFlags.newObstacle) {
        displayNewObstacleMessage(ctx, gameState.counter);
    }
    if (gameState.messageFlags.levelUp) {
        displayLevelUpMessage(ctx, gameState.counter);
    }
    if (gameState.messageFlags.newLife) {
        displayNewLifeMessage(ctx);
    }
}

function levelUp() {
    gameState.level++;
    gameState.messageFlags.levelUp = true
    setTimeout(() => {
        gameState.messageFlags.levelUp = false;
    }, 900);
}

function newLife() {
    gameState.lives++;
    heartObj = null;
    gameState.messageFlags.newLife = true
    setTimeout(() => {
        gameState.messageFlags.newLife = false;
    }, 900);
}

function updateGame() {
    if (!gameState.death.isDead) {
        calculateRectanglePosition();
        moveTriangles(trianglesObj, rectangleObj, gameState.counter);
        moveHexes(hexesObj, rectangleObj);

        if (checkCollisionWithCircle(circleObj, rectangleObj)) {
            if (circleObj.special === true) {
                levelUp();
            }
            startWhiteGlowAnimation();
            nextPhase();
        }
        if (checkCollisionWithTriangles(trianglesObj, rectangleObj)
            || checkCollisionWithHexes(hexesObj, rectangleObj)) {
            lostLife();
        }

        if (checkCollisionWithHeart(heartObj, rectangleObj)) {
            newLife();
        }
    }

    ctx.save();
    if (gameState.death.isDead) {
        ctx.globalAlpha = gameState.death.opacity;
        gameState.death.opacity -= 0.02;
        if (gameState.death.opacity <= 0) {
            gameState.death.opacity = 0;
        }
    }
    drawRectangle(ctx, rectangleObj);
    glowRectangle(ctx, rectangleObj);
    ctx.restore();

    drawCircle(ctx, circleObj);
    drawTriangles(ctx, trianglesObj);
    drawHexes(ctx, hexesObj);
    drawHeart(ctx, heartObj);

    displayCounter(ctx, gameState);
    displayLives(ctx, gameState.lives);
    displayFps(ctx, fpsCounter.calculateFPS());

    showMessages();
}

function lostLife() {
    gameState.death.isDead = true;
    gameState.death.opacity = 1;
    gameState.messageFlags.lifeLost = true;

    setTimeout(() => {
        gameState.death.isDead = false;
        gameState.messageFlags.lifeLost = false;
        gameState.lives--;

        if (gameState.lives > 0) {
            resetTrianglesPositions(trianglesObj);
            resetHexPositions(hexesObj);
            resetRectanglePosition();
        }
    }, dyingTime);
}


function drawDeath(ctx, rectangleObj) {
    ctx.globalAlpha = gameState.death.opacity;
    gameState.death.opacity -= 0.02;
    if (gameState.death.opacity <= 0) {
        gameState.death.opacity = 0;
    }
    drawRectangle(ctx, rectangleObj);
    ctx.globalAlpha = 1;
    ctx.restore();
}

function nextPhase() {
    gameState.counter++;

    if (gameState.counter % 5 === 0) {
        if (gameState.counter % 15 === 0) {
            if (hexesObj.length < 10) {  // Limit number of hexes
                hexesObj.push(newRandomHex());
                gameState.messageFlags.newObstacle = true
                setTimeout(() => {
                    gameState.messageFlags.newObstacle = false;
                }, 900);
            }
        } else {
            if (trianglesObj.length < 15) {  // Limit number of triangles
                trianglesObj.push(newRandomTriangle());
                gameState.messageFlags.dangerIncrease = true
                setTimeout(() => {
                    gameState.messageFlags.dangerIncrease = false;
                }, 900);
            }
        }
    }

    if (gameState.counter % 10 === 0) {
        circleObj = newRandomCircleSpecial(rectangleObj);
    } else {
        circleObj = newRandomCircle(rectangleObj);
    }

    if (gameState.counter % 20 === 0) {
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

function randomCirclePosition(rectangleObj, dimension) {
    let attempts = 0;
    let position;
    const maxDimension = dimension === 'x' ? canvas.width : canvas.height;
    const rectanglePosition = dimension === 'x' ? rectangleObj.x : rectangleObj.y;

    do {
        position = Math.random() * (maxDimension - circleEdgeMargin);
        attempts++;
    } while (position > rectanglePosition - minimumSpawnDistance && 
             position < rectanglePosition + minimumSpawnDistance && 
             attempts < 100);
    
    return position;
}

function randomCircleX(rectangleObj) {
    return randomCirclePosition(rectangleObj, 'x');
}

function randomCircleY(rectangleObj) {
    return randomCirclePosition(rectangleObj, 'y');
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
    let heartY = randomCircleY(rectangleObj);
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

    if (!gameState.gameRunning) {
        displayStartGame();
    } else if (gameState.lives > 0) {
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
    gameState.messageFlags.gameOver = true;

    displayGameOver(gameState.counter);
    // change game over state to false after 1 second
    setTimeout(() => {
        gameState.messageFlags.gameOver = false;
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
    trianglesObj.push(newRandomTriangle(rectangleObj));
    circleObj = newRandomCircle(rectangleObj);
    hexesObj = [];

    gameState.counter = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.gameRunning = false;
}

function glowRectangle(ctx, rectangleObj) {
    if (gameState.glow.isGlowing) {
        ctx.save();
        ctx.shadowBlur = gameState.glow.intensity;
        ctx.shadowColor = 'white';
        drawRectangle(ctx, rectangleObj);
        ctx.restore();
        gameState.glow.intensity = Math.max(0, gameState.glow.intensity - maxGlowIntensity/100);
    }
}

function startWhiteGlowAnimation() {
    gameState.glow.isGlowing = true;
    gameState.glow.intensity = maxGlowIntensity;
    setTimeout(() => {
        gameState.glow.isGlowing = false;
        gameState.glow.intensity = 0;
    }, glowDuration);
}

window.onload = function () {
    resetGameState();
    gameLoop();
}

