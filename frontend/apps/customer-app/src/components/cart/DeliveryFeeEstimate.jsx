import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Sparkles, Truck } from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import { deliveryPricingStore } from '../../stores/useDeliveryPricingStore';

const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function DeliveryFeeEstimate({
    restaurantId,
    cartValue,
    customerLat,
    customerLng,
    onEstimateChange,
}) {
    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!restaurantId || !customerLat || !customerLng || cartValue <= 0) {
            setEstimate(null);
            setError('');
            deliveryPricingStore.clearEstimate();
            onEstimateChange?.(null);
            return undefined;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setError('');
            deliveryPricingStore.setIsFetchingEstimate(true);
            try {
                const { data } = await deliveryAPI.estimateFee({
                    restaurant_id: restaurantId,
                    customer_lat: customerLat,
                    customer_lng: customerLng,
                    cart_value: cartValue,
                });
                setEstimate(data);
                deliveryPricingStore.setEstimate(data);
                onEstimateChange?.(data);
            } catch (err) {
                const message = err.response?.data?.error || 'Unable to estimate delivery fee right now.';
                setEstimate(null);
                setError(message);
                deliveryPricingStore.clearEstimate();
                onEstimateChange?.(null);
            } finally {
                setLoading(false);
                deliveryPricingStore.setIsFetchingEstimate(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [cartValue, customerLat, customerLng, onEstimateChange, restaurantId]);

    const savings = Number(estimate?.membership_savings || 0);

    return (
        <div className="card" style={{ padding: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 14,
                        background: 'rgba(255, 90, 31, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Truck size={18} color="var(--accent)" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 800 }}>Delivery Fee Estimate</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            Calculated using live road distance
                        </div>
                    </div>
                </div>
                {loading ? <Loader2 size={18} className="spin" /> : null}
            </div>

            {error ? (
                <div style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    padding: 12,
                    borderRadius: 14,
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: 'var(--danger)',
                }}>
                    <AlertCircle size={18} />
                    <span style={{ fontSize: '0.88rem' }}>{error}</span>
                </div>
            ) : null}

            {!error && estimate ? (
                <>
                    <div style={{ display: 'grid', gap: 10 }}>
                        <EstimateRow label={`Base fee (${Number(estimate.distance_km || 0).toFixed(1)} km)`} value={estimate.base_fee} />
                        <EstimateRow label="Distance fee" value={estimate.distance_fee} />
                        {Number(estimate.surge_fee || 0) > 0 ? (
                            <EstimateRow
                                label={estimate.surge_label ? `${estimate.surge_label} surge` : 'Surge fee'}
                                value={estimate.surge_fee}
                                highlight
                            />
                        ) : null}
                        {Number(estimate.small_cart_fee || 0) > 0 ? (
                            <EstimateRow
                                label="Small cart fee"
                                value={estimate.small_cart_fee}
                                helper="Applied when the order total is below the minimum fee threshold."
                            />
                        ) : null}
                        {savings > 0 ? (
                            <EstimateRow
                                label="Membership savings"
                                value={-savings}
                                positive
                                helper="Your membership absorbed the active surge fee."
                            />
                        ) : null}
                    </div>

                    <div style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <div style={{ fontWeight: 800 }}>Total delivery fee</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                Final fee is saved with the order for transparency
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, color: 'var(--accent)', fontSize: '1.1rem' }}>
                                {currency(estimate.total_delivery_fee || 0)}
                            </div>
                            {estimate.surge_active ? (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    marginTop: 4,
                                    padding: '4px 8px',
                                    borderRadius: 999,
                                    background: 'rgba(255, 90, 31, 0.08)',
                                    color: 'var(--accent)',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                }}>
                                    <Sparkles size={12} /> Surge active
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function EstimateRow({ label, value, helper, highlight = false, positive = false }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ color: highlight ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: highlight ? 700 : 500 }}>
                    {label}
                </span>
                <span style={{ fontWeight: 700, color: positive ? 'var(--success)' : 'var(--text-primary)' }}>
                    {positive ? '-' : ''}{currency(Math.abs(Number(value || 0)))}
                </span>
            </div>
            {helper ? (
                <div style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                    {helper}
                </div>
            ) : null}
        </div>
    );
}
