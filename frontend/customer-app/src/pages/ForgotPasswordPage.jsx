import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import { authAPI } from '../services/api';
import { PremiumAuthLayout, Button, FloatingInput } from '../shared-ui/PremiumUI';

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

    const authFeatures = [
        { icon: Mail, title: 'Check Your Inbox', copy: 'We will send a secure 6-digit OTP to your email.' }
    ];

    return (
        <PremiumAuthLayout 
            eyebrow="Account Recovery"
            title="Reset your password"
            description="Don't worry, it happens to the best of us. Let's get you back into your account."
            features={authFeatures}
            tone="customer"
        >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-2)', fontWeight: 700, letterSpacing: '-0.03em' }}>Forgot Password</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Enter your email to receive a password reset OTP.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <FloatingInput 
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) = autoComplete="email" > setEmail(e.target.value)}
                    required
                    disabled={sent}
                />
                
                <Button 
                    type="submit" 
                    variant="primary" 
                    fullWidth 
                    size="large" 
                    disabled={loading || sent}
                    style={{ marginTop: 'var(--space-2)' }}
                >
                    {loading ? 'Sending OTP...' : sent ? 'Sent!' : 'Send OTP'}
                </Button>
                
                <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button type="button" variant="ghost" fullWidth size="large">
                        Back to Login
                    </Button>
                </Link>
            </form>
        </PremiumAuthLayout>
    );
}
