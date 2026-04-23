import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    const [formData, setFormData] = useState({
        email: '',
        otp: '',
        new_password: '',
        confirm_new_password: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const emailFromUrl = searchParams.get('email');
        if (emailFromUrl) {
            setFormData(prev => ({ ...prev, email: emailFromUrl }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.new_password !== formData.confirm_new_password) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(formData);
            toast.success('Password reset successfully! Please login.');
            navigate('/login', { replace: true });
        } catch (err) {
            const apiError = err?.response?.data;
            toast.error(
                apiError?.otp?.[0] || 
                apiError?.confirm_new_password?.[0] || 
                apiError?.error || 
                'Failed to reset password.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="auth-shell">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Reset Password</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Enter the OTP sent to your email and your new password.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        className="input"
                        type="email"
                        name="email"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ marginBottom: 12 }}
                    />
                    <input
                        className="input"
                        type="text"
                        name="otp"
                        placeholder="6-digit OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        required
                        maxLength={6}
                        style={{ marginBottom: 12, letterSpacing: '0.1em' }}
                    />
                    <input
                        className="input"
                        type="password"
                        name="new_password"
                        placeholder="New Password (min 8 chars)"
                        value={formData.new_password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{ marginBottom: 12 }}
                    />
                    <input
                        className="input"
                        type="password"
                        name="confirm_new_password"
                        placeholder="Confirm New Password"
                        value={formData.confirm_new_password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{ marginBottom: 20 }}
                    />
                    
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: 14, fontSize: '1rem' }}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'} <ArrowRight size={18} />
                    </button>
                    
                    <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Remembered it? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Back to Login</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
}
