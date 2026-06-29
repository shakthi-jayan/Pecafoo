import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { authAPI } from '../services/api';
import AuthLayout from '../components/shared/AuthLayout';
import { Button, FloatingInput, PasswordInput, OTPInput } from '@pecafoo/shared-ui/index';

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
        <AuthLayout
            title="Create a new password"
            subtitle="Secure your account with a strong new password."
        >
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                <h2 style={{ fontSize: 'var(--text-h2)', marginBottom: 'var(--space-2)' }}>Reset Password</h2>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Enter the OTP sent to your email and your new password.</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <FloatingInput
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                
                <FloatingInput
                    label="6-digit OTP"
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleChange}
                    required
                    maxLength={6}
                    style={{ letterSpacing: '0.1em' }}
                />
                
                <PasswordInput
                    label="New Password"
                    icon={Lock}
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
                
                <PasswordInput
                    label="Confirm New Password"
                    icon={Lock}
                    name="confirm_new_password"
                    value={formData.confirm_new_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                />
                
                <Button type="submit" variant="primary" fullWidth size="medium" disabled={loading} style={{ marginTop: 'var(--space-2)' }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
            </form>
        </AuthLayout>
    );
}

