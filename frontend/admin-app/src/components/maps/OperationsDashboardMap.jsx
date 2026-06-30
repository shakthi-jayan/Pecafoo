
import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM,
    createMarkerIcon, MAP_CHROME_CSS,
} from '../../config/mapConfig';
import api from '../../services/api';

if (typeof document !== 'undefined' && !document.getElementById('map-chrome-css')) {
    const style = document.createElement('style');
    style.id = 'map-chrome-css';
    style.textContent = MAP_CHROME_CSS;
    document.head.appendChild(style);
}

export default function OperationsDashboardMap({ height = 500, className = '' }) {
    const [partners, setPartners] = useState([]);
    const [serviceAreas, setServiceAreas] = useState([]);
    const [stats, setStats] = useState({ total: 0, available: 0, on_delivery: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedPartner, setSelectedPartner] = useState(null);

    // Fetch active delivery partners
    const fetchPartners = useCallback(async () => {
        try {
            const { data } = await api.get('/locations/active-partners/');
            setPartners(data.partners || []);
            setStats({
                total: data.total || 0,
                available: data.available || 0,
                on_delivery: data.on_delivery || 0,
            });
        } catch (err) {
            console.error('Failed to fetch partners:', err);
        }
    }, []);

    // Fetch service area boundaries
    const fetchServiceAreas = useCallback(async () => {
        try {
            const { data } = await api.get('/locations/service-area/');
            setServiceAreas(data.results || data || []);
        } catch (err) {
            console.error('Failed to fetch service areas:', err);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchPartners(), fetchServiceAreas()]).finally(() => setLoading(false));

        // Refresh every 15 seconds
        const interval = setInterval(fetchPartners, 15000);
        return () => clearInterval(interval);
    }, [fetchPartners, fetchServiceAreas]);

    // Create status-based icons
    const getPartnerIcon = (status) => {
        const iconType = status === 'available' ? 'delivery_available'
            : status === 'on_delivery' ? 'delivery_busy'
                : 'delivery_offline';
        return createMarkerIcon(L, iconType);
    };

    
    const getPolygonCoords = (boundary) => {
        try {
            const geometry = boundary.type === 'Feature' ? boundary.geometry : boundary;
            if (geometry?.type === 'Polygon') {
                return geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
            }
        } catch { }
        return [];
    };

    return (
        <div className={`ops-dashboard-map ${className}`} style={{ position: 'relative' }}>
            {}
            <div style={{
                position: 'absolute', top: 12, left: 12, zIndex: 1000,
                display: 'flex', gap: 8,
            }}>
                <div style={statBadgeStyle('#10b981')}>
                    🟢 {stats.available} Available
                </div>
                <div style={statBadgeStyle('#f59e0b')}>
                    🟡 {stats.on_delivery} On Delivery
                </div>
                <div style={statBadgeStyle('#6b7280')}>
                    👥 {stats.total} Total
                </div>
            </div>

            <MapContainer
                center={DEFAULT_CENTER}
                zoom={DEFAULT_ZOOM}
                style={{ height, width: '100%', borderRadius: 16 }}
                className="pecafoo-map"
                zoomControl={false}
                attributionControl={false}
                scrollWheelZoom
                touchZoom
                doubleClickZoom
                zoomSnap={0.25}
                zoomDelta={0.5}
            >
                <ZoomControl position="bottomright" />
                <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />

                {}
                {serviceAreas.map((area) => {
                    const coords = getPolygonCoords(area.boundary);
                    if (coords.length === 0) return null;
                    return (
                        <Polygon
                            key={area.id}
                            positions={coords}
                            pathOptions={{
                                color: '#6366f1',
                                fillColor: '#6366f120',
                                weight: 2,
                                dashArray: '10, 5',
                            }}
                        />
                    );
                })}

                {}
                {partners.map((partner) => (
                    <Marker
                        key={partner.id}
                        position={[partner.latitude, partner.longitude]}
                        icon={getPartnerIcon(partner.status)}
                        eventHandlers={{
                            click: () => setSelectedPartner(partner),
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: 180 }}>
                                <strong style={{ fontSize: 14 }}>🛵 {partner.name}</strong>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                    {partner.email}
                                </div>
                                <div style={{
                                    marginTop: 6, padding: '3px 8px', borderRadius: 4,
                                    fontSize: 11, fontWeight: 600, display: 'inline-block',
                                    background: partner.status === 'available' ? '#dcfce7' :
                                        partner.status === 'on_delivery' ? '#fef3c7' : '#f3f4f6',
                                    color: partner.status === 'available' ? '#166534' :
                                        partner.status === 'on_delivery' ? '#92400e' : '#374151',
                                }}>
                                    {partner.status.replace('_', ' ').toUpperCase()}
                                </div>
                                <div style={{ fontSize: 12, marginTop: 4 }}>
                                    🚗 {partner.vehicle_type || 'N/A'} · ⭐ {partner.average_rating}
                                </div>
                                <div style={{ fontSize: 12 }}>
                                    📦 {partner.total_deliveries} deliveries
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {}
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(18,18,30,0.7)', borderRadius: 16, zIndex: 1001,
                }}>
                    <div style={{ color: '#a3a3b3', fontSize: 14 }}>Loading map data...</div>
                </div>
            )}
        </div>
    );
}

const statBadgeStyle = (color) => ({
    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    color: '#f0f0f5',
    padding: '6px 14px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
    border: `1px solid ${color}40`,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
});
