import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ChefHat, Clock3, BarChart3 } from 'lucide-react';
import { useAuth } from '../App';
import toast from 'react-hot-toast';
import { PremiumAuthLayout } from '../../../shared-ui/PremiumUI';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
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
                    toast.error('Role selection required. Please use the main app.');
                    break;
                default:
                    toast.error('Unexpected response.');
            }
        } catch {
            toast.error('Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumAuthLayout
            tone="restaurant"
            eyebrow="Pecafoo for restaurants"
            title="Your dining room, kitchen, and growth—in one calm workspace."
            description="Stay ahead of every order, keep your menu fresh, and understand the moments that grow your restaurant."
            features={[
                { icon: ChefHat, title: 'Kitchen clarity', copy: 'A focused view from accepted to ready.' },
                { icon: Clock3, title: 'Orders in rhythm', copy: 'See what needs attention at a glance.' },
                { icon: BarChart3, title: 'Useful insights', copy: 'Performance without dashboard clutter.' },
            ]}
        >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)' }}>Chef</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Restaurant Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to manage your restaurant</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Email</label>
                        <input className="input" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4, fontWeight: 700 }}>Password</label>
                        <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
                        {loading ? 'Signing in...' : 'Sign In'} {!loading && <ArrowRight size={18} />}
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign Up</Link>
                </p>
            </motion.div>
        </PremiumAuthLayout>
    );
};

export default LoginPage;
