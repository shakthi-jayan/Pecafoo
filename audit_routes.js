const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const http = require('http');

const apps = ['customer-app', 'restaurant-app', 'delivery-app', 'admin-app'];
const routes = {
    'customer-app': ['/', '/login', '/register', '/forgot-password', '/search', '/wishlist', '/cart', '/profile'],
    'restaurant-app': ['/', '/login', '/register', '/settings'],
    'delivery-app': ['/', '/login', '/register', '/profile'],
    'admin-app': ['/', '/login', '/users', '/orders']
};

async function waitForPort(port, maxRetries = 30) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await new Promise((resolve, reject) => {
                const req = http.get(`http://localhost:${port}`, (res) => {
                    resolve(true);
                });
                req.on('error', (e) => reject(e));
            });
            return true;
        } catch (e) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return false;
}

async function run() {
    const browser = await puppeteer.launch({ 
        headless: 'new',
        channel: 'chrome'
    });

    for (const app of apps) {
        console.log(`\n=== Testing ${app} ===`);
        const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
            cwd: `c:/Users/Machodev/Documents/Pecafoo/frontend/${app}`,
            stdio: 'ignore',
            shell: true,
            env: { ...process.env, PORT: "5173" }
        });

        const isUp = await waitForPort(5173);
        if (!isUp) {
            console.error(`Failed to start dev server for ${app}`);
            server.kill();
            continue;
        }

        const page = await browser.newPage();
        const appRoutes = routes[app] || ['/'];
        
        for (const route of appRoutes) {
            console.log(`Checking route: ${route}`);
            let hasError = false;
            
            page.on('pageerror', err => {
                console.error(`[ERROR on ${route}] Page Error:`, err.message);
                hasError = true;
            });
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    // Ignore some harmless 404s for API calls since backend might be down
                    if (!msg.text().includes('Failed to load resource')) {
                        console.error(`[ERROR on ${route}] Console Error:`, msg.text());
                        hasError = true;
                    }
                }
            });

            await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => {
                console.error(`[ERROR on ${route}] Navigation Failed:`, e.message);
                hasError = true;
            });

            // Check if root has content (no blank page)
            const rootHtml = await page.evaluate(() => {
                const root = document.getElementById('root');
                return root ? root.innerHTML.trim() : '';
            });

            if (!rootHtml) {
                console.error(`[ERROR on ${route}] BLANK PAGE! div#root is empty.`);
                hasError = true;
            }

            if (!hasError) {
                console.log(`  [OK] ${route}`);
            }
        }
        
        await page.close();
        server.kill('SIGINT');
        // Give it a moment to die
        await new Promise(r => setTimeout(r, 2000));
    }
    await browser.close();
    console.log('\nAudit complete.');
    process.exit(0);
}

run().catch(console.error);
