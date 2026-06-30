import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PremiumAuthLayout, Button, SegmentedControl, FloatingInput, PasswordInput } from '../shared-ui/PremiumUI';

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
    const [loading, setLoading] = useState(false);
    const [loginMode, setLoginMode] = useState('password');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await login(email, password);
            if (data?.needs_role_selection) {
                navigate('/select-role', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
        } catch {
            // Error handled by AuthContext interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const data = await googleLogin();
            if (data?.needs_role_selection) {
                navigate('/select-role', { replace: true });
            } else {
                navigate(from, { replace: true });
            }
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
            await verifyPhoneOtp({
                phone_number: phoneNumber.trim(),
                otp: phoneOtp.trim(),
            });
            navigate(from, { replace: true });
        } finally {
            setLoading(false);
        }
    };

    const authFeatures = [
        { icon: Smartphone, title: 'Live Order Tracking', copy: 'Clear ETAs from the kitchen to your door.' },
        { icon: Mail, title: 'Personalized Offers', copy: 'Discounts and deals curated for you.' },
        { icon: Lock, title: 'Secure Sign-In', copy: 'Dependable support and safe payments.' }
    ];

    return (
        <PremiumAuthLayout 
            eyebrow="Welcome Back"
            title="Log in to Pecafoo" 
            description="Continue where you left off and get your cravings delivered fast."
            features={authFeatures}
            tone="customer"
        >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-2)', fontWeight: 700, letterSpacing: '-0.03em' }}>Welcome back</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Log in to access your account</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
                <SegmentedControl 
                    options={[
                        { label: 'Email', value: 'password' },
                        { label: 'Phone', value: 'otp' }
                    ]}
                    value={loginMode}
                    onChange={setLoginMode}
                    brandColor="var(--brand-customer)"
                />
            </div>

            <form onSubmit={loginMode === 'password' ? handleLogin : handlePhoneOtpLogin}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                    {loginMode === 'password' ? (
                        <>
                            <FloatingInput
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                value={email}
                                onChange={(e) = autoComplete="email" > setEmail(e.target.value)}
                                required
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                <PasswordInput
                                    label="Password"
                                    icon={Lock}
                                    value={password}
                                    onChange={(e) = autoComplete="current-password" > setPassword(e.target.value)}
                                    required
                                />
                                <div style={{ textAlign: 'right' }}>
                                    <Link to="/forgot-password" style={{ color: 'var(--brand-customer)', fontSize: 'var(--text-caption)', fontWeight: 600, textDecoration: 'none' }}>
                                        Forgot Password?
                                    </Link>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <FloatingInput
                                label="Phone Number"
                                type="tel"
                                icon={Smartphone}
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                                disabled={otpRequested}
                            />
                            {otpRequested && (
                                <FloatingInput
                                    label="6-Digit OTP"
                                    type="text"
                                    icon={Lock}
                                    value={phoneOtp}
                                    onChange={(e) => setPhoneOtp(e.target.value)}
                                    required
                                />
                            )}
                        </>
                    )}
                </div>

                <Button 
                    type={loginMode === 'otp' && !otpRequested ? 'button' : 'submit'} 
                    variant="primary" 
                    fullWidth 
                    size="large"
                    onClick={loginMode === 'otp' && !otpRequested ? handleRequestOtp : undefined}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (loginMode === 'password' ? 'Log In' : (otpRequested ? 'Verify & Log In' : 'Send OTP'))}
                </Button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-5) 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
                <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            </div>

            <Button type="button" variant="secondary" fullWidth size="medium" onClick={handleGoogleLogin} disabled={loading}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ marginRight: '8px' }}>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
            </Button>

            <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--brand-customer)', fontWeight: 600, textDecoration: 'none' }}>
                    Sign up
                </Link>
            </p>
        </PremiumAuthLayout>
    );
};

export default LoginPage;
