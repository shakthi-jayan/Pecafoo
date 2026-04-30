import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Shield, Save, Camera, FileText, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicle_type: '', vehicle_number: '', license_number: '' });
    const [files, setFiles] = useState({ id_proof: null, license_image: null });

    const loadProfile = async () => {
        setLoading(true);
        try {
            const { data } = await deliveryAPI.getProfile();
            setProfile(data);
            setForm({ vehicle_type: data.vehicle_type || '', vehicle_number: data.vehicle_number || '', license_number: data.license_number || '' });
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('vehicle_type', form.vehicle_type);
            fd.append('vehicle_number', form.vehicle_number);
            fd.append('license_number', form.license_number);
            if (files.id_proof) fd.append('id_proof', files.id_proof);
            if (files.license_image) fd.append('license_image', files.license_image);
            await deliveryAPI.updateProfile(fd);
            await loadProfile();
            setFiles({ id_proof: null, license_image: null });
            toast.success('Profile updated');
        } catch {
            toast.error('Failed to update');
        } finally {
            setSaving(false);
        }
    };

    const DocField = ({ label, name, currentUrl }) => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 700 }}>{label}</label>
            <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                <span style={{ color: files[name] || currentUrl ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {files[name]?.name || currentUrl?.split('/').pop() || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                    <Upload size={16} /> Upload
                </span>
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setFiles({ ...files, [name]: e.target.files?.[0] || null })} />
            </label>
            {currentUrl && (
                <a href={currentUrl} target="_blank" rel="noreferrer" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <ExternalLink size={14} /> View current document
                </a>
            )}
        </div>
    );

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><ArrowLeft size={22} /></button>
                <h1 className="page-title">Profile</h1>
            </div>

            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--gradient-primary)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white', position: 'relative' }}>
                    {user?.first_name?.[0]?.toUpperCase() || '?'}
                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, background: 'var(--bg-card)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Camera size={12} color="var(--text-muted)" />
                    </div>
                </div>
                <h2 style={{ fontWeight: 700, marginBottom: 2 }}>{user?.first_name} {user?.last_name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>{user?.email}</p>
                <span className="badge badge-accent">Delivery Partner</span>
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Truck size={18} /> Vehicle Information</h3>
                {loading ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 12 }} />) : (
                    <>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Type</label>
                            <select className="input" value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })}>
                                <option value="">Select type</option>
                                <option value="bicycle">Bicycle</option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="scooter">Scooter</option>
                                <option value="car">Car</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Number</label>
                            <input className="input" value={form.vehicle_number} onChange={e => setForm({ ...form, vehicle_number: e.target.value })} placeholder="e.g. MH 01 AB 1234" />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>License Number</label>
                            <input className="input" value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} placeholder="e.g. DLXXXXXXXXXXXXXXXX" />
                        </div>
                    </>
                )}
            </motion.div>

            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ marginBottom: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} /> Uploaded Documents</h3>
                <DocField label="ID Proof" name="id_proof" currentUrl={profile?.id_proof} />
                <DocField label="Driving License / Vehicle Permit" name="license_image" currentUrl={profile?.license_image} />
                <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Verification status: <strong style={{ color: profile?.is_verified ? 'var(--success)' : 'var(--warning)' }}>{profile?.is_verified ? 'Verified' : 'Pending review'}</strong>
                </div>
            </motion.div>

            {profile && (
                <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 16 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Performance</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'var(--bg-elevated)' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>{profile.total_deliveries || 0}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deliveries</p>
                        </div>
                        <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'var(--bg-elevated)' }}>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{profile.average_rating || '-'}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rating</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <button onClick={handleSave} className="btn btn-primary btn-full btn-lg" disabled={saving} style={{ marginBottom: 12 }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </button>

            <button onClick={onLogout} className="btn btn-full" style={{ background: 'var(--danger-bg, rgba(239,68,68,0.1))', color: 'var(--danger, #ef4444)', padding: 14, borderRadius: 12, fontWeight: 600 }}>
                Sign Out
            </button>
        </div>
    );
};

export default ProfilePage;
