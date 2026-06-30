import os
import re

def fix_ui(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    
    new_style = """<style>{`
                .premium-register-layout {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    width: 100%;
                }
                .premium-register-container {
                    display: flex;
                    width: 100%;
                    max-width: 1440px;
                    margin: auto;
                    padding-inline: 48px;
                    gap: 32px;
                    align-items: center;
                    justify-content: center;
                }
                .premium-register-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    max-width: 520px;
                    position: relative;
                }
                .premium-register-right {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 640px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 48px;
                    border-radius: 24px;
                    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
                }
                .premium-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 16px;
                    border: none;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, var(--brand-color, #F97316) 0%, var(--brand-color-dark, #ea580c) 100%);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }
                .premium-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .benefit-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: var(--brand-color-light, rgba(249, 115, 22, 0.1));
                    color: var(--brand-color, #F97316);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .form-section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 32px 0 16px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .form-section-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                
                /* Desktop Responsive Behavior */
                @media (min-width: 1440px) {
                    .premium-register-left { flex: 0 0 40%; }
                    .premium-register-right { flex: 0 0 60%; }
                }
                @media (min-width: 1200px) and (max-width: 1439px) {
                    .premium-register-container { padding-inline: 32px; gap: 24px; }
                    .premium-register-left { flex: 0 0 42%; }
                    .premium-register-right { flex: 0 0 58%; }
                }
                @media (min-width: 1024px) and (max-width: 1199px) {
                    .premium-register-container { padding-inline: 24px; gap: 16px; }
                    .premium-register-left { flex: 0 0 45%; }
                    .premium-register-right { flex: 0 0 55%; }
                    .premium-register-left h1 { font-size: 40px !important; }
                }
                
                /* Desktop Scrolling Logic */
                @media (min-width: 1024px) {
                    .premium-register-layout {
                        height: 100vh;
                        overflow: hidden;
                    }
                    .premium-register-container {
                        height: 100vh;
                        padding-block: 24px;
                    }
                    .premium-register-left {
                        height: 100%;
                        overflow-y: auto;
                        padding-right: 16px;
                    }
                    .premium-register-right {
                        height: 100%;
                        overflow-y: auto;
                        padding: 16px;
                    }
                }

                /* Mobile/Tablet Stacked Layout */
                @media (max-width: 1023px) {
                    .premium-register-container { 
                        flex-direction: column; 
                        padding-inline: 0;
                        gap: 0;
                        max-width: 100%;
                    }
                    .premium-register-left { flex: none; padding: 48px 24px; max-width: 100%; }
                    .premium-register-right { flex: none; padding: 24px; width: 100%; }
                    .premium-register-card { padding: 0; box-shadow: none; border-radius: 0; background: transparent; }
                }
            `}</style>"""

    if "premium-register-container" in content:
        print(f"Skipping {path}, already patched")
        return

    content = re.sub(r'<style>\{`.*?`\}</style>', new_style, content, flags=re.DOTALL)
    
    content = content.replace(
        '<div className="premium-register-left">',
        '<div className="premium-register-container">\n            <div className="premium-register-left">'
    )
    
    # We find the last </div> before the end of the return statement.
    # The return statement ends with `</div>\n    );\n}` or `);`
    content = re.sub(r'</div>(\s*\);\s*(?:export\s+default\s+\w+;)?\s*)$', r'    </div>\n        </div>\1', content)

    if "delivery" in path:
        content = content.replace(
            '<div className="premium-register-layout">',
            '<div className="premium-register-layout" style={{"--brand-color": "#22C55E", "--brand-color-dark": "#16a34a", "--brand-color-light": "rgba(34, 197, 94, 0.1)"}}>'
        )

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
process_restaurant = r"c:\Users\Machodev\Documents\Pecafoo\frontend\restaurant-app\src\pages\RegisterPage.jsx"
process_delivery = r"c:\Users\Machodev\Documents\Pecafoo\frontend\delivery-app\src\pages\RegisterPage.jsx"

fix_ui(process_restaurant)
fix_ui(process_delivery)
print("UI Alignment fixed")
