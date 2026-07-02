import React, { useState } from 'react';
import { WindyMap } from '../components/weather/WindyMap';
import { WindyToolbar } from '../components/weather/WindyToolbar';
import { WindyForecastCard } from '../components/weather/WindyForecastCard';
import { WindyWebcamPanel } from '../components/weather/WindyWebcamPanel';
import { fetchPointForecast, generateMockForecast, ForecastData } from '../services/windyPointService';
import { fetchWebcams, WebcamData } from '../services/windyWebcamService';
import { ShieldAlert, X } from 'lucide-react';

export const WindyForecastPage: React.FC = () => {
    // Read API keys from Vite environment variables
    const WINDY_MAP_API_KEY = import.meta.env.VITE_WINDY_MAP_API_KEY || '';

    const [activeLayer, setActiveLayer] = useState<string>('temp');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [status, setStatus] = useState<'loading' | 'online' | 'fallback' | 'error'>('loading');
    
    // Ingestion selection details
    const [clickedLocation, setClickedLocation] = useState<{ lat: number; lon: number } | null>(null);
    
    // Forecast API states
    const [forecastList, setForecastList] = useState<ForecastData[]>([]);
    const [isForecastLoading, setIsForecastLoading] = useState<boolean>(false);
    const [forecastError, setForecastError] = useState<string | null>(null);
    const [activeTimelineIndex, setActiveTimelineIndex] = useState<number>(0);

    // Webcam API states
    const [webcamsList, setWebcamsList] = useState<WebcamData[]>([]);
    const [isWebcamsLoading, setIsWebcamsLoading] = useState<boolean>(false);
    const [webcamsError, setWebcamsError] = useState<string | null>(null);

    // Click/Search coordinate handler
    const handleCoordinateSelect = (lat: number, lon: number) => {
        setClickedLocation({ lat, lon });
        
        setIsForecastLoading(true);
        setForecastError(null);
        setIsWebcamsLoading(true);
        setWebcamsError(null);
        setForecastList([]);
        setWebcamsList([]);
        setActiveTimelineIndex(0);

        // Fetch GFS point forecast via backend proxy
        fetchPointForecast(lat, lon)
            .then((data: ForecastData[]) => {
                setForecastList(data);
                setIsForecastLoading(false);
            })
            .catch((err: any) => {
                console.error("Point Forecast API Error:", err);
                setForecastError("Unable to load point forecast. Please check Windy Point Forecast API key.");
                setIsForecastLoading(false);
                
                // Fallback to simulated forecast timeline
                const mock = generateMockForecast(lat, lon);
                setForecastList(mock);
            });

        // Fetch nearby webcams via backend proxy
        fetchWebcams(lat, lon, 50)
            .then((data: WebcamData[]) => {
                setWebcamsList(data);
                setIsWebcamsLoading(false);
            })
            .catch((err: any) => {
                console.error("Webcams API Error:", err);
                setWebcamsError("Unable to load nearby webcams. Map and forecast are still available.");
                setIsWebcamsLoading(false);
            });
    };

    const handleSearch = (cityKey: string) => {
        setSearchQuery(cityKey);
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="windy-container">
            {/* Windy Toolbar */}
            <WindyToolbar
                activeLayer={activeLayer}
                onLayerChange={setActiveLayer}
                onSearch={handleSearch}
                onRefresh={handleRefresh}
            />

            {/* Windy Map Canvas */}
            <div style={{ flexGrow: 1, position: 'relative', width: '100%', height: '100%' }}>
                {status === 'loading' && (
                    <div className="loading-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 500 }}>
                        <div className="spinner"></div>
                        <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>Loading Windy Map...</span>
                    </div>
                )}

                <WindyMap
                    apiKey={WINDY_MAP_API_KEY}
                    activeLayer={activeLayer}
                    searchQuery={searchQuery}
                    onCoordinateSelect={handleCoordinateSelect}
                    onStatusChange={setStatus}
                />

                {/* API Key Missing Fallback Overlay */}
                {status === 'fallback' && (
                    <div className="map-legend" style={{ left: '24px', top: '100px', bottom: 'auto', right: 'auto', pointerEvents: 'auto', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706', marginBottom: '8px' }}>
                            <ShieldAlert size={16} />
                            <h3 style={{ margin: 0, textTransform: 'none', color: '#d97706' }}>Fallback Map Mode</h3>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px' }}>
                            {WINDY_MAP_API_KEY.trim() === 's4XE2JqUZZ1gPqgiZXbuMZDrr27ZKNTD' ? (
                                <><code>VITE_WINDY_MAP_API_KEY</code> is set, but the map library failed to load or has expired.</>
                            ) : !WINDY_MAP_API_KEY ? (
                                <><code>VITE_WINDY_MAP_API_KEY</code> is not set in your <code>.env</code> file.</>
                            ) : (
                                <><code>VITE_WINDY_MAP_API_KEY</code> is invalid or running on simulated fallback.</>
                            )}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>
                            A map has been initialized. Click anywhere on the map to query point forecast and webcam lists.
                        </p>
                    </div>
                )}

                {/* API Initialisation Failure Panel */}
                {status === 'error' && (
                    <div className="map-legend" style={{ left: '24px', top: '100px', bottom: 'auto', right: 'auto', pointerEvents: 'auto', maxWidth: '340px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', marginBottom: '8px' }}>
                            <ShieldAlert size={16} />
                            <h3 style={{ margin: 0, textTransform: 'none', color: '#dc2626' }}>Unable to load Windy Map</h3>
                        </div>
                        <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>
                            Please check Windy Map Forecast API key in your `.env` file, or check network connection.
                        </p>
                        <button className="action-btn" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={handleRefresh}>
                            Retry Connection
                        </button>
                    </div>
                )}

                {/* Split Details Overlay: Forecast on Left, Webcams on Right */}
                {clickedLocation && (
                    <div className="forecast-panel-overlay" style={{ display: 'flex', flexDirection: 'row', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                        {/* Main Dismiss Button */}
                        <button 
                            className="forecast-close" 
                            onClick={() => setClickedLocation(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1100 }}
                        >
                            <X size={16} />
                        </button>

                        {/* Forecast Details (Left Column) */}
                        <div style={{ flex: '2', minWidth: '320px' }}>
                            {isForecastLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '150px', gap: '8px' }}>
                                    <div className="spinner"></div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Loading forecast...</span>
                                </div>
                            ) : forecastError ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(220, 38, 38, 0.08)', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                                        <ShieldAlert size={14} style={{ color: '#dc2626' }} />
                                        <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: 500 }}>{forecastError}</span>
                                    </div>
                                    
                                    {forecastList.length > 0 && (
                                        <WindyForecastCard
                                            lat={clickedLocation.lat}
                                            lon={clickedLocation.lon}
                                            forecastData={forecastList}
                                            activeIndex={activeTimelineIndex}
                                            onTimeSelect={setActiveTimelineIndex}
                                        />
                                    )}
                                </div>
                            ) : (
                                <WindyForecastCard
                                    lat={clickedLocation.lat}
                                    lon={clickedLocation.lon}
                                    forecastData={forecastList}
                                    activeIndex={activeTimelineIndex}
                                    onTimeSelect={setActiveTimelineIndex}
                                />
                            )}
                        </div>
                        
                        {/* Divider */}
                        <div style={{ width: '1px', backgroundColor: '#d1d5db', minHeight: '120px' }}></div>

                        {/* Webcams Details (Right Column) */}
                        <div style={{ flex: '1.5', minWidth: '280px' }}>
                            <WindyWebcamPanel
                                webcams={webcamsList}
                                isLoading={isWebcamsLoading}
                                error={webcamsError}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
