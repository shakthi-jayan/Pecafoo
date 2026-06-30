
import { useMemo, useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMapEvents, useMap } from 'react-leaflet';
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

function LocationPicker({ onLocationSelect }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng);
        },
    });
    return null;
}

function RecenterMap({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 16, { duration: 1 });
    }, [center, map]);
    return null;
}

export default function AddressPickerMap({
    onAddressSelect,
    initialPosition = null,
    height = 300,
    className = '',
}) {
    const [position, setPosition] = useState(initialPosition);
    const [address, setAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [center, setCenter] = useState(initialPosition || DEFAULT_CENTER);

    // Get user's current location on mount
    useEffect(() => {
        if (!initialPosition && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = [pos.coords.latitude, pos.coords.longitude];
                    setCenter(loc);
                },
                () => {  },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    }, [initialPosition]);

    const handleLocationSelect = useCallback(async (latlng) => {
        setPosition([latlng.lat, latlng.lng]);
        setLoading(true);

        try {
            const { data } = await api.post('/locations/reverse-geocode/', {
                latitude: latlng.lat,
                longitude: latlng.lng,
            });

            setAddress(data);
            if (onAddressSelect) {
                onAddressSelect({
                    latitude: latlng.lat,
                    longitude: latlng.lng,
                    display_name: data.display_name,
                    road: data.road,
                    suburb: data.suburb,
                    city: data.city,
                    state: data.state,
                    postcode: data.postcode,
                });
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
            
            if (onAddressSelect) {
                onAddressSelect({
                    latitude: latlng.lat,
                    longitude: latlng.lng,
                    display_name: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`,
                });
            }
        } finally {
            setLoading(false);
        }
    }, [onAddressSelect]);

    const pinIcon = useMemo(() => createMarkerIcon(L, 'customer'), []);

    return (
        <div className={`address-picker-map ${className}`}>
            <MapContainer
                center={center}
                zoom={DEFAULT_ZOOM}
                style={{ height, width: '100%', borderRadius: 12 }}
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
                <LocationPicker onLocationSelect={handleLocationSelect} />
                <RecenterMap center={center} />

                {position && (
                    <Marker
                        position={position}
                        icon={pinIcon}
                        draggable
                        eventHandlers={{
                            dragend: (event) => {
                                handleLocationSelect(event.target.getLatLng());
                            },
                        }}
                    />
                )}
            </MapContainer>

            {}
            {loading && (
                <div style={{
                    marginTop: 8, padding: '8px 12px',
                    background: 'rgba(99,102,241,0.1)', borderRadius: 8,
                    fontSize: 13, color: '#a3a3b3',
                }}>
                    Looking up address...
                </div>
            )}

            {address && !loading && (
                <div style={{
                    marginTop: 8, padding: '10px 14px',
                    background: 'rgba(16,185,129,0.08)', borderRadius: 10,
                    border: '1px solid rgba(16,185,129,0.2)',
                    fontSize: 13, color: '#e0e0e8', lineHeight: 1.5,
                }}>
                    <strong style={{ color: '#10b981' }}>📍 Selected Address</strong>
                    <div style={{ marginTop: 4 }}>
                        {address.road && <div>{address.road}</div>}
                        {address.suburb && <div>{address.suburb}</div>}
                        <div>{[address.city, address.state, address.postcode].filter(Boolean).join(', ')}</div>
                    </div>
                </div>
            )}

            {!position && (
                <div style={{
                    marginTop: 8, padding: '8px 12px',
                    background: 'rgba(255,255,255,0.05)', borderRadius: 8,
                    fontSize: 12, color: '#888', textAlign: 'center',
                }}>
                    Tap anywhere or drag the pin to fine-tune your delivery address
                </div>
            )}
        </div>
    );
}
