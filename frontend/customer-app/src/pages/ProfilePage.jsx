
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Bell, Heart, HelpCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return (
            <div className="page">
                <div className="page-header"><h1 className="page-title">Profile</h1></div>
                <div className="empty-state" style={{ marginTop: 'var(--space-2xl)' }}>
                    <User /><h3>Sign in to view profile</h3><p>Access your orders, addresses, and more</p>
                    <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ marginTop: 16 }}>Sign In</button>
                </div>
            </div>
        );
    }

    const menuItems = [
        { icon: MapPin, label: 'My Addresses', action: () => navigate('/addresses') },
        { icon: Heart, label: 'Favorites', action: () => navigate('/wishlist') },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications') },
        { icon: Shield, label: 'Privacy & Security', action: () => { } },
        { icon: HelpCircle, label: 'Help & Support', action: () => { } },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="page">
            <div className="page-header"><h1 className="page-title">Profile</h1></div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {}
                <div className="card" style={{ padding: 'var(--space-lg)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: '50%', margin: '0 auto var(--space-md)',
                        background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)',
                    }}>
                        {user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <h2 style={{ fontWeight: 700, marginBottom: 4 }}>{user.first_name} {user.last_name}</h2>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        <Mail size={14} />{user.email}
                    </div>
                    {user.phone_number && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: 4 }}>
                            <Phone size={14} />{user.phone_number}
                        </div>
                    )}
                    <span className="badge badge-accent" style={{ marginTop: 'var(--space-sm)' }}>
                        {user.role?.replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                </div>

                {}
                <div className="card" style={{ overflow: 'hidden' }}>
                    {menuItems.map(({ icon: Icon, label, action }, i) => (
                        <button key={label} onClick={action} style={{
                            display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: 'var(--space-md)',
                            width: '100%', background: 'transparent', color: 'var(--text-primary)', textAlign: 'left',
                            borderBottom: i < menuItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                            transition: 'background 0.15s',
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} style={{ color: 'var(--accent)' }} />
                            </div>
                            <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
                            <ChevronRight size={18} color="var(--text-muted)" />
                        </button>
                    ))}
                </div>

                {}
                <button onClick={handleLogout} className="btn btn-full" id="logout-btn"
                    style={{ marginTop: 'var(--space-xl)', background: 'var(--danger-bg)', color: 'var(--danger)', fontWeight: 600, gap: 8 }}>
                    <LogOut size={18} /> Sign Out
                </button>
                <p style={{ textAlign: 'center', marginTop: 'var(--space-lg)', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    Pecafoo v1.0.0
                </p>
            </motion.div>
        </div>
    );
};
export default ProfilePage;
