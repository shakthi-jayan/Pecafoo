import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Truck, Store, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PremiumAuthLayout } from '../../../shared-ui/PremiumUI';

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

    const authFeatures = [
        { icon: CheckCircle, title: 'Unified Identity', copy: 'Switch between profiles without logging out.' }
    ];

    return (
        <PremiumAuthLayout
            eyebrow={`Welcome back, ${pendingLogin.user?.first_name || 'User'}`}
            title="Select your profile"
            description="Choose how you want to continue today."
            features={authFeatures}
            tone="customer"
        >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-2)', fontWeight: 700, letterSpacing: '-0.03em' }}>Select Profile</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Choose how you want to continue today.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {pendingLogin.roles?.map((role, idx) => {
                    const isApproved = role.status === 'approved';
                    return (
                        <motion.button
                            key={role.id}
                            onClick={() => isApproved && handleSelectRole(role.id)}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            disabled={!isApproved}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-4)',
                                backgroundColor: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-card)',
                                cursor: isApproved ? 'pointer' : 'not-allowed',
                                textAlign: 'left',
                                opacity: isApproved ? 1 : 0.6,
                                transition: 'all var(--motion-duration-fast) ease',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            onMouseOver={(e) => {
                                if (isApproved) {
                                    e.currentTarget.style.borderColor = 'var(--brand-customer)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (isApproved) {
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                                }
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <div style={{ 
                                    width: '48px', 
                                    height: '48px', 
                                    borderRadius: '50%', 
                                    backgroundColor: 'var(--color-divider)', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: 'var(--color-text-primary)'
                                }}>
                                    {ROLE_ICONS[role.id] || <User size={24} />}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 'var(--text-h3)' }}>{role.display}</div>
                                    <div style={{ fontSize: 'var(--text-caption)', color: isApproved ? 'var(--color-text-secondary)' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                        {!isApproved && <ShieldAlert size={14} />}
                                        {isApproved ? 'Active profile' : 'Pending Verification'}
                                    </div>
                                </div>
                            </div>
                            {isApproved && <ArrowRight size={20} color="var(--color-text-tertiary)" />}
                        </motion.button>
                    );
                })}
            </div>
        </PremiumAuthLayout>
    );
};

export default RoleSelectionPage;
