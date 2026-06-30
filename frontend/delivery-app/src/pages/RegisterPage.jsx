import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload, User, Navigation, WalletCards, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { deliveryAPI } from '../services/api';
import { AuthProgress, PremiumAuthLayout, GlassCard, FloatingInput, PasswordInput, Button } from '../shared-ui/PremiumUI';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [fd, setFd] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        vehicle_type: 'motorcycle',
        vehicle_number: '',
        license_number: '',
    });
    const [docs, setDocs] = useState({
        id_proof: null,
        license_image: null,
    });
    const [loading, setLoading] = useState(false);
    const [accountExists, setAccountExists] = useState(false);

    // visually-hidden style for accessibility
    const visuallyHidden = {
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
        border: 0,
    };

    const normalizePhoneNumber = (value) => {
        // Remove all non-digit characters except +
        let cleaned = value.replace(/[^\d+]/g, '');
        
        // If it starts with +, keep it as is
        if (cleaned.startsWith('+')) {
            return cleaned;
        }
        
        // Remove leading 0 if present
        if (cleaned.startsWith('0') && cleaned.length > 10) {
            cleaned = cleaned.substring(1);
        }
        
        // If 10 digits, prepend +91
        if (cleaned.length === 10) {
            return '+91' + cleaned;
        }
        
        // If 12 digits starting with 91, prepend +
        if (cleaned.length === 12 && cleaned.startsWith('91')) {
            return '+' + cleaned;
        }
        
        return cleaned;
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        // Normalize as user types
        value = normalizePhoneNumber(value);
        setFd({ ...fd, phone_number: value });
    };

    const handle = async (e) => {
        e.preventDefault();
        if (fd.password !== fd.password_confirm) {
            toast.error('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            await register({
                first_name: fd.first_name,
                last_name: fd.last_name,
                email: fd.email,
                phone_number: fd.phone_number,
                password: fd.password,
                password_confirm: fd.password_confirm,
            });

            const profileData = new FormData();
            profileData.append('vehicle_type', fd.vehicle_type);
            profileData.append('vehicle_number', fd.vehicle_number);
            profileData.append('license_number', fd.license_number);
            if (docs.id_proof) profileData.append('id_proof', docs.id_proof);
            if (docs.license_image) profileData.append('license_image', docs.license_image);

            await deliveryAPI.updateProfile(profileData);

            toast.success('Account created!');
            navigate('/', { replace: true });
        } catch (err) {
            if (err.response?.data?.code === 'ACCOUNT_EXISTS') {
                setAccountExists(true);
                return;
            }
            const errorMsg = err.response?.data?.phone_number?.[0] || 
                           err.response?.data?.email?.[0] || 
                           err.response?.data?.detail || 
                           'Registration failed.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    const FileField = ({ label, name }) => (
        <div style={{ marginBottom: 'var(--space-3)' }}>
            <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)', fontWeight: 600 }}>{label}</label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', cursor: 'pointer', padding: '12px 16px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: docs[name] ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 'var(--text-body)' }}>
                    {docs[name]?.name || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--brand-delivery)', fontWeight: 600, fontSize: 'var(--text-caption)' }}>
                    <Upload size={16} /> Upload
                </span>
                <input
                    type="file"
                    name={name}
                    accept="image/*,.pdf"
                    style={visuallyHidden}
                    onChange={(e) => setDocs({ ...docs, [name]: e.target.files?.[0] || null })}
                />
            </label>
        </div>
    );

    return (
        <PremiumAuthLayout
            tone="delivery"
            eyebrow="Become a delivery partner"
            title="Flexible work, with the whole day in view."
            description="Set up your partner profile once, keep documents organized, and start delivering when it works for you."
            features={[
                { icon: Navigation, title: 'Choose your momentum', copy: 'Go online when you are ready.' },
                { icon: WalletCards, title: 'Transparent earnings', copy: 'Clear daily and weekly totals.' },
                { icon: ShieldCheck, title: 'Simple verification', copy: 'Documents stay grouped and visible.' },
            ]}
        >
            <GlassCard padding="var(--space-5)">
                <AuthProgress steps={['Account', 'Vehicle', 'Verify']} current={2} />
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-5)' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto var(--space-4)', background: 'var(--brand-delivery)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'white', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)' }}>GO</div>
                    <h1 style={{ fontSize: 'var(--text-h3)', fontWeight: 800, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Join as Partner</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-body)' }}>Create your account and upload your verification documents</p>
                </div>
                
                {accountExists ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 'var(--space-5)', background: 'var(--color-bg-base)', borderRadius: 'var(--radius-lg)' }}>
                        <div style={{ marginBottom: 'var(--space-3)' }}>
                            <User size={32} color="var(--brand-delivery)" style={{ margin: '0 auto' }} />
                        </div>
                        <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-2)', color: 'var(--color-text-primary)' }}>Account Found!</h3>
                        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
                            We found an existing Pecafoo account associated with this email. You can use your existing account to become a Delivery Partner.
                        </p>
                        <Link 
                            to={`/login?email=${encodeURIComponent(fd.email)}`}
                            style={{
                                display: 'block',
                                width: '100%',
                                padding: '14px',
                                background: 'var(--brand-delivery)',
                                color: 'white',
                                fontWeight: 600,
                                borderRadius: '100px',
                                textDecoration: 'none',
                                textAlign: 'center'
                            }}
                        >
                            Log In to Add Delivery Role
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <FloatingInput id="first_name" name="first_name" label="First Name" value={fd.first_name} onChange={ch} required />
                            <FloatingInput id="last_name" name="last_name" label="Last Name" value={fd.last_name} onChange={ch} required />
                        </div>
                        <FloatingInput id="email" type="email" name="email" label="Email Address" value={fd.email} onChange={ch} required autoComplete="email" />
                        <FloatingInput id="phone_number" type="tel" name="phone_number" label="Mobile Number (e.g., +919876543210)" value={fd.phone_number} onChange={handlePhoneChange} required />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <select className="input" name="vehicle_type" value={fd.vehicle_type} onChange={ch} style={{ height: '48px', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0 12px', fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput id="vehicle_number" name="vehicle_number" label="Vehicle Number" value={fd.vehicle_number} onChange={ch} />
                        </div>
                        <FloatingInput id="license_number" name="license_number" label="License Number" value={fd.license_number} onChange={ch} />
                        
                        <PasswordInput id="password" name="password" label="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} autoComplete="new-password" />
                        <PasswordInput id="password_confirm" name="password_confirm" label="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} autoComplete="new-password" />

                        <div style={{ background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                <FileText size={18} color="var(--brand-delivery)" />
                                <strong style={{ color: 'var(--color-text-primary)', fontSize: 'var(--text-body)' }}>Verification Documents</strong>
                            </div>
                            <FileField label="ID Proof" name="id_proof" />
                            <FileField label="Driving License / Vehicle Permit" name="license_image" />
                        </div>
                        <Button type="submit" variant="primary" size="large" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </Button>
                    </form>
                )}
                <p style={{ textAlign: 'center', marginTop: 'var(--space-5)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--brand-delivery)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                </p>
            </GlassCard>
        </PremiumAuthLayout>
    );
}
