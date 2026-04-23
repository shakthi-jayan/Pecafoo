
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Tags, GripVertical, X } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CategoriesPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selected, setSelected] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); 
    const [formName, setFormName] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchRestaurants(); }, []);

    const fetchRestaurants = async () => {
        try {
            const { data } = await restaurantsAPI.getMyRestaurants();
            const list = data.results || data || [];
            setRestaurants(list);
            if (list.length > 0) { setSelected(list[0]); fetchCategories(list[0].id); }
        } catch { } finally { setLoading(false); }
    };

    const fetchCategories = async (restaurantId) => {
        try {
            const { data } = await restaurantsAPI.getCategories(restaurantId);
            setCategories(data.results || data || []);
        } catch { setCategories([]); }
    };

    const openCreate = () => { setFormName(''); setFormDesc(''); setModal({ mode: 'create' }); };
    const openEdit = (cat) => { setFormName(cat.name); setFormDesc(cat.description || ''); setModal({ mode: 'edit', category: cat }); };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selected || !formName.trim()) return;
        setSaving(true);
        try {
            if (modal.mode === 'create') {
                await restaurantsAPI.createCategory(selected.id, { name: formName, description: formDesc });
                toast.success('Category created');
            } else {
                await restaurantsAPI.updateCategory(selected.id, modal.category.id, { name: formName, description: formDesc });
                toast.success('Category updated');
            }
            setModal(null);
            fetchCategories(selected.id);
        } catch (err) { toast.error(err.response?.data?.name?.[0] || 'Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (catId) => {
        if (!window.confirm('Delete this category? All items in it will be unlinked.')) return;
        try {
            await restaurantsAPI.deleteCategory(selected.id, catId);
            toast.success('Category deleted');
            fetchCategories(selected.id);
        } catch { toast.error('Failed to delete'); }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Categories</h1>
                <button onClick={openCreate} className="btn btn-primary" disabled={!selected}><Plus size={18} /> Add Category</button>
            </div>

            {restaurants.length > 1 && (
                <div className="chip-row" style={{ marginBottom: 20 }}>
                    {restaurants.map(r => (
                        <button key={r.id} onClick={() => { setSelected(r); fetchCategories(r.id); }}
                            className={`btn btn-sm ${selected?.id === r.id ? 'btn-primary' : 'btn-secondary'}`}>{r.name}</button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}</div>
            ) : categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {categories.map((cat, i) => (
                        <motion.div key={cat.id} className="card category-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                                <div>
                                    <p style={{ fontWeight: 600 }}>{cat.name}</p>
                                    {cat.description && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.description}</p>}
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{cat.item_count || 0} items</p>
                                </div>
                            </div>
                            <div className="category-card-actions">
                                <button onClick={() => openEdit(cat)} className="btn btn-secondary btn-sm"><Edit size={14} /></button>
                                <button onClick={() => handleDelete(cat.id)} className="btn btn-danger btn-sm"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="card"><div className="empty-state"><Tags /><h3>No Categories</h3><p>Create categories to organize your menu items</p></div></div>
            )}

            {}
            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="card" style={{ width: '100%', maxWidth: 440 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h2 style={{ fontWeight: 700 }}>{modal.mode === 'create' ? 'New Category' : 'Edit Category'}</h2>
                                <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Name</label>
                                    <input className="input" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Starters, Main Course" required />
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Description (optional)</label>
                                    <input className="input" value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="Brief description" />
                                </div>
                                <div className="responsive-actions">
                                    <button type="button" onClick={() => setModal(null)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : modal.mode === 'create' ? 'Create' : 'Update'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
export default CategoriesPage;
