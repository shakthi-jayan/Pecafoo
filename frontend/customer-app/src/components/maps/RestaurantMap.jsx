import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import {
    OSM_TILE_URL,
    OSM_ATTRIBUTION,
    DEFAULT_CENTER,
    DEFAULT_ZOOM,
    createMarkerIcon,
    MAP_CHROME_CSS,
} from '../../config/mapConfig';

if (typeof document !== 'undefined' && !document.getElementById('map-chrome-css')) {
    const style = document.createElement('style');
    style.id = 'map-chrome-css';
    style.textContent = MAP_CHROME_CSS;
    document.head.appendChild(style);
}

function RecenterOnUser({ position }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, Math.max(map.getZoom(), 14), { duration: 0.8 });
        }
    }, [position, map]);

    return null;
}

function TapToMoveLocation({ enabled, onLocationChange }) {
    useMapEvents({
        click(event) {
            if (enabled) {
                onLocationChange?.([event.latlng.lat, event.latlng.lng]);
            }
        },
    });

    return null;
}

function UserLocationMarker({ position, onLocationChange, interactive }) {
    const userIcon = useMemo(() => createMarkerIcon(L, 'customer'), []);

    if (!position) return null;

    return (
        <Marker
            position={position}
            icon={userIcon}
            draggable={interactive}
            eventHandlers={interactive ? {
                dragend: (event) => {
                    const latlng = event.target.getLatLng();
                    onLocationChange?.([latlng.lat, latlng.lng]);
                },
            } : undefined}
        >
            <Popup>
                <strong>Your delivery location</strong>
                <br />
                Drag the pin or tap the map to update it.
            </Popup>
        </Marker>
    );
}

export default function RestaurantMap({
    restaurants = [],
    height = 350,
    className = '',
    userLocation = null,
    onUserLocationChange = null,
    interactiveUserLocation = false,
}) {
    const navigate = useNavigate();
    const restaurantIcon = useMemo(() => createMarkerIcon(L, 'restaurant'), []);

    const mappable = restaurants.filter(
        (restaurant) => restaurant.latitude && restaurant.longitude && parseFloat(restaurant.latitude) !== 0
    );

    const center = userLocation || (mappable.length > 0
        ? [parseFloat(mappable[0].latitude), parseFloat(mappable[0].longitude)]
        : DEFAULT_CENTER);

    return (
        <div className={`restaurant-map ${className}`}>
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
                dragging
                zoomSnap={0.25}
                zoomDelta={0.5}
            >
                <ZoomControl position="bottomright" />
                <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
                <RecenterOnUser position={userLocation} />
                <TapToMoveLocation enabled={interactiveUserLocation} onLocationChange={onUserLocationChange} />
                <UserLocationMarker
                    position={userLocation}
                    onLocationChange={onUserLocationChange}
                    interactive={interactiveUserLocation}
                />

                {mappable.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        position={[parseFloat(restaurant.latitude), parseFloat(restaurant.longitude)]}
                        icon={restaurantIcon}
                        eventHandlers={{
                            click: () => navigate(`/restaurant/${restaurant.slug}`),
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: 160 }}>
                                <strong style={{ fontSize: 14 }}>{restaurant.name}</strong>
                                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                    {restaurant.cuisine_type}
                                </div>
                                <div style={{ fontSize: 12, marginTop: 2 }}>
                                    {restaurant.average_rating || 'New'} stars · {restaurant.delivery_time || '30'} min
                                </div>
                                <button
                                    onClick={() => navigate(`/restaurant/${restaurant.slug}`)}
                                    style={{
                                        marginTop: 6,
                                        padding: '4px 12px',
                                        fontSize: 12,
                                        background: '#ff5a1f',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        width: '100%',
                                    }}
                                >
                                    View Menu
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
