import re

with open('frontend/delivery-app/src/pages/LoginPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_login = '''        try {
            const result = await login(email, password);
            if (result && result.needsOnboarding) {
                // Navigate to onboarding, pass the password or ticket
                navigate('/become-partner', { 
                    state: { 
                        email, 
                        password, 
                        login_ticket: result.login_ticket,
                        direct_token: result.direct_token 
                    } 
                });
                return;
            }
            toast.success('Welcome!');
            navigate('/', { replace: true });
        } catch {'''

new_login = '''        try {
            const result = await login(email, password);
            switch (result?.next_action) {
                case 'LOGIN_COMPLETE':
                    toast.success('Welcome!');
                    navigate('/', { replace: true });
                    break;
                case 'ONBOARD_ROLE':
                    navigate('/become-partner', { 
                        state: { 
                            email, 
                            password, 
                            login_ticket: result.login_ticket,
                        } 
                    });
                    break;
                case 'ROLE_SELECTION':
                    // Delivery app implies delivery role, so typically this wouldn't hit unless they didn't specify requested_role
                    toast.error('Role selection required. Please use the main app.');
                    break;
                default:
                    toast.error('Unexpected response.');
            }
        } catch {'''

content = content.replace(old_login, new_login)

with open('frontend/delivery-app/src/pages/LoginPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
