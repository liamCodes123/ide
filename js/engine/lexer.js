export class Lexer {
    constructor(source) {
        this.source = source;
        this.cursor = 0;
        this.line = 1;
        this.col = 1;
    }

    error(msg) {
        throw new Error(`[Lexer Error] Line ${this.line}, Col ${this.col}: ${msg}`);
    }

    tokenize() {
        const tokens = [];
        while (this.cursor < this.source.length) {
            let char = this.source[this.cursor];

            if (char === '\n') {
                this.line++;
                this.cursor++;
                this.col = 1;
                continue;
            }

            if (/\s/.test(char)) {
                this.cursor++;
                this.col++;
                continue;
            }

            if (char === '/' && this.source[this.cursor + 1] === '/') {
                while (this.cursor < this.source.length && this.source[this.cursor] !== '\n') {
                    this.cursor++;
                }
                continue;
            }

            if (/\d/.test(char)) {
                let numStr = '';
                const startCol = this.col;
                while (this.cursor < this.source.length && /[\d\.]/.test(this.source[this.cursor])) {
                    numStr += this.source[this.cursor++];
                    this.col++;
                }
                tokens.push({ type: 'NUMBER', value: Number(numStr), line: this.line, col: startCol });
                continue;
            }

            if (char === '"' || char === "'") {
                const quote = char;
                let str = '';
                const startLine = this.line;
                const startCol = this.col;
                this.cursor++; this.col++; 
                
                while (this.cursor < this.source.length && this.source[this.cursor] !== quote) {
                    if (this.source[this.cursor] === '\n') { this.line++; this.col = 1; }
                    str += this.source[this.cursor++];
                    this.col++;
                }

                if (this.cursor >= this.source.length) {
                    this.line = startLine; this.col = startCol;
                    this.error("Unterminated string literal pattern bounds mismatch detector.");
                }

                this.cursor++; this.col++; // Skip trailing delimiter
                tokens.push({ type: 'STRING', value: str, line: startLine, col: startCol });
                continue;
            }

            if (/[a-zA-Z_]/.test(char)) {
                let id = '';
                const startCol = this.col;
                while (this.cursor < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.cursor])) {
                    id += this.source[this.cursor++];
                    this.col++;
                }

                const keywords = ['let', 'fn', 'if', 'class', 'new', 'return'];
                let type = keywords.includes(id) ? id.toUpperCase() : 'IDENTIFIER';
                tokens.push({ type, value: id, line: this.line, col: startCol });
                continue;
            }

            const doubleChar = char + (this.source[this.cursor + 1] || '');
            if (['==', '!=', '<=', '>='].includes(doubleChar)) {
                tokens.push({ type: 'OPERATOR', value: doubleChar, line: this.line, col: this.col });
                this.cursor += 2; this.col += 2;
                continue;
            }

            if (['=', '+', '-', '*', '/', '<', '>', '{', '}', '(', ')', ',', '.'].includes(char)) {
                tokens.push({ type: char, value: char, line: this.line, col: this.col });
                this.cursor++; this.col++;
                continue;
            }

            this.error(`Unexpected token symbol sequence encountered: '${char}'`);
        }

        tokens.push({ type: 'EOF', value: null, line: this.line, col: this.col });
        return tokens;
    }
}
