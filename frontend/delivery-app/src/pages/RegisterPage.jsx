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
        <div className="premium-register-layout">
            <style>{`
                .premium-register-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }
                .premium-register-left {
                    flex: 0 0 40%;
                    background: #ffffff;
                    padding: 4vw;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    border-right: 1px solid #f1f5f9;
                }
                .premium-register-right {
                    flex: 1;
                    padding: 4vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 640px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 40px;
                    border-radius: 28px;
                    box-shadow: 0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02);
                }
                .premium-btn {
                    width: 100%;
                    height: 56px;
                    border-radius: 16px;
                    border: none;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-top: 24px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.25);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .benefit-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: rgba(34, 197, 94, 0.1);
                    color: #22C55E;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                @media (max-width: 992px) {
                    .premium-register-layout { flex-direction: column; }
                    .premium-register-left { flex: none; padding: 40px 24px; border-right: none; border-bottom: 1px solid #f1f5f9; }
                    .premium-register-right { padding: 24px; }
                    .premium-register-card { padding: 32px 24px; }
                }
            `}</style>
            
            <div className="premium-register-left">
                <div style={{ maxWidth: 420, margin: '0 auto' }}>
                    <p style={{ color: '#22C55E', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pecafoo Delivery Partner</p>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Flexible work, on your terms.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.5, marginBottom: 40 }}>
                        Set up your partner profile once and start earning when it works for you.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><Navigation size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Choose your momentum</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Go online and accept deliveries whenever you are ready.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><WalletCards size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Transparent earnings</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Clear daily and weekly totals delivered right to your dashboard.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Simple verification</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Your documents stay secure, grouped, and visible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-register-card">
                    
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <AuthProgress steps={['Account', 'Vehicle', 'Verify']} current={1} brandColor="#22C55E" />
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: 16, marginBottom: 8 }}>Join as Partner</h2>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Create your account and upload verification documents.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <User size={40} color="#22C55E" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Account Found!</h3>
                            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
                                We found an existing Pecafoo account associated with this email. You can use your existing account to become a Delivery Partner.
                            </p>
                            <Link 
                                to={`/login?email=${encodeURIComponent(fd.email)}`}
                                className="premium-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                Log In to Add Delivery Role
                            </Link>
                        </motion.div>
                    ) : (
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="first_name" name="first_name" label="First Name" value={fd.first_name} onChange={ch} required />
                            <FloatingInput id="last_name" name="last_name" label="Last Name" value={fd.last_name} onChange={ch} required />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="email" type="email" name="email" label="Email Address" value={fd.email} onChange={ch} required autoComplete="email" />
                            <FloatingInput id="phone_number" type="tel" name="phone_number" label="Mobile Number" value={fd.phone_number} onChange={handlePhoneChange} required />
                        </div>
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <select name="vehicle_type" value={fd.vehicle_type} onChange={ch} style={{ height: '56px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '0 16px', fontSize: '16px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput id="vehicle_number" name="vehicle_number" label="Vehicle Number" value={fd.vehicle_number} onChange={ch} />
                        </div>
                        <FloatingInput id="license_number" name="license_number" label="License Number" value={fd.license_number} onChange={ch} />
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput id="password" name="password" label="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} autoComplete="new-password" />
                            <PasswordInput id="password_confirm" name="password_confirm" label="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} autoComplete="new-password" />
                        </div>

                        {/* Documents Section */}
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <FileText size={18} color="#22C55E" />
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>Verification Documents</strong>
                            </div>
                            <FileField label="ID Proof" name="id_proof" />
                            <FileField label="Driving License / Vehicle Permit" name="license_image" />
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    )}
                    
                    <p style={{ textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: '15px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#22C55E', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

