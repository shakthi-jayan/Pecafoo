
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserCheck, UserX, Store, Truck, Shield, User } from 'lucide-react';
import { usersAPI } from '../services/api';

const roleColors = { customer: '#60a5fa', restaurant: '#a78bfa', delivery: '#10b981', admin: '#f43f5e' };
const roleIcons = { customer: User, restaurant: Store, delivery: Truck, admin: Shield };

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        usersAPI.getAll()
            .then(({ data }) => setUsers(data.results || data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u => {
        const matchSearch = !search || u.email?.toLowerCase().includes(search.toLowerCase()) || u.first_name?.toLowerCase().includes(search.toLowerCase()) || u.last_name?.toLowerCase().includes(search.toLowerCase());
        const matchRole = roleFilter === 'all' || u.role === roleFilter;
        return matchSearch && matchRole;
    });

    const roleCounts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

    return (
        <div>
            <div className="page-header"><h1 className="page-title">Users</h1><span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{users.length} total</span></div>

            {}
            <div className="stat-grid" style={{ marginBottom: 20 }}>
                {['customer', 'restaurant', 'delivery', 'admin'].map((role, i) => {
                    const Icon = roleIcons[role];
                    const color = roleColors[role];
                    return (
                        <motion.div key={role} className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => setRoleFilter(roleFilter === role ? 'all' : role)}
                            style={{ cursor: 'pointer', border: roleFilter === role ? `2px solid ${color}` : '1px solid var(--border)', transition: 'all 0.2s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p className="stat-label" style={{ textTransform: 'capitalize' }}>{role}s</p>
                                    <p className="stat-value" style={{ color }}>{roleCounts[role] || 0}</p>
                                </div>
                                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={20} color={color} />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {}
            <div style={{ marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input className="input" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
                </div>
            </div>

            {}
            <div className="card">
                {loading ? [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8 }} />) :
                    filtered.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(u => {
                                        const color = roleColors[u.role] || '#64748b';
                                        return (
                                            <tr key={u.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color }}>
                                                            {(u.first_name?.[0] || u.email[0]).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{u.first_name} {u.last_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                                                <td>
                                                    <span style={{ padding: '3px 10px', borderRadius: 20, background: `${color}15`, color, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(u.date_joined).toLocaleDateString()}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state"><Users /><h3>No users found</h3></div>
                    )}
            </div>
        </div>
    );
};
export default UsersPage;
