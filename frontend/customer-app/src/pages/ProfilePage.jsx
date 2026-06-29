
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, LogOut, ChevronRight, Bell, Heart, HelpCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileHero, SettingsGroup, SettingsRow } from '../../../shared-ui/PremiumUI';

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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileHero
                    initials={user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    name={`${user.first_name || ''} ${user.last_name || ''}`.trim()}
                    subtitle={user.email}
                    badge={user.role?.replace(/\b\w/g, c => c.toUpperCase())}
                />
                <SettingsGroup title="Account" description={user.phone_number ? `Connected to ${user.phone_number}` : 'Your saved Pecafoo preferences'}>
                    {menuItems.slice(0, 3).map(({ icon, label, action }) => <SettingsRow key={label} icon={icon} title={label} subtitle={label === 'My Addresses' ? 'Delivery locations and defaults' : label === 'Favorites' ? 'Restaurants and dishes you love' : 'Order and account updates'} onClick={action} trailing={<ChevronRight size={17} />} />)}
                </SettingsGroup>
                <SettingsGroup title="Support & privacy" description="Help, safety, and account controls">
                    {menuItems.slice(3).map(({ icon, label, action }) => <SettingsRow key={label} icon={icon} title={label} onClick={action} trailing={<ChevronRight size={17} />} />)}
                </SettingsGroup>

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
