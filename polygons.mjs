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
            {x: this.x - this.width, y: this.y - this.height},
            {x: this.x + this.width, y: this.y - this.height},
            {x: this.x + this.width, y: this.y + this.height},
            {x: this.x - this.width, y: this.y + this.height}
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
            {x: this.x, y: this.y},
            {x: this.x - 33, y: this.y + 66},
            {x: this.x + 33, y: this.y + 66}
        ];
    }
}

class Circle {
    constructor(x, y, radius, color, special = false) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.special = special;
    }
}

class Heart {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}

class Hex {
    constructor(x, y, color, radius) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius;
    }

    // Method to calculate the polygon representation
    calculatePolygon() {
        const polygon = [];
        for (let i = 0; i < 6; i++) {
            const angle = 2 * Math.PI / 6 * i;
            polygon.push({x: this.x + this.radius * Math.cos(angle), y: this.y + this.radius * Math.sin(angle)});
        }
        return polygon;
    }
}

function getAxes(polygon) {
    let axes = [];
    for (let i = 0; i < polygon.length; i++) {
        let p1 = polygon[i];
        let p2 = polygon[i + 1 === polygon.length ? 0 : i + 1];
        let edge = {x: p1.x - p2.x, y: p1.y - p2.y};
        axes.push({x: -edge.y, y: edge.x});
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
    return {min, max};
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

function checkCollisionWithHeart(heartObj, rectangleObj) {
    if (heartObj == null) {
        return false;
    }
    const dx = heartObj.x - rectangleObj.x;
    const dy = heartObj.y - rectangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < heartObj.radius + rectangleObj.width;
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

function checkCollisionWithHexes(hexesObj, rectangleObj) {
    let collide = false
    hexesObj.forEach(hex => {
            if (checkCollisionWithHex(hex, rectangleObj)) {
                collide = true;
            }
        }
    );
    return collide;
}

function checkCollisionWithHex(hexObj, rectangleObj) {
    let rectangle = rectangleObj.calculatePolygon();
    let hex = hexObj.calculatePolygon();
    return polygonsOverlap(rectangle, hex);
}

function moveTriangles(trianglesObj, rectangleObj, counter) {
    trianglesObj.forEach(triangle => {
        moveTriangle(triangle, rectangleObj, counter);
    });
}

function moveTriangle(triangleObj, rectangleObj, counter) {
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

function moveHexes(hexesObj, rectangleObj) {
    hexesObj.forEach(hex => {
        moveHex(hex, rectangleObj);
    });
}

function moveHex(hexObj, rectangleObj) {
    const dx = rectangleObj.x - hexObj.x;
    const dy = rectangleObj.y - hexObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        const directionX = dx / distance;
        const directionY = dy / distance;

        // Calculate the fluctuation factor for the hex's speed
        const speedFluctuationFactor = Math.random() * 0.4;

        // Fluctuate the speed
        const hexSpeed = 0.5 * speedFluctuationFactor;

        // Fluctuate the direction of the hex's movement with sinus
        const newDirectionX = directionX + Math.sin(new Date().getTime() * 0.001) * 5;
        const newDirectionY = directionY + Math.cos(new Date().getTime() * 0.001) * 5;

        hexObj.x = hexObj.x + newDirectionX * hexSpeed;
        hexObj.y = hexObj.y + newDirectionY * hexSpeed;
    }
}

function checkCollisionWithCircle(circleObj, rectangleObj) {
    const dx = circleObj.x - rectangleObj.x;
    const dy = circleObj.y - rectangleObj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circleObj.radius + rectangleObj.width;
}

function resetTrianglesPositions(trianglesObj, triangleEdgeMargin) {
    trianglesObj.forEach(triangle => {
        triangle.x = randomSideX(triangleEdgeMargin);
        triangle.y = randomSideY(triangleEdgeMargin);
    });
}