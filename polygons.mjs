class Rectangle {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.pulseDirection = 1;
        this.pulseSpeed = 0.07;
        this.minSize = width * 0.95;
        this.maxSize = width * 1.05;
    }

    // Method to calculate the polygon representation
    calculatePolygon() {
        return [
            { x: this.x - this.width, y: this.y - this.height },
            { x: this.x + this.width, y: this.y - this.height },
            { x: this.x + this.width, y: this.y + this.height },
            { x: this.x - this.width, y: this.y + this.height }
        ];
    }

    // Method to update the rectangle's size for the pulsating effect
    update() {
        this.width -= this.pulseDirection * this.pulseSpeed;
        this.height += this.pulseDirection * this.pulseSpeed;

        if (this.height > this.maxSize) {
            this.pulseDirection = -1;
        } else if (this.height < this.minSize) {
            this.pulseDirection = 1;
        }
    }
}

class Triangle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    // Method to calculate the polygon representation
    calculatePolygon() {
        return [
            { x: this.x, y: this.y },
            { x: this.x - 33, y: this.y + 66 },
            { x: this.x + 33, y: this.y + 66 }
        ];
    }
}

class Circle {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
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

function checkCollisionWithTriangles(trianglesObj, rectangleObj) {
    let collide = false
    trianglesObj.forEach(triangle => {
        if (checkCollisionWithTriangle(triangle, rectangleObj)) {
            collide = true;
        }
    });
    return collide;
}

function checkCollisionWithTriangle(triangleObj, rectangleObj) {

    let rectangle = rectangleObj.calculatePolygon();
    let triangle = triangleObj.calculatePolygon();

    return polygonsOverlap(rectangle, triangle);
}

function moveTriangles(trianglesObj, rectangleObj) {
    trianglesObj.forEach(triangle => {
        moveTriangle(triangle, rectangleObj);
    });
}

function moveTriangle(triangleObj, rectangleObj) {
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

function checkCollisionWithCircle(circleObj, rectangleObj) {
    const dx = circleObj.x - rectangleObj.x;
    const dy = circleObj.y - rectangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circleObj.radius + rectangleObj.width;
}

function resetTrianglesPositions(trianglesObj,triangleEdgeMargin) {
    trianglesObj.forEach(triangle => {
        triangle.x = randomSideX(triangleEdgeMargin);
        triangle.y = randomSideY(triangleEdgeMargin);
    });
}