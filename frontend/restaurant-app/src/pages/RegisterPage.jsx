import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload, MapPin, Loader2, AlertCircle, ExternalLink, ChefHat, BarChart3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../App';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { AuthProgress, PremiumAuthLayout, FloatingInput, PasswordInput, Button, GlassCard } from '../shared-ui/PremiumUI';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '', last_name: '', email: '', phone_number: '', password: '', password_confirm: '',
        restaurant_name: '', description: '', cuisine_type: '', address: '', city: '', state: '', pincode: '', restaurant_phone: '',
        latitude: null, longitude: null
    });
    const [docs, setDocs] = useState({
        business_license: null,
        food_safety_certificate: null,
        owner_id_proof: null,
    });
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [permissionBlocked, setPermissionBlocked] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [accountExists, setAccountExists] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const normalizePhoneNumber = (value) => {
        let cleaned = value.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+')) return cleaned;
        if (cleaned.startsWith('0') && cleaned.length > 10) cleaned = cleaned.substring(1);
        if (cleaned.length === 10) return '+91' + cleaned;
        if (cleaned.length === 12 && cleaned.startsWith('91')) return '+' + cleaned;
        return cleaned;
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value;
        value = normalizePhoneNumber(value);
        setFormData(prev => ({ ...prev, [e.target.name]: value }));
    };

    // Detect browser
    const getBrowser = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('chrome')) return 'Chrome';
        if (userAgent.includes('firefox')) return 'Firefox';
        if (userAgent.includes('safari')) return 'Safari';
        if (userAgent.includes('edge')) return 'Edge';
        return 'Browser';
    };

    const browser = getBrowser();

    const getBrowserInstructions = () => {
        switch(browser) {
            case 'Chrome':
                return {
                    steps: [
                        'Click the lock icon (🔒) or info icon (ℹ️) in the address bar',
                        'Find "Location" in the permissions section',
                        'Change the setting from "Block" to "Allow"',
                        'Refresh the page and click "Allow Location Access" again'
                    ],
                    icon: '🔒'
                };
            case 'Firefox':
                return {
                    steps: [
                        'Click the shield icon (🛡️) in the address bar',
                        'Click the "X" next to "Blocked" for Location',
                        'Select "Allow" from the dropdown',
                        'Refresh the page and try again'
                    ],
                    icon: '🛡️'
                };
            case 'Safari':
                return {
                    steps: [
                        'Go to Safari Settings/Preferences',
                        'Click on "Websites" tab',
                        'Select "Location" from the left sidebar',
                        'Find this website and change from "Deny" to "Allow"',
                        'Refresh the page and try again'
                    ],
                    icon: '🌐'
                };
            case 'Edge':
                return {
                    steps: [
                        'Click the lock icon (🔒) in the address bar',
                        'Find "Location" in permissions',
                        'Change from "Block" to "Allow"',
                        'Refresh the page and try again'
                    ],
                    icon: '🔒'
                };
            default:
                return {
                    steps: [
                        'Check your browser settings for location permissions',
                        'Find the site permissions for this website',
                        'Enable location access',
                        'Refresh the page and try again'
                    ],
                    icon: '⚙️'
                };
        }
    };

    const instructions = getBrowserInstructions();

    const requestLocationPermission = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.', { duration: 5000 });
            return false;
        }

        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

                if (permissionStatus.state === 'denied') {
                    setPermissionBlocked(true);
                    setShowInstructions(true);
                    toast.error(
                        (t) => (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} />
                                    <strong>Location Permission Blocked</strong>
                                </div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    Please enable location access in your browser settings
                                </div>
                                <button
                                    onClick={() => {
                                        toast.dismiss(t.id);
                                        setShowInstructions(true);
                                    }}
                                    style={{
                                        marginTop: '8px',
                                        padding: '6px 12px',
                                        background: '#f59e0b',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem'
                                    }}
                                >
                                    Show Instructions
                                </button>
                            </div>
                        ),
                        { duration: 8000, icon: '🔒' }
                    );
                    return false;
                }
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                });
            });

            setFormData(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }));
            setPermissionBlocked(false);
            setShowInstructions(false);
            toast.success('Location captured successfully!', { duration: 3000 });
            return true;

        } catch (err) {
            if (err.code === 1) {
                setPermissionBlocked(true);
                setShowInstructions(true);
                toast.error(
                    'Location access is required. Please check the instructions to enable location permissions.',
                    { duration: 7000 }
                );
            } else if (err.code === 2) {
                toast.error('Location unavailable. Please check your GPS.', { duration: 5000 });
            } else if (err.code === 3) {
                toast.error('Location request timed out. Please try again.', { duration: 5000 });
            }
            return false;
        }
    };

    const fetchLocation = async () => {
        setFetchingLocation(true);
        setPermissionBlocked(false);
        await requestLocationPermission();
        setFetchingLocation(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            toast.error('Passwords do not match.');
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            toast.error(
                (t) => (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>📍 Location access is required for restaurant delivery</div>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                fetchLocation();
                            }}
                            style={{
                                marginTop: '8px',
                                padding: '6px 12px',
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Enable Location Now
                        </button>
                    </div>
                ),
                { duration: 5000 }
            );
            return;
        }

        if (!docs.business_license || !docs.food_safety_certificate || !docs.owner_id_proof) {
            toast.error('Please upload all required verification documents.');
            return;
        }
        setLoading(true);
        try {
            const userData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                password_confirm: formData.password_confirm,
            };

            await register(userData);

            const restaurantData = new FormData();
            restaurantData.append('name', formData.restaurant_name);
            restaurantData.append('description', formData.description);
            restaurantData.append('cuisine_type', formData.cuisine_type);
            restaurantData.append('address', formData.address);
            restaurantData.append('city', formData.city);
            restaurantData.append('state', formData.state);
            restaurantData.append('pincode', formData.pincode);
            restaurantData.append('phone', formData.restaurant_phone || formData.phone_number);
            restaurantData.append('slug', formData.restaurant_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

            restaurantData.append('business_license', docs.business_license);
            restaurantData.append('food_safety_certificate', docs.food_safety_certificate);
            restaurantData.append('owner_id_proof', docs.owner_id_proof);
            restaurantData.append('latitude', formData.latitude);
            restaurantData.append('longitude', formData.longitude);

            await restaurantsAPI.createRestaurant(restaurantData);

            toast.success('Account created successfully!');
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.data?.code === 'ACCOUNT_EXISTS') {
                setAccountExists(true);
            } else {
                toast.error(err.response?.data?.email?.[0] || err.response?.data?.detail || err.message || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    // FIX: no `required` attribute on the file <input>. A required input that is
    // visually hidden with `display: none` is removed from the accessibility tree,
    // so Chrome cannot focus it to show its native validation bubble and throws:
    // "An invalid form control with name='...' is not focusable."
    // Validation for these three fields is instead handled manually in handleRegister.
    // The input itself is hidden using an off-screen technique (not display:none) so
    // it stays in the accessibility tree and remains keyboard/label-clickable.
    const FileField = ({ label, name }) => (
        <div style={{ marginBottom: 12 }}>
            <label
                htmlFor={`file-${name}`}
                style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                    fontWeight: 700,
                }}
            >
                {label}
                <span style={{ color: '#ef4444' }}> *</span>
            </label>

            <label
                htmlFor={`file-${name}`}
                className="input"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                }}
            >
                <span
                    style={{
                        color: docs[name]
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {docs[name]?.name || 'Choose file'}
                </span>

                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--accent)',
                    }}
                >
                    <Upload size={16} />
                    Upload
                </span>

                <input
                    id={`file-${name}`}
                    type="file"
                    accept="image/*,.pdf"
                    style={{
                        position: 'absolute',
                        width: '1px',
                        height: '1px',
                        padding: 0,
                        margin: '-1px',
                        overflow: 'hidden',
                        clip: 'rect(0, 0, 0, 0)',
                        whiteSpace: 'nowrap',
                        border: 0,
                    }}
                    onChange={(e) =>
                        setDocs((prev) => ({
                            ...prev,
                            [name]: e.target.files?.[0] || null,
                        }))
                    }
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
                    background: linear-gradient(135deg, #F97316 0%, #FB923C 100%);
                    transition: transform 0.2s, box-shadow 0.2s;
                    margin-top: 24px;
                }
                .premium-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 20px rgba(249, 115, 22, 0.25);
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
                    background: rgba(249, 115, 22, 0.1);
                    color: #F97316;
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
                    <p style={{ color: '#F97316', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Pecafoo for Restaurants</p>
                    <h1 style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 16, color: '#0f172a' }}>
                        Grow your business.
                    </h1>
                    <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.5, marginBottom: 40 }}>
                        Join thousands of restaurants reaching more customers and boosting revenue every day.
                    </p>
                    
                    <div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><BarChart3 size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>More Orders</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Reach thousands of hungry customers in your area instantly.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ChefHat size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Easy Menu Management</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Update your offerings, prices, and availability in real-time.</p>
                            </div>
                        </div>
                        <div className="benefit-card">
                            <div className="benefit-icon"><ShieldCheck size={24} /></div>
                            <div>
                                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Fast Verification</h3>
                                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Quick onboarding process to get you selling as soon as possible.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="premium-register-right">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-register-card">
                    
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <AuthProgress steps={['Details', 'Location', 'Verify']} current={1} brandColor="#F97316" />
                        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: 16, marginBottom: 8 }}>Restaurant Information</h2>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Create your restaurant partner account.</p>
                    </div>

                    {accountExists ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '32px', background: '#f8fafc', borderRadius: 20 }}>
                            <div style={{ marginBottom: 16 }}>
                                <AlertCircle size={40} color="#F97316" style={{ margin: '0 auto' }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: 8, color: '#0f172a' }}>Account Found!</h3>
                            <p style={{ fontSize: '15px', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>
                                We found an existing Pecafoo account associated with this email. You can use your existing account to become a Restaurant Partner.
                            </p>
                            <Link 
                                to={`/login?email=${encodeURIComponent(formData.email)}`}
                                className="premium-btn"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                            >
                                Log In to Add Restaurant Role
                            </Link>
                        </motion.div>
                    ) : (
                    <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput name="first_name" label="First Name" value={formData.first_name} onChange={handleChange} required />
                            <FloatingInput name="last_name" label="Last Name" value={formData.last_name} onChange={handleChange} required />
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <FloatingInput type="email" name="email" label="Email Address" value={formData.email} onChange={handleChange} required autoComplete="email" />
                            <FloatingInput type="tel" name="phone_number" label="Mobile Number" value={formData.phone_number} onChange={handlePhoneChange} required />
                        </div>
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <FloatingInput name="restaurant_name" label="Restaurant Name" value={formData.restaurant_name} onChange={handleChange} required />
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                            <FloatingInput name="cuisine_type" label="Cuisine Type (e.g., Indian, Chinese)" value={formData.cuisine_type} onChange={handleChange} />
                            <FloatingInput type="tel" name="restaurant_phone" label="Restaurant Phone" value={formData.restaurant_phone} onChange={handleChange} />
                        </div>
                        
                        <FloatingInput name="description" label="Short Description" value={formData.description} onChange={handleChange} />
                        
                        <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />
                        
                        <FloatingInput name="address" label="Street Address" value={formData.address} onChange={handleChange} required />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <FloatingInput name="city" label="City" value={formData.city} onChange={handleChange} required />
                            <FloatingInput name="state" label="State" value={formData.state} onChange={handleChange} required />
                            <FloatingInput name="pincode" label="Pincode" value={formData.pincode} onChange={handleChange} required />
                        </div>
                        
                        {/* Location Widget */}
                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: formData.latitude ? '1px solid #10b981' : (permissionBlocked ? '1px solid #f59e0b' : '1px solid #e2e8f0') }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <MapPin size={16} color={permissionBlocked ? '#f59e0b' : '#F97316'} />
                                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>Restaurant Location</span>
                                        {!formData.latitude && (
                                            <span style={{ fontSize: '11px', background: permissionBlocked ? '#fef3c7' : '#fee2e2', color: permissionBlocked ? '#92400e' : '#ef4444', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{permissionBlocked ? 'Blocked' : 'Required'}</span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '13px', color: formData.latitude ? '#10b981' : (permissionBlocked ? '#92400e' : '#64748b') }}>
                                        {formData.latitude ? `Lat: ${Number(formData.latitude).toFixed(4)}, Lng: ${Number(formData.longitude).toFixed(4)}` : (permissionBlocked ? 'Location access is blocked.' : 'Required for delivery routing')}
                                    </div>
                                </div>
                                <button type="button" onClick={fetchLocation} disabled={fetchingLocation} style={{
                                    padding: '8px 16px', fontSize: '14px', background: formData.latitude ? '#ffffff' : (permissionBlocked ? '#fef3c7' : '#F97316'),
                                    color: formData.latitude ? '#0f172a' : (permissionBlocked ? '#92400e' : 'white'),
                                    border: formData.latitude ? '1px solid #e2e8f0' : (permissionBlocked ? '1px solid #f59e0b' : 'none'),
                                    borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, cursor: 'pointer'
                                }}>
                                    {fetchingLocation ? <><Loader2 size={14} className="spin" /> Fetching...</> : <><MapPin size={14} /> {formData.latitude ? 'Update' : (permissionBlocked ? 'Instructions' : 'Allow Access')}</>}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <PasswordInput name="password" label="Password (min 8 chars)" value={formData.password} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                            <PasswordInput name="password_confirm" label="Confirm Password" value={formData.password_confirm} onChange={handleChange} required minLength={8} autoComplete="new-password" />
                        </div>

                        {/* Documents Section */}
                        <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #e2e8f0', marginTop: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <FileText size={18} color="#F97316" />
                                <strong style={{ fontSize: '15px', color: '#0f172a' }}>Verification Documents</strong>
                            </div>
                            <FileField label="Business License" name="business_license" />
                            <FileField label="Food Safety Certificate" name="food_safety_certificate" />
                            <FileField label="Owner ID Proof" name="owner_id_proof" />
                        </div>

                        <button type="submit" className="premium-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                    )}

                    <p style={{ textAlign: 'center', marginTop: 32, color: '#64748b', fontSize: '15px' }}>
                        Already have an account? <Link to="/login" style={{ color: '#F97316', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}

export default RegisterPage;
