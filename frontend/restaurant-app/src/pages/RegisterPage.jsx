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
        <PremiumAuthLayout
            tone="restaurant"
            eyebrow="Partner with Pecafoo"
            title="Bring your restaurant into one beautifully organized workspace."
            description="Create your storefront, verify the essentials, and prepare your team for a smoother service."
            features={[
                { icon: ChefHat, title: 'Built for service', copy: 'Menu, kitchen, and orders stay connected.' },
                { icon: BarChart3, title: 'Grow with context', copy: 'See the signals behind every shift.' },
                { icon: ShieldCheck, title: 'Guided verification', copy: 'Business documents in one clear flow.' },
            ]}
        >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
                <AuthProgress steps={['Owner', 'Restaurant', 'Verify']} current={2} />
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)' }}>Chef</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Create Restaurant Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Register your restaurant and upload verification documents</p>
                </div>

                {/* Permission Instructions Modal/Panel */}
                {showInstructions && permissionBlocked && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginBottom: 20,
                            padding: 16,
                            background: '#fef3c7',
                            border: '1px solid #f59e0b',
                            borderRadius: 12,
                            position: 'relative'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <AlertCircle size={20} color="#f59e0b" />
                            <strong style={{ color: '#92400e' }}>Location Permission Required</strong>
                            <button
                                onClick={() => setShowInstructions(false)}
                                style={{
                                    marginLeft: 'auto',
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#92400e'
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: 12 }}>
                            Please follow these steps to enable location access in {browser}:
                        </p>
                        <ol style={{ margin: 0, paddingLeft: 20, color: '#92400e', fontSize: '0.8rem' }}>
                            {instructions.steps.map((step, idx) => (
                                <li key={idx} style={{ marginBottom: 6 }}>{step}</li>
                            ))}
                        </ol>
                        <button
                            onClick={() => {
                                setShowInstructions(false);
                                fetchLocation();
                            }}
                            style={{
                                marginTop: 12,
                                padding: '6px 12px',
                                background: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            <ExternalLink size={14} />
                            I've enabled it, try again
                        </button>
                    </motion.div>
                )}

                {accountExists ? (
                    <div className="card" style={{ padding: 32, textAlign: 'center', background: 'rgba(255,180,0,0.1)', border: '1px solid rgba(255,180,0,0.3)', borderRadius: 20 }}>
                        <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text)', marginBottom: 12 }}>You already have an account!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.5 }}>
                            The email <strong>{formData.email}</strong> is already registered on Pecafoo. You can log in and add a Restaurant profile to your existing account.
                        </p>
                        <button 
                            className="btn btn-primary btn-full btn-lg"
                            onClick={() => navigate('/login')}
                            style={{ height: 50, borderRadius: 16 }}
                        >
                            Log In to Continue <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <FloatingInput
                            name="first_name"
                            label="First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                        <FloatingInput
                            name="last_name"
                            label="Last Name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                    </div>

                    <FloatingInput
                        type="email"
                        name="email"
                        label="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    
                    <FloatingInput 
                        type="tel" 
                        name="phone_number" 
                        label="Owner Phone" 
                        value={formData.phone_number} 
                        onChange={handlePhoneChange} 
                        required 
                    />

                    <FloatingInput
                        name="restaurant_name"
                        label="Restaurant Name"
                        value={formData.restaurant_name}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="description"
                        placeholder="Restaurant Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: 'var(--radius-input)',
                            border: '1px solid var(--color-border)', background: 'var(--color-bg-base)',
                            fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                            outline: 'none', fontFamily: 'inherit', resize: 'vertical'
                        }}
                    />

                    <FloatingInput
                        name="cuisine_type"
                        label="Cuisine Type (e.g., Italian, Chinese)"
                        value={formData.cuisine_type}
                        onChange={handleChange}
                        required
                    />

                    <FloatingInput
                        name="address"
                        label="Full Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <FloatingInput
                            name="city"
                            label="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                        <FloatingInput
                            name="state"
                            label="State"
                            value={formData.state}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                        <FloatingInput
                            name="pincode"
                            label="Pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                            style={{ flex: 1 }}
                        />
                        <FloatingInput 
                            name="restaurant_phone" 
                            label="Restaurant Phone (Optional)" 
                            value={formData.restaurant_phone} 
                            onChange={handlePhoneChange} 
                            style={{ flex: 1 }}
                        />
                    </div>

                    {/* Location Section */}
                    <div style={{
                        marginTop: 16,
                        marginBottom: 16,
                        padding: 16,
                        background: 'var(--bg-alt)',
                        borderRadius: 12,
                        border: formData.latitude ? '1px solid #10b981' : (permissionBlocked ? '1px solid #f59e0b' : '1px solid var(--border-color)')
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <MapPin size={18} color={permissionBlocked ? '#f59e0b' : 'var(--accent)'} />
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        Restaurant Location
                                    </div>
                                    {!formData.latitude && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            background: permissionBlocked ? '#fef3c7' : '#ef444420',
                                            color: permissionBlocked ? '#92400e' : '#ef4444',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontWeight: 600
                                        }}>
                                            {permissionBlocked ? 'Permission Blocked' : 'Required'}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: formData.latitude ? '#10b981' : (permissionBlocked ? '#92400e' : 'var(--text-muted)') }}>
                                    {formData.latitude ?
                                        `📍 Lat: ${Number(formData.latitude).toFixed(6)}, Lng: ${Number(formData.longitude).toFixed(6)}` :
                                        (permissionBlocked ? '⚠️ Location access is blocked. Click "Show Instructions" to enable.' : '📍 Required for accurate delivery routing')
                                    }
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={fetchLocation}
                                disabled={fetchingLocation}
                                className="btn"
                                style={{
                                    padding: '8px 16px',
                                    fontSize: '0.875rem',
                                    background: formData.latitude ? 'var(--bg-card)' : (permissionBlocked ? '#fef3c7' : 'var(--accent)'),
                                    color: formData.latitude ? 'var(--text-primary)' : (permissionBlocked ? '#92400e' : 'white'),
                                    border: formData.latitude ? '1px solid var(--border-color)' : (permissionBlocked ? '1px solid #f59e0b' : 'none'),
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontWeight: 600,
                                    minWidth: '160px',
                                    justifyContent: 'center'
                                }}
                            >
                                {fetchingLocation ? (
                                    <>
                                        <Loader2 size={16} className="spin" />
                                        Getting Location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin size={16} />
                                        {formData.latitude ? 'Update Location' : (permissionBlocked ? 'Show Instructions' : 'Allow Location Access')}
                                    </>
                                )}
                            </button>
                        </div>
                        {permissionBlocked && !showInstructions && (
                            <button
                                type="button"
                                onClick={() => setShowInstructions(true)}
                                style={{
                                    marginTop: 12,
                                    fontSize: '0.7rem',
                                    color: '#f59e0b',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                Need help? Click here for detailed instructions
                            </button>
                        )}
                    </div>

                    <PasswordInput
                        name="password"
                        label="Password (min 8 characters)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />

                    <PasswordInput
                        name="password_confirm"
                        label="Confirm Password"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        required
                        minLength={8}
                    />

                    {/* Documents Section */}
                    <GlassCard padding="var(--space-4)" style={{ marginBottom: 'var(--space-5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <FileText size={18} color="var(--brand-restaurant)" />
                            <strong style={{ fontSize: '0.9rem' }}>Verification Documents</strong>
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: 'auto' }}>
                                All files required
                            </span>
                        </div>
                        <FileField label="Business License" name="business_license" />
                        <FileField label="Food Safety Certificate" name="food_safety_certificate" />
                        <FileField label="Owner ID Proof" name="owner_id_proof" />
                        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                            Supported formats: Images (JPG, PNG) and PDF files (Max 5MB each)
                        </p>
                    </GlassCard>

                    <Button
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="large"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>
                )}

                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign In</Link>
                </p>
            </motion.div>
        </PremiumAuthLayout>
    );
};

export default RegisterPage;
