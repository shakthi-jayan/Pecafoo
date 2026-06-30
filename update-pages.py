import re

files = [
    r'c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\pages\SearchPage.jsx',
    r'c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\pages\HomePage.jsx',
    r'c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\pages\WishlistPage.jsx',
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove RestaurantCard from PremiumUI import
    content = re.sub(r'(\s*)RestaurantCard,(\s*)', r'\1\2', content)

    # Add local RestaurantCard import
    if 'import { RestaurantCard } from' not in content:
        # Search for PremiumUI import and insert before it
        import_stmt = "import { RestaurantCard } from '../components/RestaurantCard';\n"
        content = content.replace("import {\n    PageContainer", import_stmt + "import {\n    PageContainer")
        # In case the import is one-liner or different
        if import_stmt not in content:
            content = content.replace("import {", import_stmt + "import {", 1)

    # Replace PremiumUI RestaurantCard usage in SearchPage & HomePage
    # <RestaurantCard name=... subtitle=... image=... rating=... [time=...] />
    # We will just regex match <RestaurantCard[^\>]+/> and replace it
    # Wait, in WishlistPage we might have a different format.
    
    # Let's write a targeted replace for SearchPage and HomePage
    old_card = r'<RestaurantCard\s+name=\{restaurant\.name\}\s+subtitle=\{restaurant\.cuisine_type[^}]*\}\s+image=\{restaurant\.image_url\}\s+rating=\{restaurant\.rating\}(?:\s+time=\{[^\}]+\})?\s*/>'
    content = re.sub(old_card, '<RestaurantCard restaurant={restaurant} />', content)

    # For WishlistPage
    old_wishlist_card = r'<RestaurantCard\s+image=\{r\.cover_image[^}]*\}\s+name=\{r\.name\}\s+subtitle=\{r\.cuisine_type\}\s+rating=\{r\.average_rating\}\s+time=\{`\$\{r\.average_delivery_time[^`]+`\}\s+onClick=\{[^}]+\}\s*/>'
    content = re.sub(old_wishlist_card, '<RestaurantCard restaurant={r} />', content)

    # Remove wrapper onClick for SearchPage since local card handles it
    content = re.sub(r'onClick=\{\(\) => navigate\(`/restaurant/\$\{restaurant\.slug\}`\)\}\s+style=\{\{ cursor: \'pointer\' \}\}', '', content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
