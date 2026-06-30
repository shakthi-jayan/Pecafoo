const fs = require("fs");
const path = require("path");

const apps = ["customer-app", "restaurant-app", "delivery-app", "admin-app"];

const aliasCode = `    resolve: {
      alias: {
        'react': require('path').resolve(__dirname, 'node_modules/react'),
        'react-dom': require('path').resolve(__dirname, 'node_modules/react-dom'),
        'react/jsx-runtime': require('path').resolve(__dirname, 'node_modules/react/jsx-runtime'),
        'framer-motion': require('path').resolve(__dirname, 'node_modules/framer-motion'),
        'lucide-react': require('path').resolve(__dirname, 'node_modules/lucide-react'),
        'react-router-dom': require('path').resolve(__dirname, 'node_modules/react-router-dom')
      }
    },`;

for (const app of apps) {
    const configPath = path.join(__dirname, "frontend", app, "vite.config.js");
    let content = fs.readFileSync(configPath, "utf-8");
    
    if (content.includes("resolve: {")) {
        // Already has resolve, skip or manual fix
        console.log(`Skipping ${app}, already has resolve block`);
        // For customer-app we added it manually earlier, so let's just replace it entirely
        if (app === "customer-app") {
            content = content.replace(/resolve: {[\s\S]*?},/, aliasCode);
            fs.writeFileSync(configPath, content);
            console.log(`Updated ${app}`);
        }
        continue;
    }
    
    // Find plugins: [...]
    content = content.replace(/plugins:\s*\[.*?\]\s*,/, `$&
${aliasCode}`);
    
    fs.writeFileSync(configPath, content);
    console.log(`Updated ${app}`);
}
