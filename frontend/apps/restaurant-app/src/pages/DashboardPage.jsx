
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { ordersAPI, restaurantsAPI } from '../services/api';
import { MetricCard, PageHero, SectionHeader } from '@pecafoo/shared-ui/PremiumUI';

const DashboardPage = () => {
    const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await ordersAPI.getRestaurantOrders();
            const orders = data.results || data || [];
            setRecentOrders(orders.slice(0, 5));
            setStats({
                orders: orders.length,
                revenue: orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total || 0), 0),
                pending: orders.filter(o => ['placed', 'confirmed', 'preparing'].includes(o.status)).length,
            });
        } catch { }
    };

    const statCards = [
        { icon: ShoppingBag, label: 'Total Orders', value: stats.orders, color: '#6366f1' },
        { icon: IndianRupee, label: 'Revenue', value: `₹${stats.revenue.toFixed(0)}`, color: '#34d399' },
        { icon: Clock, label: 'Pending Orders', value: stats.pending, color: '#fbbf24' },
        { icon: TrendingUp, label: 'Completion Rate', value: stats.orders > 0 ? `${Math.round(((stats.orders - stats.pending) / stats.orders) * 100)}%` : '0%', color: '#f87171' },
    ];

    return (
        <div className="page-shell">
            <PageHero eyebrow="Restaurant overview" title="Service, at a glance." description="Stay on top of today's orders, kitchen flow, and restaurant performance.">
                <div className="restaurant-service-status"><span /><div><small>Kitchen status</small><strong>{stats.pending > 0 ? `${stats.pending} orders moving` : 'Ready for orders'}</strong></div></div>
            </PageHero>
            <SectionHeader eyebrow="Performance" title="Today’s essentials" description="The numbers your team needs before the next order arrives." />
            <div className="stat-grid">
                {statCards.map(({ icon: Icon, label, value, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <MetricCard icon={Icon} label={label} value={value} tone={color} detail="Today" />
                    </motion.div>
                ))}
            </div>
            <SectionHeader eyebrow="Live queue" title="Recent orders" description="The latest tickets entering your restaurant workflow." />
            <div className="card stack-safe">
                {recentOrders.length > 0 ? (
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
                            <tbody>
                                {recentOrders.map(o => (
                                    <tr key={o.id}>
                                        <td style={{ fontWeight: 600 }}>#{o.order_number}</td>
                                        <td>{o.customer_name || 'Customer'}</td>
                                        <td>₹{o.total}</td>
                                        <td><span className={`badge badge-${['placed', 'confirmed', 'preparing'].includes(o.status) ? 'warning' : o.status === 'delivered' ? 'success' : 'accent'}`}>{o.status.replace(/_/g, ' ')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state"><ShoppingBag /><h3>No orders yet</h3><p>Orders will appear here when customers place them</p></div>
                )}
            </div>
        </div>
    );
};
export default DashboardPage;
