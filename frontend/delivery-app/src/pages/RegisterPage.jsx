import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload, User, Navigation, WalletCards, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
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

            await deliveryAPI.createProfile(profileData);

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
        <div className="premium-register-layout" style={{"--brand-color": "#22C55E", "--brand-color-dark": "#16a34a", "--brand-color-light": "rgba(34, 197, 94, 0.1)"}}>
            <style>{`
                .premium-register-layout {
                    display: flex;
                    align-items: stretch;
                    justify-content: center;
                    background-color: #f8fafc;
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    width: 100%;
                    min-height: 100vh;
                }
                .premium-register-container {
                    display: flex;
                    width: 100%;
                    max-width: 1440px;
                    margin: auto;
                    padding-inline: 48px;
                    gap: 32px;
                    align-items: stretch;
                    justify-content: center;
                }
                .premium-register-left {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    max-width: 520px;
                    position: relative;
                }
                .premium-register-right {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                }
                .premium-register-card {
                    width: 100%;
                    max-width: 640px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 48px;
                    border-radius: 24px;
                    box-shadow: 0 24px 48px -12px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.02);
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
                    background: linear-gradient(135deg, var(--brand-color, #F97316) 0%, var(--brand-color-dark, #ea580c) 100%);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    margin-top: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 24px rgba(0,0,0,0.1);
                }
                .premium-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .premium-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .benefit-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .benefit-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: var(--brand-color-light, rgba(249, 115, 22, 0.1));
                    color: var(--brand-color, #F97316);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .form-section-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #0f172a;
                    margin: 32px 0 16px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .form-section-title::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e2e8f0;
                }
                
                /* Desktop Responsive Behavior */
                @media (min-width: 1440px) {
                    .premium-register-left { flex: 0 0 40%; }
                    .premium-register-right { flex: 0 0 60%; }
                }
                @media (min-width: 1200px) and (max-width: 1439px) {
                    .premium-register-container { padding-inline: 32px; gap: 24px; }
                    .premium-register-left { flex: 0 0 42%; }
                    .premium-register-right { flex: 0 0 58%; }
                }
                @media (min-width: 1024px) and (max-width: 1199px) {
                    .premium-register-container { padding-inline: 24px; gap: 16px; }
                    .premium-register-left { flex: 0 0 45%; }
                    .premium-register-right { flex: 0 0 55%; }
                    .premium-register-left h1 { font-size: 40px !important; }
                }
                
                /* Desktop Scrolling Logic */
                @media (min-width: 1024px) {
                    .premium-register-layout {
                        height: 100vh;
                        overflow: hidden;
                    }
                    .premium-register-container {
                        height: 100vh;
                    }
                    .premium-register-left {
                        height: 100%;
                        overflow-y: auto;
                        padding-right: 16px;
                        padding-top: 48px;
                        padding-bottom: 48px;
                    }
                    .premium-register-right {
                        height: 100%;
                        overflow-y: auto;
                        padding-top: 48px;
                        padding-bottom: 48px;
                    }
                }

                /* Mobile/Tablet Stacked Layout */
                @media (max-width: 1023px) {
                    .premium-register-container { 
                        flex-direction: column; 
                        padding-inline: 0;
                        gap: 0;
                        max-width: 100%;
                    }
                    .premium-register-left { flex: none; padding: 48px 24px; max-width: 100%; }
                    .premium-register-right { flex: none; padding: 24px; width: 100%; }
                    .premium-register-card { padding: 0; box-shadow: none; border-radius: 0; background: transparent; }
                }
            `}</style>
            
            <div className="premium-register-container">
            <div className="premium-register-left">
                <div style={{ maxWidth: 420, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, background: '#0f172a', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 32 }}>
                        <Navigation size={24} />
                    </div>
                    <h1 style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Earn on your own schedule.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6, marginBottom: 48 }}>
                        Set up your partner profile once and start earning when it works for you.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><Navigation size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Choose your momentum</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Go online and accept deliveries whenever you are ready.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><WalletCards size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Transparent earnings</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Clear daily and weekly totals delivered right to your dashboard.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Simple verification</h3>
                                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: 1.5 }}>Your documents stay secure, grouped, and visible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="premium-register-card">
                    
                    {/* Apple-style Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
                        {['Account', 'Vehicle', 'Verify'].map((step, i) => {
                            const current = 1;
                            const isActive = i + 1 === current;
                            const isDone = i + 1 < current;
                            return (
                                <React.Fragment key={step}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                        <div style={{
                                            width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive || isDone ? '#22C55E' : '#f1f5f9',
                                            color: isActive || isDone ? 'white' : '#94a3b8',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {isDone ? <CheckCircle size={14} /> : (isActive ? <div style={{width: 8, height: 8, borderRadius: 4, background: 'white'}}/> : <div style={{width: 6, height: 6, borderRadius: 3, background: '#cbd5e1'}}/>)}
                                        </div>
                                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? '#0f172a' : '#94a3b8' }}>{step}</span>
                                    </div>
                                    {i < 2 && (
                                        <div style={{ width: 40, height: 2, background: isDone ? '#22C55E' : '#f1f5f9', marginTop: -24 }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', marginBottom: 8, letterSpacing: '-0.02em' }}>Become a Delivery Partner</h2>
                        <p style={{ color: '#64748b', fontSize: '16px' }}>Create your account and upload verification documents.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px', background: '#f0fdf4', borderRadius: 20, border: '1px solid #dcfce7' }}>
                            <div style={{ marginBottom: 16 }}>
                                <User size={48} color="#22C55E" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#166534' }}>Account Already Exists</h3>
                            <p style={{ fontSize: '15px', color: '#166534', marginBottom: 24, lineHeight: 1.5, opacity: 0.9 }}>
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
                        
                        <div className="form-section-title">Name</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="first_name" name="first_name" label="First Name" value={fd.first_name} onChange={ch} required brandColor="var(--brand-delivery)" />
                            <FloatingInput id="last_name" name="last_name" label="Last Name" value={fd.last_name} onChange={ch} required brandColor="var(--brand-delivery)" />
                        </div>
                        
                        <div className="form-section-title">Contact</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput id="email" type="email" name="email" label="Email Address" value={fd.email} onChange={ch} required autoComplete="email" brandColor="var(--brand-delivery)" />
                            <FloatingInput id="phone_number" type="tel" name="phone_number" label="Mobile Number" value={fd.phone_number} onChange={handlePhoneChange} required brandColor="var(--brand-delivery)" />
                        </div>
                        
                        <div className="form-section-title">Vehicle</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <select name="vehicle_type" value={fd.vehicle_type} onChange={ch} style={{ height: '56px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '16px', padding: '0 16px', fontSize: '16px', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput id="vehicle_number" name="vehicle_number" label="Vehicle Number" value={fd.vehicle_number} onChange={ch} brandColor="var(--brand-delivery)" />
                        </div>
                        <FloatingInput id="license_number" name="license_number" label="License Number" value={fd.license_number} onChange={ch} brandColor="var(--brand-delivery)" />
                        
                        <div className="form-section-title">Passwords</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput id="password" name="password" label="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} autoComplete="new-password" brandColor="var(--brand-delivery)" />
                            <PasswordInput id="password_confirm" name="password_confirm" label="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} autoComplete="new-password" brandColor="var(--brand-delivery)" />
                        </div>

                        {/* High-Fidelity Documents Section */}
                        <div className="form-section-title">Verification Uploads</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {[
                                { label: 'ID Proof', name: 'id_proof' },
                                { label: 'Driving License / Vehicle Permit', name: 'license_image' }
                            ].map(field => {
                                const file = docs[field.name];
                                return (
                                    <label key={field.name} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px',
                                        background: file ? '#f0fdf4' : '#ffffff',
                                        border: file ? '2px solid #22C55E' : '1px dashed #cbd5e1',
                                        borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s ease',
                                        boxShadow: file ? '0 4px 12px rgba(34,197,94,0.1)' : 'none'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                            <div style={{ width: 48, height: 48, borderRadius: 12, background: file ? '#22C55E' : '#f1f5f9', color: file ? 'white' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                                                {file ? <FileText size={24} /> : <Upload size={24} />}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                                                    {field.label}
                                                </div>
                                                <div style={{ fontSize: 13, color: file ? '#22C55E' : '#94a3b8', fontWeight: file ? 600 : 400 }}>
                                                    {file ? file.name : 'Drag & Drop or Choose File'}
                                                </div>
                                            </div>
                                        </div>
                                        {!file && (
                                            <div style={{ padding: '8px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                                Browse
                                            </div>
                                        )}
                                        {file && (
                                            <div style={{ padding: '6px', borderRadius: '50%', background: '#22C55E', color: 'white' }}>
                                                <CheckCircle size={16} />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            name={field.name}
                                            accept="image/*,.pdf"
                                            style={{ display: 'none' }}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0] || null;
                                                setDocs(prev => ({ ...prev, [field.name]: f }));
                                            }}
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? <><Loader2 className="spin" size={20} /> Creating Account...</> : <>Create Account <ArrowRight size={20} /></>}
                        </button>
                    </form>
                    )}
                    
                    <p style={{ textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: '15px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#22C55E', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
        </div>
    );
}
