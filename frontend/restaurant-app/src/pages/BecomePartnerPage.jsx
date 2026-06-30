import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { PageContainer, GlassCard, Button } from '../../../shared-ui/PremiumUI';

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
                toast.success('Welcome to Pecafoo for Restaurants!');
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
        <PageContainer padding="var(--space-4)" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-bg-base)' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 460 }}>
                <GlassCard padding="var(--space-6)" style={{ textAlign: 'center' }}>
                    <div style={{ width: 80, height: 80, margin: '0 auto var(--space-5)', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--brand-restaurant)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserPlus size={40} />
                    </div>
                    <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 800, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>Open your Restaurant</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                        Welcome back! We found your Pecafoo account (<b>{state.email}</b>), but it doesn't have a Restaurant profile yet.
                    </p>

                    <div style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-6)', background: 'var(--color-bg-base)', textAlign: 'left', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontSize: 'var(--text-body)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>What happens next?</h3>
                        <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)', lineHeight: 1.6 }}>
                            <li style={{ marginBottom: 8 }}>Your Restaurant profile will be securely linked to your existing account.</li>
                            <li style={{ marginBottom: 8 }}>You'll use the same email and password to log in everywhere.</li>
                            <li>You'll configure your restaurant's menu, hours, and details in the dashboard.</li>
                        </ul>
                    </div>

                    <Button 
                        variant="primary" 
                        fullWidth 
                        size="large"
                        onClick={handleConfirm} 
                        disabled={loading} 
                        icon={ArrowRight}
                        style={{ display: 'flex', flexDirection: 'row-reverse' }}
                    >
                        {loading ? 'Setting up...' : 'Confirm & Continue'}
                    </Button>
                    
                    <Button 
                        variant="ghost" 
                        fullWidth 
                        onClick={() => navigate('/login')} 
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        Cancel
                    </Button>
                </GlassCard>
            </motion.div>
        </PageContainer>
    );
}
