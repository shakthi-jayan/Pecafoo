import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../App';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';

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

    // Check if API base URL is configured
    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
        console.log('API URL:', apiUrl);
        if (!apiUrl) {
            toast.error('API configuration missing. Please check your environment variables.');
        }
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const requestLocationPermission = async () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.', { duration: 5000 });
            return false;
        }

        try {
            if (navigator.permissions && navigator.permissions.query) {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
                if (permissionStatus.state === 'denied') {
                    toast.error(
                        'Location permission is blocked. Please enable it in your browser settings.',
                        { duration: 7000 }
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
            toast.success('Location captured successfully!', { duration: 3000 });
            return true;
            
        } catch (err) {
            switch(err.code) {
                case 1:
                    toast.error('Please allow location access when prompted by your browser.', { duration: 6000 });
                    break;
                case 2:
                    toast.error('Location unavailable. Please check your GPS.', { duration: 5000 });
                    break;
                case 3:
                    toast.error('Location request timed out. Please try again.', { duration: 5000 });
                    break;
                default:
                    toast.error('Failed to get location. Please try again.', { duration: 5000 });
                    break;
            }
            return false;
        }
    };

    const fetchLocation = async () => {
        setFetchingLocation(true);
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
            toast.error('Please allow location access and fetch GPS coordinates.', {
                duration: 5000,
                icon: '📍'
            });
            return;
        }

        // Validate required documents
        if (!docs.business_license || !docs.food_safety_certificate || !docs.owner_id_proof) {
            toast.error('Please upload all required verification documents.', {
                duration: 5000
            });
            return;
        }
        
        setLoading(true);
        try {
            // Register user first
            const userData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                password_confirm: formData.password_confirm,
            };
            
            console.log('Registering user:', userData.email);
            await register(userData);

            // Create restaurant
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

            console.log('Creating restaurant...');
            await restaurantsAPI.createRestaurant(restaurantData);

            toast.success('Account created successfully!');
            navigate('/', { replace: true });
        } catch (err) {
            console.error('Registration error:', err);
            if (err.response?.status === 404) {
                toast.error('API server not found. Please check if backend is running on port 8000');
            } else if (err.response?.status === 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error(err.response?.data?.email?.[0] || err.response?.data?.detail || err.message || 'Registration failed.');
            }
        } finally {
            setLoading(false);
        }
    };

    const FileField = ({ label, name, required = true }) => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 700 }}>
                {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                <span style={{ color: docs[name] ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {docs[name]?.name || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                    <Upload size={16} /> Upload
                </span>
                <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    style={{ display: 'none' }} 
                    required={required}
                    onChange={(e) => setDocs({ ...docs, [name]: e.target.files?.[0] || null })} 
                />
            </label>
        </div>
    );

    return (
        <div className="auth-shell">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="auth-card" style={{ maxWidth: 560 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)' }}>Chef</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Create Restaurant Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Register your restaurant and upload verification documents</p>
                </div>
                
                <form onSubmit={handleRegister}>
                    <div className="auth-split-row">
                        <input 
                            className="input" 
                            name="first_name" 
                            placeholder="First Name *" 
                            value={formData.first_name} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            className="input" 
                            name="last_name" 
                            placeholder="Last Name *" 
                            value={formData.last_name} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <input 
                        className="input" 
                        type="email" 
                        name="email" 
                        placeholder="Email *" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <input 
                        className="input" 
                        type="tel" 
                        name="phone_number" 
                        placeholder="Owner Phone *" 
                        value={formData.phone_number} 
                        onChange={handleChange} 
                        required 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <input 
                        className="input" 
                        name="restaurant_name" 
                        placeholder="Restaurant Name *" 
                        value={formData.restaurant_name} 
                        onChange={handleChange} 
                        required 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <textarea 
                        className="input" 
                        name="description" 
                        placeholder="Restaurant Description" 
                        value={formData.description} 
                        onChange={handleChange} 
                        rows="3"
                        style={{ marginBottom: 12, resize: 'vertical' }} 
                    />
                    
                    <input 
                        className="input" 
                        name="cuisine_type" 
                        placeholder="Cuisine Type * (e.g., Italian, Chinese, Indian)" 
                        value={formData.cuisine_type} 
                        onChange={handleChange} 
                        required 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <input 
                        className="input" 
                        name="address" 
                        placeholder="Full Address *" 
                        value={formData.address} 
                        onChange={handleChange} 
                        required 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <div className="auth-split-row">
                        <input 
                            className="input" 
                            name="city" 
                            placeholder="City *" 
                            value={formData.city} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            className="input" 
                            name="state" 
                            placeholder="State *" 
                            value={formData.state} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    <div className="auth-split-row" style={{ marginTop: 12 }}>
                        <input 
                            className="input" 
                            name="pincode" 
                            placeholder="Pincode *" 
                            value={formData.pincode} 
                            onChange={handleChange} 
                            required 
                        />
                        <input 
                            className="input" 
                            name="restaurant_phone" 
                            placeholder="Restaurant Phone (Optional)" 
                            value={formData.restaurant_phone} 
                            onChange={handleChange} 
                        />
                    </div>
                    
                    {/* Location Section */}
                    <div style={{ 
                        marginTop: 16, 
                        marginBottom: 16, 
                        padding: 16, 
                        background: 'var(--bg-alt)', 
                        borderRadius: 12, 
                        border: formData.latitude ? '1px solid #10b981' : '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <MapPin size={18} color="var(--accent)" />
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        Restaurant Location
                                    </div>
                                    {!formData.latitude && (
                                        <span style={{ 
                                            fontSize: '0.7rem', 
                                            background: '#ef444420', 
                                            color: '#ef4444',
                                            padding: '2px 6px',
                                            borderRadius: 4,
                                            fontWeight: 600
                                        }}>
                                            Required
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: formData.latitude ? '#10b981' : 'var(--text-muted)' }}>
                                    {formData.latitude ? 
                                        `📍 Lat: ${Number(formData.latitude).toFixed(6)}, Lng: ${Number(formData.longitude).toFixed(6)}` : 
                                        '📍 Required for accurate delivery routing'
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
                                    background: formData.latitude ? 'var(--bg-card)' : 'var(--accent)',
                                    color: formData.latitude ? 'var(--text-primary)' : 'white',
                                    border: formData.latitude ? '1px solid var(--border-color)' : 'none',
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
                                        {formData.latitude ? 'Update Location' : 'Allow Location Access'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <input 
                        className="input" 
                        type="password" 
                        name="password" 
                        placeholder="Password * (min 8 characters)" 
                        value={formData.password} 
                        onChange={handleChange} 
                        required 
                        minLength={8} 
                        style={{ marginBottom: 12 }} 
                    />
                    
                    <input 
                        className="input" 
                        type="password" 
                        name="password_confirm" 
                        placeholder="Confirm Password *" 
                        value={formData.password_confirm} 
                        onChange={handleChange} 
                        required 
                        minLength={8} 
                        style={{ marginBottom: 20 }} 
                    />

                    {/* Documents Section */}
                    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <FileText size={18} color="var(--accent)" />
                            <strong style={{ fontSize: '0.9rem' }}>Verification Documents</strong>
                            <span style={{ fontSize: '0.7rem', color: '#ef4444', marginLeft: 'auto' }}>
                                All files required
                            </span>
                        </div>
                        <FileField label="Business License" name="business_license" required={true} />
                        <FileField label="Food Safety Certificate" name="food_safety_certificate" required={true} />
                        <FileField label="Owner ID Proof" name="owner_id_proof" required={true} />
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                            Supported formats: Images (JPG, PNG) and PDF files (Max 5MB each)
                        </p>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={loading} 
                        style={{ 
                            width: '100%', 
                            padding: 14, 
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="spin" />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                Create Account
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>
                
                <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
