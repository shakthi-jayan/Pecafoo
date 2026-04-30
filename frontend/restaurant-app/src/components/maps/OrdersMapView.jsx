
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM,
    createMarkerIcon, createPulsingIcon, MAP_CHROME_CSS,
} from '../../config/mapConfig';

if (typeof document !== 'undefined' && !document.getElementById('map-chrome-css')) {
    const style = document.createElement('style');
    style.id = 'map-chrome-css';
    style.textContent = MAP_CHROME_CSS;
    document.head.appendChild(style);
}

function FitToMarkers({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length >= 2) {
            map.fitBounds(L.latLngBounds(positions), { padding: [40, 40], maxZoom: 15 });
        } else if (positions.length === 1) {
            map.flyTo(positions[0], 14);
        }
    }, [positions, map]);
    return null;
}

export default function OrdersMapView({ orders = [], restaurant = null, height = 400, className = '' }) {
    const customerIcon = createMarkerIcon(L, 'order_drop');
    const restaurantIcon = createMarkerIcon(L, 'restaurant');
    const deliveryIcon = createPulsingIcon(L, '#f59e0b');

    
    const mappableOrders = orders.filter(
        (o) => o.delivery_latitude && o.delivery_longitude
    );

    const restaurantPos = restaurant?.latitude && restaurant?.longitude
        ? [parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]
        : null;

    const allPositions = [
        restaurantPos,
        ...mappableOrders.map((o) => [parseFloat(o.delivery_latitude), parseFloat(o.delivery_longitude)]),
    ].filter(Boolean);

    const center = restaurantPos || DEFAULT_CENTER;

    const getStatusColor = (status) => {
        const colors = {
            placed: '#ef4444',
            confirmed: '#f59e0b',
            preparing: '#3b82f6',
            ready: '#8b5cf6',
            picked_up: '#10b981',
            on_the_way: '#10b981',
            delivered: '#6b7280',
        };
        return colors[status] || '#888';
    };

    return (
        <div className={`orders-map ${className}`}>
            <MapContainer
                center={center}
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
                <FitToMarkers positions={allPositions} />

                {}
                {restaurantPos && (
                    <Marker position={restaurantPos} icon={restaurantIcon}>
                        <Popup><strong>🍕 Your Restaurant</strong></Popup>
                    </Marker>
                )}

                {}
                {mappableOrders.map((order) => {
                    const pos = [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)];
                    const statusColor = getStatusColor(order.status);

                    return (
                        <Marker key={order.id} position={pos} icon={customerIcon}>
                            <Popup>
                                <div style={{ minWidth: 160 }}>
                                    <strong>Order #{order.order_number}</strong>
                                    <div style={{
                                        marginTop: 4, padding: '2px 8px',
                                        background: statusColor, color: 'white',
                                        borderRadius: 4, fontSize: 11, display: 'inline-block',
                                    }}>
                                        {order.status}
                                    </div>
                                    <div style={{ fontSize: 12, marginTop: 4 }}>
                                        📍 {order.delivery_address}
                                    </div>
                                    <div style={{ fontSize: 12 }}>
                                        💰 ₹{order.total} · {order.items?.length || 0} items
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {}
                {restaurantPos && mappableOrders.map((order) => {
                    const dest = [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)];
                    return (
                        <Polyline
                            key={`route-${order.id}`}
                            positions={[restaurantPos, dest]}
                            pathOptions={{
                                color: getStatusColor(order.status),
                                weight: 2,
                                opacity: 0.4,
                                dashArray: '8, 6',
                            }}
                        />
                    );
                })}
            </MapContainer>
        </div>
    );
}
