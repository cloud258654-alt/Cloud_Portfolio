import React, { useEffect, useRef, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { SUPPORTED_CITIES } from '../../services/windyMapService';
import { installWindyProxyInterceptor } from '../../services/windyProxyInterceptor';

declare const L: any;

interface WindyMapProps {
    apiKey: string;
    activeLayer: string; // 'temp' | 'wind' | 'rain' | 'pressure' | 'clouds'
    searchQuery: string;
    onCoordinateSelect: (lat: number, lon: number) => void;
    onStatusChange: (status: 'loading' | 'online' | 'fallback' | 'error') => void;
}

export const WindyMap: React.FC<WindyMapProps> = ({
    apiKey,
    activeLayer,
    searchQuery,
    onCoordinateSelect,
    onStatusChange
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const activeMarkerRef = useRef<any>(null);
    const windyAPIRef = useRef<any>(null);
    
    const [isFallbackMode, setIsFallbackMode] = useState<boolean>(false);
    const [fallbackReason, setFallbackReason] = useState<string | null>(null);

    // Initialize map
    useEffect(() => {
        if (!containerRef.current) return;
        onStatusChange('loading');

        let fallbackTimeout: any = null;
        let observer: MutationObserver | null = null;

        // Callback to gracefully trigger fallback map loading
        const triggerFallback = (reason: string) => {
            if (windyAPIRef.current) return; // already successfully loaded
            console.warn(`[*] Windy initialization fallback: ${reason}. Launching Leaflet Fallback Map.`);
            
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            if (observer) observer.disconnect();
            
            setIsFallbackMode(true);
            setFallbackReason(reason);
            onStatusChange('fallback');
            
            if (containerRef.current) {
                containerRef.current.innerHTML = ''; // clean out Windy's unauthorized message text
            }
            initFallbackLeaflet();
        };

        // Check if API key is provided and is not a placeholder
        const isPlaceholder = !apiKey || apiKey.trim() === '' || apiKey.trim() === 'Point Forecast' || apiKey.includes(' ') || apiKey.length < 15;
        if (isPlaceholder) {
            triggerFallback("Key is empty or placeholder");
            return;
        }

        // Setup DOM mutation observer to capture authorization failure immediately
        if (containerRef.current) {
            observer = new MutationObserver(() => {
                const text = containerRef.current?.textContent || '';
                const isDomainError = text.includes('Cannot use Windy API, key is used from unauthorized domain')
                    || text.includes('unauthorized domain');
                if (
                    text.includes('authorized') ||
                    text.includes('Unauthorized') ||
                    text.includes('Invalid API key') ||
                    text.includes('Not authorized') ||
                    text.includes('Forbidden') ||
                    text.includes('403') ||
                    text.includes('Cannot use Windy API')
                ) {
                    if (isDomainError) {
                        triggerFallback("403: unauthorized domain");
                    } else {
                        triggerFallback("Windy API authorization rejected (403 Forbidden / domain not authorized)");
                    }
                }
            });
            observer.observe(containerRef.current, { childList: true, subtree: true });
        }

        // Setup a 1s timeout - fast fallback if Windy doesn't load or is blocked by domain restriction
        fallbackTimeout = setTimeout(() => {
            triggerFallback("Windy load timeout (1s) - possibly domain-restricted key");
        }, 1000);

        // Install proxy interceptor to rewrite api.windy.com requests through Vite proxy
        installWindyProxyInterceptor();

        // Try initializing Windy Map
        if (typeof (window as any).windyInit === 'function') {
            try {
                const options = {
                    key: apiKey,
                    lat: 23.973875,
                    lon: 120.982024,
                    zoom: 7,
                };

                (window as any).windyInit(options, (windyAPI: any) => {
                    // API succeeded! Cancel fallback handlers.
                    if (fallbackTimeout) clearTimeout(fallbackTimeout);
                    if (observer) observer.disconnect();

                    console.log("[+] Windy Map API loaded successfully!");
                    windyAPIRef.current = windyAPI;
                    mapRef.current = windyAPI.map;
                    onStatusChange('online');

                    // Set default layer
                    setWindyLayer(activeLayer);

                    // Add map click listener
                    windyAPI.map.on('click', (e: any) => {
                        handleMapClickEvent(e.latlng.lat, e.latlng.lng);
                    });
                });
            } catch (err) {
                console.error("[!] Windy init error:", err);
                triggerFallback("Initialization error thrown");
            }
        } else {
            console.error("[!] window.windyInit is not a function. Fallback mode activated.");
            triggerFallback("windyInit is missing");
        }

        return () => {
            if (fallbackTimeout) clearTimeout(fallbackTimeout);
            if (observer) observer.disconnect();
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Handle Layer changes
    useEffect(() => {
        if (isFallbackMode) {
            console.log(`[*] Mocking layer switch to: ${activeLayer}`);
            return;
        }
        setWindyLayer(activeLayer);
    }, [activeLayer, isFallbackMode]);

    // Handle Search Queries
    useEffect(() => {
        if (!searchQuery || !mapRef.current) return;

        const q = searchQuery.toLowerCase().trim();
        if (SUPPORTED_CITIES[q]) {
            const city = SUPPORTED_CITIES[q];
            mapRef.current.flyTo([city.lat, city.lon], 10, {
                animate: true,
                duration: 1.5
            });
            handleMapClickEvent(city.lat, city.lon);
        }
    }, [searchQuery]);

    // Helper to map UI layer names to Windy API internal overlays
    const setWindyLayer = (layerName: string) => {
        if (!windyAPIRef.current) return;
        const { store } = windyAPIRef.current;
        
        const layerMap: Record<string, string> = {
            temp: 'temp',
            wind: 'wind',
            rain: 'rain',
            pressure: 'pressure',
            clouds: 'clouds'
        };
        
        const targetOverlay = layerMap[layerName] || 'temp';
        store.set('overlay', targetOverlay);
    };

    // Helper to initialize Leaflet Map Fallback
    const initFallbackLeaflet = () => {
        if (!containerRef.current) return;
        
        if (mapRef.current) {
            mapRef.current.remove();
        }

        const mapInstance = L.map(containerRef.current, {
            zoomControl: false
        }).setView([23.973875, 120.982024], 7.5);

        L.control.zoom({ position: 'topright' }).addTo(mapInstance);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance);

        mapRef.current = mapInstance;

        mapInstance.on('click', (e: any) => {
            handleMapClickEvent(e.latlng.lat, e.latlng.lng);
        });
    };

    // Map click handler
    const handleMapClickEvent = (lat: number, lon: number) => {
        if (!mapRef.current) return;

        // Place custom glowing marker at clicked point
        if (activeMarkerRef.current) {
            mapRef.current.removeLayer(activeMarkerRef.current);
        }

        const newMarker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: '#38bdf8',
            color: '#ffffff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        }).addTo(mapRef.current);

        activeMarkerRef.current = newMarker;

        // Propagate selection back to container page
        onCoordinateSelect(lat, lon);
    };

    const isDomain403 = fallbackReason?.includes('unauthorized domain');

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <div ref={containerRef} id="windy" style={{ width: '100%', height: '100%' }}></div>

            {isFallbackMode && isDomain403 && (
                <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: '#ffffff',
                    border: '1px solid rgba(220, 38, 38, 0.3)',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    maxWidth: '480px',
                    width: '90%',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'auto'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <ShieldAlert size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
                                Windy Map API domain is not authorized.
                            </h3>
                            <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>
                                Please add the current development domain to Windy API Allowed Domains:
                            </p>
                            <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: '11px', color: '#6b7280', lineHeight: 1.7 }}>
                                <li><code style={{ background: 'rgba(74, 111, 165, 0.1)', padding: '1px 6px', borderRadius: '4px', color: '#4a6fa5' }}>localhost</code></li>
                                <li><code style={{ background: 'rgba(74, 111, 165, 0.1)', padding: '1px 6px', borderRadius: '4px', color: '#4a6fa5' }}>localhost:5173</code></li>
                                <li><code style={{ background: 'rgba(74, 111, 165, 0.1)', padding: '1px 6px', borderRadius: '4px', color: '#4a6fa5' }}>127.0.0.1</code></li>
                                <li><code style={{ background: 'rgba(74, 111, 165, 0.1)', padding: '1px 6px', borderRadius: '4px', color: '#4a6fa5' }}>127.0.0.1:5173</code></li>
                            </ul>
                            <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af', lineHeight: 1.5 }}>
                                If using LAN testing, also add the current IP domain.
                            </p>
                            <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(74, 111, 165, 0.06)', borderRadius: '6px', border: '1px solid rgba(74, 111, 165, 0.2)' }}>
                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>Current Origin: </span>
                                <code style={{ fontSize: '11px', color: '#4a6fa5', fontWeight: 500 }}>{typeof window !== 'undefined' ? window.location.origin : 'N/A'}</code>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
