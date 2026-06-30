

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Store, Clock, MapPin, IndianRupee, Image as ImageIcon, Plus, UploadCloud, X, FileText, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PageContainer, PageHero, GlassCard, EmptyState, Skeleton, Button, FloatingInput } from '../shared-ui/PremiumUI';

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
            const list = data.results || data || [];
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
            setCreateForm({ name: '', description: '', cuisine_type: '', address: '', city: '', state: '', pincode: '', phone: '', opening_time: '09:00', closing_time: '22:00', minimum_order_amount: '100', delivery_fee: '30', average_delivery_time: '30', latitude: null, longitude: null });
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

    const DocumentUpload = ({ label, field, currentUrl }) => (
        <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
            <label className="input" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer' }}>
                <span style={{ color: docFiles[field] || currentUrl ? 'var(--text-primary)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {docFiles[field]?.name || currentUrl?.split('/').pop() || 'Choose file'}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--accent)' }}>
                    <UploadCloud size={16} /> Upload
                </span>
                <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => setDocFiles({ ...docFiles, [field]: e.target.files?.[0] || null })} />
            </label>
            {currentUrl && (
                <a href={currentUrl} target="_blank" rel="noreferrer" style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontSize: '0.8rem', fontWeight: 700 }}>
                    <ExternalLink size={14} /> View current document
                </a>
            )}
        </div>
    );

    const Field = ({ label, name, type = 'text', formData, setFormData, ...props }) => (
        <div style={{ marginBottom: 'var(--space-4)' }}>
            <FloatingInput
                label={label}
                id={name}
                type={type}
                value={formData[name]}
                onChange={e => setFormData({ ...formData, [name]: e.target.value })}
                {...props}
            />
        </div>
    );

    const Toggle = ({ label, name, formData, setFormData }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>{label}</span>
            <button type="button" onClick={() => setFormData({ ...formData, [name]: !formData[name] })}
                style={{ width: 48, height: 26, borderRadius: 13, background: formData[name] ? 'var(--color-success)' : 'var(--color-bg-elevated)', border: 'none', position: 'relative', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div style={{ width: 20, height: 20, borderRadius: 10, background: 'white', position: 'absolute', top: 3, left: formData[name] ? 25 : 3, transition: 'all 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
            </button>
        </div>
    );

    const ImageUpload = ({ label, preview, onSelect, onRemove, aspectRatio, height }) => (
        <div>
            <label style={{ display: 'block', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)', fontWeight: 600 }}>{label}</label>
            <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                width: '100%', ...(aspectRatio ? { aspectRatio } : { height: height || 200 }),
                borderRadius: 'var(--radius-lg)', border: '2px dashed var(--color-border)',
                background: 'var(--color-bg-base)', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                transition: 'border-color 0.2s',
            }}>
                {preview ? (
                    <img src={preview} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <>
                        <UploadCloud size={28} color="var(--color-text-tertiary)" style={{ marginBottom: 8 }} />
                        <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>Click to upload</span>
                    </>
                )}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files[0];
                    if (file) onSelect(file);
                }} />
            </label>
            {preview && (
                <Button type="button" onClick={onRemove} variant="ghost" size="small" style={{ color: 'var(--color-danger)', marginTop: 'var(--space-2)' }}>
                    <X size={14} /> Remove
                </Button>
            )}
        </div>
    );

    if (loading) return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Settings" title="Restaurant profile." description="Manage your restaurant's details and settings." />
            </div>
            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
                {[1, 2, 3].map(i => <Skeleton key={i} height={120} radius="var(--radius-md)" style={{ marginBottom: 'var(--space-4)' }} />)}
            </div>
        </PageContainer>
    );

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Settings" title="Restaurant profile." description="Manage your restaurant's details, location, and operating hours." compact action={<Button onClick={() => setShowCreate(true)} variant="primary" icon={Plus}>New Restaurant</Button>} />
            </div>
            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>

            {showCreate && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="card" style={{ width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', padding: 'var(--space-5)' }}>
                        <h2 style={{ fontSize: 'var(--text-h3)', fontWeight: 800, marginBottom: 'var(--space-4)' }}>Create New Restaurant</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column' }}>
                            <Field label="Restaurant Name" name="name" formData={createForm} setFormData={setCreateForm} required />
                            <Field label="Description" name="description" formData={createForm} setFormData={setCreateForm} />
                            <Field label="Cuisine Type" name="cuisine_type" formData={createForm} setFormData={setCreateForm} placeholder="e.g. Indian, Chinese, Italian" />
                            <Field label="Full Address" name="address" formData={createForm} setFormData={setCreateForm} required />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="City" name="city" formData={createForm} setFormData={setCreateForm} required />
                                <Field label="State" name="state" formData={createForm} setFormData={setCreateForm} required />
                                <Field label="Pincode" name="pincode" formData={createForm} setFormData={setCreateForm} required />
                            </div>
                            <Field label="Phone" name="phone" formData={createForm} setFormData={setCreateForm} />
                            
                            <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--color-text-primary)' }}>GPS Coordinates</div>
                                    <div style={{ fontSize: 'var(--text-caption)', color: createForm.latitude ? 'var(--color-success)' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                                        {createForm.latitude ? `Lat: ${Number(createForm.latitude).toFixed(4)}, Lng: ${Number(createForm.longitude).toFixed(4)}` : 'Required for delivery routing'}
                                    </div>
                                </div>
                                <Button type="button" onClick={() => fetchLocation(true)} disabled={fetchingLocation} variant="outline" size="small" icon={fetchingLocation ? Loader2 : MapPin}>
                                    {createForm.latitude ? 'Update' : 'Fetch'}
                                </Button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="Opening Time" name="opening_time" type="time" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Closing Time" name="closing_time" type="time" formData={createForm} setFormData={setCreateForm} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="Min Order (₹)" name="minimum_order_amount" type="number" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Delivery Fee (₹)" name="delivery_fee" type="number" formData={createForm} setFormData={setCreateForm} />
                                <Field label="Delivery Time (min)" name="average_delivery_time" type="number" formData={createForm} setFormData={setCreateForm} />
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                <Button type="button" onClick={() => setShowCreate(false)} variant="ghost" style={{ flex: 1 }}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Creating...' : 'Create Restaurant'}</Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {restaurants.length === 0 && !showCreate ? (
                <GlassCard padding="0">
                    <EmptyState icon={Store} title="No Restaurant Yet" description="Create your first restaurant to get started" action={<Button onClick={() => setShowCreate(true)} variant="primary" icon={Plus}>Create Restaurant</Button>} />
                </GlassCard>
            ) : selected && (
                <>
                    {restaurants.length > 1 && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-5)' }}>
                                {restaurants.map(r => (
                                <button key={r.id} onClick={() => { loadRestaurantDetail(r.id); }}
                                    style={{ 
                                        padding: '6px 16px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                        backgroundColor: selected.id === r.id ? 'var(--brand-restaurant)' : 'var(--color-bg-card)', 
                                        color: selected.id === r.id ? '#fff' : 'var(--color-text-secondary)',
                                        boxShadow: selected.id === r.id ? 'var(--shadow-sm)' : 'none'
                                    }}>{r.name}</button>
                            ))}
                        </div>
                    )}

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><ShieldCheck size={20} color="var(--brand-restaurant)" /> Restaurant Status</h3>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                                <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: selected.approval_status === 'approved' ? 'var(--color-success-bg)' : selected.approval_status === 'rejected' ? 'var(--color-danger-bg)' : 'var(--color-warning-bg)', color: selected.approval_status === 'approved' ? 'var(--color-success)' : selected.approval_status === 'rejected' ? 'var(--color-danger)' : 'var(--color-warning)' }}>
                                    {selected.approval_status || 'pending'}
                                </span>
                                <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: selected.is_active ? 'var(--color-success-bg)' : 'var(--color-danger-bg)', color: selected.is_active ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                    {selected.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>Restaurant ID: <strong style={{ color: 'var(--color-text-primary)' }}>{selected.id}</strong></p>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-caption)' }}>Owner: <strong style={{ color: 'var(--color-text-primary)' }}>{selected.owner_name || 'N/A'}</strong></p>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Store size={20} color="var(--brand-restaurant)" /> Basic Information</h3>
                            <Field label="Restaurant Name" name="name" formData={form} setFormData={setForm} />
                            <Field label="Description" name="description" formData={form} setFormData={setForm} />
                            <Field label="Cuisine Type" name="cuisine_type" formData={form} setFormData={setForm} />
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><ImageIcon size={20} color="var(--brand-restaurant)" /> Restaurant Images</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
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
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><FileText size={20} color="var(--brand-restaurant)" /> Verification Documents</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                                <DocumentUpload label="Business License" field="business_license" currentUrl={selected.business_license} />
                                <DocumentUpload label="Food Safety Certificate" field="food_safety_certificate" currentUrl={selected.food_safety_certificate} />
                                <DocumentUpload label="Owner ID Proof" field="owner_id_proof" currentUrl={selected.owner_id_proof} />
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><MapPin size={20} color="var(--brand-restaurant)" /> Location & Contact</h3>
                            <Field label="Full Address" name="address" formData={form} setFormData={setForm} />
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="City" name="city" formData={form} setFormData={setForm} />
                                <Field label="State" name="state" formData={form} setFormData={setForm} />
                                <Field label="Pincode" name="pincode" formData={form} setFormData={setForm} />
                            </div>
                            <Field label="Phone" name="phone" formData={form} setFormData={setForm} />

                            <div style={{ padding: 'var(--space-3)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 'var(--text-body)', fontWeight: 600, color: 'var(--color-text-primary)' }}>GPS Coordinates</div>
                                    <div style={{ fontSize: 'var(--text-caption)', color: form.latitude ? 'var(--color-success)' : 'var(--color-text-secondary)', marginTop: '2px' }}>
                                        {form.latitude ? `Lat: ${Number(form.latitude).toFixed(4)}, Lng: ${Number(form.longitude).toFixed(4)}` : 'Required for delivery routing'}
                                    </div>
                                </div>
                                <Button type="button" onClick={() => fetchLocation(false)} disabled={fetchingLocation} variant="outline" size="small" icon={fetchingLocation ? Loader2 : MapPin}>
                                    {form.latitude ? 'Update' : 'Fetch'}
                                </Button>
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><Clock size={20} color="var(--brand-restaurant)" /> Operating Hours</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="Opening Time" name="opening_time" type="time" formData={form} setFormData={setForm} />
                                <Field label="Closing Time" name="closing_time" type="time" formData={form} setFormData={setForm} />
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><IndianRupee size={20} color="var(--brand-restaurant)" /> Delivery & Pricing</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                                <Field label="Min Order (₹)" name="minimum_order_amount" type="number" formData={form} setFormData={setForm} />
                                <Field label="Delivery Fee (₹)" name="delivery_fee" type="number" formData={form} setFormData={setForm} />
                                <Field label="Avg Delivery (min)" name="average_delivery_time" type="number" formData={form} setFormData={setForm} />
                            </div>
                        </GlassCard>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }}>
                        <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-5)' }}>
                            <h3 style={{ fontSize: 'var(--text-h4)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Status</h3>
                            <Toggle label="Currently Open" name="is_open" formData={form} setFormData={setForm} />
                            <Toggle label="Featured Restaurant" name="is_featured" formData={form} setFormData={setForm} />
                        </GlassCard>
                    </motion.div>

                    <Button onClick={handleSave} variant="primary" size="large" disabled={saving} style={{ width: '100%', marginBottom: 'var(--space-5)' }} icon={Save}>
                        {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                </>
            )}
            </div>
        </PageContainer>
    );
};
export default SettingsPage;
