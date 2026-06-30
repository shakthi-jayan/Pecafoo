import os
import re

apps = ['customer-app', 'restaurant-app', 'delivery-app', 'admin-app']
base_path = r'c:\Users\Machodev\Documents\Pecafoo\frontend'

for app in apps:
    # 1. Update AuthContext.jsx
    auth_ctx = os.path.join(base_path, app, 'src', 'context', 'AuthContext.jsx')
    if os.path.exists(auth_ctx):
        with open(auth_ctx, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We want to replace the catch block in register
        # find: catch (error) { ... const errData = error.response?.data;
        replacement = """catch (error) {
            const status = error.response?.status;
            const errData = error.response?.data;
            const errString = JSON.stringify(errData || {});
            
            if (status === 409 || errString.includes('ACCOUNT_EXISTS') || errString.includes('already exists')) {
                toast.error('An account with this email already exists. Redirecting to login...');
                error.isAccountExists = true;
                throw error;
            }
            
            if (!errData) {"""
            
        content = re.sub(
            r'catch\s*\(\s*error\s*\)\s*\{\s*const errData = error\.response\?\.data;\s*if \(\!errData\) \{',
            replacement,
            content
        )
        
        with open(auth_ctx, 'w', encoding='utf-8') as f:
            f.write(content)

    # 2. Update RegisterPage.jsx
    reg_page = os.path.join(base_path, app, 'src', 'pages', 'RegisterPage.jsx')
    if os.path.exists(reg_page):
        with open(reg_page, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # find: catch { } finally { OR catch (err) { } finally {
        # replace with catch (error) { if (error.isAccountExists) navigate('/login', { replace: true }); } finally {
        
        # Some are just "catch {" or "catch (err) {"
        content = re.sub(
            r'catch\s*(?:\([^)]+\))?\s*\{[^}]*\}\s*finally\s*\{',
            "catch (error) {\n            if (error.isAccountExists) {\n                navigate('/login', { replace: true });\n            }\n        } finally {",
            content
        )
        
        with open(reg_page, 'w', encoding='utf-8') as f:
            f.write(content)

print("Phase 3 complete")
