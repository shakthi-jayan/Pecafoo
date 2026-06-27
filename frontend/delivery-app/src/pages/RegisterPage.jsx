import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../App';
import { deliveryAPI } from '../services/api';

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
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 700 }}>{label}</label>
            <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                <span style={{ color: docs[name] ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {docs[name]?.name || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-default)', padding: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: 520, padding: 32, borderRadius: 24, boxShadow: 'var(--shadow-elevation)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 16px', background: 'var(--gradient-primary)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: 'white', boxShadow: 'var(--shadow-accent)' }}>GO</div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>Join as Partner</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Create your account and upload your verification documents</p>
                </div>
                <form onSubmit={handle}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <input className="input" name="first_name" placeholder="First Name" value={fd.first_name} onChange={ch} required />
                        <input className="input" name="last_name" placeholder="Last Name" value={fd.last_name} onChange={ch} required />
                    </div>
                    <input className="input" type="email" name="email" placeholder="Email Address" value={fd.email} onChange={ch} required style={{ marginBottom: 12 }} />
                    <input className="input" type="tel" name="phone_number" placeholder="Mobile Number (e.g., 9876543210)" value={fd.phone_number} onChange={handlePhoneChange} style={{ marginBottom: 12 }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                        <select className="input" name="vehicle_type" value={fd.vehicle_type} onChange={ch}>
                            <option value="bicycle">Bicycle</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="scooter">Scooter</option>
                            <option value="car">Car</option>
                        </select>
                        <input className="input" name="vehicle_number" placeholder="Vehicle Number" value={fd.vehicle_number} onChange={ch} />
                    </div>
                    <input className="input" name="license_number" placeholder="License Number" value={fd.license_number} onChange={ch} style={{ marginBottom: 12 }} />
                    <input className="input" type="password" name="password" placeholder="Password (min 8 chars)" value={fd.password} onChange={ch} required minLength={8} style={{ marginBottom: 12 }} />
                    <input className="input" type="password" name="password_confirm" placeholder="Confirm Password" value={fd.password_confirm} onChange={ch} required minLength={8} style={{ marginBottom: 16 }} />

                    <div className="card" style={{ padding: 16, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <FileText size={18} color="var(--accent)" />
                            <strong>Verification Documents</strong>
                        </div>
                        <FileField label="ID Proof" name="id_proof" />
                        <FileField label="Driving License / Vehicle Permit" name="license_image" />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ justifyContent: 'center', height: 50, borderRadius: 16 }}>
                        {loading ? 'Creating...' : 'Create Account'} <ArrowRight size={18} />
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 800 }}>Sign In</Link>
                </p>
            </motion.div>
        </div>
    );
}
