import os
import json

# 1. Create directories
os.makedirs('frontend/apps', exist_ok=True)
os.makedirs('frontend/packages', exist_ok=True)

# 2. Move directories (using python so it's clean)
import shutil
apps = ['customer-app', 'restaurant-app', 'delivery-app', 'admin-app']
for app in apps:
    if os.path.exists(f'frontend/{app}'):
        shutil.move(f'frontend/{app}', f'frontend/apps/{app}')

if os.path.exists('frontend/shared-ui'):
    shutil.move('frontend/shared-ui', 'frontend/packages/shared-ui')

# 3. Create workspace package.json
with open('frontend/package.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "name": "pecafoo-frontend-workspace",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}''')

# 4. Create shared-ui package.json
with open('frontend/packages/shared-ui/package.json', 'w', encoding='utf-8') as f:
    f.write('''{
  "name": "@pecafoo/shared-ui",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "dependencies": {
    "react": "^18.3.1",
    "framer-motion": "^12.34.3",
    "lucide-react": "^0.575.0"
  }
}''')

# 5. Patch dependencies in apps
for app in apps:
    pkg_path = f'frontend/apps/{app}/package.json'
    if os.path.exists(pkg_path):
        with open(pkg_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if 'dependencies' not in data:
            data['dependencies'] = {}
        data['dependencies']['@pecafoo/shared-ui'] = '*'
        with open(pkg_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

# 6. Patch vite configs
for app in apps:
    vite_path = f'frontend/apps/{app}/vite.config.js'
    if os.path.exists(vite_path):
        with open(vite_path, 'r', encoding='utf-8') as f:
            content = f.read()
        import re
        content = re.sub(r'alias:\s*\{[^}]+\}', 'preserveSymlinks: true, alias: { "@api": path.resolve(__dirname, "src/services/api") }', content)
        with open(vite_path, 'w', encoding='utf-8') as f:
            f.write(content)

# 7. Patch imports and Dockerfiles
def process_directory(directory):
    for root, _, files in os.walk(directory):
        for file in files:
            filepath = os.path.join(root, file)
            if file.endswith(('.js', '.jsx', '.css')):
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace("../../../shared-ui", "@pecafoo/shared-ui")
                new_content = new_content.replace("../../shared-ui", "@pecafoo/shared-ui")
                new_content = new_content.replace("../shared-ui", "@pecafoo/shared-ui")

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
            elif file == 'Dockerfile':
                app_name = os.path.basename(os.path.dirname(filepath))
                if app_name in apps:
                    new_docker = f'''FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
COPY packages/shared-ui ./packages/shared-ui
COPY apps/{app_name} ./apps/{app_name}

RUN npm install --legacy-peer-deps

WORKDIR /app/apps/{app_name}
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache wget
COPY --from=build /app/apps/{app_name}/dist /usr/share/nginx/html
COPY apps/{app_name}/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \\
    CMD wget --quiet --tries=1 --spider http://0.0.0.0/health || exit 1
CMD ["nginx", "-g", "daemon off;"]'''
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_docker)

process_directory('frontend/apps')

print("All patches applied!")
