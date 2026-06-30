
import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    OSM_TILE_URL, OSM_ATTRIBUTION, DEFAULT_CENTER, DEFAULT_ZOOM,
    createMarkerIcon, createPulsingIcon, MAP_CHROME_CSS,
} from '../../config/mapConfig';
import { deliveryAPI, ordersAPI } from '../../services/api';
import api from '../../services/api';

if (typeof document !== 'undefined' && !document.getElementById('map-chrome-css')) {
    const style = document.createElement('style');
    style.id = 'map-chrome-css';
    style.textContent = MAP_CHROME_CSS;
    document.head.appendChild(style);
}

function AutoCenterMap({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) map.panTo(position, { animate: true, duration: 0.5 });
    }, [position, map]);
    return null;
}

export default function DeliveryNavigationMap({ activeOrder, height = '100%', className = '' }) {
    const [currentPosition, setCurrentPosition] = useState(null);
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeInfo, setRouteInfo] = useState(null);
    const [nearPickup, setNearPickup] = useState(false);
    const [nearDropoff, setNearDropoff] = useState(false);
    const watchIdRef = useRef(null);

    // Watch GPS position
    useEffect(() => {
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const loc = [pos.coords.latitude, pos.coords.longitude];
                setCurrentPosition(loc);

                // Send location to backend
                deliveryAPI.updateLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    order_id: activeOrder?.id,
                }).catch(() => { });
            },
            (err) => console.error('GPS error:', err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
        );

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [activeOrder]);

    // Fetch route for active order
    useEffect(() => {
        if (!activeOrder?.id) return;

        api.get(`/locations/orders/${activeOrder.id}/route/`)
            .then(({ data }) => {
                setRouteInfo(data);
                if (data.route_geojson?.geometry?.coordinates) {
                    const coords = data.route_geojson.geometry.coordinates.map(
                        ([lng, lat]) => [lat, lng]
                    );
                    setRouteCoords(coords);
                }
            })
            .catch(() => { });
    }, [activeOrder]);

    // Geofence proximity detection
    useEffect(() => {
        if (!currentPosition || !activeOrder) return;

        const restaurantPos = activeOrder.restaurant_latitude && activeOrder.restaurant_longitude
            ? [parseFloat(activeOrder.restaurant_latitude), parseFloat(activeOrder.restaurant_longitude)]
            : null;
        const customerPos = activeOrder.delivery_latitude && activeOrder.delivery_longitude
            ? [parseFloat(activeOrder.delivery_latitude), parseFloat(activeOrder.delivery_longitude)]
            : null;

        if (restaurantPos) {
            const dist = L.latLng(currentPosition).distanceTo(L.latLng(restaurantPos));
            setNearPickup(dist <= 150);
        }
        if (customerPos) {
            const dist = L.latLng(currentPosition).distanceTo(L.latLng(customerPos));
            setNearDropoff(dist <= 200);
        }
    }, [currentPosition, activeOrder]);

    // Icons
    const deliveryIcon = createPulsingIcon(L, '#10b981');
    const restaurantIcon = createMarkerIcon(L, 'restaurant');
    const customerIcon = createMarkerIcon(L, 'customer');

    const restaurantPos = activeOrder?.restaurant_latitude && activeOrder?.restaurant_longitude
        ? [parseFloat(activeOrder.restaurant_latitude), parseFloat(activeOrder.restaurant_longitude)]
        : null;
    const customerPos = activeOrder?.delivery_latitude && activeOrder?.delivery_longitude
        ? [parseFloat(activeOrder.delivery_latitude), parseFloat(activeOrder.delivery_longitude)]
        : null;

    const isBeforePickup = activeOrder && ['confirmed', 'preparing', 'ready'].includes(activeOrder.status);
    const isAfterPickup = activeOrder && ['picked_up', 'on_the_way'].includes(activeOrder.status);

    return (
        <div className={`delivery-nav-map ${className}`} style={{ position: 'relative' }}>
            <MapContainer
                center={currentPosition || DEFAULT_CENTER}
                zoom={15}
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
                {currentPosition && <AutoCenterMap position={currentPosition} />}

                {}
                {routeCoords.length > 0 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: isBeforePickup ? '#f59e0b' : '#6366f1',
                            weight: 5,
                            opacity: 0.85,
                        }}
                    />
                )}

                {}
                {currentPosition && (
                    <Marker position={currentPosition} icon={deliveryIcon}>
                        <Popup>📍 You are here</Popup>
                    </Marker>
                )}

                {}
                {restaurantPos && (
                    <>
                        <Marker position={restaurantPos} icon={restaurantIcon}>
                            <Popup>🍕 {activeOrder.restaurant_name} — Pickup</Popup>
                        </Marker>
                        {}
                        <Circle
                            center={restaurantPos}
                            radius={150}
                            pathOptions={{
                                color: nearPickup ? '#10b981' : '#f59e0b',
                                fillColor: nearPickup ? '#10b98140' : '#f59e0b20',
                                weight: 2,
                                dashArray: '5, 5',
                            }}
                        />
                    </>
                )}

                {}
                {customerPos && (
                    <>
                        <Marker position={customerPos} icon={customerIcon}>
                            <Popup>📦 Delivery — {activeOrder.delivery_address}</Popup>
                        </Marker>
                        <Circle
                            center={customerPos}
                            radius={200}
                            pathOptions={{
                                color: nearDropoff ? '#10b981' : '#6366f1',
                                fillColor: nearDropoff ? '#10b98140' : '#6366f120',
                                weight: 2,
                                dashArray: '5, 5',
                            }}
                        />
                    </>
                )}
            </MapContainer>

            {}
            <div style={{
                position: 'absolute', top: 12, left: 12, right: 12,
                display: 'flex', gap: 8, zIndex: 1000,
            }}>
                {routeInfo && (
                    <div style={{
                        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                        color: '#f0f0f5', padding: '8px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}>
                        📏 {routeInfo.distance_km} km · ⏱ {routeInfo.duration_minutes} min
                    </div>
                )}

                {nearPickup && isBeforePickup && (
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white', padding: '8px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 700,
                        animation: 'pulse-ring 2s ease-out infinite',
                    }}>
                        ✅ You're near the restaurant!
                    </div>
                )}

                {nearDropoff && isAfterPickup && (
                    <div style={{
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: 'white', padding: '8px 16px', borderRadius: 10,
                        fontSize: 13, fontWeight: 700,
                    }}>
                        🎉 Almost at delivery point!
                    </div>
                )}
            </div>
        </div>
    );
}
