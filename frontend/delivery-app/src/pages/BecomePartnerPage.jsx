import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { GlassCard, Button } from '../../../shared-ui/PremiumUI';

export default function BecomePartnerPage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { partnerOnboard } = useAuth();
    const [loading, setLoading] = useState(false);
    
    if (!state?.email) {
        return <Navigate to="/login" replace />;
    }

    const handleConfirm = async () => {
        setLoading(true);
        try {
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-base)', padding: 'var(--space-5)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460 }}>
                <GlassCard padding="var(--space-6)" style={{ textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, margin: '0 auto var(--space-4)', background: 'var(--color-success-bg)', color: 'var(--brand-delivery)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={40} />
                    </div>
                    <h1 style={{ fontSize: 'var(--text-h3)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Become a Delivery Partner</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)', lineHeight: 1.6, marginBottom: 'var(--space-5)' }}>
                        Welcome back! We found your Pecafoo account (<b style={{ color: 'var(--color-text-primary)' }}>{state.email}</b>), but it doesn't have a Delivery profile yet.
                    </p>

                    <div style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-5)', background: 'var(--color-bg-elevated)', textAlign: 'left', borderRadius: 'var(--radius-lg)' }}>
                        <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>What happens next?</h3>
                        <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)', lineHeight: 1.6 }}>
                            <li style={{ marginBottom: 8 }}>Your Delivery profile will be securely linked to your existing account.</li>
                            <li style={{ marginBottom: 8 }}>You'll use the same email and password to log in everywhere.</li>
                            <li>You'll need to upload verification documents (License, ID) inside the dashboard.</li>
                        </ul>
                    </div>

                    <Button 
                        onClick={handleConfirm} 
                        variant="primary"
                        size="large"
                        disabled={loading} 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700 }}
                    >
                        {loading ? 'Setting up...' : 'Confirm & Continue'} <ArrowRight size={20} />
                    </Button>
                    
                    <Button 
                        type="button" 
                        onClick={() => navigate('/login')} 
                        variant="ghost"
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        Cancel
                    </Button>
                </GlassCard>
            </motion.div>
        </div>
    );
}
