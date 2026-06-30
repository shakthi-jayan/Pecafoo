import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Truck, Store, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLE_ICONS = {
    customer: <User size={24} />,
    delivery: <Truck size={24} />,
    restaurant: <Store size={24} />,
};

const RoleSelectionPage = () => {
    const { pendingLogin, completeLogin, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // If already authenticated or no pending login, redirect to home
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (!pendingLogin) {
        return <Navigate to="/login" replace />;
    }

    const handleSelectRole = async (roleId) => {
        try {
            await completeLogin(pendingLogin.login_ticket, roleId);
            navigate('/', { replace: true });
        } catch (error) {
            // Error handled by context
        }
    };

    return (
        <div className="auth-shell">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                style={{ maxWidth: '480px' }}
            >
                <div className="auth-brand">
                    <motion.div
                        className="auth-mark"
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.12 }}
                    >
                        P
                    </motion.div>
                    <p className="auth-eyebrow">Welcome back, {pendingLogin.user?.first_name || 'User'}</p>
                    <h1 className="auth-title">Select your profile</h1>
                    <p className="auth-subtitle">Choose how you want to continue today.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                    {pendingLogin.roles?.map((role, idx) => {
                        const isApproved = role.status === 'approved';
                        return (
                            <motion.button
                                key={role.id}
                                onClick={() => isApproved && handleSelectRole(role.id)}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                disabled={!isApproved}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '16px',
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '12px',
                                    cursor: isApproved ? 'pointer' : 'not-allowed',
                                    textAlign: 'left',
                                    opacity: isApproved ? 1 : 0.6,
                                    transition: 'all 0.2s',
                                }}
                                onMouseOver={(e) => {
                                    if (isApproved) {
                                        e.currentTarget.style.borderColor = 'var(--accent-strong)';
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (isApproved) {
                                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                                        e.currentTarget.style.transform = 'none';
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ 
                                        width: '40px', 
                                        height: '40px', 
                                        borderRadius: '50%', 
                                        background: 'var(--bg-subtle)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        color: 'var(--text-primary)'
                                    }}>
                                        {ROLE_ICONS[role.id] || <User size={24} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{role.display}</div>
                                        <div style={{ fontSize: '0.85rem', color: isApproved ? 'var(--text-secondary)' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                            {!isApproved && <ShieldAlert size={14} />}
                                            {isApproved ? 'Active profile' : 'Pending Verification'}
                                        </div>
                                    </div>
                                </div>
                                {isApproved && <ArrowRight size={20} color="var(--text-muted)" />}
                            </motion.button>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};

export default RoleSelectionPage;
