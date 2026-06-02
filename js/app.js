import { Lexer } from './engine/lexer.js';
import { Parser } from './engine/parser.js';
import { Interpreter } from './engine/interpreter.js';
import { GameRuntime } from './runtime.js';

document.addEventListener('DOMContentLoaded', () => {
    const codeArea = document.getElementById('code-textarea');
    const consoleLog = document.getElementById('console-output');
    const btnRun = document.getElementById('btn-run');
    const btnStop = document.getElementById('btn-stop');

    const runtime = new GameRuntime('game-viewport');
    const interpreter = new Interpreter(
        (msg, type) => logToIDEConsole(msg, type),
        (cmd, args) => runtime.executeRenderOperation(cmd, args)
    );

    btnRun.addEventListener('click', () => {
        logToIDEConsole("Lexical parsing initialization...", "system");
        try {
            // 1. Run Lexical Analysis
            const lexer = new Lexer(codeArea.value);
            const tokens = lexer.tokenize();

            // 2. Syntactic Analysis (Generate AST)
            const parser = new Parser(tokens);
            const ast = parser.parseProject();

            // 3. Mount Abstract Syntax Tree onto interpreter runtime structures
            interpreter.loadAST(ast);
            logToIDEConsole("AST Generated Successfully. Initializing Runtime Engine...", "system");

            // 4. Fire Loop Pipelines
            runtime.start(
                () => interpreter.executeFunction('init'),
                () => interpreter.executeFunction('update')
            );
        } catch (ex) {
            logToIDEConsole(`Build Execution Failure: ${ex.message}`, "error");
        }
    });

    btnStop.addEventListener('click', () => {
        runtime.stop();
        logToIDEConsole("Engine execution loop cleanly halted.", "system");
    });

    function logToIDEConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        line.innerHTML = `<span class="time">[${new Date().toLocaleTimeString()}]</span> <span>${message}</span>`;
        consoleLog.appendChild(line);
        consoleLog.scrollTop = consoleLog.scrollHeight;
    }
});
