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

    # Add autoComplete="email" to email inputs
    # Looking for <FloatingInput ... label="Email"... /> or type="email"
    content = re.sub(
        r'(<FloatingInput[^>]*label="Email(?:[^"]*)"[^>]*)(\/?>)',
        lambda m: m.group(1) + ' autoComplete="email" ' + m.group(2) if 'autoComplete' not in m.group(0) else m.group(0),
        content
    )

    # Add autoComplete="one-time-code" to OTP inputs
    content = re.sub(
        r'(<FloatingInput[^>]*label="OTP"[^>]*)(\/?>)',
        lambda m: m.group(1) + ' autoComplete="one-time-code" ' + m.group(2) if 'autoComplete' not in m.group(0) else m.group(0),
        content
    )

    # For Password Inputs
    if 'LoginPage' in page:
        content = re.sub(
            r'(<PasswordInput[^>]*)(\/?>)',
            lambda m: m.group(1) + ' autoComplete="current-password" ' + m.group(2) if 'autoComplete' not in m.group(0) else m.group(0),
            content
        )
    elif 'RegisterPage' in page or 'ResetPasswordPage' in page:
        content = re.sub(
            r'(<PasswordInput[^>]*)(\/?>)',
            lambda m: m.group(1) + ' autoComplete="new-password" ' + m.group(2) if 'autoComplete' not in m.group(0) else m.group(0),
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Added autoComplete attributes.")
