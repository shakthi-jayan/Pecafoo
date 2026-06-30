import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Plus, Trash2, UtensilsCrossed, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantsAPI } from '../services/api';
import { PageContainer, PageHero, GlassCard, EmptyState, Skeleton, Button, FloatingInput } from '../../../shared-ui/PremiumUI';

const createInitialForm = () => ({
    category: '',
    name: '',
    description: '',
    food_type: 'veg',
    price: '',
    discount_price: '',
    calories: '',
    preparation_time: '',
    is_available: true,
    is_bestseller: false,
    image: null,
});

const MenuPage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(createInitialForm());

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const selectedRestaurantId = selectedRestaurant?.id;
    const activeRestaurantName = selectedRestaurant?.name || 'this restaurant';

    const totalItems = useMemo(() => menuItems.length, [menuItems]);

    const fetchRestaurants = async () => {
        setLoading(true);
        try {
            const { data } = await restaurantsAPI.getMyRestaurants();
            const list = data.results || data || [];
            setRestaurants(list);
            if (list.length > 0) {
                setSelectedRestaurant(list[0]);
                await Promise.all([fetchMenu(list[0].id), fetchCategories(list[0].id)]);
            }
        } catch {
            toast.error('Failed to load restaurants');
        } finally {
            setLoading(false);
        }
    };

    const fetchMenu = async (restaurantId) => {
        try {
            const { data } = await restaurantsAPI.getMenuItems(restaurantId);
            setMenuItems(data.results || data || []);
        } catch {
            setMenuItems([]);
            toast.error('Failed to load menu items');
        }
    };

    const fetchCategories = async (restaurantId) => {
        try {
            const { data } = await restaurantsAPI.getCategories(restaurantId);
            setCategories(data.results || data || []);
        } catch {
            setCategories([]);
        }
    };

    const selectRestaurant = async (restaurant) => {
        setSelectedRestaurant(restaurant);
        closeForm();
        await Promise.all([fetchMenu(restaurant.id), fetchCategories(restaurant.id)]);
    };

    const updateField = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const resetForm = () => {
        setForm(createInitialForm());
        setEditingItem(null);
    };

    const closeForm = () => {
        setShowForm(false);
        setSaving(false);
        resetForm();
    };

    const openCreateForm = () => {
        if (!selectedRestaurantId) {
            toast.error('Select a restaurant first');
            return;
        }
        if (categories.length === 0) {
            toast.error('Create a category before adding menu items');
            return;
        }
        resetForm();
        setForm((current) => ({ ...current, category: String(categories[0].id) }));
        setShowForm(true);
    };

    const openEditForm = (item) => {
        setEditingItem(item);
        setForm({
            category: item.category ? String(item.category) : '',
            name: item.name || '',
            description: item.description || '',
            food_type: item.food_type || 'veg',
            price: item.price ? String(item.price) : '',
            discount_price: item.discount_price ? String(item.discount_price) : '',
            calories: item.calories ? String(item.calories) : '',
            preparation_time: item.preparation_time ? String(item.preparation_time) : '',
            is_available: Boolean(item.is_available),
            is_bestseller: Boolean(item.is_bestseller),
            image: null,
        });
        setShowForm(true);
    };

    const buildPayload = () => {
        const payload = new FormData();
        payload.append('category', form.category);
        payload.append('name', form.name.trim());
        payload.append('description', form.description.trim());
        payload.append('food_type', form.food_type);
        payload.append('price', form.price);
        payload.append('is_available', String(form.is_available));
        payload.append('is_bestseller', String(form.is_bestseller));

        if (form.discount_price) payload.append('discount_price', form.discount_price);
        if (form.calories) payload.append('calories', form.calories);
        if (form.preparation_time) payload.append('preparation_time', form.preparation_time);
        if (form.image instanceof File) payload.append('image', form.image);

        return payload;
    };

    const validateForm = () => {
        if (!selectedRestaurantId) return 'Select a restaurant first';
        if (!form.category) return 'Please choose a category';
        if (!form.name.trim()) return 'Item name is required';
        if (!form.price || Number(form.price) <= 0) return 'Enter a valid price';
        if (form.discount_price && Number(form.discount_price) >= Number(form.price)) {
            return 'Discount price must be lower than the original price';
        }
        return null;
    };

    const submitForm = async (event) => {
        event.preventDefault();
        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload();
            if (editingItem) {
                await restaurantsAPI.updateMenuItem(selectedRestaurantId, editingItem.id, payload);
                toast.success('Menu item updated');
            } else {
                await restaurantsAPI.createMenuItem(selectedRestaurantId, payload);
                toast.success('Menu item created');
            }
            await fetchMenu(selectedRestaurantId);
            closeForm();
        } catch (err) {
            const message =
                err?.response?.data?.detail ||
                Object.values(err?.response?.data || {}).flat().join(' ') ||
                'Failed to save menu item';
            toast.error(message);
            setSaving(false);
        }
    };

    const deleteItem = async (itemId) => {
        if (!selectedRestaurantId || !window.confirm('Delete this menu item?')) return;
        try {
            await restaurantsAPI.deleteMenuItem(selectedRestaurantId, itemId);
            toast.success('Item deleted');
            fetchMenu(selectedRestaurantId);
        } catch {
            toast.error('Failed to delete');
        }
    };

    return (
        <PageContainer padding="0">
            <div style={{ padding: 'var(--space-4)' }}>
                <PageHero eyebrow="Menu Management" title="Craft your offerings." description={`Manage dishes for ${activeRestaurantName}. ${totalItems} item${totalItems === 1 ? '' : 's'} listed.`} compact action={<Button onClick={openCreateForm} variant="primary" icon={Plus}>Add Item</Button>} />
            </div>

            <div style={{ padding: '0 var(--space-4) var(--space-4) var(--space-4)' }}>
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={80} radius="var(--radius-md)" />
                    ))}
                </div>
            ) : restaurants.length === 0 ? (
                <GlassCard padding="0">
                    <EmptyState icon={UtensilsCrossed} title="No restaurant yet" description="Create your restaurant first" />
                </GlassCard>
            ) : (
                <>
                    {restaurants.length > 1 && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', marginBottom: 'var(--space-5)' }}>
                            {restaurants.map((restaurant) => (
                                <button
                                    key={restaurant.id}
                                    onClick={() => selectRestaurant(restaurant)}
                                    style={{ 
                                        padding: '6px 16px', borderRadius: '100px', fontSize: 'var(--text-caption)', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                        backgroundColor: selectedRestaurantId === restaurant.id ? 'var(--brand-restaurant)' : 'var(--color-bg-card)', 
                                        color: selectedRestaurantId === restaurant.id ? '#fff' : 'var(--color-text-secondary)',
                                        boxShadow: selectedRestaurantId === restaurant.id ? 'var(--shadow-sm)' : 'none'
                                    }}
                                >
                                    {restaurant.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {categories.length === 0 && (
                        <GlassCard padding="0" style={{ marginBottom: 'var(--space-5)' }}>
                            <EmptyState icon={UtensilsCrossed} title="No categories yet" description="Create a category first so menu items can be assigned correctly." />
                        </GlassCard>
                    )}

                    <GlassCard padding="0">
                        {menuItems.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Type</th>
                                            <th>Price</th>
                                            <th>Available</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menuItems.map((item, index) => (
                                            <motion.tr
                                                key={item.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.04 }}
                                            >
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div
                                                            style={{
                                                                width: 48,
                                                                height: 48,
                                                                borderRadius: 8,
                                                                background: 'var(--bg-elevated)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '1.2rem',
                                                                flexShrink: 0,
                                                                overflow: 'hidden',
                                                            }}
                                                        >
                                                            {item.image ? (
                                                                <img
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                />
                                                            ) : (
                                                                '🍽️'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 600 }}>{item.name}</p>
                                                            {item.is_bestseller && (
                                                                <span className="badge badge-accent" style={{ marginTop: 2 }}>
                                                                    Bestseller
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.food_type === 'veg' ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.food_type}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 600 }}>
                                                    ₹{item.discount_price || item.price}
                                                    {item.discount_price && (
                                                        <span
                                                            style={{
                                                                textDecoration: 'line-through',
                                                                color: 'var(--text-muted)',
                                                                marginLeft: 6,
                                                                fontWeight: 400,
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            ₹{item.price}
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.is_available ? 'badge-success' : 'badge-danger'}`}>
                                                        {item.is_available ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                        <Button onClick={() => editItem(item)} variant="outline" size="small" icon={Edit} />
                                                        <Button onClick={() => deleteItem(item.id)} variant="ghost" size="small" style={{ color: 'var(--color-danger)' }}>
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <EmptyState icon={UtensilsCrossed} title="No menu items" description="Add your first menu item to get started" action={<Button onClick={openCreateForm} variant="primary" icon={Plus}>Add Item</Button>} />
                        )}
                    </GlassCard>
                </>
            )}

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(15, 23, 42, 0.45)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 16,
                            zIndex: 1000,
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                            className="card"
                            style={{
                                width: 'min(720px, 100%)',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                padding: 24,
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: 12,
                                    marginBottom: 'var(--space-4)',
                                }}
                            >
                                <div>
                                    <h2 style={{ fontSize: 'var(--text-h3)', fontWeight: 800 }}>
                                        {editingItem ? 'Edit menu item' : 'Add menu item'}
                                    </h2>
                                    <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-secondary)' }}>
                                        {editingItem ? `Update ${editingItem.name}` : `Create a new dish for ${activeRestaurantName}`}
                                    </p>
                                </div>
                                <Button variant="ghost" size="small" onClick={closeForm} disabled={saving}>
                                    <X size={20} />
                                </Button>
                            </div>

                            <form onSubmit={submitForm}>
                                <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                                    <div>
                                        <label htmlFor="menu-category" style={{ fontWeight: 600, fontSize: 'var(--text-caption)', marginBottom: 'var(--space-1)', display: 'block' }}>Category</label>
                                        <select
                                            id="menu-category"
                                            value={form.category}
                                            onChange={(e) => updateField('category', e.target.value)}
                                            style={{ 
                                                width: '100%', padding: '16px', borderRadius: 'var(--radius-input)',
                                                border: '1px solid var(--color-border)', background: 'var(--color-bg-base)',
                                                fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                                                outline: 'none', fontFamily: 'inherit'
                                            }}
                                        >
                                            <option value="">Select category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <FloatingInput
                                        id="menu-name"
                                        label="Item name"
                                        value={form.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                    />

                                    <div>
                                        <label htmlFor="menu-description" style={{ fontWeight: 600, fontSize: 'var(--text-caption)', marginBottom: 'var(--space-1)', display: 'block' }}>Description</label>
                                        <textarea
                                            id="menu-description"
                                            value={form.description}
                                            onChange={(e) => updateField('description', e.target.value)}
                                            rows={4}
                                            placeholder="Describe the dish, taste, and serving size"
                                            style={{ 
                                                width: '100%', padding: '16px', borderRadius: 'var(--radius-input)',
                                                border: '1px solid var(--color-border)', background: 'var(--color-bg-base)',
                                                fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                                                outline: 'none', fontFamily: 'inherit', resize: 'vertical'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                                        <div>
                                            <label htmlFor="menu-type" style={{ fontWeight: 600, fontSize: 'var(--text-caption)', marginBottom: 'var(--space-1)', display: 'block' }}>Food type</label>
                                            <select
                                                id="menu-type"
                                                value={form.food_type}
                                                onChange={(e) => updateField('food_type', e.target.value)}
                                                style={{ 
                                                    width: '100%', padding: '16px', borderRadius: 'var(--radius-input)',
                                                    border: '1px solid var(--color-border)', background: 'var(--color-bg-base)',
                                                    fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                                                    outline: 'none', fontFamily: 'inherit'
                                                }}
                                            >
                                                <option value="veg">Veg</option>
                                                <option value="non_veg">Non Veg</option>
                                                <option value="vegan">Vegan</option>
                                                <option value="egg">Egg</option>
                                            </select>
                                        </div>

                                        <FloatingInput
                                            id="menu-price"
                                            type="number"
                                            label="Price"
                                            value={form.price}
                                            onChange={(e) => updateField('price', e.target.value)}
                                        />

                                        <FloatingInput
                                            id="menu-discount"
                                            type="number"
                                            label="Discount price"
                                            value={form.discount_price}
                                            onChange={(e) => updateField('discount_price', e.target.value)}
                                        />

                                        <FloatingInput
                                            id="menu-calories"
                                            type="number"
                                            label="Calories"
                                            value={form.calories}
                                            onChange={(e) => updateField('calories', e.target.value)}
                                        />

                                        <FloatingInput
                                            id="menu-prep-time"
                                            type="number"
                                            label="Prep time (mins)"
                                            value={form.preparation_time}
                                            onChange={(e) => updateField('preparation_time', e.target.value)}
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="menu-image" style={{ fontWeight: 600, fontSize: 'var(--text-caption)', marginBottom: 'var(--space-1)', display: 'block' }}>
                                            {editingItem ? 'Replace image' : 'Item image'}
                                        </label>
                                        <input
                                            id="menu-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => updateField('image', e.target.files?.[0] || null)}
                                            style={{ 
                                                width: '100%', padding: '16px', borderRadius: 'var(--radius-input)',
                                                border: '1px solid var(--color-border)', background: 'var(--color-bg-base)',
                                                fontSize: 'var(--text-body)', color: 'var(--color-text-primary)',
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.is_available}
                                                onChange={(e) => updateField('is_available', e.target.checked)}
                                            />
                                            Available
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
                                            <input
                                                type="checkbox"
                                                checked={form.is_bestseller}
                                                onChange={(e) => updateField('is_bestseller', e.target.checked)}
                                            />
                                            Bestseller
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 'var(--space-4)' }}>
                                    <Button type="button" variant="ghost" onClick={closeForm} disabled={saving}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary" disabled={saving}>
                                        {saving ? 'Saving...' : editingItem ? 'Update Item' : 'Create Item'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </PageContainer>
    );
};

export default MenuPage;
