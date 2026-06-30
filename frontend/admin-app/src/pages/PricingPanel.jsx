import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Clock3, Percent, Settings2, Sparkles, Target, Truck } from 'lucide-react';
import { deliveryAPI } from '../services/api';

const defaultPricing = {
    base_fee: '35.00',
    per_km_rate: '8.00',
    base_distance_km: '3',
    min_order_fee_threshold: '199.00',
    small_cart_fee: '20.00',
    platform_margin_percent: '18',
};

const defaultPayout = {
    base_pay: '28.00',
    per_km_incentive: '5.00',
    peak_hour_bonus: '10.00',
    rain_bonus: '15.00',
    long_distance_threshold_km: '8',
    long_distance_bonus: '20.00',
};

const defaultSurge = {
    name: '',
    multiplier: '1.25',
    trigger_type: 'manual',
    start_time: '',
    end_time: '',
    days_of_week: '',
    is_active: true,
    priority: 10,
};

const defaultSlab = {
    period: 'daily',
    orders_required: 8,
    bonus_amount: '80.00',
    is_active: true,
};

export default function PricingPanel() {
    const [pricingForm, setPricingForm] = useState(defaultPricing);
    const [payoutForm, setPayoutForm] = useState(defaultPayout);
    const [surges, setSurges] = useState([]);
    const [slabs, setSlabs] = useState([]);
    const [manualSurge, setManualSurge] = useState(defaultSurge);
    const [slabForm, setSlabForm] = useState(defaultSlab);
    const [editingSlabId, setEditingSlabId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await deliveryAPI.getPricingConfig();
            if (data.delivery_pricing) {
                setPricingForm(toStringForm(data.delivery_pricing, defaultPricing));
            }
            if (data.partner_payout) {
                setPayoutForm(toStringForm(data.partner_payout, defaultPayout));
            }
            setSurges(data.surges || []);
            setSlabs(data.incentive_slabs || []);
        } catch {
            toast.error('Failed to load pricing configuration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const activeSurgeCount = useMemo(
        () => surges.filter((surge) => surge.is_active).length,
        [surges],
    );

    const saveConfigs = async () => {
        setSaving(true);
        try {
            await deliveryAPI.updatePricingConfig({
                delivery_pricing: normalizePayload(pricingForm),
                partner_payout: normalizePayload(payoutForm),
            });
            toast.success('Pricing configuration updated.');
            await load();
        } catch {
            toast.error('Failed to update pricing configuration.');
        } finally {
            setSaving(false);
        }
    };

    const createSurge = async () => {
        setSaving(true);
        try {
            await deliveryAPI.createSurge({
                ...normalizePayload(manualSurge),
                days_of_week: manualSurge.days_of_week
                    ? manualSurge.days_of_week.split(',').map((day) => Number(day.trim())).filter((day) => Number.isInteger(day))
                    : null,
            });
            toast.success('Surge rule created.');
            setManualSurge(defaultSurge);
            await load();
        } catch {
            toast.error('Failed to create surge rule.');
        } finally {
            setSaving(false);
        }
    };

    const toggleSurge = async (surge) => {
        try {
            await deliveryAPI.updateSurge(surge.id, { is_active: !surge.is_active });
            toast.success(`${surge.name} ${surge.is_active ? 'deactivated' : 'activated'}.`);
            await load();
        } catch {
            toast.error('Failed to update surge rule.');
        }
    };

    const saveSlab = async () => {
        setSaving(true);
        try {
            const payload = normalizePayload(slabForm);
            if (editingSlabId) {
                await deliveryAPI.updateIncentiveSlab(editingSlabId, payload);
                toast.success('Incentive slab updated.');
            } else {
                await deliveryAPI.createIncentiveSlab(payload);
                toast.success('Incentive slab created.');
            }
            setSlabForm(defaultSlab);
            setEditingSlabId(null);
            await load();
        } catch {
            toast.error('Failed to save incentive slab.');
        } finally {
            setSaving(false);
        }
    };

    const removeSlab = async (id) => {
        try {
            await deliveryAPI.deleteIncentiveSlab(id);
            toast.success('Incentive slab removed.');
            await load();
        } catch {
            toast.error('Failed to delete incentive slab.');
        }
    };

    if (loading) {
        return (
            <div>
                <div className="page-header"><h1 className="page-title">Pricing Panel</h1></div>
                {[1, 2, 3].map((item) => (
                    <div key={item} className="skeleton" style={{ height: 120, marginBottom: 16, borderRadius: 20 }} />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Pricing Panel</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>
                        Manage delivery pricing, partner payouts, surge rules, and incentive slabs.
                    </p>
                </div>
            </div>

            <div className="stat-grid" style={{ marginBottom: 16 }}>
                <MetricCard icon={Truck} label="Base fee" value={`Rs ${pricingForm.base_fee}`} />
                <MetricCard icon={Percent} label="Margin %" value={pricingForm.platform_margin_percent} />
                <MetricCard icon={Sparkles} label="Active surges" value={activeSurgeCount} />
                <MetricCard icon={Target} label="Active slabs" value={slabs.filter((slab) => slab.is_active).length} />
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Settings2 size={18} color="var(--accent)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>Customer Pricing + Partner Payout</h2>
                </div>

                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                    <ConfigForm
                        title="Delivery Pricing"
                        fields={[
                            ['base_fee', 'Base fee'],
                            ['per_km_rate', 'Per km rate'],
                            ['base_distance_km', 'Base distance km'],
                            ['min_order_fee_threshold', 'Small cart threshold'],
                            ['small_cart_fee', 'Small cart fee'],
                            ['platform_margin_percent', 'Platform margin %'],
                        ]}
                        values={pricingForm}
                        onChange={setPricingForm}
                    />
                    <ConfigForm
                        title="Partner Payout"
                        fields={[
                            ['base_pay', 'Base pay'],
                            ['per_km_incentive', 'Per km incentive'],
                            ['peak_hour_bonus', 'Peak hour bonus'],
                            ['rain_bonus', 'Rain bonus'],
                            ['long_distance_threshold_km', 'Long distance threshold'],
                            ['long_distance_bonus', 'Long distance bonus'],
                        ]}
                        values={payoutForm}
                        onChange={setPayoutForm}
                    />
                </div>

                <div style={{ marginTop: 18 }}>
                    <button className="btn btn-primary" onClick={saveConfigs} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Pricing Config'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Sparkles size={18} color="var(--accent)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>Surge Rules</h2>
                </div>

                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(260px, 340px) minmax(0, 1fr)' }}>
                    <div style={{ padding: 16, borderRadius: 18, background: 'var(--bg-elevated)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 12 }}>Create Surge</div>
                        <StackField label="Label">
                            <input className="input" value={manualSurge.name} onChange={(event) => setManualSurge((prev) => ({ ...prev, name: event.target.value }))} />
                        </StackField>
                        <StackField label="Multiplier">
                            <input className="input" value={manualSurge.multiplier} onChange={(event) => setManualSurge((prev) => ({ ...prev, multiplier: event.target.value }))} />
                        </StackField>
                        <StackField label="Trigger type">
                            <select className="input" value={manualSurge.trigger_type} onChange={(event) => setManualSurge((prev) => ({ ...prev, trigger_type: event.target.value }))}>
                                <option value="manual">Manual</option>
                                <option value="time_window">Time window</option>
                                <option value="weather">Weather</option>
                            </select>
                        </StackField>
                        <StackField label="Days of week (0-6 comma separated)">
                            <input className="input" value={manualSurge.days_of_week} onChange={(event) => setManualSurge((prev) => ({ ...prev, days_of_week: event.target.value }))} />
                        </StackField>
                        <div className="auth-split-row">
                            <StackField label="Start time">
                                <input className="input" type="time" value={manualSurge.start_time} onChange={(event) => setManualSurge((prev) => ({ ...prev, start_time: event.target.value }))} />
                            </StackField>
                            <StackField label="End time">
                                <input className="input" type="time" value={manualSurge.end_time} onChange={(event) => setManualSurge((prev) => ({ ...prev, end_time: event.target.value }))} />
                            </StackField>
                        </div>
                        <StackField label="Priority">
                            <input className="input" type="number" value={manualSurge.priority} onChange={(event) => setManualSurge((prev) => ({ ...prev, priority: event.target.value }))} />
                        </StackField>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 14 }}>
                            <input type="checkbox" checked={manualSurge.is_active} onChange={(event) => setManualSurge((prev) => ({ ...prev, is_active: event.target.checked }))} />
                            Activate immediately
                        </label>
                        <button className="btn btn-primary" onClick={createSurge} disabled={saving || !manualSurge.name.trim()}>
                            Create Surge
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Trigger</th>
                                    <th>Multiplier</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {surges.map((surge) => (
                                    <tr key={surge.id}>
                                        <td style={{ fontWeight: 700 }}>{surge.name}</td>
                                        <td>{surge.trigger_type}</td>
                                        <td>{surge.multiplier}x</td>
                                        <td>{surge.priority}</td>
                                        <td>
                                            <span className={`badge ${surge.is_active ? 'badge-success' : 'badge-warning'}`}>
                                                {surge.is_active ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" onClick={() => toggleSurge(surge)}>
                                                {surge.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Clock3 size={18} color="var(--accent)" />
                    <h2 style={{ fontWeight: 800, fontSize: '1rem' }}>Incentive Slabs</h2>
                </div>

                <div style={{ display: 'grid', gap: 20, gridTemplateColumns: 'minmax(260px, 320px) minmax(0, 1fr)' }}>
                    <div style={{ padding: 16, borderRadius: 18, background: 'var(--bg-elevated)' }}>
                        <div style={{ fontWeight: 700, marginBottom: 12 }}>
                            {editingSlabId ? 'Edit Slab' : 'Add Slab'}
                        </div>
                        <StackField label="Period">
                            <select className="input" value={slabForm.period} onChange={(event) => setSlabForm((prev) => ({ ...prev, period: event.target.value }))}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                            </select>
                        </StackField>
                        <StackField label="Orders required">
                            <input className="input" type="number" value={slabForm.orders_required} onChange={(event) => setSlabForm((prev) => ({ ...prev, orders_required: event.target.value }))} />
                        </StackField>
                        <StackField label="Bonus amount">
                            <input className="input" value={slabForm.bonus_amount} onChange={(event) => setSlabForm((prev) => ({ ...prev, bonus_amount: event.target.value }))} />
                        </StackField>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: 14 }}>
                            <input type="checkbox" checked={slabForm.is_active} onChange={(event) => setSlabForm((prev) => ({ ...prev, is_active: event.target.checked }))} />
                            Active slab
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-primary" onClick={saveSlab} disabled={saving}>
                                {editingSlabId ? 'Update Slab' : 'Create Slab'}
                            </button>
                            {editingSlabId ? (
                                <button className="btn btn-secondary" onClick={() => { setEditingSlabId(null); setSlabForm(defaultSlab); }}>
                                    Cancel
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Period</th>
                                    <th>Orders</th>
                                    <th>Bonus</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {slabs.map((slab) => (
                                    <tr key={slab.id}>
                                        <td>{slab.period}</td>
                                        <td>{slab.orders_required}</td>
                                        <td>Rs {Number(slab.bonus_amount || 0).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${slab.is_active ? 'badge-success' : 'badge-warning'}`}>
                                                {slab.is_active ? 'active' : 'inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                <button className="btn btn-secondary" onClick={() => { setEditingSlabId(slab.id); setSlabForm(toStringForm(slab, defaultSlab)); }}>
                                                    Edit
                                                </button>
                                                <button className="btn" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }} onClick={() => removeSlab(slab.id)}>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value }) {
    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255, 90, 31, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color="var(--accent)" />
                </div>
            </div>
        </div>
    );
}

function ConfigForm({ title, fields, values, onChange }) {
    return (
        <div style={{ padding: 16, borderRadius: 18, background: 'var(--bg-elevated)' }}>
            <div style={{ fontWeight: 700, marginBottom: 12 }}>{title}</div>
            <div style={{ display: 'grid', gap: 12 }}>
                {fields.map(([key, label]) => (
                    <StackField key={key} label={label}>
                        <input
                            className="input"
                            value={values[key] ?? ''}
                            onChange={(event) => onChange((prev) => ({ ...prev, [key]: event.target.value }))}
                        />
                    </StackField>
                ))}
            </div>
        </div>
    );
}

function StackField({ label, children }) {
    return (
        <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{label}</span>
            {children}
        </label>
    );
}

function toStringForm(source, fallback) {
    return Object.keys(fallback).reduce((accumulator, key) => {
        const value = source?.[key];
        accumulator[key] = typeof fallback[key] === 'boolean'
            ? Boolean(value)
            : value ?? fallback[key];
        return accumulator;
    }, {});
}

function normalizePayload(form) {
    return Object.entries(form).reduce((accumulator, [key, value]) => {
        if (typeof value === 'boolean') {
            accumulator[key] = value;
            return accumulator;
        }
        if (value === '') {
            accumulator[key] = null;
            return accumulator;
        }

        const numericKeys = new Set([
            'base_fee',
            'per_km_rate',
            'base_distance_km',
            'min_order_fee_threshold',
            'small_cart_fee',
            'platform_margin_percent',
            'base_pay',
            'per_km_incentive',
            'peak_hour_bonus',
            'rain_bonus',
            'long_distance_threshold_km',
            'long_distance_bonus',
            'multiplier',
            'priority',
            'orders_required',
            'bonus_amount',
        ]);

        accumulator[key] = numericKeys.has(key) ? Number(value) : value;
        return accumulator;
    }, {});
}
