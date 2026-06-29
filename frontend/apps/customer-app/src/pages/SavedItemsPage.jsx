import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Heart, Trash2, UtensilsCrossed } from 'lucide-react';
import toast from 'react-hot-toast';
import { customersAPI } from '../services/api';

import {
    PageContainer,
    IconButton,
    EmptyState,
    Button,
    GlassCard
} from '@pecafoo/shared-ui/index';

const buildMediaUrl = (value) => {
    if (!value || typeof value !== 'string') return '';
    if (/^(https?:|data:|blob:)/i.test(value)) return value;
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'https://api.pecafoo.com/api';
    const mediaBase = apiBase.replace(/\/api\/?$/, '');
    return `${mediaBase}${value.startsWith('/') ? value : `/${value}`}`;
};

export default function SavedItemsPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedItems();
    }, []);

    const fetchSavedItems = async () => {
        setLoading(true);
        try {
            const { data } = await customersAPI.getFoodWishlist();
            setItems(data.results || data || []);
        } catch {
            setItems([]);
            toast.error('Failed to load saved items');
        } finally {
            setLoading(false);
        }
    };

    const removeSavedItem = async (menuItemId, itemName) => {
        try {
            await customersAPI.toggleFoodWishlist({ menu_item_id: menuItemId });
            setItems((current) => current.filter((item) => item.menu_item !== menuItemId));
            toast.success(`${itemName} removed from saved items`);
        } catch {
            toast.error('Failed to remove item');
        }
    };

    const totalValue = items.reduce(
        (sum, item) => sum + Number(item.item_discount_price || item.item_price || 0),
        0
    );

    return (
        <PageContainer padding="0">
            <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)', padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <IconButton icon={ArrowLeft} onClick={() => navigate(-1)} />
                    <h1 style={{ margin: 0, fontSize: 'var(--text-h3)' }}>Saved Dishes</h1>
                </div>
                <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={20} color="var(--brand-customer)" fill="var(--brand-customer)" />
                </div>
            </div>

            <div style={{ padding: 'var(--space-4)' }}>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ height: 100, backgroundColor: 'var(--color-divider)', borderRadius: 'var(--radius-card)' }} />
                        ))}
                    </div>
                ) : items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                        <AnimatePresence>
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard padding="var(--space-3)" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-divider)', flexShrink: 0 }}>
                                            {item.menu_item_image ? (
                                                <img 
                                                    src={buildMediaUrl(item.menu_item_image)} 
                                                    alt={item.item_name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🍽️</div>
                                            )}
                                        </div>
                                        
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: '0 0 2px 0', fontWeight: 800, fontSize: 'var(--text-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.item_name || 'Food Item'}</p>
                                            {item.restaurant_name && (
                                                <div 
                                                    onClick={() => navigate(`/restaurant/${item.restaurant_slug}`)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-customer)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                                                >
                                                    {item.restaurant_name} <ChevronRight size={12}/>
                                                </div>
                                            )}
                                            <p style={{ margin: '4px 0 0 0', fontWeight: 800, fontSize: 'var(--text-body)' }}>₹{item.item_discount_price || item.item_price}</p>
                                        </div>
                                        
                                        <IconButton 
                                            icon={Trash2} 
                                            variant="ghost" 
                                            onClick={() => removeSavedItem(item.menu_item, item.item_name)} 
                                            style={{ color: 'var(--color-danger)' }}
                                        />
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div style={{ marginTop: 'var(--space-8)' }}>
                        <EmptyState
                            icon={UtensilsCrossed}
                            title="No saved dishes"
                            description="Tap the heart icon on any dish to save it for later."
                            action={<Button onClick={() => navigate('/')}>Explore Menu</Button>}
                        />
                    </div>
                )}
            </div>
        </PageContainer>
    );
}

