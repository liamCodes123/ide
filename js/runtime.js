export class GameRuntime {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.animationFrameId = null;
        this.isRunning = false;
        this.onUpdateTick = () => {}; 
    }

    /**
     * Starts up the game runtime frame ticks sequence execution systems
     */
    start(initCallback, updateCallback) {
        this.stop(); // Clean legacy loop items out instantly
        this.isRunning = true;
        
        // Fire initial setup callback once
        initCallback();

        // Bind update frame cycles loop pipeline handler
        this.onUpdateTick = updateCallback;
        const loop = () => {
            if (!this.isRunning) return;
            this.onUpdateTick();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }

    /**
     * Terminate loops safely, preventing context leaks
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        // Force back visual environment baseline states visually
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Native graphics context wrapper for custom language functions
     */
    executeRenderOperation(cmd, args) {
        if (cmd === 'clear') {
            this.ctx.fillStyle = args[0] || "#000000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } 
        else if (cmd === 'rect') {
            const [x, y, w, h, color] = args;
            this.ctx.fillStyle = color || "#ffffff";
            this.ctx.fillRect(x, y, w, h);
        }
    }
}
