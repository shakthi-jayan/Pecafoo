
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { locationsAPI } from '../services/api';
import toast from 'react-hot-toast';

const LocationContext = createContext(null);

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (!context) throw new Error('useLocation must be used within LocationProvider');
    return context;
};

const LOCATION_KEY = 'pecafoo_location';
const LAST_LOCATION_KEY = 'pecafoo_last_location';
const LOCATION_EXPIRY = 30 * 60 * 1000; 

function loadStoredLocation() {
    try {
        const stored = localStorage.getItem(LOCATION_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            
            if (Date.now() - parsed.timestamp < LOCATION_EXPIRY) {
                return parsed;
            }
        }
    } catch {  }
    return null;
}

export const LocationProvider = ({ children }) => {
    const stored = loadStoredLocation();
    const [coords, setCoords] = useState(stored ? [stored.latitude, stored.longitude] : null);
    const [address, setAddress] = useState(stored?.address || '');
    const [addressParts, setAddressParts] = useState(stored?.parts || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    // Save to localStorage
    const saveLocation = useCallback((lat, lng, addr, parts = {}) => {
        const data = {
            latitude: lat,
            longitude: lng,
            address: addr,
            parts,
            timestamp: Date.now(),
        };
        localStorage.setItem(LOCATION_KEY, JSON.stringify(data));
        localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify([lat, lng]));
    }, []);

    // Reverse geocode coordinates to human-readable address
    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const { data } = await locationsAPI.reverseGeocode({
                latitude: lat,
                longitude: lng,
            });

            if (data && data.display_name) {
                const parts = {
                    road: data.road || '',
                    suburb: data.suburb || '',
                    city: data.city || '',
                    state: data.state || '',
                    postcode: data.postcode || '',
                    country: data.country || '',
                };

                const addressStr = [
                    parts.road, parts.suburb, parts.city
                ].filter(Boolean).join(', ') || data.display_name;

                setAddress(addressStr);
                setAddressParts(parts);
                saveLocation(lat, lng, addressStr, parts);
                return { address: addressStr, parts };
            }
        } catch (err) {
            console.error('Reverse geocoding failed:', err);
        }
        return { address: '', parts: {} };
    }, [saveLocation]);

    // Detect current location using browser GPS
    const detectLocation = useCallback(async (silent = false) => {
        if (!('geolocation' in navigator)) {
            setError('Geolocation not supported by your browser');
            if (!silent) toast.error('Geolocation not supported');
            return null;
        }

        setLoading(true);
        setError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setCoords([lat, lng]);
                    setPermissionDenied(false);

                    
                    const result = await reverseGeocode(lat, lng);
                    setLoading(false);

                    if (!silent && result.address) {
                        toast.success('📍 Location detected!');
                    }

                    resolve({ coords: [lat, lng], ...result });
                },
                (err) => {
                    setLoading(false);
                    if (err.code === 1) {
                        setPermissionDenied(true);
                        setError('Location permission denied');
                        if (!silent) toast.error('Location permission denied. Enable it in browser settings.');
                    } else if (err.code === 2) {
                        setError('Location unavailable');
                        if (!silent) toast.error('Location unavailable. Try again.');
                    } else {
                        setError('Location request timed out');
                        if (!silent) toast.error('Location request timed out.');
                    }
                    resolve(null);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
            );
        });
    }, [reverseGeocode]);

    
    const setManualLocation = useCallback(async (lat, lng) => {
        const fallbackAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setCoords([lat, lng]);
        setAddress(fallbackAddress);
        setAddressParts({});
        setLoading(true);
        saveLocation(lat, lng, fallbackAddress, {});

        const result = await reverseGeocode(lat, lng);
        setLoading(false);

        if (!result.address) {
            setAddress(fallbackAddress);
            saveLocation(lat, lng, fallbackAddress, {});
        }

        return result;
    }, [reverseGeocode, saveLocation]);

    
    const setFromSavedAddress = useCallback((addr) => {
        const fullAddr = [
            addr.full_address, addr.landmark, addr.city, addr.state, addr.pincode
        ].filter(Boolean).join(', ');

        setAddress(fullAddr);
        if (addr.latitude && addr.longitude) {
            setCoords([parseFloat(addr.latitude), parseFloat(addr.longitude)]);
        }

        setAddressParts({
            road: addr.full_address || '',
            suburb: addr.landmark || '',
            city: addr.city || '',
            state: addr.state || '',
            postcode: addr.pincode || '',
        });

        saveLocation(
            addr.latitude ? parseFloat(addr.latitude) : coords?.[0],
            addr.longitude ? parseFloat(addr.longitude) : coords?.[1],
            fullAddr,
            { city: addr.city, state: addr.state }
        );
    }, [coords, saveLocation]);

    
    useEffect(() => {
        if (!coords) {
            detectLocation(true); 
        }
    }, []);

    const value = {
        coords,
        latitude: coords?.[0] || null,
        longitude: coords?.[1] || null,
        address,
        addressParts,
        loading,
        error,
        permissionDenied,
        detectLocation,
        setManualLocation,
        setFromSavedAddress,
        reverseGeocode,
    };

    return (
        <LocationContext.Provider value={value}>
            {children}
        </LocationContext.Provider>
    );
};
