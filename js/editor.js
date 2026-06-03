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
        
        // Lock scroll alignments together instantly
        this.tx.addEventListener('scroll', () => {
            this.hl.scrollTop = this.tx.scrollTop;
            this.hl.scrollLeft = this.tx.scrollLeft;
            this.ln.scrollTop = this.tx.scrollTop;
        });

        this.tx.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    update() {
        const code = this.tx.value;
        
        // 1. Render Line Counter Arrays
        const lineCount = code.split('\n').length;
        let lineStr = '';
        for (let i = 1; i <= lineCount; i++) {
            lineStr += i + '<br>';
        }
        this.ln.innerHTML = lineStr;

        // 2. Syntax Rendering Transformation 
        this.hl.innerHTML = this.highlightSyntax(code);
    }

    handleKeydown(e) {
        const start = this.tx.selectionStart;
        const end = this.tx.selectionEnd;
        const val = this.tx.value;

        // Tab Key Override Action
        if (e.key === 'Tab') {
            e.preventDefault();
            this.tx.value = val.substring(0, start) + "    " + val.substring(end);
            this.tx.selectionStart = this.tx.selectionEnd = start + 4;
            this.update();
        }

        // Auto-Close Boundary Bracket Pairs Map Execution
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
        // Escape special HTML character symbols safely
        let html = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Regular expression maps for token processing rules
        html = html.replace(/(\/\/.+)/g, '<span class="tk-comment">$1</span>');
        html = html.replace(/(["'])(.*?)\1/g, '<span class="tk-string">$1$2$1</span>');
        html = html.replace(/\b(let|class|fn|if|new|return)\b/g, '<span class="tk-keyword">$1</span>');
        html = html.replace(/\b(this)\b/g, '<span class="tk-this">$1</span>');
        html = html.replace(/\b(\d+)\b/g, '<span class="tk-number">$1</span>');
        html = html.replace(/\b(print|clear|rect|line|collides)\b(?=\s*\()/g, '<span class="tk-builtin">$1</span>');

        return html;
    }
}
