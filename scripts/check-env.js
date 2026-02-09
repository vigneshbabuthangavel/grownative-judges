const fs = require('fs');
const path = require('path');

const requiredVersion = '22.11.0';

function checkNodeVersion() {
    const currentVersion = process.version.replace('v', '');
    const majorVersion = currentVersion.split('.')[0];

    if (majorVersion !== '22') {
        console.error(`\x1b[31m
===================================================================
CRITICAL ENVIRONMENT ERROR
===================================================================
You are running Node.js ${process.version}.
This project requires Node.js v22.x.

Please run:
    nvm use
    (or install it: nvm install 22)

The app will not start to prevent hard-to-debug issues.
===================================================================\x1b[0m`);
        process.exit(1);
    } else {
        console.log(`\x1b[32m✔ Environment check passed: Node.js ${process.version}\x1b[0m`);
    }
}

checkNodeVersion();
