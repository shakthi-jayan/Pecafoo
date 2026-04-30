import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { authAPI } from '../services/api';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.forgotPassword({ email });
            toast.success('OTP sent to your email');
            setSent(true);
            setTimeout(() => {
                navigate(`/reset-password?email=${encodeURIComponent(email)}`);
            }, 1000);
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to send OTP.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-shell">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>Forgot Password</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Enter your email to receive a password reset OTP.
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        className="input"
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ marginBottom: 20 }}
                        disabled={sent}
                    />
                    
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || sent}
                        style={{ width: '100%', padding: 14, fontSize: '1rem', marginBottom: 16 }}
                    >
                        {loading ? 'Sending OTP...' : sent ? 'Sent!' : 'Send OTP'} <ArrowRight size={18} />
                    </button>
                    
                    <Link
                        to="/login"
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: 14, fontSize: '1rem', display: 'flex', justifyContent: 'center' }}
                    >
                        <ArrowLeft size={18} /> Back to Login
                    </Link>
                </form>
            </motion.div>
        </div>
    );
}
