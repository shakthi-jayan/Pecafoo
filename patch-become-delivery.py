import re

with open('frontend/delivery-app/src/pages/BecomePartnerPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace authAPI import and useAuth usage
content = content.replace("import { authAPI } from '../services/api';", "import { useAuth } from '../App';")
content = content.replace("    const [loading, setLoading] = useState(false);", "    const { partnerOnboard } = useAuth();\n    const [loading, setLoading] = useState(false);")

old_confirm = '''        try {
            const payload = { role: 'delivery' };
            if (state.login_ticket) {
                payload.login_ticket = state.login_ticket;
            }
            if (state.password) {
                payload.password = state.password;
            }

            const { data } = await authAPI.partnerOnboard(payload);
            
            localStorage.setItem('delivery_user', JSON.stringify(data.user));
            localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
            
            toast.success('Welcome to Pecafoo Delivery!');
            window.location.href = '/';
            
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to onboard.');
        }'''

new_confirm = '''        try {
            const payload = {};
            if (state.login_ticket) payload.login_ticket = state.login_ticket;
            if (state.password) payload.password = state.password;

            const result = await partnerOnboard(payload);
            if (result?.next_action === 'LOGIN_COMPLETE') {
                toast.success('Welcome to Pecafoo Delivery!');
                navigate('/', { replace: true });
            } else {
                toast.error('Unexpected response.');
            }
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to onboard.');
        }'''

content = content.replace(old_confirm, new_confirm)

with open('frontend/delivery-app/src/pages/BecomePartnerPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
