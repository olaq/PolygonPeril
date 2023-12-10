const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const version = '0.0.6';

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 25;
const circleRadius = 10; // Change this to change the size of the circle
const rectangleSpeed = 2; // Change this to make the rectangle move faster or slower

const rectangleColor = '#307bad'; // Solarized pastel blue
const triangleColor = '#c94a48'; // Solarized red
const circleColor = '#76bd52';

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

function drawRectangle() {
    let rectangle = rectangleObj.calculatePolygon();

    ctx.fillStyle = rectangleObj.color;
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

function resetCirclePosition() {
    circleObj.x = Math.random() * (canvas.width - 50);
    circleObj.y = Math.random() * (canvas.height - 50);
}

function checkCollisionWithCircle() {
    const dx = circleObj.x - rectangleObj.x;
    const dy = circleObj.y - rectangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < circleObj.radius + baseSize) {
        // Increase the counter
        counter++;

        if (counter % 5 === 0) {
            // Add a new triangle to the triangles array
            let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
            let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];
            trianglesObj.push(new Triangle(triangleX, triangleY, triangleColor));
        }

        // Move the circle to a new random position
        resetCirclePosition();
    }
}

function drawTriangles() {
    trianglesObj.forEach(triangle => {
        drawTriangle(triangle);
    });
}

function drawTriangle(triangleObj) {
    let triangle = triangleObj.calculatePolygon();
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.closePath();
    ctx.fillStyle = triangleObj.color;
    ctx.fill();
}

function moveTriangles() {
    trianglesObj.forEach(triangle => {
        moveTriangle(triangle);
    });
}

function moveTriangle(triangleObj) {
    const dx = rectangleObj.x - triangleObj.x;
    const dy = rectangleObj.y - triangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Calculate the fluctuation factor for the triangle's speed
        const speedFluctuationFactor = Math.random() * 0.4 + 0.9;

        // Calculate the fluctuation factor for the triangle's direction
        const directionFluctuationFactor = Math.random() * 0.7 - 0.1;

        // Increase the speed of the triangle with the counter and fluctuation factor
        const triangleSpeed = (0.2 + counter * 0.03) * speedFluctuationFactor;

        // Fluctuate the direction of the triangle's movement
        const newDirectionX = directionX + directionFluctuationFactor;
        const newDirectionY = directionY + directionFluctuationFactor;

        triangleObj.x = triangleObj.x + newDirectionX * triangleSpeed;
        triangleObj.y = triangleObj.y + newDirectionY * triangleSpeed;
    }
}

function checkCollisionWithTriangles() {
    trianglesObj.forEach(triangle => {
        checkCollisionWithTriangle(triangle);
    });
}

function checkCollisionWithTriangle(triangleObj) {

    let rectangle = rectangleObj.calculatePolygon();
    let triangle = triangleObj.calculatePolygon();

    if (polygonsOverlap(rectangle, triangle)) {
        lostLife();
    }
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
    displayText(ctx, 'Polygon Peril', canvas.width / 2, canvas.height / 2 - 150, 'red', 70);
    displayText(ctx, 'Survive the Shape Shift!', canvas.width / 2, canvas.height / 2 - 100, 'red', 30);
    displayText(ctx, 'Click to play the game', canvas.width / 2, canvas.height / 2, 'red', 20);
}

function displayInstructions(ctx) {
    displayText(ctx, 'Instructions:', canvas.width / 2, canvas.height / 2 + 100, 'lightgrey', 20);
    displayText(ctx, '1. Avoid the triangles.', canvas.width / 2, canvas.height / 2 + 130, 'lightgrey');
    displayText(ctx, '2. Collect the circles to gain points.', canvas.width / 2, canvas.height / 2 + 160, 'lightgrey');
    displayText(ctx, '3. You have 3 lives. Good luck!', canvas.width / 2, canvas.height / 2 + 190, 'lightgrey');
}

function displayVersion(ctx) {
    displayText(ctx, version, canvas.width - 10, canvas.height - 15, 'grey', 14, 'right');
}


function updateGame() {
    calculateRectanglePosition();
    moveTriangles();

    drawRectangle();
    drawCircle();
    drawTriangles();

    displayCounter();
    displayLives();
    displayFps();

    checkCollisionWithCircle();
    checkCollisionWithTriangles();
}

function lostLife() {
    lives--;
    lifeLostMessageFlag = true
    resetTrianglesPositions();
    resetRectanglePosition();
    setTimeout(() => {
        lifeLostMessageFlag = false;
    }, 900);
}

function displayLifeLostMessage() {
    displayText(ctx, 'You died!', canvas.width / 2, canvas.height / 2, 'red', 50);
    // display number of lives left
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '\u2764 ';
    }
    displayText(ctx, 'Lives left: ' + livesText, canvas.width / 2, canvas.height / 2 + 50, 'red', 30);

}

function resetTrianglesPositions() {
    trianglesObj.forEach(triangle => {
        triangle.x = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
        triangle.y = [50, canvas.height - 50][Math.floor(Math.random() * 2)];
    });
}

function resetRectanglePosition() {
    rectangleObj.x = canvas.width / 2;
    rectangleObj.y = canvas.height / 2;
}

function gameLoop() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameRunning) {
        displayStartGame();
    } else if (lives > 0) {
        updateGame();
        if (lifeLostMessageFlag) {
            displayLifeLostMessage();
        }
        requestAnimationFrame(gameLoop);
    } else {
        executeGameOver();
    }
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

function displayGameOver() {
    displayText(ctx, 'GAME OVER', canvas.width / 2, canvas.height / 2, 'red', 50);
    displayText(ctx, `Points: ${counter}`, canvas.width / 2, canvas.height / 2 + 50, 'red', 30);
}

window.onload = function () {
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let circleX = Math.random() * (canvas.width - 50);
    let circleY = Math.random() * (canvas.height - 50);
    let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
    let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];


    rectangleObj = new Rectangle(x, y, baseSize, baseSize, rectangleColor);
    trianglesObj.push(new Triangle(triangleX, triangleY, triangleColor));
    circleObj = new Circle(circleX, circleY, circleRadius, circleColor);


    displayStartGame();
}

function resetGameState() {
    // Reset the game variables
    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let circleX = Math.random() * (canvas.width - 50);
    let circleY = Math.random() * (canvas.height - 50);
    let triangleX = Math.random() * (canvas.width - 50);
    let triangleY = Math.random() * (canvas.height - 50);

    rectangleObj = new Rectangle(x, y, baseSize, baseSize, rectangleColor);
    trianglesObj = [];
    trianglesObj.push(new Triangle(triangleX, triangleY, triangleColor));
    circleObj = new Circle(circleX, circleY, circleRadius, circleColor);

    counter = 0;
    lives = 3;
    gameRunning = false;
}
