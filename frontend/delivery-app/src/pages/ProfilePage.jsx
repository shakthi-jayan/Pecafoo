import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Truck, Shield, Save, Camera, FileText, Upload, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deliveryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ProfileHero, GlassCard, Button, FloatingInput } from '../shared-ui/PremiumUI';

const ProfilePage = ({ user, onLogout }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ vehicle_type: '', vehicle_number: '', license_number: '' });
    const [files, setFiles] = useState({ id_proof: null, license_image: null });

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
            <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 700 }}>{label}</label>
            <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', background: 'var(--color-bg-base)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px' }}>
                <span style={{ color: files[name] || currentUrl ? 'var(--color-text-primary)' : 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {files[name]?.name || currentUrl?.split('/').pop() || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--brand-delivery)' }}>
                    <Upload size={16} /> Upload
                </span>
                <input
                    type="file"
                    name={name}
                    accept="image/*,.pdf"
                    style={visuallyHidden}
                    onChange={(e) => setFiles({ ...files, [name]: e.target.files?.[0] || null })}
                />
            </label>
            {currentUrl && (
                <a href={currentUrl} target="_blank" rel="noreferrer" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--brand-delivery)', fontSize: 'var(--text-caption)', fontWeight: 700 }}>
                    <ExternalLink size={14} /> View current document
                </a>
            )}
        </div>
    );

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <button className="btn btn-secondary btn-sm profile-back-button" onClick={() => navigate(-1)}><ArrowLeft size={17} /> Back</button>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <ProfileHero initials={user?.first_name?.[0]?.toUpperCase() || '?'} name={`${user?.first_name || ''} ${user?.last_name || ''}`.trim()} subtitle={`${user?.email || ''}${user?.phone_number ? ` · ${user.phone_number}` : ''}`} badge="Delivery Partner">
                    <span className={`profile-verification ${profile?.is_verified ? 'is-verified' : ''}`}><Shield size={16} />{profile?.is_verified ? 'Verified' : 'Review pending'}</span>
                </ProfileHero>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 16 }}>
                <GlassCard padding="var(--space-5)">
                    <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}><Truck size={18} /> Vehicle Information</h3>
                    {loading ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44, marginBottom: 12 }} />) : (
                        <>
                            <div style={{ marginBottom: 'var(--space-3)' }}>
                                <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 700 }}>Vehicle Type</label>
                                <select className="input" value={form.vehicle_type} onChange={e => setForm({ ...form, vehicle_type: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
                                    <option value="">Select type</option>
                                    <option value="bicycle">Bicycle</option>
                                    <option value="motorcycle">Motorcycle</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                            <FloatingInput
                                label="Vehicle Number"
                                value={form.vehicle_number}
                                onChange={e => setForm({ ...form, vehicle_number: e.target.value })}
                                placeholder="e.g. MH 01 AB 1234"
                            />
                            <div style={{ height: 'var(--space-3)' }} />
                            <FloatingInput
                                label="License Number"
                                value={form.license_number}
                                onChange={e => setForm({ ...form, license_number: e.target.value })}
                                placeholder="e.g. DLXXXXXXXXXXXXXXXX"
                            />
                        </>
                    )}
                </GlassCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={{ marginBottom: 16 }}>
                <GlassCard padding="var(--space-5)">
                    <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}><FileText size={18} /> Uploaded Documents</h3>
                    <DocField label="ID Proof" name="id_proof" currentUrl={profile?.id_proof} />
                    <DocField label="Driving License / Vehicle Permit" name="license_image" currentUrl={profile?.license_image} />
                    <div style={{ marginTop: 8, fontSize: '0.82rem', color: 'var(--color-text-secondary)' }}>
                        Verification status: <strong style={{ color: profile?.is_verified ? 'var(--color-success)' : 'var(--color-warning)' }}>{profile?.is_verified ? 'Verified' : 'Pending review'}</strong>
                    </div>
                </GlassCard>
            </motion.div>

            {profile && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 16 }}>
                    <GlassCard padding="var(--space-5)">
                        <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}><Shield size={18} /> Performance</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'var(--color-bg-elevated)' }}>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-delivery)' }}>{profile.total_deliveries || 0}</p>
                                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>Deliveries</p>
                            </div>
                            <div style={{ textAlign: 'center', padding: 12, borderRadius: 12, background: 'var(--color-bg-elevated)' }}>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{profile.average_rating || '-'}</p>
                                <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>Rating</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            )}

            <Button onClick={handleSave} variant="primary" size="large" disabled={saving} style={{ width: '100%', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Save size={18} /> {saving ? 'Saving...' : 'Save Profile'}
            </Button>

            <Button onClick={onLogout} variant="ghost" size="large" style={{ width: '100%', color: 'var(--color-danger)' }}>
                Sign Out
            </Button>
        </div>
    );
};

export default ProfilePage;
