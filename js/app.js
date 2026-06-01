import { ForgeCompiler } from './compiler.js';
import { GameRuntime } from './runtime.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // Node references mapping
    const tabButtons = document.querySelectorAll('.tab-btn');
    const workspaces = document.querySelectorAll('.workspace-view');
    const codeArea = document.getElementById('code-textarea');
    const consoleLog = document.getElementById('console-output');
    
    const btnRun = document.getElementById('btn-run');
    const btnStop = document.getElementById('btn-stop');

    // 1. Initialize Modules Instantiation System
    const runtime = new GameRuntime('game-viewport');
    const compiler = new ForgeCompiler(
        (msg, type) => logToIDEConsole(msg, type),
        (cmd, args) => runtime.executeRenderOperation(cmd, args)
    );

    // 2. View Panel Workspace Switcher Routing Handling logic
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            workspaces.forEach(view => view.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.getAttribute('data-target')).classList.add('active');
        });
    });

    // 3. Project Actions Runtime Processing Mapping Hooks
    btnRun.addEventListener('click', () => {
        logToIDEConsole("Initializing runtime engine pipeline compilation execution...", "system");
        
        try {
            // Read current script source code state representation string
            const source = codeArea.value;
            compiler.compile(source);

            // Bind compilation result outputs to active game engine frame update runtime arrays 
            runtime.start(
                () => compiler.executeFunction('init'),
                () => compiler.executeFunction('update')
            );
        } catch(ex) {
            logToIDEConsole(`Build Failed compilation check: ${ex.message}`, "error");
        }
    });

    btnStop.addEventListener('click', () => {
        runtime.stop();
        logToIDEConsole("Engine execution execution loops halted cleanly.", "system");
    });

    // Console rendering context feedback system 
    function logToIDEConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span class="time">[${timestamp}]</span><span>${message}</span>`;
        
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight; 
    }

    // Fire default diagnostic setup log messages line entry references
    logToIDEConsole("PixelForge Studio IDE interface systems active.", "system");
});
