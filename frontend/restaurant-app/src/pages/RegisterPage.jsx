import { useState } from 'react';
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
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        restaurant_name: '',
        description: '',
        cuisine_type: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        restaurant_phone: '',
        latitude: null,
        longitude: null
    });

    const [docs, setDocs] = useState({
        business_license: null,
        food_safety_certificate: null,
        owner_id_proof: null,
    });

    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const fetchLocation = () => {
        setFetchingLocation(true);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));

                setFetchingLocation(false);
                toast.success('Location captured successfully!');
            },
            () => {
                setFetchingLocation(false);
                toast.error('Failed to get location. Allow location permission.');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000
            }
        );
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirm) {
            toast.error('Passwords do not match.');
            return;
        }

        if (!formData.phone_number.startsWith('+')) {
            toast.error('Use phone format like +919876543210');
            return;
        }

        if (!formData.latitude || !formData.longitude) {
            toast.error('Please fetch restaurant location.');
            return;
        }

        setLoading(true);

        try {
            // STEP 1 - Create user account
            await register({
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                password_confirm: formData.password_confirm,
                role: 'restaurant'
            });

            // STEP 2 - Create restaurant profile
            const restaurantData = new FormData();

            restaurantData.append('name', formData.restaurant_name);
            restaurantData.append('description', formData.description);
            restaurantData.append('cuisine_type', formData.cuisine_type);
            restaurantData.append('address', formData.address);
            restaurantData.append('city', formData.city);
            restaurantData.append('state', formData.state);
            restaurantData.append('pincode', formData.pincode);
            restaurantData.append(
                'phone',
                formData.restaurant_phone || formData.phone_number
            );

            restaurantData.append(
                'slug',
                formData.restaurant_name
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '')
            );

            restaurantData.append('latitude', formData.latitude);
            restaurantData.append('longitude', formData.longitude);

            if (docs.business_license) {
                restaurantData.append(
                    'business_license',
                    docs.business_license
                );
            }

            if (docs.food_safety_certificate) {
                restaurantData.append(
                    'food_safety_certificate',
                    docs.food_safety_certificate
                );
            }

            if (docs.owner_id_proof) {
                restaurantData.append(
                    'owner_id_proof',
                    docs.owner_id_proof
                );
            }

            await restaurantsAPI.createRestaurant(restaurantData);

            toast.success('Restaurant account created!');
            navigate('/', { replace: true });

        } catch (err) {
            console.log('REGISTER ERROR:', err.response?.data);

            const apiError =
                err.response?.data?.email?.[0] ||
                err.response?.data?.phone_number?.[0] ||
                err.response?.data?.role?.[0] ||
                err.response?.data?.detail ||
                'Registration failed.';

            toast.error(apiError);
        } finally {
            setLoading(false);
        }
    };

    const FileField = ({ label, name }) => (
        <div style={{ marginBottom: 12 }}>
            <label
                style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginBottom: 6,
                    fontWeight: 700
                }}
            >
                {label}
            </label>

            <label
                className="input"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer'
                }}
            >
                <span
                    style={{
                        color: docs[name]
                            ? 'var(--text-primary)'
                            : 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}
                >
                    {docs[name]?.name || 'Choose file'}
                </span>

                <span
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--accent)'
                    }}
                >
                    <Upload size={16} />
                    Upload
                </span>

                <input
                    type="file"
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) =>
                        setDocs({
                            ...docs,
                            [name]: e.target.files?.[0] || null
                        })
                    }
                />
            </label>
        </div>
    );

    return (
        <div className="auth-shell">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="auth-card"
                style={{ maxWidth: 560 }}
            >
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            margin: '0 auto 16px',
                            background: 'var(--gradient-primary)',
                            borderRadius: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            fontWeight: 800,
                            color: 'white',
                            boxShadow: 'var(--shadow-accent)'
                        }}
                    >
                        Chef
                    </div>

                    <h1
                        style={{
                            fontSize: '1.5rem',
                            fontWeight: 800,
                            marginBottom: 4
                        }}
                    >
                        Create Restaurant Account
                    </h1>

                    <p
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem'
                        }}
                    >
                        Register your restaurant and upload verification documents
                    </p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="auth-split-row">
                        <input
                            className="input"
                            name="first_name"
                            placeholder="First Name"
                            value={formData.first_name}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="input"
                            name="last_name"
                            placeholder="Last Name"
                            value={formData.last_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        className="input"
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ marginBottom: 12 }}
                    />

                    <input
                        className="input"
                        type="tel"
                        name="phone_number"
                        placeholder="+919876543210"
                        value={formData.phone_number}
                        onChange={handleChange}
                        required
                        style={{ marginBottom: 12 }}
                    />

                    <input
                        className="input"
                        name="restaurant_name"
                        placeholder="Restaurant Name"
                        value={formData.restaurant_name}
                        onChange={handleChange}
                        required
                        style={{ marginBottom: 12 }}
                    />

                    <input
                        className="input"
                        name="description"
                        placeholder="Restaurant Description"
                        value={formData.description}
                        onChange={handleChange}
                        style={{ marginBottom: 12 }}
                    />

                    <input
                        className="input"
                        name="cuisine_type"
                        placeholder="Cuisine Type"
                        value={formData.cuisine_type}
                        onChange={handleChange}
                        style={{ marginBottom: 12 }}
                    />

                    <input
                        className="input"
                        name="address"
                        placeholder="Full Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        style={{ marginBottom: 12 }}
                    />

                    <div className="auth-split-row">
                        <input
                            className="input"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="input"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div
                        className="auth-split-row"
                        style={{ marginTop: 12 }}
                    >
                        <input
                            className="input"
                            name="pincode"
                            placeholder="Pincode"
                            value={formData.pincode}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="input"
                            name="restaurant_phone"
                            placeholder="Restaurant Phone"
                            value={formData.restaurant_phone}
                            onChange={handleChange}
                        />
                    </div>

                    <div
                        style={{
                            marginTop: 12,
                            marginBottom: 12,
                            padding: 12,
                            background: 'var(--bg-alt)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div
                                style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    color: 'var(--text-primary)'
                                }}
                            >
                                GPS Coordinates
                            </div>

                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    color: formData.latitude
                                        ? 'var(--accent)'
                                        : 'var(--text-muted)'
                                }}
                            >
                                {formData.latitude
                                    ? `Lat: ${Number(formData.latitude).toFixed(4)}, Lng: ${Number(formData.longitude).toFixed(4)}`
                                    : 'Required for delivery routing'}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={fetchLocation}
                            disabled={fetchingLocation}
                            className="btn"
                            style={{
                                padding: '8px 12px',
                                fontSize: '0.875rem',
                                background: 'var(--bg-card)',
                                color: 'var(--text-primary)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                            }}
                        >
                            {fetchingLocation ? (
                                <Loader2 size={16} className="spin" />
                            ) : (
                                <MapPin size={16} color="var(--accent)" />
                            )}

                            {formData.latitude ? 'Update' : 'Fetch'}
                        </button>
                    </div>

                    <input
                        className="input"
                        type="password"
                        name="password"
                        placeholder="Password (min 8 chars)"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{
                            marginTop: 12,
                            marginBottom: 12
                        }}
                    />

                    <input
                        className="input"
                        type="password"
                        name="password_confirm"
                        placeholder="Confirm Password"
                        value={formData.password_confirm}
                        onChange={handleChange}
                        required
                        minLength={8}
                        style={{ marginBottom: 16 }}
                    />

                    <div
                        className="card"
                        style={{
                            padding: 16,
                            marginBottom: 20
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 12
                            }}
                        >
                            <FileText
                                size={18}
                                color="var(--accent)"
                            />
                            <strong>Verification Documents</strong>
                        </div>

                        <FileField
                            label="Business License"
                            name="business_license"
                        />

                        <FileField
                            label="Food Safety Certificate"
                            name="food_safety_certificate"
                        />

                        <FileField
                            label="Owner ID Proof"
                            name="owner_id_proof"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: 14,
                            fontSize: '1rem'
                        }}
                    >
                        {loading
                            ? 'Creating Account...'
                            : 'Create Account'}{' '}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p
                    style={{
                        textAlign: 'center',
                        marginTop: 20,
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}
                >
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        style={{
                            color: 'var(--accent)',
                            fontWeight: 700
                        }}
                    >
                        Sign In
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
