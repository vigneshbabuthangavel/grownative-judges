const { execSync } = require('child_process');

const PORTS = [3000, 3001];

PORTS.forEach(port => {
    try {
        // console.log(`Checking port ${port}...`);
        // lsof -t -i:PORT returns PIDs. If no process, it throws (exit code 1).
        const stdout = execSync(`lsof -t -i:${port}`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();

        if (stdout) {
            const pids = stdout.split('\n').filter(Boolean);
            pids.forEach(pid => {
                console.log(`🧹 Killing existing process ${pid} on port ${port}...`);
                try {
                    execSync(`kill -9 ${pid}`);
                } catch (err) {
                    // Ignore if already dead
                }
            });
        }
    } catch (e) {
        // lsof returns non-zero if no process found, which is fine.
    }
});

console.log('✨ Ports 3000-3001 are clear. Starting server...');
