class FPSCounter {
    constructor() {
        this.lastTime = Date.now();
        this.frames = 0;
        this.fps = 0;
    }

    calculateFPS() {
        // Calculate the time difference
        let now = Date.now();
        let delta = now - this.lastTime;

        // Increase the frame count
        this.frames++;

        // Calculate the FPS every second
        if (delta >= 1000) {
            this.fps = this.frames;
            this.frames = 0;
            this.lastTime = now;
        }
        return this.fps;
    }
}
