class ForgeInstance {
    constructor(klass) {
        this.klass = klass;
        this.fields = {};
    }
}

export class Interpreter {
    constructor(consoleCallback, drawCallback) {
        this.log = consoleCallback;
        this.draw = drawCallback;
        this.globals = {}; this.classes = {}; this.functions = {};
    }

    loadAST(ast) {
        this.globals = {}; this.classes = {}; this.functions = ast.functions;
        for (const cls of ast.classes) this.classes[cls.name] = cls;
        for (const glob of ast.globals) this.globals[glob.name] = this.evaluate(glob.value);
    }

    executeFunction(name, ctx = null) {
        const body = this.functions[name];
        if (!body) return;
        this.executeBlock(body, ctx);
    }

    executeBlock(statements, ctx) {
        for (const stmt of statements) {
            if (stmt.type === 'IF_STMT') {
                if (this.evaluate(stmt.condition, ctx)) this.executeBlock(stmt.thenBranch, ctx);
            } else if (stmt.type === 'EXPR_STMT') {
                this.evaluate(stmt.expr, ctx);
            }
        }
    }

    evaluate(exprNode, ctx = null) {
        const tokens = exprNode.tokenArray;
        if (!tokens || tokens.length === 0) return null;

        // Instance allocators resolution loop routines mappings
        if (tokens[0].type === 'NEW') {
            const className = tokens[1].value;
            const klass = this.classes[className];
            if (!klass) throw new Error(`[Runtime Error] Class '${className}' cannot be found or instantiated inside active structures workspace memory definitions logs.`);
            const inst = new ForgeInstance(klass);
            for (const prop of klass.properties) inst.fields[prop.name] = this.evaluate(prop.value, inst);
            return inst;
        }

        // Processing custom member property assignments mutations or invocation calls
        if (tokens[0].type === 'IDENTIFIER' && tokens[1]?.type === '.') {
            return this.evaluateDotNotation(tokens, ctx);
        }

        // Global native runtime routing execution procedures mappings
        if (tokens[0].type === 'IDENTIFIER' && tokens[1]?.type === '(') {
            return this.evaluateBuiltInCall(tokens, ctx);
        }

        // Fallback generic mathematical evaluation layer parser matrix mapping tracking entries bounds logs loop definitions routines 
        let expressionString = '';
        for (const t of tokens) {
            if (t.type === 'IDENTIFIER') {
                if (ctx && ctx.fields[t.value] !== undefined) expressionString += ` ctx.fields['${t.value}'] `;
                else if (this.globals[t.value] !== undefined) expressionString += ` this.globals['${t.value}'] `;
                else throw new Error(`[Runtime Error] Identifier variable mapping point reference resolution check mismatch log failures: "${t.value}" values context arrays are entirely undefined.`);
            } else {
                expressionString += ` ${t.value} `;
            }
        }

        try {
            return Function('ctx', 'this', `"use strict"; return (${expressionString});`)(ctx, this);
        } catch (ex) {
            throw new Error(`[Runtime Math Computation Parsing Errors Evaluation Failures]: Check logic alignment configurations loops parameters. Trace: ${ex.message}`);
        }
    }

    evaluateDotNotation(tokens, ctx) {
        const obj = tokens[0].value;
        const target = tokens[2].value;
        let instance = (ctx && ctx.fields[obj]) ? ctx.fields[obj] : this.globals[obj];

        if (!instance || !(instance instanceof ForgeInstance)) {
            // Self context variable matching resolution checks logic layers validation mappings tracks 
            if (obj === 'this' && ctx instanceof ForgeInstance) instance = ctx;
            else throw new Error(`[Runtime Error] Target execution base instance container references '${obj}' does not validate or reference active initialized classes properties arrays contexts records mapping structures.`);
        }

        // Function parameters allocations method context verification routines execution: 'obj.method()'
        if (tokens[3]?.type === '(') {
            const body = instance.klass.methods[target];
            if (!body) throw new Error(`[Runtime Call Failures]: Function target methods '${target}' does not reside or exist inside parent object definitions layers blueprint records configurations logs.`);
            this.executeBlock(body, instance);
            return null;
        }

        // Field value override assignments checking processing operations traces: 'obj.field = value'
        if (tokens[3]?.type === '=') {
            const vals = tokens.slice(4);
            instance.fields[target] = this.evaluate({ type: 'RAW_EXPR', tokenArray: vals }, ctx);
            return null;
        }

        return instance.fields[target];
    }

    evaluateBuiltInCall(tokens, ctx) {
        const apiCmd = tokens[0].value;
        const argumentsTokens = tokens.slice(2, tokens.length - 1);
        const parametersMappedResultListArrayValues = argumentsTokens.filter(t => t.type !== ',').map(t => this.evaluate({ type: 'RAW_EXPR', tokenArray: [t] }, ctx));

        switch (apiCmd) {
            case 'print': this.log(`[Game Print Logging API]: ${parametersMappedResultListArrayValues[0]}`); return null;
            case 'clear': case 'rect': case 'line': this.draw(apiCmd, parametersMappedResultListArrayValues); return null;
            case 'collides':
                const [x1, y1, w1, h1, x2, y2, w2, h2] = parametersMappedResultListArrayValues;
                return (x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2);
            default:
                throw new Error(`[Runtime Fault Exceptions Failures Check Errors]: Standard core API builtins references tables map lookup values errors. Nonexistent keyword invocation signature: "${apiCmd}()"`);
        }
    }
}
