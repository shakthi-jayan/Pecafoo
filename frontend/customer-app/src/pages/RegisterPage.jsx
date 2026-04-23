import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, googleLogin } = useAuth();

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        role: 'customer',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await register(formData);

            navigate('/', { replace: true });
        } catch {
            
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const data = await googleLogin();

            navigate('/', { replace: true });
        } catch {
            
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
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
                    <p className="auth-eyebrow">Create Account</p>
                    <h1 className="auth-title">Join Pecafoo today</h1>
                    <p className="auth-subtitle">Sign up in seconds and start ordering from your favorite places.</p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="auth-grid auth-grid-2">
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">First Name</label>
                            <div className="input-icon-wrapper">
                                <User />
                                <input
                                    className="input"
                                    name="first_name"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    id="register-first-name"
                                />
                            </div>
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Last Name</label>
                            <input
                                className="input"
                                name="last_name"
                                placeholder="Doe"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                id="register-last-name"
                                style={{ paddingLeft: 16 }}
                            />
                        </div>
                    </div>

                    <div className="input-group" style={{ marginTop: 16 }}>
                        <label className="input-label">Email</label>
                        <div className="input-icon-wrapper">
                            <Mail />
                            <input type="email" className="input" name="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required id="register-email" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <div className="input-icon-wrapper">
                            <Phone />
                            <input type="tel" className="input" name="phone_number" placeholder="+91 98765 43210" value={formData.phone_number} onChange={handleChange} id="register-phone" />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="input-icon-wrapper">
                            <Lock />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                name="password"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                id="register-password"
                                style={{ paddingRight: '46px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-muted)',
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <div className="input-icon-wrapper">
                            <Lock />
                            <input type="password" className="input" name="password_confirm" placeholder="Re-enter password" value={formData.password_confirm} onChange={handleChange} required minLength={8} id="register-confirm-password" />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit" style={{ marginTop: 8 }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="divider">or continue with</div>

                <button onClick={handleGoogleLogin} className="btn btn-secondary btn-full" disabled={loading} id="google-register" style={{ gap: '12px', fontWeight: 800 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--accent-strong)', fontWeight: 800 }}>Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
