
export const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const OSM_ATTRIBUTION = '';

export const DEFAULT_CENTER = [19.076, 72.8777];
export const DEFAULT_ZOOM = 13;

export const MARKER_COLORS = {
    restaurant: '#ff5a1f',
    customer: '#2563eb',
    delivery: '#16a34a',
    deliveryActive: '#f59e0b',
    orderPin: '#ef4444',
    default: '#ff5a1f',
};

export function createMarkerIcon(L, type = 'default') {
    const configs = {
        restaurant: { color: MARKER_COLORS.restaurant, size: 38 },
        customer: { color: MARKER_COLORS.customer, size: 38 },
        delivery: { color: MARKER_COLORS.delivery, size: 38 },
        delivery_available: { color: MARKER_COLORS.delivery, size: 34 },
        delivery_busy: { color: MARKER_COLORS.deliveryActive, size: 34 },
        delivery_offline: { color: '#6b7280', size: 34 },
        order_drop: { color: MARKER_COLORS.orderPin, size: 38 },
        default: { color: MARKER_COLORS.default, size: 36 },
    };

    const config = configs[type] || configs.default;
    const dotSize = Math.round(config.size * 0.3);

    return L.divIcon({
        className: 'pecafoo-map-marker',
        html: `
            <div style="width:${config.size}px;height:${config.size + 10}px;display:flex;align-items:flex-start;justify-content:center;">
                <div style="
                    width:${config.size}px;
                    height:${config.size}px;
                    background:${config.color};
                    border-radius:50% 50% 50% 0;
                    transform:rotate(-45deg);
                    border:3px solid #ffffff;
                    box-shadow:0 14px 28px rgba(15, 23, 42, 0.24);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                ">
                    <div style="
                        width:${dotSize}px;
                        height:${dotSize}px;
                        background:#ffffff;
                        border-radius:999px;
                        transform:rotate(45deg);
                    "></div>
                </div>
            </div>
        `,
        iconSize: [config.size, config.size + 10],
        iconAnchor: [config.size / 2, config.size + 2],
        popupAnchor: [0, -config.size + 2],
    });
}

export function createPulsingIcon(L, color = MARKER_COLORS.delivery) {
    return L.divIcon({
        className: 'pecafoo-pulsing-marker',
        html: `
            <div style="position:relative;width:22px;height:22px;">
                <div style="
                    position:absolute;
                    inset:0;
                    background:${color};
                    border-radius:999px;
                    border:3px solid #ffffff;
                    box-shadow:0 0 0 8px ${color}22;
                    z-index:2;
                "></div>
                <div style="
                    position:absolute;
                    inset:0;
                    background:${color}55;
                    border-radius:999px;
                    animation:pecafoo-pulse-ring 1.8s ease-out infinite;
                    z-index:1;
                "></div>
            </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
    });
}

export const MAP_CHROME_CSS = `
@keyframes pecafoo-pulse-ring {
    0% { transform: scale(1); opacity: 0.95; }
    100% { transform: scale(2.8); opacity: 0; }
}

.pecafoo-map-marker,
.pecafoo-pulsing-marker {
    background: transparent !important;
    border: none !important;
}

.pecafoo-map .leaflet-control-attribution {
    display: none !important;
}

.pecafoo-map .leaflet-control-zoom {
    border: none !important;
    border-radius: 18px !important;
    overflow: hidden;
    box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18) !important;
    margin: 0 14px 18px 0 !important;
}

.pecafoo-map .leaflet-control-zoom a {
    width: 46px;
    height: 46px;
    line-height: 44px;
    font-size: 22px;
    font-weight: 600;
    color: #0f172a;
    background: rgba(255, 255, 255, 0.96);
    border: none !important;
}

.pecafoo-map .leaflet-control-zoom a:hover {
    background: #fff7f2;
    color: #ff5a1f;
}

.pecafoo-map .leaflet-control-zoom a:first-child {
    border-bottom: 1px solid #e5e7eb !important;
}

.pecafoo-map .leaflet-bar a.leaflet-disabled {
    background: #f3f4f6;
    color: #94a3b8;
}
`;

export const PULSE_CSS = MAP_CHROME_CSS;
