import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
    const { itemCount } = useCart();
    const location = useLocation();

    
    const hideOnPaths = ['/login', '/register', '/forgot-password', '/onboarding'];
    const hideOnPrefixes = ['/restaurant/'];

    if (hideOnPaths.includes(location.pathname) || hideOnPrefixes.some((prefix) => location.pathname.startsWith(prefix))) {
        return null;
    }


    const navItems = [
        { to: '/', icon: Home, label: 'Home' },
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/orders', icon: ClipboardList, label: 'Orders', badge: itemCount },
        { to: '/profile', icon: User, label: 'Profile' },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map(({ to, icon: Icon, label, badge }) => (
                <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <span className="nav-icon-wrap">
                        <Icon />
                    </span>
                    {badge > 0 && <span className="nav-badge">{badge}</span>}
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    );
};

export default BottomNav;
