import re

def fix_api_tokens():
    path = r"c:\Users\Machodev\Documents\Pecafoo\frontend\restaurant-app\src\services\api.js"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace token references specifically
    content = content.replace("localStorage.getItem('tokens')", "localStorage.getItem('restaurant_tokens')")
    content = content.replace("localStorage.setItem('tokens'", "localStorage.setItem('restaurant_tokens'")
    content = content.replace("localStorage.removeItem('tokens')", "localStorage.removeItem('restaurant_tokens')")
    
    # Replace user references in logout helpers (only when followed by ) or next to token clear)
    # The safest way is to just target the exact logout statements we saw
    content = content.replace("localStorage.removeItem('user')", "localStorage.removeItem('restaurant_user')")
    content = content.replace("localStorage.getItem('user')", "localStorage.getItem('restaurant_user')")

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

fix_api_tokens()
print("Fixed api.js tokens")
