function drawRectangle(ctx, rectangleObj) {
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

function drawCircle(ctx, circleObj) {
    ctx.beginPath();
    ctx.arc(circleObj.x, circleObj.y, circleObj.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = circleObj.color;
    ctx.fill();
}

function drawTriangles(ctx, trianglesObj) {
    trianglesObj.forEach(triangle => {
        drawTriangle(ctx, triangle);
    });
}

function drawHexes(ctx, hexesObj) {
    hexesObj.forEach(hex => {
        drawHex(ctx, hex);
    });
}

function drawHex(ctx, hexObj) {
    let hex = hexObj.calculatePolygon();
    ctx.beginPath();
    ctx.moveTo(hex[0].x, hex[0].y);
    ctx.lineTo(hex[1].x, hex[1].y);
    ctx.lineTo(hex[2].x, hex[2].y);
    ctx.lineTo(hex[3].x, hex[3].y);
    ctx.lineTo(hex[4].x, hex[4].y);
    ctx.lineTo(hex[5].x, hex[5].y);
    ctx.closePath();
    ctx.fillStyle = hexObj.color;
    ctx.fill();
}

function drawHeart(ctx, heartObj) {
    if (heartObj == null) {
        return;
    }

    // Calculate the pulsation scale based on time
    const pulsationScale = Math.abs(Math.sin(Date.now() * 0.005));

    // Calculate the size of the heart based on the pulsation scale
    const heartSize = heartObj.radius + (pulsationScale * 15);

    // Draw the pulsating heart
    ctx.font = `${heartSize}px Arial`;
    ctx.fillStyle = heartObj.color;
    ctx.fillText('\u2764', heartObj.x - (heartSize / 2), heartObj.y + (heartSize / 2));

    // // Request the next animation frame
    // requestAnimationFrame(() => drawHeart(ctx, heartObj));
}

function drawTriangle(ctx, triangleObj) {
    let triangle = triangleObj.calculatePolygon();
    ctx.beginPath();
    ctx.moveTo(triangle[0].x, triangle[0].y);
    ctx.lineTo(triangle[1].x, triangle[1].y);
    ctx.lineTo(triangle[2].x, triangle[2].y);
    ctx.closePath();
    ctx.fillStyle = triangleObj.color;
    ctx.fill();
}