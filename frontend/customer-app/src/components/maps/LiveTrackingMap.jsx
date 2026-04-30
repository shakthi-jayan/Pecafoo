
import { useState, useEffect, useRef } from 'react';
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


function MapBoundsUpdater({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions.length >= 2) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
        }
    }, [positions, map]);
    return null;
}


function AnimatedMarker({ position, icon }) {
    const markerRef = useRef(null);
    const prevPos = useRef(position);

    useEffect(() => {
        const marker = markerRef.current;
        if (marker && prevPos.current) {
            
            const latlng = L.latLng(position);
            marker.setLatLng(latlng);
        }
        prevPos.current = position;
    }, [position]);

    return <Marker ref={markerRef} position={position} icon={icon} />;
}

export default function LiveTrackingMap({
    order,
    deliveryLocation,
    routeGeoJSON,
    eta,
    className = '',
}) {
    const [routeCoords, setRouteCoords] = useState([]);

    // Parse GeoJSON route into Leaflet-compatible coords
    useEffect(() => {
        if (routeGeoJSON?.geometry?.coordinates) {
            const coords = routeGeoJSON.geometry.coordinates.map(
                ([lng, lat]) => [lat, lng]
            );
            setRouteCoords(coords);
        }
    }, [routeGeoJSON]);

    if (!order) return null;

    const restaurantPos = order.restaurant_latitude && order.restaurant_longitude
        ? [parseFloat(order.restaurant_latitude), parseFloat(order.restaurant_longitude)]
        : null;

    const customerPos = order.delivery_latitude && order.delivery_longitude
        ? [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)]
        : null;

    const deliveryPos = deliveryLocation?.latitude && deliveryLocation?.longitude
        ? [parseFloat(deliveryLocation.latitude), parseFloat(deliveryLocation.longitude)]
        : null;

    // Collect all positions for bounds fitting
    const allPositions = [restaurantPos, customerPos, deliveryPos].filter(Boolean);
    const center = customerPos || restaurantPos || DEFAULT_CENTER;

    // Create marker icons
    const restaurantIcon = createMarkerIcon(L, 'restaurant');
    const customerIcon = createMarkerIcon(L, 'customer');
    const deliveryIcon = createPulsingIcon(L, '#10b981');

    
    const etaDisplay = eta ? new Date(eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <div className={`tracking-map-container ${className}`} style={{ position: 'relative' }}>
            <MapContainer
                center={center}
                zoom={DEFAULT_ZOOM}
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
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
                <MapBoundsUpdater positions={allPositions} />

                {}
                {routeCoords.length > 0 && (
                    <Polyline
                        positions={routeCoords}
                        pathOptions={{
                            color: '#6366f1',
                            weight: 4,
                            opacity: 0.8,
                            dashArray: '10, 6',
                        }}
                    />
                )}

                {}
                {restaurantPos && (
                    <Marker position={restaurantPos} icon={restaurantIcon}>
                        <Popup>
                            <strong>🍕 {order.restaurant_name}</strong>
                            <br />Pickup point
                        </Popup>
                    </Marker>
                )}

                {}
                {customerPos && (
                    <Marker position={customerPos} icon={customerIcon}>
                        <Popup>
                            <strong>📍 Delivery Address</strong>
                            <br />{order.delivery_address}
                        </Popup>
                    </Marker>
                )}

                {}
                {deliveryPos && (
                    <AnimatedMarker position={deliveryPos} icon={deliveryIcon} />
                )}
            </MapContainer>

            {}
            {etaDisplay && (
                <div style={{
                    position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                    background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
                    color: '#f0f0f5', padding: '10px 24px', borderRadius: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    fontSize: 14, fontWeight: 600, zIndex: 1000,
                    display: 'flex', alignItems: 'center', gap: 8,
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <span style={{ fontSize: 18 }}>🕐</span>
                    ETA: {etaDisplay}
                </div>
            )}
        </div>
    );
}
