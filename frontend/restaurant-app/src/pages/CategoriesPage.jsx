
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Tags, GripVertical, X } from 'lucide-react';
import { restaurantsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { PageContainer, PageHero, GlassCard, EmptyState, Skeleton, Button, FloatingInput } from '../shared-ui/PremiumUI';

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
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Categories" title="Organize your menu." description="Group items into logical categories to help customers find what they want faster." compact action={<Button onClick={openCreate} variant="primary" icon={Plus} disabled={!selected}>Add Category</Button>} />
            </div>

            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
            {restaurants.length > 1 && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-5)' }}>
                    {restaurants.map(r => (
                        <button key={r.id} onClick={() => { setSelected(r); fetchCategories(r.id); }}
                            style={{ 
                                padding: '6px 16px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                backgroundColor: selected?.id === r.id ? 'var(--brand-restaurant)' : 'var(--color-bg-card)', 
                                color: selected?.id === r.id ? '#fff' : 'var(--color-text-secondary)',
                                boxShadow: selected?.id === r.id ? 'var(--shadow-sm)' : 'none'
                            }}>{r.name}</button>
                    ))}
                </div>
            )}

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>{[1, 2, 3, 4].map(i => <Skeleton key={i} height={80} radius="var(--radius-md)" />)}</div>
            ) : categories.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {categories.map((cat, i) => (
                        <motion.article key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                            <GlassCard padding="var(--space-3)" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                    <div style={{ cursor: 'grab', color: 'var(--color-text-tertiary)' }}><GripVertical size={20} /></div>
                                    <div>
                                        <h3 style={{ fontWeight: 700, fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}>{cat.name}</h3>
                                        {cat.description && <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)', marginTop: 2 }}>{cat.description}</p>}
                                        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-tertiary)', marginTop: 4, textTransform: 'uppercase' }}>{cat.item_count || 0} items</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <Button onClick={() => openEdit(cat)} variant="secondary" size="small" icon={Edit} />
                                    <Button onClick={() => handleDelete(cat.id)} variant="ghost" size="small" style={{ color: 'var(--color-danger)' }} icon={Trash2} />
                                </div>
                            </GlassCard>
                        </motion.article>
                    ))}
                </div>
            ) : (
                <GlassCard padding="0">
                    <EmptyState
                        icon={Tags}
                        title="No Categories"
                        description="Create categories to organize your menu items"
                        action={<Button onClick={openCreate} variant="primary" icon={Plus} disabled={!selected}>+ Add Category</Button>}
                    />
                </GlassCard>
            )}
            </div>

            <AnimatePresence>
                {modal && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} className="card" style={{ width: '100%', maxWidth: 440, padding: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                <div>
                                    <h2 style={{ fontSize: 'var(--text-h3)', fontWeight: 800 }}>{modal.mode === 'create' ? 'New Category' : 'Edit Category'}</h2>
                                </div>
                                <Button onClick={() => setModal(null)} variant="ghost" size="small"><X size={20} /></Button>
                            </div>
                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                <FloatingInput id="cat-name" label="Category Name" value={formName} onChange={e => setFormName(e.target.value)} required />
                                <FloatingInput id="cat-desc" label="Description (optional)" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
                                
                                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                                    <Button type="button" onClick={() => setModal(null)} variant="ghost" style={{ flex: 1 }}>Cancel</Button>
                                    <Button type="submit" variant="primary" disabled={saving} style={{ flex: 1 }}>{saving ? 'Saving...' : modal.mode === 'create' ? 'Create' : 'Update'}</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};
export default CategoriesPage;
