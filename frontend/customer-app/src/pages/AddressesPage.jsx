
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Briefcase, Heart, X, Star, Navigation, Loader } from 'lucide-react';
import { customersAPI } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import AddressPickerMap from '../components/maps/AddressPickerMap';

const typeIcons = { home: Home, work: Briefcase, other: Heart };
const typeColors = { home: '#60a5fa', work: '#a78bfa', other: '#f43f5e' };

const emptyForm = {
    address_type: 'home',
    label: '',
    full_address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    is_default: false,
};

const AddressesPage = () => {
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });
    const [saving, setSaving] = useState(false);
    const { detectLocation, loading: gpsLoading, setFromSavedAddress } = useLocation();
    const { cartItems } = useCart();

    useEffect(() => { fetchAddresses(); }, []);

    const fetchAddresses = async () => {
        try { const { data } = await customersAPI.getAddresses(); setAddresses(data.results || data || []); }
        catch { }
        finally { setLoading(false); }
    };

    const openCreate = () => { setForm({ ...emptyForm }); setModal({ mode: 'create' }); };

    const autoFillFromGPS = async () => {
        const result = await detectLocation();
        if (result && result.address) {
            const p = result.parts || {};
            setForm(prev => ({
                ...prev,
                full_address: [p.road, p.suburb].filter(Boolean).join(', ') || result.address,
                city: p.city || prev.city,
                state: p.state || prev.state,
                pincode: p.postcode || prev.pincode,
                latitude: result.coords?.[0] ?? prev.latitude,
                longitude: result.coords?.[1] ?? prev.longitude,
            }));
            toast.success('Address auto-filled from GPS!');
        }
    };
    const openEdit = (addr) => {
        setForm({
            address_type: addr.address_type || 'home',
            label: addr.label || '',
            full_address: addr.full_address || '',
            landmark: addr.landmark || '',
            city: addr.city || '',
            state: addr.state || '',
            pincode: addr.pincode || '',
            latitude: addr.latitude || '',
            longitude: addr.longitude || '',
            is_default: addr.is_default || false,
        });
        setModal({ mode: 'edit', id: addr.id });
    };

    const handleAddressMapSelect = (selected) => {
        setForm(prev => ({
            ...prev,
            full_address: selected.display_name || prev.full_address,
            landmark: selected.suburb || prev.landmark,
            city: selected.city || prev.city,
            state: selected.state || prev.state,
            pincode: selected.postcode || prev.pincode,
            latitude: selected.latitude,
            longitude: selected.longitude,
        }));
    };

    const handleDeliverHere = (addr) => {
        setFromSavedAddress(addr);
        toast.success(`Delivery location set to ${addr.label || addr.address_type || 'selected address'}`);
        navigate(cartItems.length > 0 ? '/cart' : '/');
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (modal.mode === 'create') { await customersAPI.addAddress(form); toast.success('Address saved'); }
            else { await customersAPI.updateAddress(modal.id, form); toast.success('Address updated'); }
            setModal(null);
            fetchAddresses();
        } catch (err) {
            const detail = err.response?.data;
            const msg = detail ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : 'Failed to save address';
            toast.error(msg);
        }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try { await customersAPI.deleteAddress(id); toast.success('Address deleted'); fetchAddresses(); }
        catch { toast.error('Failed to delete'); }
    };

    return (
        <div className="page" style={{ paddingBottom: 100 }}>
            <div className="page-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}><ArrowLeft size={22} /></button>
                <h1 className="page-title">Saved Addresses</h1>
                <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={16} /> Add</button>
            </div>

            <div
                className="card"
                style={{
                    marginBottom: 16,
                    padding: 18,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(244,247,255,0.95))',
                    display: 'grid',
                    gap: 14,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                        <p style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#5b8def', fontWeight: 800 }}>
                            Delivery Spots
                        </p>
                        <h2 style={{ marginTop: 6, fontSize: '1.32rem', lineHeight: 1.12, fontWeight: 800 }}>
                            Keep checkout fast with ready-to-use addresses
                        </h2>
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 16, background: 'rgba(96, 165, 250, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', flexShrink: 0 }}>
                        <MapPin size={20} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(96, 165, 250, 0.08)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Saved</div>
                        <div style={{ marginTop: 4, fontSize: '1.2rem', fontWeight: 800 }}>{addresses.length}</div>
                    </div>
                    <div style={{ padding: 12, borderRadius: 16, background: 'rgba(251, 191, 36, 0.12)' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Default</div>
                        <div style={{ marginTop: 4, fontSize: '1.02rem', fontWeight: 800 }}>
                            {addresses.find((address) => address.is_default)?.label || addresses.find((address) => address.is_default)?.address_type || 'None'}
                        </div>
                    </div>
                </div>
            </div>

            {loading ? [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />) :
                addresses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {addresses.map((addr, i) => {
                            const addrType = addr.address_type || 'other';
                            const TypeIcon = typeIcons[addrType] || Heart;
                            const typeColor = typeColors[addrType] || '#f43f5e';
                            return (
                                <motion.div key={addr.id} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                    style={{ display: 'grid', gap: 14, padding: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <TypeIcon size={20} color={typeColor} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{addrType}</p>
                                            {addr.label && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({addr.label})</span>}
                                            {addr.is_default && <Star size={12} fill="#fbbf24" color="#fbbf24" />}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                            {addr.full_address}, {addr.city} {addr.pincode}
                                        </p>
                                        {addr.landmark && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Near: {addr.landmark}</p>}
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                        <button onClick={() => openEdit(addr)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(addr.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                                    </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                                        <button
                                            onClick={() => handleDeliverHere(addr)}
                                            className="btn btn-outline btn-sm"
                                            style={{ minHeight: 40 }}
                                        >
                                            <MapPin size={14} /> Deliver Here
                                        </button>
                                        <button
                                            onClick={() => openEdit(addr)}
                                            className="btn btn-secondary btn-sm"
                                            style={{ minHeight: 40 }}
                                        >
                                            <Edit size={14} /> Edit
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="card"><div className="empty-state"><MapPin /><h3>No Saved Addresses</h3><p>Add addresses for faster checkout</p><button onClick={openCreate} className="btn btn-primary" style={{ marginTop: 12 }}><Plus size={16} /> Add Address</button></div></div>
                )}

            {}
            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}>
                        <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
                            className="card" style={{ width: '100%', maxWidth: 480, borderRadius: '20px 20px 0 0', maxHeight: '85vh', overflow: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={{ fontWeight: 700 }}>{modal.mode === 'create' ? 'New Address' : 'Edit Address'}</h2>
                                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave}>
                                {}
                                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                    {['home', 'work', 'other'].map(type => {
                                        const Icon = typeIcons[type];
                                        return (
                                            <button key={type} type="button" onClick={() => setForm({ ...form, address_type: type })}
                                                style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `2px solid ${form.address_type === type ? typeColors[type] : 'var(--border)'}`, background: form.address_type === type ? `${typeColors[type]}15` : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', textTransform: 'capitalize', fontWeight: 500, color: form.address_type === type ? typeColors[type] : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <Icon size={16} /> {type}
                                            </button>
                                        );
                                    })}
                                </div>
                                {}
                                <button
                                    type="button"
                                    onClick={autoFillFromGPS}
                                    disabled={gpsLoading}
                                    style={{
                                        width: '100%', padding: '10px 16px', marginBottom: 12,
                                        background: 'var(--bg-elevated)', border: '1px dashed var(--accent)',
                                        borderRadius: 10, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 8, cursor: 'pointer',
                                        color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem',
                                    }}
                                >
                                    {gpsLoading ? <Loader size={16} className="spin" /> : <Navigation size={16} />}
                                    {gpsLoading ? 'Detecting...' : 'Use Current Location'}
                                </button>
                                <div style={{ marginBottom: 14 }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                        Drag the pin or tap the map to save the exact drop location for orders.
                                    </p>
                                    <AddressPickerMap
                                        height={220}
                                        initialPosition={
                                            form.latitude && form.longitude
                                                ? [parseFloat(form.latitude), parseFloat(form.longitude)]
                                                : null
                                        }
                                        onAddressSelect={handleAddressMapSelect}
                                    />
                                </div>
                                <input className="input" placeholder="Custom label (optional, e.g. Mom's House)" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} style={{ marginBottom: 12 }} />
                                <textarea className="input" placeholder="Full Address *" value={form.full_address} onChange={e => setForm({ ...form, full_address: e.target.value })} required rows={2} style={{ marginBottom: 12, resize: 'none' }} />
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    <input className="input" placeholder="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                                    <input className="input" placeholder="State *" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    <input className="input" placeholder="Pincode *" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} required />
                                    <input className="input" placeholder="Landmark" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    <input className="input" placeholder="Latitude" value={form.latitude} readOnly />
                                    <input className="input" placeholder="Longitude" value={form.longitude} readOnly />
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    <input type="checkbox" checked={form.is_default} onChange={e => setForm({ ...form, is_default: e.target.checked })} />
                                    Set as default address
                                </label>
                                <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', marginTop: 8 }}>
                                    {saving ? 'Saving...' : modal.mode === 'create' ? 'Save Address' : 'Update Address'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default AddressesPage;
