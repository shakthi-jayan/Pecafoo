import { BrowserRouter, Routes, Route, NavLink, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  LayoutDashboard,
  Users,
  Store,
  ClipboardList,
  LogOut,
  ArrowRight,
  ShoppingBag,
  IndianRupee,
  Menu,
  X,
  ShieldCheck,
  Truck,
  ExternalLink,
  Settings2,
  Clock3,
  Activity,
  BarChart3,
  ServerCog,
} from 'lucide-react';
import { authAPI, restaurantsAPI, deliveryAPI, analyticsAPI } from './services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import PricingPanel from './pages/PricingPanel';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProgress, MetricCard, PageHero, PremiumAuthLayout, SectionHeader } from '@pecafoo/shared-ui/PremiumUI';

const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('admin_user');
    const storedTokens = localStorage.getItem('admin_tokens');
    return storedUser && storedTokens ? JSON.parse(storedUser) : null;
  });
  const loading = false;

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    if (data.user.role !== 'admin' && !data.user.is_staff) {
      throw new Error('Admin access required');
    }
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    localStorage.setItem('admin_tokens', JSON.stringify(data.tokens));
    setUser(data.user);
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register({ ...formData, role: 'admin' });
    localStorage.setItem('admin_user', JSON.stringify(data.user));
    localStorage.setItem('admin_tokens', JSON.stringify(data.tokens));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('admin_tokens') || '{}');
      if (tokens.refresh) {
        await authAPI.logout({ refresh: tokens.refresh });
      }
    } catch {
      
    }
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_tokens');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>{children}</AuthContext.Provider>;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Admin!');
      navigate('/', { replace: true });
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PremiumAuthLayout
      tone="admin"
      eyebrow="Pecafoo operations"
      title="The whole platform, with the signal turned up."
      description="Monitor growth, review operations, and keep every side of the marketplace healthy from one deliberate workspace."
      features={[
        { icon: Activity, title: 'Live operations', copy: 'Orders and activity without the clutter.' },
        { icon: BarChart3, title: 'Decision-ready metrics', copy: 'The numbers that matter, in context.' },
        { icon: ServerCog, title: 'Platform control', copy: 'Management tools with clear hierarchy.' },
      ]}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: 'var(--shadow-accent)' }}>Admin</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Pecafoo Management Console</p>
        </div>
        <form onSubmit={handle}>
          <input className="input" type="email" placeholder="Admin email" value={email} onChange={(event) => setEmail(event.target.value)} required style={{ marginBottom: 12 }} />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required style={{ marginBottom: 20 }} />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 14, fontSize: '1rem' }}>
            {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Need the first admin account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Bootstrap Admin</Link>
        </p>
      </motion.div>
    </PremiumAuthLayout>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone_number: '', password: '', password_confirm: '' });
  const [loading, setLoading] = useState(false);

  const handle = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.password_confirm) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await register(formData);
      toast.success('Admin account created.');
      navigate('/', { replace: true });
    } catch (error) {
      const apiError = error?.response?.data;
      toast.error(
        apiError?.role?.[0] ||
        apiError?.email?.[0] ||
        apiError?.detail ||
        'Admin registration is restricted. Ask an existing admin to create the account.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  return (
    <PremiumAuthLayout
      tone="admin"
      eyebrow="Secure administration"
      title="Set up trusted access to Pecafoo operations."
      description="Create an administrator identity for platform oversight, verification, pricing, and marketplace health."
      features={[
        { icon: ShieldCheck, title: 'Restricted access', copy: 'Bootstrap or authorized administrators only.' },
        { icon: Activity, title: 'Operational awareness', copy: 'See marketplace health in one view.' },
        { icon: ServerCog, title: 'Purpose-built tools', copy: 'Focused controls for platform teams.' },
      ]}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <AuthProgress steps={['Identity', 'Security', 'Access']} current={2} />
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: 'var(--shadow-accent)' }}>Admin</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Create Admin Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Only the first admin or an existing admin can create this account.</p>
        </div>
        <form onSubmit={handle}>
          <div className="auth-split-row">
            <input className="input" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
            <input className="input" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
          </div>
          <input className="input" type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required style={{ marginBottom: 12 }} />
          <input className="input" type="tel" name="phone_number" placeholder="Phone (optional)" value={formData.phone_number} onChange={handleChange} style={{ marginBottom: 12 }} />
          <input className="input" type="password" name="password" placeholder="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength={8} style={{ marginBottom: 12 }} />
          <input className="input" type="password" name="password_confirm" placeholder="Confirm Password" value={formData.password_confirm} onChange={handleChange} required minLength={8} style={{ marginBottom: 20 }} />
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: 14, fontSize: '1rem' }}>
            {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>
    </PremiumAuthLayout>
  );
}

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {
        setStats(null);
        toast.error('Failed to load dashboard analytics.');
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats?.totals?.total_users ?? '-', color: '#60a5fa' },
    { icon: Store, label: 'Active Restaurants', value: stats?.totals?.active_restaurants ?? '-', color: '#34d399' },
    { icon: ShoppingBag, label: "Today's Orders", value: stats?.today?.total_orders ?? '-', color: '#f43f5e' },
    { icon: IndianRupee, label: "Today's Revenue", value: stats ? `₹${Number(stats.today?.revenue || 0).toFixed(2)}` : '-', color: '#fbbf24' },
  ];

  return (
    <div className="page-shell">
      <PageHero eyebrow="Platform pulse" title="Good morning, Admin." description="A concise view of Pecafoo's marketplace health and today's operating rhythm.">
        <div className="admin-health-orbit"><Activity size={34} /><span>Systems overview</span><strong>Live</strong></div>
      </PageHero>
      <SectionHeader eyebrow="Today" title="Marketplace at a glance" description="Live totals across customers, partners, orders, and revenue." />
      <div className="stat-grid">
        {statCards.map(({ icon: Icon, label, value, color }, index) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <MetricCard icon={Icon} label={label} value={loading ? '—' : value} tone={color} detail="Live" />
          </motion.div>
        ))}
      </div>
      <SectionHeader eyebrow="Operations" title="Today's flow" description="Delivery outcomes and revenue context for the current day." />
      <div className="card page-shell" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Today's Breakdown</h3>
        {loading ? (
          [1, 2, 3].map((item) => <div key={item} className="skeleton" style={{ height: 18, marginBottom: 10 }} />)
        ) : stats ? (
          <div className="content-grid stack-safe" style={{ gap: 10 }}>
            <DashboardMetric label="Delivered" value={stats.today?.delivered ?? 0} color="var(--success)" />
            <DashboardMetric label="Pending" value={stats.today?.pending ?? 0} color="var(--warning)" />
            <DashboardMetric label="Cancelled" value={stats.today?.cancelled ?? 0} color="var(--danger)" />
            <DashboardMetric label="Yesterday Revenue" value={`₹${Number(stats.yesterday?.revenue || 0).toFixed(2)}`} color="var(--text-primary)" />
          </div>
        ) : (
          <div className="empty-state" style={{ minHeight: 'unset', padding: '1rem 0' }}>
            <Clock3 style={{ width: 42, height: 42, color: 'var(--text-muted)', opacity: 0.35 }} />
            <h3>Analytics unavailable</h3>
            <p>We couldn’t load today’s dashboard data.</p>
          </div>
        )}
      </div>
      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Platform Overview</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Connect to the Django admin panel at <a href="https://api.pecafoo.com/admin/" target="_blank" rel="noopener">api.pecafoo.com/admin/</a> for full management capabilities.
          This dashboard now reads live analytics from the backend and shows a quick snapshot of platform health.
        </p>
      </div>
    </div>
  );
}

