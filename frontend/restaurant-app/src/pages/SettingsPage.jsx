import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Clock, MapPin, IndianRupee, Image as ImageIcon, Plus, UploadCloud, X, FileText, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';

// ── Sub-components defined OUTSIDE to prevent remount on every keystroke ──

const Field = ({ label, name, type = 'text', formData, setFormData, ...props }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>{label}</label>
        <input
            className="input"
            type={type}
            value={formData[name] ?? ''}
            onChange={e => setFormData({ ...formData, [name]: e.target.value })}
            {...props}
        />
    </div>
);

const Toggle = ({ label, name, formData, setFormData }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <button
            onClick={() => setFormData({ ...formData, [name]: !formData[name] })}
            style={{ width: 48, height: 26, borderRadius: 13, background: formData[name] ? 'var(--accent)' : 'var(--bg-elevated)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}
        >
            <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: formData[name] ? 25 : 3, transition: 'all 0.3s' }} />
        </button>
    </div>
);

const ImageUpload = ({ label, preview, onSelect, onRemove, aspectRatio, height }) => (
    <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
        <label style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            width: '100%', ...(aspectRatio ? { aspectRatio } : { height: height || 200 }),
            borderRadius: 16, border: '2px dashed var(--border)',
            background: 'var(--bg-elevated)', cursor: 'pointer', overflow: 'hidden', position: 'relative',
            transition: 'border-color 0.2s',
        }}>
            {preview ? (
                <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
                <>
                    <UploadCloud size={28} color="var(--text-muted)" style={{ marginBottom: 8 }} />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click to upload</span>
                </>
            )}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                const file = e.target.files[0];
                if (file) onSelect(file);
            }} />
        </label>
        {preview && (
            <button type="button" onClick={onRemove}
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <X size={12} /> Remove
            </button>
        )}
    </div>
);

const DocumentUpload = ({ label, field, currentUrl, docFiles, setDocFiles }) => (
    <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
        <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
            <span style={{ color: docFiles[field] || currentUrl ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {docFiles[field]?.name || currentUrl?.split('/').pop() || 'Choose file'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                <UploadCloud size={16} /> Upload
            </span>
            <input
                type="file"
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => setDocFiles({ ...docFiles, [field]: e.target.files?.[0] || null })}
            />
        </label>
        {currentUrl && (
            <a href={currentUrl} target="_blank" rel="noreferrer"
                style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 500 }}>
                <ExternalLink size={14} /> View current document
            </a>
        )}
    </div>
);

// ── Main Component ──

const SettingsPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '', description: '', cuisine_type: '', address: '', city: '', state: '', pincode: '', phone: '',
        opening_time: '09:00', closing_time: '22:00',
        minimum_order_amount: '100', delivery_fee: '30', average_delivery_time: '30',
        is_open: true, is_featured: false, latitude: null, longitude: null
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState(null);
    const [docFiles, setDocFiles] = useState({ business_license: null, food_safety_certificate: null, owner_id_proof: null });
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '', description: '', cuisine_type: '', address: '', city: '', state: '', pincode: '', phone: '',
        opening_time: '09:00', closing_time: '22:00',
        minimum_order_amount: '100', delivery_fee: '30', average_delivery_time: '30', latitude: null, longitude: null
    });
    const [fetchingLocation, setFetchingLocation] = useState(false);

    useEffect(() => { fetchRestaurants(); }, []);

    const fetchRestaurants = async () => {
        try {
            const { data } = await restaurantsAPI.getMyRestaurants();
            const list = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
            setRestaurants(list);
            if (list.length > 0) {
                await loadRestaurantDetail(list[0].id);
            }
        } catch { } finally { setLoading(false); }
    };

    const fetchLocation = (isCreateForm) => {
        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (!pos || !pos.coords) {
                    setFetchingLocation(false);
                    toast.error('Failed to get location coordinates.');
                    return;
                }
                const updates = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                if (isCreateForm) setCreateForm(prev => ({ ...prev, ...updates }));
                else setForm(prev => ({ ...prev, ...updates }));
                setFetchingLocation(false);
                toast.success('Location captured successfully!');
            },
            () => {
                setFetchingLocation(false);
                toast.error('Failed to get location. Provide permissions.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const loadRestaurantDetail = async (id) => {
        try {
            const { data } = await restaurantsAPI.getRestaurant(id);
            setSelected(data);
            populateForm(data);
        } catch {
            toast.error('Failed to load restaurant details');
        }
    };

    const populateForm = (r) => {
        setForm({
            name: r.name || '', description: r.description || '', cuisine_type: r.cuisine_type || '',
            address: r.address || '', city: r.city || '', state: r.state || '', pincode: r.pincode || '', phone: r.phone || '',
            opening_time: r.opening_time || '09:00', closing_time: r.closing_time || '22:00',
            minimum_order_amount: r.minimum_order_amount || '100', delivery_fee: r.delivery_fee || '30',
            average_delivery_time: r.average_delivery_time || '30',
            is_open: r.is_open ?? true, is_featured: r.is_featured ?? false,
            latitude: r.latitude || null, longitude: r.longitude || null
        });
        setLogoPreview(r.logo || null);
        setCoverPreview(r.cover_image || null);
        setLogoFile(null);
        setCoverFile(null);
        setDocFiles({ business_license: null, food_safety_certificate: null, owner_id_proof: null });
    };

    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([key, val]) => {
                if (val !== null && val !== undefined && val !== '') fd.append(key, val);
            });
            if (logoFile) fd.append('logo', logoFile);
            if (coverFile) fd.append('cover_image', coverFile);
            Object.entries(docFiles).forEach(([key, file]) => {
                if (file) fd.append(key, file);
            });
            await restaurantsAPI.updateRestaurant(selected.id, fd);
            toast.success('Settings saved successfully!');
            fetchRestaurants();
        } catch (err) { toast.error(err.response?.data?.detail || 'Failed to save settings'); }
        finally { setSaving(false); }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...createForm, slug: createForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
            await restaurantsAPI.createRestaurant(payload);
            toast.success('Restaurant created!');
            setShowCreate(false);
            setCreateForm({
                name: '', description: '', cuisine_type: '', address: '', city: '', state: '', pincode: '', phone: '',
                opening_time: '09:00', closing_time: '22:00',
                minimum_order_amount: '100', delivery_fee: '30', average_delivery_time: '30', latitude: null, longitude: null
            });
            fetchRestaurants();
        } catch (err) { toast.error(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to create'); }
        finally { setSaving(false); }
    };

    const handleImageSelect = (file, setFile, setPreview) => {
        if (file) {
            setFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading) return (
        <div>
            <div className="page-header"><h1 className="page-title">Settings</h1></div>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12 }} />)}
        </div>
    );

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <button onClick={() => setShowCreate(true)} className="btn btn-primary"><Plus size={18} /> New Restaurant</button>
            </div>

            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ fontWeight: 700, marginBottom: 20 }}>Create New Restaurant</h2>
                        <form onSubmit={handleCreate}>
                            <Field label="Restaurant Name" name="name" formData={createForm} setFormData={setCreateForm} required />
                            <Field label="Description" name="description" formData={createForm} setFormData={setCreateForm} />
                            <Field label="Cuisine Type" name="cuisine_type" formData={createForm} setFormData={setCreateForm} placeholder="e.g. Indian, Chinese, Italian" />
                            <Field label="Full Address" name="address" formData={createForm} setFormData={setCreateForm} required />
                            <div className="responsive-grid responsive-grid-3">
                                <Field label="City" name="city" formData={createForm} setFormData={setCreateForm} required />
                                <Field label="State" name="state" formData={createForm} setFormData={setCreateForm} required />
                                <Field label="Pincode" name="pincode" formData={createForm} setFormData={setCreateForm} required />
                            </div>
                            <Field label="Phone" name="phone" formData={createForm} setFormData={setCreateForm} />

                            <div style={{ marginTop: 12, marginBottom: 12, padding: 12, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>GPS Coordinates</div>
                                    <div style={{ fontSize: '0.75rem', color: createForm.latitude ? 'var(--accent)' : 'var(--text-muted)' }}>
                                        {createForm.latitude ? `Lat: ${Number(createForm.latitude).toFixed(4)}, Lng: ${Number(createForm.longitude).toFixed(4)}` : 'Required for delivery routing'}
                                    </div>
                                </div>
                                <button type="button" onClick={() => fetchLocation(true)} disabled={fetchingLocation} className="btn" style={{ padding: '8px 12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {fetchingLocation ? <Loader2 size={16} className="spin" /> : <MapPin size={16} color="var(--accent)" />}
                                    {createForm.latitude ? 'Update' : 'Fetch'}
                                </button>
                            </div>

                            <div className="responsive-grid responsive-grid-2">
                                <Field label="Opening Time" name="opening_time" type="time" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Closing Time" name="closing_time" type="time" formData={createForm} setFormData={setCreateForm} />
                            </div>
                            <div className="responsive-grid responsive-grid-3">
                                <Field label="Min Order (₹)" name="minimum_order_amount" type="number" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Delivery Fee (₹)" name="delivery_fee" type="number" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Delivery Time (min)" name="average_delivery_time" type="number" formData={createForm} setFormData={setCreateForm} />
                            </div>
                            <div className="responsive-actions" style={{ marginTop: 20 }}>
                                <button type="button" onClick={() => setShowCreate(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Creating...' : 'Create Restaurant'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {restaurants.length === 0 && !showCreate ? (
                <div className="card">
                    <div className="empty-state">
                        <Store />
                        <h3>No Restaurant Yet</h3>
                        <p>Create your first restaurant to get started</p>
                        <button onClick={() => setShowCreate(true)} className="btn btn-primary">Create Now</button>
                    </div>
                </div>
            ) : selected && (
                <>
                    {restaurants.length > 1 && (
                        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                            {restaurants.map(r => (
                                <button key={r.id} onClick={() => loadRestaurantDetail(r.id)}
                                    className={`btn btn-sm ${selected.id === r.id ? 'btn-primary' : 'btn-secondary'}`}>{r.name}</button>
                            ))}
                        </div>
                    )}

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}><ShieldCheck size={18} /> Restaurant Status</h3>
                        <div className="chip-row">
                            <span className={`badge ${selected.approval_status === 'approved' ? 'badge-success' : selected.approval_status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                {selected.approval_status || 'pending'}
                            </span>
                            <span className={`badge ${selected.is_active ? 'badge-success' : 'badge-danger'}`}>
                                {selected.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <p style={{ marginTop: 12, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Restaurant ID: <strong>{selected.id}</strong>
                        </p>
                        <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Owner: <strong>{selected.owner_name || 'N/A'}</strong>
                        </p>
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Store size={18} /> Basic Information</h3>
                        <Field label="Restaurant Name" name="name" formData={form} setFormData={setForm} />
                        <Field label="Description" name="description" formData={form} setFormData={setForm} />
                        <Field label="Cuisine Type" name="cuisine_type" formData={form} setFormData={setForm} />
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><ImageIcon size={18} /> Restaurant Images</h3>
                        <div className="responsive-grid settings-image-grid">
                            <ImageUpload
                                label="Logo"
                                preview={logoPreview}
                                aspectRatio="1"
                                onSelect={(file) => handleImageSelect(file, setLogoFile, setLogoPreview)}
                                onRemove={() => { setLogoFile(null); setLogoPreview(null); }}
                            />
                            <ImageUpload
                                label="Cover Image"
                                preview={coverPreview}
                                height={200}
                                onSelect={(file) => handleImageSelect(file, setCoverFile, setCoverPreview)}
                                onRemove={() => { setCoverFile(null); setCoverPreview(null); }}
                            />
                        </div>
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} /> Verification Documents</h3>
                        <DocumentUpload label="Business License" field="business_license" currentUrl={selected.business_license} docFiles={docFiles} setDocFiles={setDocFiles} />
                        <DocumentUpload label="Food Safety Certificate" field="food_safety_certificate" currentUrl={selected.food_safety_certificate} docFiles={docFiles} setDocFiles={setDocFiles} />
                        <DocumentUpload label="Owner ID Proof" field="owner_id_proof" currentUrl={selected.owner_id_proof} docFiles={docFiles} setDocFiles={setDocFiles} />
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Location & Contact</h3>
                        <Field label="Full Address" name="address" formData={form} setFormData={setForm} />
                        <div className="responsive-grid responsive-grid-3">
                            <Field label="City" name="city" formData={form} setFormData={setForm} />
                            <Field label="State" name="state" formData={form} setFormData={setForm} />
                            <Field label="Pincode" name="pincode" formData={form} setFormData={setForm} />
                        </div>
                        <Field label="Phone" name="phone" formData={form} setFormData={setForm} />

                        <div style={{ marginTop: 12, marginBottom: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>GPS Coordinates</div>
                                <div style={{ fontSize: '0.75rem', color: form.latitude ? 'var(--accent)' : 'var(--text-muted)' }}>
                                    {form.latitude ? `Lat: ${Number(form.latitude).toFixed(4)}, Lng: ${Number(form.longitude).toFixed(4)}` : 'Required for delivery routing'}
                                </div>
                            </div>
                            <button type="button" onClick={() => fetchLocation(false)} disabled={fetchingLocation} className="btn" style={{ padding: '8px 12px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                {fetchingLocation ? <Loader2 size={16} className="spin" /> : <MapPin size={16} color="var(--accent)" />}
                                {form.latitude ? 'Update' : 'Fetch'}
                            </button>
                        </div>
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={18} /> Operating Hours</h3>
                        <div className="responsive-grid responsive-grid-2">
                            <Field label="Opening Time" name="opening_time" type="time" formData={form} setFormData={setForm} />
                            <Field label="Closing Time" name="closing_time" type="time" formData={form} setFormData={setForm} />
                        </div>
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 16 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><IndianRupee size={18} /> Delivery & Pricing</h3>
                        <div className="responsive-grid responsive-grid-3">
                            <Field label="Min Order (₹)" name="minimum_order_amount" type="number" formData={form} setFormData={setForm} />
                            <Field label="Delivery Fee (₹)" name="delivery_fee" type="number" formData={form} setFormData={setForm} />
                            <Field label="Avg Delivery (min)" name="average_delivery_time" type="number" formData={form} setFormData={setForm} />
                        </div>
                    </motion.div>

                    <motion.div className="card" style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Status</h3>
                        <Toggle label="Currently Open" name="is_open" formData={form} setFormData={setForm} />
                        <Toggle label="Featured Restaurant" name="is_featured" formData={form} setFormData={setForm} />
                    </motion.div>

                    <button onClick={handleSave} className="btn btn-primary btn-lg" disabled={saving} style={{ width: '100%' }}>
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </>
            )}
        </div>
    );
};

export default SettingsPage;
