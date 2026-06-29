import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Navigation, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { PremiumAuthLayout } from '@pecafoo/shared-ui/PremiumUI';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = async (e) => {
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
                    // Delivery app implies delivery role, so typically this wouldn't hit unless they didn't specify requested_role
                    toast.error('Role selection required. Please use the main app.');
                    break;
                default:
                    toast.error('Unexpected response.');
            }
        } catch {
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumAuthLayout
            tone="delivery"
            eyebrow="Pecafoo delivery"
            title="Own your route. See every opportunity clearly."
            description="A focused partner experience for deliveries, earnings, navigation, and performance—without the noise."
            features={[
                { icon: Navigation, title: 'Routes that make sense', copy: 'Pickup and drop-off details in one place.' },
                { icon: TrendingUp, title: 'Earnings at a glance', copy: 'Understand today, this week, and beyond.' },
                { icon: ShieldCheck, title: 'Partner support', copy: 'Verified details and dependable account access.' },
            ]}
        >
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="auth-card">
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)' }}>GO</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Partner Login</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Sign in to start delivering</p>
                </div>
                <form onSubmit={handle}>
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 700 }}>Email Address</label>
                        <input className="input" type="email" placeholder="partner@pecafoo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 700 }}>Password</label>
                        <input className="input" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ justifyContent: 'center', height: 50, borderRadius: 16 }}>
                        {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 800 }}>Sign Up</Link>
                </p>
            </motion.div>
        </PremiumAuthLayout>
    );
}
