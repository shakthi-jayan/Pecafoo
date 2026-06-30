import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Navigation, ShieldCheck, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { PremiumAuthLayout, GlassCard, FloatingInput, PasswordInput, Button } from '../shared-ui/PremiumUI';

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
            <GlassCard padding="var(--space-5)">
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto var(--space-4)', background: 'var(--brand-delivery)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'white', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>GO</div>
                    <h1 style={{ fontSize: 'var(--text-h3)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Partner Login</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Sign in to start delivering</p>
                </div>
                <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <FloatingInput 
                        id="email"
                        label="Email Address" 
                        type="email" 
                        value={email} 
                        onChange={(e) = autoComplete="email" > setEmail(e.target.value)} 
                        required 
                    />
                    <PasswordInput 
                        id="password"
                        label="Password" 
                        value={password} 
                        onChange={(e) = autoComplete="current-password" > setPassword(e.target.value)} 
                        required 
                    />
                    <Button type="submit" variant="primary" size="large" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
                    Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--brand-delivery)', fontWeight: 700 }}>Sign Up</Link>
                </p>
            </GlassCard>
        </PremiumAuthLayout>
    );
}
