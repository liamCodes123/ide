export class PixelForgeEditor {
    constructor(textareaId, highlightLayerId, lineNumbersId) {
        this.tx = document.getElementById(textareaId);
        this.hl = document.getElementById(highlightLayerId);
        this.ln = document.getElementById(lineNumbersId);
        
        this.initListeners();
        this.update();
    }

    initListeners() {
        this.tx.addEventListener('input', () => this.update());
        
        // Synchronize scroll coordinates across layers perfectly
        this.tx.addEventListener('scroll', () => {
            this.hl.scrollTop = this.tx.scrollTop;
            this.hl.scrollLeft = this.tx.scrollLeft;
            this.ln.scrollTop = this.tx.scrollTop;
        });

        this.tx.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    update() {
        const code = this.tx.value;
        
        // Compute and sync lines
        const lines = code.split('\n');
        let lineStr = '';
        for (let i = 1; i <= lines.length; i++) {
            lineStr += i + '<br>';
        }
        this.ln.innerHTML = lineStr;

        // Perform single-pass highlighting compilation
        this.hl.innerHTML = this.highlightSyntax(code);
    }

    handleKeydown(e) {
        const start = this.tx.selectionStart;
        const end = this.tx.selectionEnd;
        const val = this.tx.value;

        // Handle Tab Interceptions
        if (e.key === 'Tab') {
            e.preventDefault();
            this.tx.value = val.substring(0, start) + "    " + val.substring(end);
            this.tx.selectionStart = this.tx.selectionEnd = start + 4;
            this.update();
        }

        // Auto-Close Pair Character Interceptions
        const pairs = { '{': '}', '(': ')', '[': ']', '"': '"', "'": "'" };
        if (pairs[e.key] !== undefined) {
            e.preventDefault();
            const closeChar = pairs[e.key];
            this.tx.value = val.substring(0, start) + e.key + closeChar + val.substring(end);
            this.tx.selectionStart = this.tx.selectionEnd = start + 1;
            this.update();
        }
    }

    highlightSyntax(code) {
        // Step 1: Sanitize HTML tags to prevent cross-injection breaks
        let escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Step 2: Single-pass master tokenizer regex
        // Group 1: Comments, Group 2: Strings, Group 3: Keywords, Group 4: This, Group 5: Core Built-ins, Group 6: Numbers, Group 7: Member Properties
        const masterRegex = /(\/\/[^\n]*)|(["'](?:\\.|[^"\\])*["'])|\b(let|class|fn|if|new|return)\b|\b(this)\b|\b(print|clear|rect|line|collides)\b(?=\s*\()|\b(\d+)\b|(?<=\.)([a-zA-Z_][a-zA-Z0-9_]*)\b/g;

        return escaped.replace(masterRegex, (match, g1, g2, g3, g4, g5, g6, g7) => {
            if (g1) return `<span class="tk-comment">${match}</span>`;
            if (g2) return `<span class="tk-string">${match}</span>`;
            if (g3) return `<span class="tk-keyword">${match}</span>`;
            if (g4) return `<span class="tk-this">${match}</span>`;
            if (g5) return `<span class="tk-builtin">${match}</span>`;
            if (g6) return `<span class="tk-number">${match}</span>`;
            if (g7) return `<span class="tk-member">${match}</span>`;
            return match;
        });
    }
}
