
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import { ordersAPI, restaurantsAPI } from '../services/api';

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
            <div className="page-header"><h1 className="page-title">Dashboard</h1></div>
            <div className="stat-grid">
                {statCards.map(({ icon: Icon, label, value, color }, i) => (
                    <motion.div key={label} className="card stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p className="stat-label">{label}</p>
                                <p className="stat-value" style={{ color }}>{value}</p>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={22} color={color} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
            <div className="card stack-safe">
                <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Recent Orders</h3>
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
