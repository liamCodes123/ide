export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    peek() { return this.tokens[this.current]; }
    previous() { return this.tokens[this.current - 1]; }
    isAtEnd() { return this.peek().type === 'EOF'; }
    
    advance() {
        if (!this.isAtEnd()) this.current++;
        return this.previous();
    }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    check(type) {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    consume(type, message) {
        if (this.check(type)) return this.advance();
        throw new Error(`[Parser Error] Line ${this.peek().line}: ${message}`);
    }

    parseProject() {
        const program = { globals: [], classes: [], functions: {} };

        while (!this.isAtEnd()) {
            if (this.match('LET')) {
                program.globals.push(this.varDeclaration());
            } else if (this.match('CLASS')) {
                program.classes.push(this.classDeclaration());
            } else if (this.match('FN')) {
                const func = this.functionDeclaration();
                program.functions[func.name] = func.body;
            } else {
                throw new Error(`[Parser Error] Unexpected global statement token "${this.peek().value}" at line ${this.peek().line}`);
            }
        }
        return program;
    }

    varDeclaration() {
        const name = this.consume('IDENTIFIER', 'Expect variable name.').value;
        this.consume('=', 'Expect "=" after variable assignment.');
        const value = this.expression();
        return { type: 'VAR_DECL', name, value };
    }

    classDeclaration() {
        const className = this.consume('IDENTIFIER', 'Expect class name.').value;
        this.consume('{', 'Expect "{" before class body.');
        
        const properties = [];
        const methods = {};

        while (!this.check('}') && !this.isAtEnd()) {
            if (this.match('LET')) {
                const prop = this.varDeclaration();
                properties.push(prop);
            } else if (this.match('FN')) {
                const method = this.functionDeclaration();
                methods[method.name] = method.body;
            } else {
                this.advance();
            }
        }
        this.consume('}', 'Expect "}" after class body.');
        return { type: 'CLASS_DECL', name: className, properties, methods };
    }

    functionDeclaration() {
        const name = this.consume('IDENTIFIER', 'Expect function name.').value;
        this.consume('(', 'Expect "(" after function name.');
        this.consume(')', 'Expect ")" after arguments list.');
        this.consume('{', 'Expect "{" before execution block.');
        
        const body = [];
        while (!this.check('}') && !this.isAtEnd()) {
            body.push(this.statement());
        }
        this.consume('}', 'Expect "}" after execution block.');
        return { name, body };
    }

    statement() {
        if (this.match('IF')) return this.ifStatement();
        return { type: 'EXPR_STMT', expr: this.expression() };
    }

    ifStatement() {
        const condition = this.expression();
        this.consume('{', 'Expect "{" after condition constraint.');
        const thenBranch = [];
        while (!this.check('}') && !this.isAtEnd()) {
            thenBranch.push(this.statement());
        }
        this.consume('}', 'Expect "}" after condition block execution window.');
        return { type: 'IF_STMT', condition, thenBranch };
    }

    expression() {
        return { type: 'RAW_EXPR', tokenArray: this.gatherExpressionTokens() };
    }

    gatherExpressionTokens() {
        const tokens = [];
        let braceDepth = 0;
        // Read tokens up to statement delimiter/block anchors safely
        while (!this.isAtEnd()) {
            const t = this.peek();
            if (braceDepth === 0 && (t.type === '\n' || t.type === '}' || t.type === '{')) break;
            if (t.type === '{') braceDepth++;
            if (t.type === '}') braceDepth--;
            tokens.push(this.advance());
        }
        return tokens;
    }
}
