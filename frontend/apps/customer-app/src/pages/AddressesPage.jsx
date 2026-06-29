import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Briefcase, Heart, X, Star, Navigation, Loader } from 'lucide-react';
import { customersAPI } from '../services/api';
import { useLocation } from '../context/LocationContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import { AddressPickerMap } from '@pecafoo/shared-ui';

import {
    PageContainer,
    IconButton,
    Button,
    GlassCard,
    EmptyState,
    FloatingInput
} from '@pecafoo/shared-ui/index';

const typeIcons = { home: Home, work: Briefcase, other: Heart };
const typeColors = { home: '#3b82f6', work: '#8b5cf6', other: '#ec4899' };

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
        try { 
            const { data } = await customersAPI.getAddresses(); 
            setAddresses(data.results || data || []); 
        } catch { 
            toast.error('Failed to load addresses');
        } finally { 
            setLoading(false); 
        }
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
            if (modal.mode === 'create') { 
                await customersAPI.addAddress(form); 
                toast.success('Address saved'); 
            } else { 
                await customersAPI.updateAddress(modal.id, form); 
                toast.success('Address updated'); 
            }
            setModal(null);
            fetchAddresses();
        } catch (err) {
            const detail = err.response?.data;
            const msg = detail ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : 'Failed to save address';
            toast.error(msg);
        } finally { 
            setSaving(false); 
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this address?')) return;
        try { 
            await customersAPI.deleteAddress(id); 
            toast.success('Address deleted'); 
            fetchAddresses(); 
        } catch { 
            toast.error('Failed to delete'); 
        }
    };

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Addresses</h1>
                </div>
                <Button variant="secondary" size="small" icon={Plus} onClick={openCreate}>Add</Button>
            </div>

            <div style={{ padding: 'var(--space-4)' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {[1, 2, 3].map(i => <div key={i} style={{ height: 120, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />)}
                    </div>
                ) : addresses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <AnimatePresence>
                            {addresses.map((addr, i) => {
                                const addrType = addr.address_type || 'other';
                                const TypeIcon = typeIcons[addrType] || Heart;
                                const typeColor = typeColors[addrType] || '#ec4899';
                                
                                return (
                                    <motion.div key={addr.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                        <GlassCard padding="var(--space-4)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                                <div style={{ width: 40, height: 40, borderRadius: '12px', backgroundColor: `${typeColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <TypeIcon size={20} color={typeColor} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                        <h3 style={{ margin: 0, fontSize: 'var(--text-body)', fontWeight: 700, textTransform: 'capitalize' }}>{addrType}</h3>
                                                        {addr.label && <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>({addr.label})</span>}
                                                        {addr.is_default && <div style={{ display: 'flex', alignItems: 'center', gap: 2, backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800 }}><Star size={10} fill="currentColor"/> Default</div>}
                                                    </div>
                                                    <p style={{ margin: '4px 0 0 0', fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                                                        {addr.full_address}, {addr.city} {addr.pincode}
                                                    </p>
                                                    {addr.landmark && <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Near: {addr.landmark}</p>}
                                                </div>
                                                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                                    <IconButton variant="ghost" icon={Edit} onClick={() => openEdit(addr)} />
                                                    <IconButton variant="ghost" icon={Trash2} onClick={() => handleDelete(addr.id)} style={{ color: 'var(--color-danger)' }} />
                                                </div>
                                            </div>
                                            
                                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                                <Button fullWidth variant="outline" size="small" icon={MapPin} onClick={() => handleDeliverHere(addr)}>
                                                    Deliver Here
                                                </Button>
                                                <Button fullWidth variant="secondary" size="small" icon={Edit} onClick={() => openEdit(addr)}>
                                                    Edit
                                                </Button>
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div style={{ marginTop: 'var(--space-8)' }}>
                        <EmptyState
                            icon={MapPin}
                            title="No Saved Addresses"
                            description="Add addresses for faster checkout"
                            action={<Button onClick={openCreate} icon={Plus}>Add Address</Button>}
                        />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <motion.div 
                            initial={{ y: '100%' }} 
                            animate={{ y: 0 }} 
                            exit={{ y: '100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            style={{ 
                                width: '100%', 
                                maxWidth: '480px', 
                                backgroundColor: 'var(--color-bg-base)', 
                                borderRadius: '24px 24px 0 0', 
                                padding: 'var(--space-5)', 
                                paddingBottom: 'calc(var(--space-5) + env(safe-area-inset-bottom))',
                                maxHeight: '90vh', 
                                overflowY: 'auto' 
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                                <h2 style={{ margin: 0, fontSize: 'var(--text-h2)' }}>{modal.mode === 'create' ? 'New Address' : 'Edit Address'}</h2>
                                <IconButton icon={X} variant="ghost" onClick={() => setModal(null)} />
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                                    {['home', 'work', 'other'].map(type => {
                                        const Icon = typeIcons[type];
                                        const isSelected = form.address_type === type;
                                        return (
                                            <button 
                                                key={type} 
                                                type="button" 
                                                onClick={() => setForm({ ...form, address_type: type })}
                                                style={{ 
                                                    padding: '12px 8px', 
                                                    borderRadius: '12px', 
                                                    border: `2px solid ${isSelected ? typeColors[type] : 'var(--color-border)'}`, 
                                                    backgroundColor: isSelected ? `${typeColors[type]}10` : 'transparent', 
                                                    display: 'flex', 
                                                    flexDirection: 'column',
                                                    alignItems: 'center', 
                                                    justifyContent: 'center', 
                                                    gap: 6, 
                                                    cursor: 'pointer', 
                                                    textTransform: 'capitalize', 
                                                    fontWeight: 700, 
                                                    color: isSelected ? typeColors[type] : 'var(--color-text-secondary)', 
                                                    fontSize: '12px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Icon size={20} /> {type}
                                            </button>
                                        );
                                    })}
                                </div>

                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    onClick={autoFillFromGPS} 
                                    disabled={gpsLoading}
                                    style={{ color: 'var(--brand-customer)', backgroundColor: 'rgba(217, 70, 239, 0.1)', border: '1px dashed var(--brand-customer)' }}
                                >
                                    {gpsLoading ? <Loader size={16} className="spin" /> : <Navigation size={16} />}
                                    <span style={{ marginLeft: 8 }}>{gpsLoading ? 'Detecting...' : 'Use Current Location'}</span>
                                </Button>

                                <div>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>Pin your exact location</p>
                                    <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <AddressPickerMap
                                            height={180}
                                            initialPosition={
                                                form.latitude && form.longitude
                                                    ? [parseFloat(form.latitude), parseFloat(form.longitude)]
                                                    : null
                                            }
                                            onAddressSelect={handleAddressMapSelect}
                                        />
                                    </div>
                                </div>

                                <FloatingInput 
                                    label="Custom label (optional, e.g. Mom's House)" 
                                    value={form.label} 
                                    onChange={e => setForm({ ...form, label: e.target.value })} 
                                />
                                
                                <FloatingInput 
                                    label="Full Address" 
                                    value={form.full_address} 
                                    onChange={e => setForm({ ...form, full_address: e.target.value })} 
                                    required
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <FloatingInput label="City" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
                                    <FloatingInput label="State" value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                                    <FloatingInput label="Pincode" value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} required />
                                    <FloatingInput label="Landmark" value={form.landmark} onChange={e => setForm({ ...form, landmark: e.target.value })} />
                                </div>

                                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: 'var(--color-divider)', borderRadius: '12px', cursor: 'pointer', fontSize: 'var(--text-body)', fontWeight: 600 }}>
                                    <input 
                                        type="checkbox" 
                                        checked={form.is_default} 
                                        onChange={e => setForm({ ...form, is_default: e.target.checked })} 
                                        style={{ width: 20, height: 20, accentColor: 'var(--brand-customer)' }}
                                    />
                                    Set as default address
                                </label>

                                <Button type="submit" variant="primary" size="large" disabled={saving} style={{ marginTop: 'var(--space-2)' }}>
                                    {saving ? 'Saving...' : modal.mode === 'create' ? 'Save Address' : 'Update Address'}
                                </Button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};

export default AddressesPage;


