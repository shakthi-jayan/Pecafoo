const fs = require('fs');
const path = require('path');

const APPS = ['customer-app', 'restaurant-app', 'delivery-app', 'admin-app'];
const BASE_DIR = path.resolve('c:/Users/Machodev/Documents/Pecafoo/frontend');
const SHARED_UI_SRC = path.join(BASE_DIR, 'shared-ui');

function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        if (fs.lstatSync(srcPath).isDirectory()) {
            copyRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

for (const app of APPS) {
    const appDir = path.join(BASE_DIR, app);
    const srcDir = path.join(appDir, 'src');
    const destSharedUi = path.join(srcDir, 'shared-ui');
    
    // Copy shared-ui
    copyRecursiveSync(SHARED_UI_SRC, destSharedUi);
    
    // Process files
    function walkDir(dir) {
        for (const item of fs.readdirSync(dir)) {
            const filepath = path.join(dir, item);
            if (fs.lstatSync(filepath).isDirectory()) {
                if (filepath !== destSharedUi) {
                    walkDir(filepath);
                }
            } else if (/\.(jsx?|css)$/.test(filepath)) {
                let content = fs.readFileSync(filepath, 'utf8');
                
                const relToSrc = path.relative(dir, srcDir);
                let relToShared = (relToSrc === '' ? '.' : relToSrc) + '/shared-ui';
                relToShared = relToShared.replace(/\\/g, '/');
                if (!relToShared.startsWith('.')) relToShared = './' + relToShared;
                
                const regex = /(['"])(?:\.\.\/)+shared-ui([^'"]*)['"]/g;
                if (regex.test(content)) {
                    content = content.replace(regex, (match, q1, suffix) => {
                        return q1 + relToShared + suffix + q1;
                    });
                    fs.writeFileSync(filepath, content, 'utf8');
                    console.log('Updated ' + filepath);
                }
            }
        }
    }
    walkDir(srcDir);
}
console.log('Done.');
