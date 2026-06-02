class ForgeInstance {
    constructor(klass) {
        this.klass = klass;
        this.fields = {};
        // Initialize default fields from class properties
        for (const prop of klass.properties) {
            this.fields[prop.name] = null; 
        }
    }
}

export class Interpreter {
    constructor(consoleCallback, drawCallback) {
        this.log = consoleCallback;
        this.draw = drawCallback;
        this.globals = {};
        this.classes = {};
        this.functions = {};
    }

    loadAST(ast) {
        this.globals = {};
        this.classes = {};
        this.functions = ast.functions;

        // Process Classes
        for (const cls of ast.classes) {
            this.classes[cls.name] = cls;
        }
        // Process Global initial evaluations
        for (const glob of ast.globals) {
            this.globals[glob.name] = this.evaluate(glob.value);
        }
    }

    executeFunction(name, instanceContext = null) {
        const body = this.functions[name];
        if (!body) return;
        this.executeBlock(body, instanceContext);
    }

    executeBlock(statements, ctx) {
        for (const stmt of statements) {
            if (stmt.type === 'IF_STMT') {
                if (this.evaluate(stmt.condition, ctx)) {
                    this.executeBlock(stmt.thenBranch, ctx);
                }
            } else if (stmt.type === 'EXPR_STMT') {
                this.evaluate(stmt.expr, ctx);
            }
        }
    }

    evaluate(exprNode, ctx = null) {
        const tokens = exprNode.tokenArray;
        if (tokens.length === 0) return null;

        // OOP Instance Creation: 'new ClassName()'
        if (tokens[0].type === 'NEW') {
            const className = tokens[1].value;
            const klass = this.classes[className];
            if (!klass) throw new Error(`Class ${className} is not defined.`);
            const instance = new ForgeInstance(klass);
            
            // Populate initial properties
            for (const prop of klass.properties) {
                instance.fields[prop.name] = this.evaluate(prop.value, instance);
            }
            return instance;
        }

        // Native API / Free Function Call Evaluators: 'print(...)' or 'rect(...)'
        if (tokens[0].type === 'IDENTIFIER' && tokens[1]?.type === '(') {
            return this.evaluateBuiltIn(tokens, ctx);
        }

        // Object Method Call Or Property Mutation Evaluator: 'player.move()' or 'player.x = 10'
        if (tokens[0].type === 'IDENTIFIER' && tokens[1]?.type === '.') {
            return this.handleObjectDotNotation(tokens, ctx);
        }

        // Simple Math Expression / Variable Resolver Pipeline
        let exprStr = '';
        for (const t of tokens) {
            if (t.type === 'IDENTIFIER') {
                if (ctx && ctx.fields[t.value] !== undefined) {
                    exprStr += ` ctx.fields['${t.value}'] `;
                } else if (this.globals[t.value] !== undefined) {
                    exprStr += ` this.globals['${t.value}'] `;
                } else {
                    exprStr += t.value;
                }
            } else {
                exprStr += ` ${t.value} `;
            }
        }

        try {
            return Function('ctx', 'this', `"use strict"; return (${exprStr});`)(ctx, this);
        } catch {
            return null;
        }
    }

    handleObjectDotNotation(tokens, currentCtx) {
        const objName = tokens[0].value;
        const propOrMethod = tokens[2].value;
        
        let targetInstance = (currentCtx && currentCtx.fields[objName]) ? currentCtx.fields[objName] : this.globals[objName];
        if (!targetInstance || !(targetInstance instanceof ForgeInstance)) {
            throw new Error(`Target object reference '${objName}' is not a valid class instance object.`);
        }

        // Method execution invocation check: 'player.update()'
        if (tokens[3]?.type === '(') {
            const methodBody = targetInstance.klass.methods[propOrMethod];
            if (!methodBody) throw new Error(`Method ${propOrMethod} not found on class ${targetInstance.klass.name}`);
            this.executeBlock(methodBody, targetInstance);
            return null;
        }

        // Assignment execution mutation: 'player.x = 20'
        if (tokens[3]?.type === '=') {
            const sliceValueTokens = tokens.slice(4);
            targetInstance.fields[propOrMethod] = this.evaluate({ type: 'RAW_EXPR', tokenArray: sliceValueTokens }, currentCtx);
            return null;
        }

        // Property access fetch
        return targetInstance.fields[propOrMethod];
    }

    evaluateBuiltIn(tokens, ctx) {
        const cmd = tokens[0].value;
        // Simple token collection between parenthesis strings extraction maps
        const argsTokens = tokens.slice(2, tokens.length - 1);
        const args = argsTokens.filter(t => t.type !== ',').map(t => this.evaluate({ type: 'RAW_EXPR', tokenArray: [t] }, ctx));

        switch (cmd) {
            case 'print': this.log(`[Script]: ${args[0]}`); return null;
            case 'clear': this.draw('clear', args); return null;
            case 'rect': this.draw('rect', args); return null;
            case 'line': this.draw('line', args); return null;
            case 'collides':
                // Custom Builtin Physics Engine: AABB Bounding Box Check API
                // Usage: collides(x1, y1, w1, h1, x2, y2, w2, h2)
                return (args[0] < args[4] + args[6] &&
                        args[0] + args[2] > args[4] &&
                        args[1] < args[5] + args[7] &&
                        args[1] + args[3] > args[5]);
            default:
                throw new Error(`Unknown Engine function call command lookup hook identifier: ${cmd}`);
        }
    }
}
