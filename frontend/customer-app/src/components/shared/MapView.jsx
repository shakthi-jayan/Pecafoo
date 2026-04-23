import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createMarkerIcon, DEFAULT_CENTER, MAP_CHROME_CSS, OSM_ATTRIBUTION, OSM_TILE_URL } from '../../config/mapConfig';

const MapUpdater = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 13, { animate: true });
        }
    }, [center, zoom, map]);

    return null;
};

const ClickHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            if (onLocationSelect) {
                onLocationSelect([e.latlng.lat, e.latlng.lng]);
            }
        },
    });

    return null;
};

const MapView = ({
    center = DEFAULT_CENTER,
    zoom = 13,
    markers = [],
    route = null,
    zone = null,
    onLocationSelect = null,
    style = { height: 300, width: '100%', borderRadius: 16 },
}) => {
    const defaultMarkerIcon = useMemo(() => createMarkerIcon(L, 'default'), []);

    return (
        <>
            <style>{MAP_CHROME_CSS}</style>
            <MapContainer
                center={center}
                zoom={zoom}
                style={style}
                className="pecafoo-map"
                attributionControl={false}
                zoomControl={false}
                scrollWheelZoom
                touchZoom
                doubleClickZoom
                dragging
                zoomSnap={0.25}
                zoomDelta={0.5}
            >
                <MapUpdater center={center} zoom={zoom} />
                <ClickHandler onLocationSelect={onLocationSelect} />
                <ZoomControl position="bottomright" />
                <TileLayer url={OSM_TILE_URL} attribution={OSM_ATTRIBUTION} />
                {markers.map((marker, index) => (
                    <Marker
                        key={index}
                        position={marker.position || marker}
                        icon={marker.icon || defaultMarkerIcon}
                        draggable={Boolean(marker.draggable)}
                        eventHandlers={marker.draggable ? {
                            dragend: (event) => {
                                const latlng = event.target.getLatLng();
                                marker.onDragEnd?.([latlng.lat, latlng.lng], event);
                            },
                        } : undefined}
                    >
                        {marker.popup && <Popup>{marker.popup}</Popup>}
                    </Marker>
                ))}
                {route && <Polyline positions={route} color="#ff5a1f" weight={5} opacity={0.9} />}
                {zone && <Polygon positions={zone} pathOptions={{ color: '#ff5a1f', fillColor: '#ffedd5', fillOpacity: 0.2 }} />}
            </MapContainer>
        </>
    );
};

export default MapView;
