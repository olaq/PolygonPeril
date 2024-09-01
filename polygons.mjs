class Polygon {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    // Abstract method to calculate the polygon representation
    calculatePolygon() {
        throw new Error("Method 'calculatePolygon()' must be implemented.");
    }

    isCollidingWith(otherPolygonObj) {
        if(otherPolygonObj == null) {
            return false;
        }
        let firstPolygon = this.calculatePolygon();
        let otherPolygon = otherPolygonObj.calculatePolygon();
        return polygonsOverlap(firstPolygon, otherPolygon);
    }

    isCollidingWithMultiple(otherPolygonObjs) {
        if(otherPolygonObjs == null) {
            return false;
        }
        let collide = false;
        otherPolygonObjs.forEach(object => {
            if (this.isCollidingWith(object)) {
                collide = true;
            }   
        });
        return collide;
    }
}

class Rectangle extends Polygon {
    constructor(x, y, width, height, color) {
        super(x, y, color);
        this.width = width;
        this.height = height;

        this.pulseDirection = 1;
        this.pulseSpeed = 0.07;
        this.minHeight = height * 0.95;
        this.maxHeight = height * 1.05;
    }

    calculatePolygon() {
        return [
            {x: this.x - this.width, y: this.y - this.height},
            {x: this.x + this.width, y: this.y - this.height},
            {x: this.x + this.width, y: this.y + this.height},
            {x: this.x - this.width, y: this.y + this.height}
        ];
    }

    update() {
        this.width -= this.pulseDirection * this.pulseSpeed;
        this.height += this.pulseDirection * this.pulseSpeed;

        if (this.height > this.maxHeight) {
            this.pulseDirection = -1;
        } else if (this.height < this.minHeight) {
            this.pulseDirection = 1;
        }
    }
}

class Triangle extends Polygon {
    constructor(x, y, color) {
        super(x, y, color);
    }

    calculatePolygon() {
        return [
            {x: this.x, y: this.y},
            {x: this.x - 33, y: this.y + 66},
            {x: this.x + 33, y: this.y + 66}
        ];
    }
}

class Circle extends Polygon {
    constructor(x, y, radius, color, special = false) {
        super(x, y, color);
        this.radius = radius;
        this.special = special;
    }

    calculatePolygon() {
        const segments = 16; // Increase for better approximation
        const points = [];
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            points.push({
                x: this.x + this.radius * Math.cos(angle),
                y: this.y + this.radius * Math.sin(angle)
            });
        }
        return points;
    }
}

class Heart extends Circle {
    constructor(x, y, radius) {
        super(x, y, radius, 'red', true);
    }
}

class Hex extends Polygon {
    constructor(x, y, color, radius) {
        super(x, y, color);
        this.radius = radius;
    }

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

function moveTriangles(trianglesObj, rectangleObj, hexesObj, counter, canvasWidth, canvasHeight) {
    trianglesObj.forEach(triangle => {
        moveTriangle(triangle, rectangleObj, hexesObj, counter, canvasWidth, canvasHeight);
    });
}

function moveTriangle(triangleObj, rectangleObj, hexesObj, counter, canvasWidth, canvasHeight) {
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

        const newX = triangleObj.x + newDirectionX * triangleSpeed;
        const newY = triangleObj.y + newDirectionY * triangleSpeed;

        // Check boundaries before updating position
        if (newX >= 0 && newX <= canvasWidth && newY >= 0 && newY <= canvasHeight) {
            if(!triangleObj.isCollidingWithMultiple(hexesObj)) {
                triangleObj.x = newX;
                triangleObj.y = newY;
            } else {
                triangleObj.x = triangleObj.x - newDirectionX * triangleSpeed;
                triangleObj.y = triangleObj.y - newDirectionY * triangleSpeed;
            }
        }
    }
}

function moveHexes(hexesObj, rectangleObj, canvasWidth, canvasHeight) {
    hexesObj.forEach(hex => {
        moveHex(hex, rectangleObj, canvasWidth, canvasHeight);
    });
}

function moveHex(hexObj, rectangleObj, canvasWidth, canvasHeight) {
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

        const newX = hexObj.x + newDirectionX * hexSpeed;
        const newY = hexObj.y + newDirectionY * hexSpeed;

        // Check boundaries before updating position
        if (newX >= 0 && newX <= canvasWidth && newY >= 0 && newY <= canvasHeight) {
            hexObj.x = newX;
            hexObj.y = newY;
        }
    }
}
