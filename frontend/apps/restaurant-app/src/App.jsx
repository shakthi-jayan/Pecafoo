import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, Tags, Settings, LogOut, Menu, X } from 'lucide-react';
import { authAPI } from './services/api';
import toast from 'react-hot-toast';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import MenuPage from './pages/MenuPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BecomePartnerPage from './pages/BecomePartnerPage';
import NotFoundPage from './pages/NotFoundPage';
import { WebSocketProvider } from './context/WebSocketProvider';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('restaurant_user');
    const t = localStorage.getItem('restaurant_tokens');
    return u && t ? JSON.parse(u) : null;
  });

  const loading = false;

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password, requested_role: 'restaurant' });
    
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('restaurant_user', JSON.stringify(data.user));
      localStorage.setItem('restaurant_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);

  const partnerOnboard = useCallback(async (payload) => {
    const { data } = await authAPI.partnerOnboard({ ...payload, role: 'restaurant' });
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('restaurant_user', JSON.stringify(data.user));
      localStorage.setItem('restaurant_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register({ ...formData, role: 'restaurant' });
    localStorage.setItem('restaurant_user', JSON.stringify(data.user));
    localStorage.setItem('restaurant_tokens', JSON.stringify(data.tokens));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const t = JSON.parse(localStorage.getItem('restaurant_tokens') || '{}');
      if (t.refresh) await authAPI.logout({ refresh: t.refresh });
    } catch {
      
    }
    localStorage.removeItem('restaurant_user');
    localStorage.removeItem('restaurant_tokens');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, partnerOnboard }}>{children}</AuthContext.Provider>;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ width: 200, height: 30 }} /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/categories', icon: Tags, label: 'Categories' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <div className="sidebar-brand"><span className="sidebar-brand-mark">P</span> <span>Pecafoo</span></div>
          <p className="sidebar-subtitle">Restaurant Dashboard</p>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <X size={18} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 4 }}>{user?.first_name} {user?.last_name}</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 12 }}>{user?.email}</p>
        <button onClick={() => { logout(); onClose(); }} className="btn btn-danger btn-sm" style={{ width: '100%' }}><LogOut size={14} /> Sign Out</button>
      </div>
    </aside>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/become-partner" element={<BecomePartnerPage />} />
            <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#241b35', border: '1px solid #f0e4ff', borderRadius: '16px', boxShadow: '0 16px 32px rgba(175, 124, 219, 0.16)' }, duration: 3000 }} />
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="mobile-header">
        <div className="mobile-header-brand"><span className="mobile-brand-mark">P</span> <span>Pecafoo</span></div>
        <button className="hamburger-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <RestaurantBottomNav />
    </>
  );
}

function RestaurantBottomNav() {
  const location = useLocation();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Home' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
    { to: '/menu', icon: UtensilsCrossed, label: 'Menu' },
    { to: '/categories', icon: Tags, label: 'Categories' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  if (['/login', '/register'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bottom-nav restaurant-bottom-nav">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon-wrap">
            <Icon size={18} />
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default App;
