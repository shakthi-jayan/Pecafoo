import os
import re

BASE_DIR = r"c:\Users\Machodev\Documents\Pecafoo\frontend"
auth_pages = [
    "customer-app/src/pages/LoginPage.jsx",
    "customer-app/src/pages/RegisterPage.jsx",
    "customer-app/src/pages/ResetPasswordPage.jsx",
    "customer-app/src/pages/ForgotPasswordPage.jsx",
    "restaurant-app/src/pages/LoginPage.jsx",
    "restaurant-app/src/pages/RegisterPage.jsx",
    "delivery-app/src/pages/LoginPage.jsx",
    "delivery-app/src/pages/RegisterPage.jsx",
]

for page in auth_pages:
    filepath = os.path.join(BASE_DIR, page.replace('/', '\\'))
    if not os.path.exists(filepath):
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix syntax error `/ autoComplete="..." >` into `autoComplete="..." />`
    content = re.sub(r'/\s+autoComplete="([^"]+)"\s*>', r'autoComplete="\1" />', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed JSX syntax errors.")
