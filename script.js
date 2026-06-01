document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const workspaces = document.querySelectorAll('.workspace-view');
    const btnRun = document.getElementById('btn-run');
    const consoleOutput = document.getElementById('console-output');

    // 1. View Switching Handler
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active states from tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Hide all workspaces
            workspaces.forEach(view => view.classList.remove('active'));

            // Add active state to clicked tab
            button.classList.add('active');
            // Show corresponding target workspace
            const targetId = button.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
            
            logToConsole(`Switched to ${button.textContent.trim()}`);
        });
    });

    // 2. Play Button Simulation
    btnRun.addEventListener('click', () => {
        logToConsole("Compiling custom language code...");
        
        // Simulating compilation delay
        setTimeout(() => {
            logToConsole("Success! Launching Game Runtime Window...", "system");
            alert("Game engine runtime hook would launch here!");
        }, 600);
    });

    // Helper function to append to console
    function logToConsole(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `log-${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span>[${timestamp}]</span> ${message}`;
        
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight; // Auto scroll to bottom
    }
});