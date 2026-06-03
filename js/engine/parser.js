export class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.current = 0;
    }

    peek() { return this.tokens[this.current]; }
    previous() { return this.tokens[this.current - 1]; }
    isAtEnd() { return this.peek().type === 'EOF'; }
    advance() { if (!this.isAtEnd()) this.current++; return this.previous(); }
    check(type) { return this.isAtEnd() ? false : this.peek().type === type; }

    match(...types) {
        for (const type of types) {
            if (this.check(type)) { this.advance(); return true; }
        }
        return false;
    }

    error(token, msg) {
        return new Error(`[Parser Error] Line ${token.line}, Col ${token.col}: ${msg}`);
    }

    consume(type, errMsg) {
        if (this.check(type)) return this.advance();
        throw this.error(this.peek(), errMsg);
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
                throw this.error(this.peek(), `Expected structural keyword layout definition blocks but got instead: "${this.peek().value}"`);
            }
        }
        return program;
    }

    varDeclaration() {
        const name = this.consume('IDENTIFIER', 'Missing structural variable label identifier context references.').value;
        this.consume('=', 'Missing variable value initialization symbol reference token "=".');
        const value = this.expression();
        return { type: 'VAR_DECL', name, value };
    }

    classDeclaration() {
        const className = this.consume('IDENTIFIER', 'Missing class naming declaration tokens.').value;
        this.consume('{', 'Expected encapsulation start brace symbol "{" after class statement structures.');
        
        const properties = [];
        const methods = {};

        while (!this.check('}') && !this.isAtEnd()) {
            if (this.match('LET')) {
                properties.push(this.varDeclaration());
            } else if (this.match('FN')) {
                const method = this.functionDeclaration();
                methods[method.name] = method.body;
            } else {
                throw this.error(this.peek(), `Illegal structural assignment type encountered inside class scope constraints: "${this.peek().value}"`);
            }
        }
        this.consume('}', 'Missing class closure matching brace structure wrapper "}" character elements.');
        return { type: 'CLASS_DECL', name: className, properties, methods };
    }

    functionDeclaration() {
        const name = this.consume('IDENTIFIER', 'Missing functional target declaration signature identifiers.').value;
        this.consume('(', 'Missing standard argument encapsulation start block parameters mapping execution bounds "(" token references.');
        this.consume(')', 'Missing closure parameters array mappings parenthesis element components character matching ")" reference mappings.');
        this.consume('{', 'Missing function method runtime definition operational bounds initializer block opening curly brace token "{".');
        
        const body = [];
        while (!this.check('}') && !this.isAtEnd()) {
            body.push(this.statement());
        }
        this.consume('}', 'Missing matching functional context scope final closing curly brace bracket "}" block tokens.');
        return { name, body };
    }

    statement() {
        if (this.match('IF')) return this.ifStatement();
        return { type: 'EXPR_STMT', expr: this.expression() };
    }

    ifStatement() {
        const condition = this.expression();
        this.consume('{', 'Missing conditional code block entry activation anchor curly braces opening bracket elements "{".');
        const thenBranch = [];
        while (!this.check('}') && !this.isAtEnd()) {
            thenBranch.push(this.statement());
        }
        this.consume('}', 'Missing trailing closure bracket element character components tracking conditional execution boundaries layout structures "}".');
        return { type: 'IF_STMT', condition, thenBranch };
    }

    expression() {
        return { type: 'RAW_EXPR', tokenArray: this.gatherExpressionTokens() };
    }

    gatherExpressionTokens() {
        const tokens = [];
        let braceDepth = 0;
        if (this.isAtEnd()) return tokens;
        const startLine = this.peek().line;

        while (!this.isAtEnd()) {
            const t = this.peek();
            if (braceDepth === 0 && t.line !== startLine) break;
            if (braceDepth === 0 && (t.type === '}' || t.type === '{')) break;
            
            if (t.type === '{') braceDepth++;
            if (t.type === '}') braceDepth--;
            
            tokens.push(this.advance());
        }
        return tokens;
    }
}
