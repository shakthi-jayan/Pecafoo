import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, LogOut, ChevronRight, Bell, Heart, HelpCircle, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
    PageContainer,
    Button,
    EmptyState,
    ProfileHero, 
    SettingsGroup, 
    SettingsRow 
} from '../shared-ui/PremiumUI';

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuth();

    if (!isAuthenticated) {
        return (
            <PageContainer>
                <div style={{ marginTop: 'var(--space-8)' }}>
                    <EmptyState
                        icon={User}
                        title="Sign in to view profile"
                        description="Access your orders, addresses, and more"
                        action={<Button onClick={() => navigate('/login')}>Sign In</Button>}
                    />
                </div>
            </PageContainer>
        );
    }

    const menuItems = [
        { icon: ShoppingBag, label: 'My Orders', action: () => navigate('/orders'), subtitle: 'Track, return, or buy things again' },
        { icon: MapPin, label: 'My Addresses', action: () => navigate('/addresses'), subtitle: 'Delivery locations and defaults' },
        { icon: Heart, label: 'Favorites', action: () => navigate('/wishlist'), subtitle: 'Restaurants and dishes you love' },
        { icon: Bell, label: 'Notifications', action: () => navigate('/notifications'), subtitle: 'Order and account updates' },
        { icon: Shield, label: 'Privacy & Security', action: () => { } },
        { icon: HelpCircle, label: 'Help & Support', action: () => { } },
    ];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <PageContainer padding="var(--space-4)">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileHero
                    initials={user.first_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    name={`${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Customer'}
                    subtitle={user.email}
                    badge={user.role?.replace(/\b\w/g, c => c.toUpperCase())}
                />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-6)' }}>
                    <SettingsGroup 
                        title="Account" 
                        description={user.phone_number ? `Connected to ${user.phone_number}` : 'Your saved Pecafoo preferences'}
                    >
                        {menuItems.slice(0, 4).map(({ icon, label, action, subtitle }) => (
                            <SettingsRow 
                                key={label} 
                                icon={icon} 
                                title={label} 
                                subtitle={subtitle} 
                                onClick={action} 
                                trailing={<ChevronRight size={16} color="var(--color-text-tertiary)" />} 
                            />
                        ))}
                    </SettingsGroup>
                    
                    <SettingsGroup 
                        title="Support & Privacy" 
                        description="Help, safety, and account controls"
                    >
                        {menuItems.slice(4).map(({ icon, label, action }) => (
                            <SettingsRow 
                                key={label} 
                                icon={icon} 
                                title={label} 
                                onClick={action} 
                                trailing={<ChevronRight size={16} color="var(--color-text-tertiary)" />} 
                            />
                        ))}
                    </SettingsGroup>
                </div>

                <div style={{ marginTop: 'var(--space-8)' }}>
                    <Button 
                        variant="ghost" 
                        fullWidth 
                        icon={LogOut} 
                        onClick={handleLogout}
                        style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                    >
                        Sign Out
                    </Button>
                </div>
                
                <p style={{ textAlign: 'center', marginTop: 'var(--space-6)', fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>
                    Pecafoo v1.0.0
                </p>
                <div style={{ height: '80px' }} />
            </motion.div>
        </PageContainer>
    );
};
export default ProfilePage;
