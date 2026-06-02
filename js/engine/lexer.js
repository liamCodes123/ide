export class Lexer {
    constructor(source) {
        this.source = source;
        this.cursor = 0;
        this.line = 1;
    }

    tokenize() {
        const tokens = [];
        while (this.cursor < this.source.length) {
            let char = this.source[this.cursor];

            // Handle Newlines & Whitespace
            if (char === '\n') { this.line++; this.cursor++; continue; }
            if (/\s/.test(char)) { this.cursor++; continue; }

            // Skip Comments
            if (char === '/' && this.source[this.cursor + 1] === '/') {
                while (this.cursor < this.source.length && this.source[this.cursor] !== '\n') {
                    this.cursor++;
                }
                continue;
            }

            // Numeric Literals
            if (/\d/.test(char)) {
                let numStr = '';
                while (this.cursor < this.source.length && /[\d\.]/.test(this.source[this.cursor])) {
                    numStr += this.source[this.cursor++];
                }
                tokens.push({ type: 'NUMBER', value: Number(numStr), line: this.line });
                continue;
            }

            // Strings Literals
            if (char === '"' || char === "'") {
                const quoteType = char;
                let str = '';
                this.cursor++; // Skip opening quote
                while (this.cursor < this.source.length && this.source[this.cursor] !== quoteType) {
                    str += this.source[this.cursor++];
                }
                this.cursor++; // Skip closing quote
                tokens.push({ type: 'STRING', value: str, line: this.line });
                continue;
            }

            // Identifiers / Keywords
            if (/[a-zA-Z_]/.test(char)) {
                let id = '';
                while (this.cursor < this.source.length && /[a-zA-Z0-9_]/.test(this.source[this.cursor])) {
                    id += this.source[this.cursor++];
                }
                
                const keywords = ['let', 'fn', 'if', 'class', 'new', 'return'];
                let type = keywords.includes(id) ? id.toUpperCase() : 'IDENTIFIER';
                tokens.push({ type, value: id, line: this.line });
                continue;
            }

            // Operators & Multi-char Syntax
            const doubleChar = char + (this.source[this.cursor + 1] || '');
            if (['==', '!=', '<=', '>='].includes(doubleChar)) {
                tokens.push({ type: 'OPERATOR', value: doubleChar, line: this.line });
                this.cursor += 2;
                continue;
            }

            // Single Character Symbols
            if (['=', '+', '-', '*', '/', '<', '>', '{', '}', '(', ')', ',', '.'].includes(char)) {
                tokens.push({ type: char, value: char, line: this.line });
                this.cursor++;
                continue;
            }

            throw new Error(`[Lexer Error] Unknown token character '${char}' at line ${this.line}`);
        }
        tokens.push({ type: 'EOF', value: null, line: this.line });
        return tokens;
    }
}
