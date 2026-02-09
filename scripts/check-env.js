const fs = require('fs');
const path = require('path');

const requiredVersion = '22.11.0';

function checkNodeVersion() {
    const currentVersion = process.version.replace('v', '');

    if (currentVersion !== requiredVersion) {
        console.error(`\x1b[31m
===================================================================
CRITICAL ENVIRONMENT ERROR
===================================================================
You are running Node.js ${process.version}.
This project STRICTLY requires Node.js v${requiredVersion}.

Please run:
    nvm use
    (or install it: nvm install ${requiredVersion})

The app will not start to prevent hard-to-debug issues.
===================================================================\x1b[0m`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m✔ Environment check passed: Node.js ${process.version}\x1b[0m`);
    }
}

checkNodeVersion();
