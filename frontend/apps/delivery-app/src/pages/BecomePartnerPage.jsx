import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, UserPlus } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-default)', padding: 20 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: 460, padding: 40, borderRadius: 24, boxShadow: 'var(--shadow-elevation)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, margin: '0 auto 24px', background: 'rgba(var(--accent-rgb), 0.1)', color: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={40} />
                </div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>Become a Delivery Partner</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 32 }}>
                    Welcome back! We found your Pecafoo account (<b>{state.email}</b>), but it doesn't have a Delivery profile yet.
                </p>

                <div className="card" style={{ padding: 20, marginBottom: 32, background: 'var(--bg-secondary)', textAlign: 'left', borderRadius: 16 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--text)' }}>What happens next?</h3>
                    <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        <li style={{ marginBottom: 8 }}>Your Delivery profile will be securely linked to your existing account.</li>
                        <li style={{ marginBottom: 8 }}>You'll use the same email and password to log in everywhere.</li>
                        <li>You'll need to upload verification documents (License, ID) inside the dashboard.</li>
                    </ul>
                </div>

                <button 
                    className="btn btn-primary btn-full btn-lg" 
                    onClick={handleConfirm} 
                    disabled={loading} 
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 56, borderRadius: 16, fontSize: '1.1rem', fontWeight: 700 }}
                >
                    {loading ? 'Setting up...' : 'Confirm & Continue'} <ArrowRight size={20} />
                </button>
                
                <button 
                    type="button" 
                    onClick={() => navigate('/login')} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600, marginTop: 24 }}
                >
                    Cancel
                </button>
            </motion.div>
        </div>
    );
}
