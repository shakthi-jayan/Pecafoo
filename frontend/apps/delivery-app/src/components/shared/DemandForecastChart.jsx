import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DemandForecastChart = ({ data, style = { width: '100%', height: 250 } }) => {
    
    if (!data || data.length === 0) return <div className="skeleton" style={style}></div>;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const dataPoint = payload[0].payload;
            return (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{dataPoint.time}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                        <strong style={{ color: dataPoint.is_peak ? 'var(--danger)' : 'var(--accent)' }}>
                            {dataPoint.predicted_orders}
                        </strong> expected orders
                    </p>
                    {dataPoint.is_peak && <span className="badge badge-danger" style={{ marginTop: 4 }}>Peak Hour</span>}
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ minWidth: 0, minHeight: 250, width: '100%', ...style }}>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-card-hover)', opacity: 0.5 }} />
                    <Bar dataKey="predicted_orders" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.is_peak ? 'var(--danger)' : 'var(--accent)'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DemandForecastChart;