function DashboardMetric({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem' }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restaurantsAPI.getAll().then(({ data }) => setRestaurants(data.results || data || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Restaurants</h1></div>
      <div className="card">
        {loading ? [1, 2, 3].map((item) => <div key={item} className="skeleton" style={{ height: 50, marginBottom: 8 }} />) : restaurants.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Cuisine</th><th>Rating</th><th>Status</th></tr></thead>
              <tbody>{restaurants.map((restaurant) => (
                <tr key={restaurant.id}><td style={{ fontWeight: 600 }}>{restaurant.name}</td><td>{restaurant.cuisine_type}</td><td>{restaurant.average_rating || 'New'}</td>
                  <td><span className={`badge ${restaurant.is_open ? 'badge-success' : 'badge-danger'}`}>{restaurant.is_open ? 'Open' : 'Closed'}</span></td></tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty-state"><Store style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.4, marginBottom: 16 }} /><h3>No restaurants</h3></div>}
      </div>
    </div>
  );
}

function VerificationsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      restaurantsAPI.getVerifications(),
      deliveryAPI.getVerifications(),
    ])
      .then(([restaurantRes, deliveryRes]) => {
        setRestaurants(restaurantRes.data.results || restaurantRes.data || []);
        setPartners(deliveryRes.data.results || deliveryRes.data || []);
      })
      .catch(() => toast.error('Failed to load verification data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateRestaurantStatus = async (id, approval_status) => {
    setSavingId(id);
    try {
      await restaurantsAPI.reviewVerification(id, { approval_status });
      toast.success(`Restaurant marked ${approval_status}.`);
      load();
    } catch {
      toast.error('Failed to update restaurant verification.');
    } finally {
      setSavingId(null);
    }
  };

  const updateDeliveryStatus = async (id, is_verified) => {
    setSavingId(id);
    try {
      await deliveryAPI.reviewVerification(id, { is_verified });
      toast.success(is_verified ? 'Delivery partner verified.' : 'Delivery partner marked unverified.');
      load();
    } catch {
      toast.error('Failed to update delivery verification.');
    } finally {
      setSavingId(null);
    }
  };

  const DocLink = ({ url, label }) => url ? (
    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', marginRight: 12 }}>
      <ExternalLink size={14} /> {label}
    </a>
  ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}: Not uploaded</span>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">Verifications</h1></div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Store size={18} /> Restaurant Applications</h3>
        {loading ? [1, 2].map((item) => <div key={item} className="skeleton" style={{ height: 64, marginBottom: 12 }} />) : restaurants.length > 0 ? restaurants.map((restaurant) => (
          <div key={restaurant.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{restaurant.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{restaurant.owner_name} • {restaurant.owner_email || 'No email'} • {restaurant.owner_phone_number || 'No phone'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>{restaurant.city}, {restaurant.state} • {restaurant.cuisine_type || 'Cuisine not set'}</div>
              </div>
              <span className={`badge ${restaurant.approval_status === 'approved' ? 'badge-success' : restaurant.approval_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>{restaurant.approval_status || 'pending'}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <DocLink url={restaurant.business_license} label="GST / Business License" />
              <DocLink url={restaurant.food_safety_certificate} label="Food Safety Certificate" />
              <DocLink url={restaurant.owner_id_proof} label="Owner ID Proof" />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={savingId === restaurant.id} onClick={() => updateRestaurantStatus(restaurant.id, 'approved')}>Approve</button>
              <button className="btn btn-secondary" disabled={savingId === restaurant.id} onClick={() => updateRestaurantStatus(restaurant.id, 'pending')}>Mark Pending</button>
              <button className="btn" disabled={savingId === restaurant.id} onClick={() => updateRestaurantStatus(restaurant.id, 'rejected')} style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>Reject</button>
            </div>
          </div>
        )) : <div className="empty-state"><ShieldCheck style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.4, marginBottom: 16 }} /><h3>No restaurant applications</h3></div>}
      </div>

      <div className="card">
        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={18} /> Delivery Applications</h3>
        {loading ? [1, 2].map((item) => <div key={item} className="skeleton" style={{ height: 64, marginBottom: 12 }} />) : partners.length > 0 ? partners.map((partner) => (
          <div key={partner.id} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 18, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 10 }}>
              <div>
                <div style={{ fontWeight: 800 }}>{partner.full_name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{partner.email} • {partner.phone_number || 'No phone'}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>{partner.vehicle_type || 'Vehicle not set'} • {partner.vehicle_number || 'No vehicle number'} • {partner.license_number || 'No license number'}</div>
              </div>
              <span className={`badge ${partner.is_verified ? 'badge-success' : 'badge-warning'}`}>{partner.is_verified ? 'verified' : 'pending'}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
              <DocLink url={partner.id_proof} label="ID Proof" />
              <DocLink url={partner.license_image} label="License / RC / PCC" />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" disabled={savingId === partner.id} onClick={() => updateDeliveryStatus(partner.id, true)}>Verify</button>
              <button className="btn btn-secondary" disabled={savingId === partner.id} onClick={() => updateDeliveryStatus(partner.id, false)}>Mark Pending</button>
            </div>
          </div>
        )) : <div className="empty-state"><ShieldCheck style={{ width: 64, height: 64, color: 'var(--text-muted)', opacity: 0.4, marginBottom: 16 }} /><h3>No delivery applications</h3></div>}
      </div>
    </div>
  );
}

function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const links = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/restaurants', icon: Store, label: 'Restaurants' },
    { to: '/verifications', icon: ShieldCheck, label: 'Verifications' },
    { to: '/pricing', icon: Settings2, label: 'Pricing' },
    { to: '/orders', icon: ClipboardList, label: 'Orders' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div>
          <div className="sidebar-brand"><span className="sidebar-brand-mark">A</span> Admin <span>Console</span></div>
          <p className="sidebar-subtitle">Pecafoo Management</p>
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
        <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{user?.email}</p>
        <button onClick={() => { logout(); onClose(); }} style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600, width: '100%', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 }}><LogOut size={14} /> Sign Out</button>
      </div>
    </aside>
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
        <div className="mobile-header-brand"><span className="mobile-brand-mark">A</span> Admin <span>Console</span></div>
        <button className="hamburger-btn" onClick={() => setSidebarOpen((open) => !open)}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />
      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/restaurants" element={<RestaurantsPage />} />
            <Route path="/verifications" element={<VerificationsPage />} />
            <Route path="/pricing" element={<PricingPanel />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
        </Routes>
        <Toaster position="top-right" toastOptions={{ style: { background: '#ffffff', color: '#241b35', border: '1px solid #f0e4ff', borderRadius: 16, boxShadow: '0 16px 32px rgba(175, 124, 219, 0.16)' }, duration: 3000 }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: 40 }}><div className="skeleton" style={{ width: 200, height: 30 }} /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

export default App;
