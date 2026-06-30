import re

with open(r'c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\components\RestaurantCard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace classes with Apple HIG inline styles
content = content.replace('className="restaurant-card"', 'className="premium-restaurant-card" style={{ backgroundColor: "var(--color-bg-card)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "var(--shadow-md)", cursor: "pointer", display: "flex", flexDirection: "column", position: "relative", border: "1px solid var(--color-border)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}')
content = content.replace('className="restaurant-card-media"', 'style={{ width: "100%", height: "160px", backgroundColor: "var(--color-divider)", position: "relative" }}')
content = content.replace('className="restaurant-card-image restaurant-card-placeholder"', 'style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", color: "var(--color-text-tertiary)" }}')
content = content.replace('className="restaurant-card-image"', 'style={{ width: "100%", height: "100%", objectFit: "cover" }}')
content = content.replace('className="wishlist-btn"', 'style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-3)", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(10px)", borderRadius: "50%", padding: "6px", display: "flex", border: "none", cursor: "pointer", zIndex: 2, boxShadow: "var(--shadow-sm)" }}')
content = re.sub(r'className="restaurant-open-pill[^"]*"', 'style={{ position: "absolute", top: "var(--space-3)", left: "var(--space-3)", backgroundColor: restaurant.is_open ? "var(--color-success)" : "var(--color-error)", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700, zIndex: 2 }}', content)
content = content.replace('className="restaurant-card-body"', 'style={{ padding: "var(--space-4)" }}')
content = content.replace('className="restaurant-card-name"', 'style={{ fontSize: "var(--text-h3)", margin: "0 0 var(--space-1) 0", fontWeight: 600 }}')
content = content.replace('className="restaurant-card-cuisine"', 'style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-caption)", margin: 0 }}')
content = content.replace('className="restaurant-card-meta"', 'style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", marginTop: "var(--space-3)", fontSize: "var(--text-caption)", color: "var(--color-text-secondary)", fontWeight: 600 }}')
content = content.replace('className="restaurant-card-footer"', 'style={{ display: "none" }}')
content = content.replace('className="restaurant-card-media-shade"', 'style={{ display: "none" }}')
content = content.replace('className="badge badge-accent"', 'style={{ backgroundColor: "var(--brand-customer)", color: "#fff", padding: "4px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: 700 }}')
content = content.replace('className="rating"', 'style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-primary)" }}')
content = content.replace('fill="currentColor"', 'fill="#FFCC00" color="#FFCC00"')

with open(r'c:\Users\Machodev\Documents\Pecafoo\frontend\customer-app\src\components\RestaurantCard.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
