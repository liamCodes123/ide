import { PixelForgeEditor } from './editor.js';
import { Lexer } from './engine/lexer.js';
import { Parser } from './engine/parser.js';
import { Interpreter } from './engine/interpreter.js';
import { GameRuntime } from './runtime.js';

document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const workspaces = document.querySelectorAll('.workspace-view');
    const consoleLog = document.getElementById('console-output');
    
    const btnRun = document.getElementById('btn-run');
    const btnStop = document.getElementById('btn-stop');

    // 1. Initialize Highlighting Core Editor Elements
    const editor = new PixelForgeEditor('code-textarea', 'editor-highlight-layer', 'editor-line-numbers');

    // 2. Instantiate Runtime & Interpreter Engine Blocks Context Systems 
    const runtime = new GameRuntime('game-viewport');
    const interpreter = new Interpreter(
        (msg, type) => appendIDEConsole(msg, type),
        (cmd, args) => runtime.executeRenderOperation(cmd, args)
    );

    // Tab Panel View Port View State Swapping Routing Processing Logic Controls
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            workspaces.forEach(w => w.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.getAttribute('data-target')).classList.add('active');
        });
    });

    // Compilation Build Action Request Execution Lifecycle Orchestration Engine Trigger Handlers
    btnRun.addEventListener('click', () => {
        appendIDEConsole("Parsing codebase and processing structural tokens verification routines...", "system");
        
        try {
            const sourceCodeValue = document.getElementById('code-textarea').value;
            
            // Step A: Lexing
            const lexer = new Lexer(sourceCodeValue);
            const tokens = lexer.tokenize();

            // Step B: Parsing
            const parser = new Parser(tokens);
            const ast = parser.parseProject();

            // Step C: Execution
            interpreter.loadAST(ast);
            appendIDEConsole("Project structure verification complete. Initializing frame pipeline cycles components mappings entries...", "system");

            runtime.start(
                () => interpreter.executeFunction('init'),
                () => interpreter.executeFunction('update')
            );
        } catch (error) {
            // Precise target error feedback printing to IDE footer output monitor logs channels
            appendIDEConsole(error.message, "error");
            runtime.stop();
        }
    });

    btnStop.addEventListener('click', () => {
        runtime.stop();
        appendIDEConsole("Game viewport lifecycle sequence stopped cleaner runtime process hooks execution loops terminated logs.", "system");
    });

    function appendIDEConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerHTML = `<span class="time">[${new Date().toLocaleTimeString()}]</span><span>${message}</span>`;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }

    appendIDEConsole("PixelForge Studio system initialization success metrics active.", "system");
});
