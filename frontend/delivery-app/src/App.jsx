import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { MapPin, ClipboardList, IndianRupee, User } from 'lucide-react';
import { authAPI } from './services/api';

import HomePage from './pages/HomePage';
import DeliveriesPage from './pages/DeliveriesPage';
import ProfilePage from './pages/ProfilePage';
import EarningsPage from './pages/EarningsPage';
import BecomePartnerPage from './pages/BecomePartnerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem('delivery_user');
    const t = localStorage.getItem('delivery_tokens');
    if (u && t) {
      try {
        const parsedTokens = JSON.parse(t);
        if (parsedTokens?.access || parsedTokens?.refresh) {
          setUser(JSON.parse(u));
        } else {
          localStorage.removeItem('delivery_user');
          localStorage.removeItem('delivery_tokens');
        }
      } catch {
        localStorage.removeItem('delivery_user');
        localStorage.removeItem('delivery_tokens');
      }
    } else if (u || t) {
      localStorage.removeItem('delivery_user');
      localStorage.removeItem('delivery_tokens');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const handleForcedLogout = () => {
      localStorage.removeItem('delivery_user');
      localStorage.removeItem('delivery_tokens');
      setUser(null);
    };

    window.addEventListener('delivery-auth-expired', handleForcedLogout);
    return () => window.removeEventListener('delivery-auth-expired', handleForcedLogout);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password, requested_role: 'delivery' });
    
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);

  const partnerOnboard = useCallback(async (payload) => {
    const { data } = await authAPI.partnerOnboard({ ...payload, role: 'delivery' });
    if (data.next_action === 'LOGIN_COMPLETE') {
      localStorage.setItem('delivery_user', JSON.stringify(data.user));
      localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register({ ...formData, role: 'delivery' });
    localStorage.setItem('delivery_user', JSON.stringify(data.user));
    localStorage.setItem('delivery_tokens', JSON.stringify(data.tokens));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const t = JSON.parse(localStorage.getItem('delivery_tokens') || '{}');
      if (t.refresh) await authAPI.logout({ refresh: t.refresh });
    } catch {
      
    }
    localStorage.removeItem('delivery_user');
    localStorage.removeItem('delivery_tokens');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, partnerOnboard }}>
      {children}
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-container">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/become-partner" element={<BecomePartnerPage />} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/deliveries" element={<ProtectedRoute><DeliveriesPage /></ProtectedRoute>} />
            <Route path="/earnings" element={<ProtectedRoute><EarningsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePageWrapper /></ProtectedRoute>} />
            <Route path="*" element={<ProtectedRoute><NotFoundPage /></ProtectedRoute>} />
          </Routes>
          <BottomNav />
        </div>
        <Toaster position="top-center" toastOptions={{ style: { background: '#ffffff', color: '#241b35', border: '1px solid #f0e4ff', borderRadius: 16, boxShadow: '0 16px 32px rgba(175, 124, 219, 0.16)' }, duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProfilePageWrapper() {
  const { user, logout } = useAuth();
  return <ProfilePage user={user} onLogout={logout} />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const hasAccessToken = (() => {
    try {
      const tokens = JSON.parse(localStorage.getItem('delivery_tokens') || '{}');
      return !!tokens?.access;
    } catch {
      return false;
    }
  })();
  if (loading) return <div className="page"><div className="skeleton" style={{ height: 200 }} /></div>;
  if (!isAuthenticated || !hasAccessToken) return <Navigate to="/login" replace />;
  return children;
}

function BottomNav() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <nav className="bottom-nav">
      {[
        { to: '/', icon: MapPin, label: 'Home' },
        { to: '/deliveries', icon: ClipboardList, label: 'Deliveries' },
        { to: '/earnings', icon: IndianRupee, label: 'Earnings' },
        { to: '/profile', icon: User, label: 'Profile' }
      ].map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon-wrap"><Icon size={22} /></span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default App;
