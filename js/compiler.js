export class ForgeCompiler {
    constructor(outputConsoleCallback, runtimeGraphicsCallback) {
        this.log = outputConsoleCallback;
        this.drawCall = runtimeGraphicsCallback;
        this.variables = {};
        this.functions = { init: [], update: [] };
    }

    /**
     * Resets execution context scopes completely
     */
    reset() {
        this.variables = {};
        this.functions = { init: [], update: [] };
    }

    /**
     * Compiles raw input text script configurations 
     */
    compile(sourceCode) {
        this.reset();
        const lines = sourceCode.split('\n');
        let currentScope = null;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            
            // Skip empty items & commentary expressions
            if (!line || line.startsWith('//')) continue;

            // Scoping Handler Entry points
            if (line.startsWith('fn init()')) { currentScope = 'init'; continue; }
            if (line.startsWith('fn update()')) { currentScope = 'update'; continue; }
            if (line == '}') { currentScope = null; continue; }

            if (currentScope) {
                this.functions[currentScope].push({ raw: line, lineNum: i + 1 });
            } else {
                // Global allocations context mapping
                this.executeStatement(line, i + 1);
            }
        }
        this.log("Compilation Successful!", "system");
    }

    /**
     * Runs localized specific system functions inside our code context arrays
     */
    executeFunction(name) {
        const statements = this.functions[name];
        if (!statements) return;

        for (const stmt of statements) {
            this.executeStatement(stmt.raw, stmt.lineNum);
        }
    }

    /**
     * Interprets a single command line instruction statement
     */
    executeStatement(line, lineNum) {
        try {
            // 1. Let/Variable Allocations Handling
            if (line.startsWith('let ')) {
                const parts = line.substring(4).split('=');
                const varName = parts[0].trim();
                const varValue = this.evaluateExpression(parts[1].trim());
                this.variables[varName] = varValue;
                return;
            }

            // 2. Conditionals Blocks Simplified Check 
            if (line.startsWith('if ')) {
                const conditionStr = line.match(/if\s+(.*)\s+\{/)[1];
                if (this.evaluateCondition(conditionStr)) {
                    // Primitive inside-block inline translation hook execution 
                    const inlineAction = line.split('{')[1].replace('}', '').trim();
                    if (inlineAction) this.executeStatement(inlineAction, lineNum);
                }
                return;
            }

            // 3. Variable mutations assignments check (e.g., x = x + 1)
            if (line.includes('=') && !line.startsWith('let')) {
                const parts = line.split('=');
                const varName = parts[0].trim();
                if (this.variables[varName] !== undefined) {
                    this.variables[varName] = this.evaluateExpression(parts[1].trim());
                    return;
                }
            }

            // 4. API Core Functions Mapped Call Execution
            const commandMatch = line.match(/^(\w+)\((.*)\)$/);
            if (commandMatch) {
                const cmd = commandMatch[1];
                const argsStr = commandMatch[2];
                const args = this.parseArgs(argsStr);

                this.runEngineAPI(cmd, args);
            }
        } catch (err) {
            this.log(`Runtime Error (Line ${lineNum}): ${err.message}`, "error");
        }
    }

    /**
     * Safe parameter parsing helper for strings/integers/variables
     */
    parseArgs(argsStr) {
        if (!argsStr.trim()) return [];
        return argsStr.split(',').map(arg => {
            arg = arg.trim();
            if (arg.startsWith('"') || arg.startsWith("'")) {
                return arg.slice(1, -1); // String clean-up
            }
            if (!isNaN(arg)) return Number(arg); // Integer mapping
            if (this.variables[arg] !== undefined) return this.variables[arg]; // Dynamic scope extraction
            return arg;
        });
    }

    /**
     * Evaluates elementary math computations (e.g. x + 1)
     */
    evaluateExpression(expr) {
        // Replace known variables tokens inside calculations
        let dynamicString = expr;
        for (const [key, value] of Object.entries(this.variables)) {
            dynamicString = dynamicString.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
        }
        // Native sandboxed resolution safe computing math context configurations
        return Function(`"use strict"; return (${dynamicString})`)();
    }

    /**
     * Evaluates single conditional operations logic elements
     */
    evaluateCondition(condStr) {
        let normalized = condStr;
        for (const [key, value] of Object.entries(this.variables)) {
            normalized = normalized.replace(new RegExp(`\\b${key}\\b`, 'g'), value);
        }
        return Function(`"use strict"; return (${normalized})`)();
    }

    /**
     * Engine Specific Standard API hooks mapping references directly 
     */
    runEngineAPI(cmd, args) {
        switch (cmd) {
            case 'print':
                this.log(`[Script Print]: ${args[0]}`);
                break;
            case 'clear':
            case 'rect':
                this.drawCall(cmd, args);
                break;
            default:
                throw new Error(`Unknown instruction call reference: "${cmd}"`);
        }
    }
}
