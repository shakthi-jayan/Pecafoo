const fs = require("fs");
const path = require("path");

const apps = ["customer-app", "restaurant-app", "delivery-app", "admin-app"];

const aliasCode = `    resolve: {
      alias: {
        'react': require('path').resolve(process.cwd(), 'node_modules/react'),
        'react-dom': require('path').resolve(process.cwd(), 'node_modules/react-dom'),
        'react/jsx-runtime': require('path').resolve(process.cwd(), 'node_modules/react/jsx-runtime'),
        'framer-motion': require('path').resolve(process.cwd(), 'node_modules/framer-motion'),
        'lucide-react': require('path').resolve(process.cwd(), 'node_modules/lucide-react'),
        'react-router-dom': require('path').resolve(process.cwd(), 'node_modules/react-router-dom')
      }
    },`;
    
const esmAliasCode = `    resolve: {
      alias: {
        'react': '/node_modules/react',
        'react-dom': '/node_modules/react-dom',
        'react/jsx-runtime': '/node_modules/react/jsx-runtime',
        'framer-motion': '/node_modules/framer-motion',
        'lucide-react': '/node_modules/lucide-react',
        'react-router-dom': '/node_modules/react-router-dom'
      }
    },`;

for (const app of apps) {
    const configPath = path.join(__dirname, "frontend", app, "vite.config.js");
    let content = fs.readFileSync(configPath, "utf-8");
    
    // Clean old resolve block
    content = content.replace(/resolve:\s*\{[\s\S]*?\},/, "");
    // Remove import path from 'path'
    content = content.replace(/import path from ['"]path['"];\n/, "");
    
    // Add new clean resolve block
    content = content.replace(/plugins:\s*\[.*?\]\s*,/, `$&
${esmAliasCode}`);
    
    fs.writeFileSync(configPath, content);
}
