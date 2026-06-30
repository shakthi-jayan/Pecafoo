import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    IndianRupee,
    Sparkles,
    Target,
    TrendingUp,
    Truck,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { deliveryAPI } from '../../services/api';
import { GlassCard, PageHero } from '../../shared-ui/PremiumUI';

const chartGradient = ['#FF5A1F', '#FF7B47', '#FF9A70', '#FFC2AE'];

export default function EarningsDashboard() {
    const [today, setToday] = useState(null);
    const [summary, setSummary] = useState({});
    const [earnings, setEarnings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let intervalId;

        const load = async () => {
            try {
                const [todayRes, summaryRes, earningsRes] = await Promise.allSettled([
                    deliveryAPI.getTodayEarnings(),
                    deliveryAPI.getEarningsSummary(),
                    deliveryAPI.getEarnings(),
                ]);

                if (todayRes.status === 'fulfilled') {
                    setToday(todayRes.value.data);
                }
                if (summaryRes.status === 'fulfilled') {
                    setSummary(summaryRes.value.data);
                }
                if (earningsRes.status === 'fulfilled') {
                    setEarnings(earningsRes.value.data.results || earningsRes.value.data || []);
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        intervalId = window.setInterval(load, 30000);
        return () => window.clearInterval(intervalId);
    }, []);

    const weeklyChartData = useMemo(() => {
        const days = [];
        const todayDate = new Date();
        for (let offset = 6; offset >= 0; offset -= 1) {
            const date = new Date(todayDate);
            date.setDate(todayDate.getDate() - offset);
            days.push({
                key: date.toISOString().slice(0, 10),
                name: date.toLocaleDateString('en-IN', { weekday: 'short' }),
                total: 0,
            });
        }

        earnings.forEach((entry) => {
            const key = new Date(entry.earned_at).toISOString().slice(0, 10);
            const target = days.find((day) => day.key === key);
            if (target) {
                target.total += Number(entry.total || 0);
            }
        });

        return days;
    }, [earnings]);

    const maxBar = Math.max(...weeklyChartData.map((item) => item.total), 1);

    const statCards = [
        {
            label: "Today's total",
            value: `Rs ${Number(today?.total_earned || 0).toFixed(2)}`,
            icon: IndianRupee,
            tone: 'var(--accent)',
        },
        {
            label: 'Completed orders',
            value: today?.orders_completed || 0,
            icon: Truck,
            tone: 'var(--success)',
        },
        {
            label: 'This week',
            value: `Rs ${Number(summary.week_earnings || 0).toFixed(2)}`,
            icon: TrendingUp,
            tone: '#f59e0b',
        },
    ];

    const payoutBreakdown = [
        { label: 'Base pay', value: today?.breakdown?.base_pay_total || 0 },
        { label: 'Distance incentive', value: today?.breakdown?.distance_incentive_total || 0 },
        { label: 'Bonuses', value: today?.breakdown?.bonus_total || 0 },
    ];

    return (
        <div className="page earnings-page stack-safe" style={{ paddingBottom: 152 }}>
            <PageHero eyebrow="Earnings" title="Earnings Dashboard" description="Track payout components, slab progress, and weekly delivery trends." compact />

            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <GlassCard
                    id="earnings-hero-card"
                    padding="var(--space-6)"
                    style={{
                        marginBottom: 'var(--space-4)',
                        background: 'linear-gradient(135deg, #ff6f3d 0%, #ff5a1f 55%, #ff8f68 100%)',
                        color: 'white',
                        border: 'none',
                    }}
                >
                    <div className="earnings-hero-label" style={{ opacity: 0.85, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.74rem', fontWeight: 700, marginBottom: 8 }}>
                        Today&apos;s partner payout
                    </div>
                    <div className="earnings-hero-value" style={{ fontSize: 'var(--text-h1)', fontWeight: 900, lineHeight: 1 }}>
                        Rs {Number(today?.total_earned || 0).toFixed(2)}
                    </div>
                    <div className="earnings-hero-chips" style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
                        <SummaryChip label="Deliveries" value={today?.orders_completed || 0} />
                        <SummaryChip label="Total lifetime" value={`Rs ${Number(summary.total_earnings || 0).toFixed(2)}`} />
                    </div>
                </GlassCard>
            </motion.div>

            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: 'var(--space-4)' }}>
                {statCards.map(({ label, value, icon: Icon, tone }, index) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.06 }}
                    >
                        <GlassCard padding="var(--space-4)" style={{ height: '100%' }}>
                            <div style={{ width: 42, height: 42, borderRadius: 14, background: `${tone}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                <Icon size={20} color={tone} />
                            </div>
                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--color-text-primary)' }}>{value}</div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>

            <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Sparkles size={18} color="var(--brand-delivery)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>Payout Breakdown</h2>
                </div>
                <div style={{ display: 'grid', gap: 12 }}>
                    {payoutBreakdown.map((item) => (
                        <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: 14, background: 'var(--color-bg-elevated)' }}>
                            <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                            <span style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>Rs {Number(item.value || 0).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </GlassCard>

            <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Target size={18} color="var(--brand-delivery)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>Daily Incentive Slabs</h2>
                </div>
                {today?.slab_progress?.length ? (
                    <div style={{ display: 'grid', gap: 14 }}>
                        {today.slab_progress.map((slab) => {
                            const completed = today.orders_completed || 0;
                            const percent = Math.min((completed / slab.orders_required) * 100, 100);
                            return (
                                <div key={`${slab.orders_required}-${slab.bonus_amount}`}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--color-text-primary)' }}>{slab.orders_required} orders</div>
                                            <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>
                                                Bonus Rs {Number(slab.bonus_amount || 0).toFixed(2)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.82rem', color: slab.achieved ? 'var(--brand-delivery)' : 'var(--color-text-secondary)', fontWeight: 700 }}>
                                            {slab.achieved ? 'Achieved' : `${slab.orders_remaining} to go`}
                                        </div>
                                    </div>
                                    <div style={{ height: 10, borderRadius: 999, background: 'var(--color-bg-elevated)', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${percent}%`,
                                            height: '100%',
                                            borderRadius: 999,
                                            background: slab.achieved ? 'linear-gradient(90deg, #FF5A1F, #FF8C63)' : 'linear-gradient(90deg, rgba(255, 90, 31, 0.5), rgba(255, 90, 31, 0.9))',
                                        }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                        No active daily slabs yet.
                    </div>
                )}
            </GlassCard>

            <GlassCard padding="var(--space-5)" style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <BarChart3 size={18} color="var(--brand-delivery)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>Weekly Summary</h2>
                </div>
                <div className="earnings-chart-wrap" style={{ height: 240, minHeight: 240, minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={weeklyChartData} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255, 90, 31, 0.06)' }}
                                contentStyle={{
                                    borderRadius: 16,
                                    border: '1px solid var(--border)',
                                    boxShadow: 'var(--shadow-elevation)',
                                }}
                                formatter={(value) => [`Rs ${Number(value).toFixed(2)}`, 'Earnings']}
                            />
                            <Bar dataKey="total" radius={[10, 10, 0, 0]} maxBarSize={42}>
                                {weeklyChartData.map((entry, index) => (
                                    <Cell
                                        key={entry.key}
                                        fill={entry.total === maxBar ? '#FF5A1F' : chartGradient[index % chartGradient.length]}
                                        fillOpacity={entry.total === maxBar ? 1 : 0.72}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {!loading && !earnings.length ? (
                    <div style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        Weekly bars will populate as completed deliveries are credited.
                    </div>
                ) : null}
            </GlassCard>
        </div>
    );
}

function SummaryChip({ label, value }) {
    return (
        <div className="earnings-summary-chip" style={{
            padding: '10px 12px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.14)',
            minWidth: 130,
        }}>
            <div className="earnings-summary-chip-label" style={{ fontSize: '0.72rem', opacity: 0.82, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                {label}
            </div>
            <div className="earnings-summary-chip-value" style={{ fontWeight: 800, marginTop: 4 }}>
                {value}
            </div>
        </div>
    );
}
