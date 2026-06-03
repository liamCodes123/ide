export class GameRuntime {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.loopId = null; this.activeStateRunningFlag = false;
        this.tickUpdateProc = () => {};
    }

    start(initProc, updateProc) {
        this.stop(); this.activeStateRunningFlag = true;
        initProc(); // Fire setup execution functions immediately inside compilation context pipelines wrappers 
        this.tickUpdateProc = updateProc;
        
        const loop = () => {
            if (!this.activeStateRunningFlag) return;
            this.tickUpdateProc();
            this.loopId = requestAnimationFrame(loop);
        };
        this.loopId = requestAnimationFrame(loop);
    }

    stop() {
        this.activeStateRunningFlag = false;
        if (this.loopId) cancelAnimationFrame(this.loopId);
        this.ctx.fillStyle = "#000000"; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    executeRenderOperation(cmd, args) {
        this.ctx.imageSmoothingEnabled = false;
        if (cmd === 'clear') {
            this.ctx.fillStyle = args[0] || "#000";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        } else if (cmd === 'rect') {
            const [x, y, w, h, color] = args;
            this.ctx.fillStyle = color || "#fff";
            this.ctx.fillRect(x, y, w, h);
        } else if (cmd === 'line') {
            const [x1, y1, x2, y2, color] = args;
            this.ctx.strokeStyle = color || "#fff"; this.ctx.lineWidth = 1;
            this.ctx.beginPath(); this.ctx.moveTo(x1, y1); this.ctx.lineTo(x2, y2); this.ctx.stroke();
        }
    }
}
