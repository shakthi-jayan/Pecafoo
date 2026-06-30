import os

files = [
    r"c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\pages\ForgotPasswordPage.jsx",
    r"c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\pages\LoginPage.jsx",
    r"c:\Users\Machodev\Documents\Pecafoo\frontend\delivery-app\src\pages\LoginPage.jsx",
    r"c:\Users\Machodev\Documents\Pecafoo\frontend\restaurant-app\src\pages\LoginPage.jsx",
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Fix email
        content = content.replace(
            'onChange={(e) = autoComplete="email" > setEmail(e.target.value)}',
            'autoComplete="email"\n                                onChange={(e) => setEmail(e.target.value)}'
        )
        # Handle cases where spacing is slightly different
        content = content.replace(
            'onChange={(e) = autoComplete="email" > setEmail(e.target.value)} ',
            'autoComplete="email"\n                                onChange={(e) => setEmail(e.target.value)}'
        )
        
        # Fix current-password
        content = content.replace(
            'onChange={(e) = autoComplete="current-password" > setPassword(e.target.value)}',
            'autoComplete="current-password"\n                                    onChange={(e) => setPassword(e.target.value)}'
        )
        content = content.replace(
            'onChange={(e) = autoComplete="current-password" > setPassword(e.target.value)} ',
            'autoComplete="current-password"\n                                    onChange={(e) => setPassword(e.target.value)}'
        )

        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

print("Fixed JSX corruption in Phase 1.")
