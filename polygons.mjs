class Rectangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
}

class Triangle {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    // calculatePolygon() {
    //     return [
    //         { x: this.x, y: this.y },
    //         { x: this.x - 33, y: this.y + 66 },
    //         { x: this.x + 33, y: this.y + 66 }
    //     ];
    // }
}
