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
