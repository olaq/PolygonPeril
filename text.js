
function displayCounter(ctx, counter) {
    displayText(ctx, `Points: ${counter}`, canvas.width - 10, 30, 'grey', 20, 'right')
}

function displayLives(ctx, lives) {
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '\u2764 ';
    }
    displayText(ctx, livesText, 10, 30, 'red', 20, 'left');
}

function displayFps(ctx, fps) {
    displayText(ctx, 'FPS: ' + fps, 10, canvas.height - 15, 'grey', 14, 'left');
}

function displayGameIntro(ctx) {
    displayText(ctx, 'Polygon Peril', canvas.width / 2, canvas.height / 2 - 150, 'red', 70);
    displayText(ctx, 'Survive the Shape Shift!', canvas.width / 2, canvas.height / 2 - 100, 'red', 30);
    displayText(ctx, 'Click to play the game', canvas.width / 2, canvas.height / 2, 'red', 20);
    displayText(ctx, 'https://github.com/olaq/PolygonPeril', 10, canvas.height - 15, 'darkgrey', 15, 'left');
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

function displayLifeLostMessage(ctx, lives) {
    displayText(ctx, 'You died!', canvas.width / 2, canvas.height / 2, 'red', 50);
    // display number of lives left
    let livesText = '';
    for (let i = 0; i < lives; i++) {
        livesText += '\u2764 ';
    }
    displayText(ctx, 'Lives left: ' + livesText, canvas.width / 2, canvas.height / 2 + 50, 'red', 30);
}

function displayDangerIncreaseMessage(ctx) {
    displayText(ctx, 'Danger increased!', canvas.width / 2, canvas.height / 2, triangleColor, 20);
}

function displayNewObstacleMessage(ctx) {
    displayText(ctx, 'New obstacle!', canvas.width / 2, canvas.height / 2, hexColor, 20);
}

// function displayLevelUpMessage(ctx) {
//     displayText(ctx, 'Level up!', canvas.width / 2, canvas.height / 2, 'green', 20);
// }

function displayGameOver() {
    displayText(ctx, 'GAME OVER', canvas.width / 2, canvas.height / 2, 'red', 50);
    displayText(ctx, `Points: ${counter}`, canvas.width / 2, canvas.height / 2 + 50, 'red', 30);
}

function displayText(ctx, text, x, y, color = 'white', fontSize = 20, align = 'center') {
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
}

