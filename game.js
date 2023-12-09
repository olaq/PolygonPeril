const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Calculate the size of the square using a sine wave to make it pulsate
const baseSize = 25;
const amplitude = 5; // Change this to make the pulsating effect more or less pronounced
const frequency = 0.02; // Change this to make the pulsating effect faster or slower
const circleRadius = 10; // Change this to change the size of the circle
const rectangleSpeed = 2; // Change this to make the rectangle move faster or slower

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
    ArrowRight: false
};

// mouse position
let targetX 
let targetY
let mouseDown = false;

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

function calculateRectanglePosition() {
    // Calculate the new position
    console.log('rectangleObj', rectangleObj);

    let newX = rectangleObj.x
    let newY = rectangleObj.y
    if (keys.ArrowUp) newY -= rectangleSpeed;
    if (keys.ArrowDown) newY += rectangleSpeed;
    if (keys.ArrowLeft) newX -= rectangleSpeed;
    if (keys.ArrowRight) newX += rectangleSpeed;
    if (mouseDown) {
        // Calculate the direction vector
        let dx = targetX - x;
        let dy = targetY - y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let directionX = dx / distance;
        let directionY = dy / distance;

        newX += directionX * rectangleSpeed;
        newY += directionY * rectangleSpeed;
    }

    // Check if the new position is inside the canvas
    if (newX >= 0 + baseSize / 2 && newX <= canvas.width - baseSize / 2) {
        x = newX;
    }
    if (newY >= 0 + baseSize / 2 && newY <= canvas.height - baseSize / 2) {
        y = newY;
    }
    // update rectangle object
    rectangleObj = new Rectangle(x, y, baseSize, baseSize);
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
    console.log('circleObj', circleObj);
    ctx.beginPath();
    ctx.arc(circleObj.x, circleObj.y, circleObj.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
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

function drawCounter() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'grey';
    ctx.textAlign = 'right';
    ctx.fillText(`Points: ${counter}`, canvas.width - 10, 30);
}

function drawTriangle() {
    let triangle = triangleObj.calculatePolygon();
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.closePath();
    ctx.fillStyle = 'red';
    ctx.fill();
}

function moveTriangle() {
    const dx = x - triangleObj.x;
    const dy = y - triangleObj.y;
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

    let rectangle = rectangleObj.calculatePolygon();
    let triangle = triangleObj.calculatePolygon();

    // Check if the rectangle and triangle overlap using SAT
    if (polygonsOverlap(rectangle, triangle)) {
        // log triangle and rectangle
        console.log('triangle', triangle);
        console.log('rectangle', rectangle);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw triangle shadow
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(triangle[0].x, triangle[0].y);
        ctx.lineTo(triangle[1].x, triangle[1].y);
        ctx.lineTo(triangle[2].x, triangle[2].y);
        ctx.closePath();
        ctx.fill();

        // Draw rectangle shadow
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        ctx.moveTo(rectangle[0].x, rectangle[0].y);
        ctx.lineTo(rectangle[1].x, rectangle[1].y);
        ctx.lineTo(rectangle[2].x, rectangle[2].y);
        ctx.lineTo(rectangle[3].x, rectangle[3].y);
        ctx.closePath();
        ctx.fill();

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
    //log
    console.log('triangleObj', triangleObj);
    console.log('rectangleObj', rectangleObj);
    console.log('circleObj', circleObj);
    calculateRectanglePosition();
    drawRectangle();
    drawCircle();
    drawCounter();
    moveTriangle();
    drawTriangle();
    drawLives();
    checkOverlapTriangleRectangle();
    checkOverlapRectangleCircle();
    displayFps();
}

function displayFps() {
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
    let circleX = Math.random() * (canvas.width - 50);
    let circleY = Math.random() * (canvas.height - 50);
    let triangleX = [50, canvas.width - 50][Math.floor(Math.random() * 2)];
    let triangleY = [50, canvas.height - 50][Math.floor(Math.random() * 2)];


    rectangleObj = new Rectangle(x, y, baseSize, baseSize);
    triangleObj = new Triangle(triangleX, triangleY);
    circleObj = new Circle(circleX, circleY, circleRadius);

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
        let x = canvas.width / 2;
        let y = canvas.height / 2;
        let circleX = Math.random() * (canvas.width - 50);
        let circleY = Math.random() * (canvas.height - 50);
        let triangleX = Math.random() * (canvas.width - 50);
        let triangleY = Math.random() * (canvas.height - 50);
        
        rectangleObj = new Rectangle(x, y, baseSize, baseSize);
        triangleObj = new Triangle(triangleX, triangleY);
        circleObj = new Circle(circleX, circleY, circleRadius);

        counter = 0;
        lives = 3;

        // Start the game loop again
        gameLoop();
    }
});
