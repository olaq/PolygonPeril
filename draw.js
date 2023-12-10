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