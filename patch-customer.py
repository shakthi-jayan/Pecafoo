import re

with open('frontend/customer-app/src/context/AuthContext.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update login
old_login = '''            const { data } = await authAPI.login({ email, password });
            if (data.needs_role_selection) {
                savePendingLogin(data);
                return data;
            }
            saveAuth(data.user, data.tokens);
            toast.success('Welcome back!');
            return data;'''

new_login = '''            const { data } = await authAPI.login({ email, password, requested_role: 'customer' });
            if (data.next_action === 'ROLE_SELECTION') {
                savePendingLogin(data);
                return data;
            } else if (data.next_action === 'ONBOARD_ROLE') {
                savePendingLogin(data);
                return data;
            }
            saveAuth(data.user, data.tokens);
            toast.success('Welcome back!');
            return data;'''
content = content.replace(old_login, new_login)

# Update googleLogin
old_google = '''            const { data } = await authAPI.firebaseAuth({
                firebase_token: firebaseToken,
                role: 'customer',
            });
            if (data.needs_role_selection) {
                savePendingLogin(data);
                return data;
            }
            saveAuth(data.user, data.tokens);'''

new_google = '''            const { data } = await authAPI.firebaseAuth({
                firebase_token: firebaseToken,
                requested_role: 'customer',
            });
            if (data.next_action === 'ROLE_SELECTION' || data.next_action === 'ONBOARD_ROLE') {
                savePendingLogin(data);
                return data;
            }
            saveAuth(data.user, data.tokens);'''
content = content.replace(old_google, new_google)

# Update completeLogin
old_complete = '''            const { data } = await authAPI.completeLogin({
                login_ticket: pendingLogin.login_ticket,
                role: roleId,
            });
            saveAuth(data.user, data.tokens);
            return data;'''

new_complete = '''            const { data } = await authAPI.completeLogin({
                login_ticket: pendingLogin.login_ticket,
                role: roleId,
            });
            if (data.next_action === 'LOGIN_COMPLETE') {
                saveAuth(data.user, data.tokens);
            }
            return data;'''
content = content.replace(old_complete, new_complete)

with open('frontend/customer-app/src/context/AuthContext.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

