import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, googleLogin, requestPhoneOtp, verifyPhoneOtp } = useAuth();
    const from = location.state?.from?.pathname || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [otpRequested, setOtpRequested] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loginMode, setLoginMode] = useState('password');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);

            navigate(from, { replace: true });
        } catch {
            
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const data = await googleLogin();

            navigate(from, { replace: true });
        } catch {
            
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOtp = async () => {
        if (!phoneNumber.trim()) return;
        setLoading(true);
        try {
            await requestPhoneOtp(phoneNumber.trim());
            setOtpRequested(true);
        } finally {
            setLoading(false);
        }
    };

    const handlePhoneOtpLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await verifyPhoneOtp({
                phone_number: phoneNumber.trim(),
                otp: phoneOtp.trim(),
            });

            navigate(from, { replace: true });
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
                    <p className="auth-eyebrow">Welcome Back</p>
                    <h1 className="auth-title">Login to your account</h1>
                    <p className="auth-subtitle">Continue where you left off and get your cravings delivered fast.</p>
                </div>

                <div className="responsive-actions" style={{ marginBottom: 16 }}>
                    <button type="button" className={`btn ${loginMode === 'password' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLoginMode('password')}>
                        Email Login
                    </button>
                    <button type="button" className={`btn ${loginMode === 'otp' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setLoginMode('otp')}>
                        Phone OTP
                    </button>
                </div>

                {loginMode === 'password' ? (
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email</label>
                        <div className="input-icon-wrapper">
                            <Mail />
                            <input
                                type="email"
                                className="input"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                id="login-email"
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div className="input-icon-wrapper">
                            <Lock />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                id="login-password"
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

                    <div style={{ textAlign: 'right', marginBottom: 16 }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-strong)', fontWeight: 700 }}>
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                        id="login-submit"
                    >
                        {loading ? 'Signing in...' : 'Login'}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>
                ) : (
                <form onSubmit={handlePhoneOtpLogin}>
                    <div className="input-group">
                        <label className="input-label">Phone Number</label>
                        <div className="input-icon-wrapper">
                            <Smartphone />
                            <input
                                type="tel"
                                className="input"
                                placeholder="+91 98765 43210"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {otpRequested && (
                        <div className="input-group">
                            <label className="input-label">OTP</label>
                            <div className="input-icon-wrapper">
                                <Lock />
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Enter 6-digit OTP"
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="responsive-actions">
                        {!otpRequested ? (
                            <button type="button" className="btn btn-primary btn-full" disabled={loading} onClick={handleRequestOtp}>
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        ) : (
                            <>
                                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Verifying...' : 'Verify OTP'}
                                </button>
                                <button type="button" className="btn btn-secondary btn-full" disabled={loading} onClick={handleRequestOtp}>
                                    Resend OTP
                                </button>
                            </>
                        )}
                    </div>
                </form>
                )}

                <div className="divider">or continue with</div>

                <button
                    onClick={handleGoogleLogin}
                    className="btn btn-secondary btn-full"
                    disabled={loading}
                    id="google-login"
                    style={{ gap: '12px', fontWeight: 800 }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <p style={{ textAlign: 'center', marginTop: 22, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don&apos;t have an account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent-strong)', fontWeight: 800 }}>
                        Sign Up
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
