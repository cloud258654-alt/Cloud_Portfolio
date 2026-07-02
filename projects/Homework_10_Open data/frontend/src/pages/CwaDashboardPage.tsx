import React, { useEffect, useState, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Declaring Window interface extension for Leaflet
declare const L: any;

interface WeatherRecord {
    station_id: string;
    station_name: string;
    obs_time: string;
    latitude_wgs84: number | null;
    longitude_wgs84: number | null;
    altitude: number | null;
    county_name: string | null;
    town_name: string | null;
    weather: string | null;
    precipitation: number | null;
    wind_speed: number | null;
    air_temperature: number | null;
    relative_humidity: number | null;
    air_pressure: number | null;
    peak_gust_speed: number | null;
}

interface StatRecord {
    station_name: string;
    county_name: string;
    air_temperature?: number;
    precipitation?: number;
    peak_gust_speed?: number;
}

interface StatsData {
    max_temperature: StatRecord | null;
    max_precipitation: StatRecord | null;
    max_gust: StatRecord | null;
}

export const CwaDashboardPage: React.FC = () => {
    const [records, setRecords] = useState<WeatherRecord[]>([]);
    const [stats, setStats] = useState<StatsData>({
        max_temperature: null,
        max_precipitation: null,
        max_gust: null
    });
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersLayerRef = useRef<any>(null);

    // Color code stations by temperature
    const getTempColor = (temp: number | null | undefined) => {
        if (temp === null || temp === undefined) return '#9ca3af';
        if (temp >= 30) return '#dc2626';
        if (temp >= 25) return '#d97706';
        if (temp >= 20) return '#059669';
        return '#2563eb';
    };

    // Construct premium popup content
    const getPopupContent = (station: WeatherRecord) => {
        const tempVal = station.air_temperature !== null ? `${station.air_temperature.toFixed(1)} °C` : 'N/A';
        const rainVal = station.precipitation !== null ? `${station.precipitation.toFixed(1)} mm` : 'N/A';
        const windVal = station.wind_speed !== null ? `${station.wind_speed.toFixed(1)} m/s` : 'N/A';
        const humidVal = station.relative_humidity !== null ? `${station.relative_humidity.toFixed(0)} %` : 'N/A';
        const pressureVal = station.air_pressure !== null ? `${station.air_pressure.toFixed(1)} hPa` : 'N/A';
        const weatherDesc = station.weather || 'N/A';
        const location = `${station.county_name || ''} ${station.town_name || ''}`.trim() || 'Unknown Location';
        const tempColor = getTempColor(station.air_temperature);
        
        return `
            <div class="weather-popup">
                <h3>${station.station_name}</h3>
                <div class="popup-sub">${location} (ID: ${station.station_id})</div>
                <div class="popup-grid">
                    <div class="popup-item">
                        <span class="popup-label">Temperature</span>
                        <span class="popup-value" style="color: ${tempColor}">${tempVal}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Precipitation</span>
                        <span class="popup-value highlight">${rainVal}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Wind Speed</span>
                        <span class="popup-value">${windVal}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Humidity</span>
                        <span class="popup-value">${humidVal}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Air Pressure</span>
                        <span class="popup-value">${pressureVal}</span>
                    </div>
                    <div class="popup-item">
                        <span class="popup-label">Condition</span>
                        <span class="popup-value">${weatherDesc}</span>
                    </div>
                </div>
            </div>
        `;
    };

    // Initialize Map once
    useEffect(() => {
        if (!mapRef.current && mapContainerRef.current) {
            // Centered on Taiwan
            const mapInstance = L.map(mapContainerRef.current, {
                zoomControl: false
            }).setView([23.973875, 120.982024], 7.5);

            L.control.zoom({ position: 'topright' }).addTo(mapInstance);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(mapInstance);

            const markersLayer = L.layerGroup().addTo(mapInstance);

            mapRef.current = mapInstance;
            markersLayerRef.current = markersLayer;
        }

        // Clean up map instance on component unmount
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Fetch and render loops
    const fetchWeatherData = async () => {
        try {
            const API_BASE = "http://127.0.0.1:5000/api";
            
            const [resWeather, resStats] = await Promise.all([
                fetch(`${API_BASE}/weather`),
                fetch(`${API_BASE}/stats`)
            ]);

            if (!resWeather.ok || !resStats.ok) {
                throw new Error("Backend API endpoints returned error status");
            }

            const weatherData = await resWeather.json();
            const statsData = await resStats.json();

            setRecords(weatherData.data);
            setStats(statsData.stats);
            setIsConnected(true);
            setErrorMsg('');

            // Redraw markers
            if (markersLayerRef.current) {
                markersLayerRef.current.clearLayers();
                weatherData.data.forEach((station: WeatherRecord) => {
                    const lat = station.latitude_wgs84;
                    const lon = station.longitude_wgs84;
                    if (lat !== null && lon !== null) {
                        const marker = L.circleMarker([lat, lon], {
                            radius: 7,
                            fillColor: getTempColor(station.air_temperature),
                            color: '#ffffff',
                            weight: 1.5,
                            opacity: 1,
                            fillOpacity: 0.85
                        });
                        marker.bindPopup(getPopupContent(station));
                        marker.addTo(markersLayerRef.current);
                    }
                });
            }
        } catch (err: any) {
            console.error("[!] Failed to fetch observations from backend Flask API:", err);
            setIsConnected(false);
            setErrorMsg("Flask API offline. Start backend server first.");
        }
    };

    // Auto-refresh poll interval
    useEffect(() => {
        fetchWeatherData();
        const interval = setInterval(fetchWeatherData, 10000);
        return () => clearInterval(interval);
    }, []);

    // Chart Configuration: Top 10 Temp
    const topTempRecords = [...records]
        .filter(s => s.air_temperature !== null)
        .sort((a, b) => (b.air_temperature || 0) - (a.air_temperature || 0))
        .slice(0, 10);

    const tempChartData = {
        labels: topTempRecords.map(s => s.station_name),
        datasets: [{
            label: 'Temperature (°C)',
            data: topTempRecords.map(s => s.air_temperature),
            backgroundColor: 'rgba(74, 111, 165, 0.55)',
            borderColor: '#4a6fa5',
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    // Chart Configuration: Top 10 Rain
    const topRainRecords = [...records]
        .filter(s => s.precipitation !== null && (s.precipitation || 0) > 0)
        .sort((a, b) => (b.precipitation || 0) - (a.precipitation || 0))
        .slice(0, 10);

    const rainChartData = {
        labels: topRainRecords.map(s => s.station_name),
        datasets: [{
            label: 'Rainfall (mm)',
            data: topRainRecords.map(s => s.precipitation),
            backgroundColor: 'rgba(5, 150, 105, 0.55)',
            borderColor: '#059669',
            borderWidth: 1,
            borderRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                grid: { color: 'rgba(0, 0, 0, 0.06)' },
                ticks: { color: '#6b7280', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 10 } }
            }
        }
    };

    return (
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Sidebar with observation info */}
            <aside className="sidebar" style={{ borderRight: '1px solid #d1d5db' }}>
                <section className="panel stats-panel">
                    <h2>📊 Key Observations</h2>
                    <div className="stats-grid">
                        <div className="stat-card" id="stat-temp">
                            <span className="stat-icon">🌡️</span>
                            <div className="stat-info">
                                <span className="stat-label">Hottest Station</span>
                                <span className="stat-value">
                                    {stats.max_temperature?.air_temperature !== undefined 
                                        ? `${stats.max_temperature.air_temperature.toFixed(1)} °C` 
                                        : '-- °C'}
                                </span>
                                <span className="stat-location">
                                    {stats.max_temperature 
                                        ? `${stats.max_temperature.station_name} (${stats.max_temperature.county_name})` 
                                        : errorMsg || 'Loading...'}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-rain">
                            <span className="stat-icon">💧</span>
                            <div className="stat-info">
                                <span className="stat-label">Max Rain</span>
                                <span className="stat-value">
                                    {stats.max_precipitation?.precipitation !== undefined 
                                        ? `${stats.max_precipitation.precipitation.toFixed(1)} mm` 
                                        : '-- mm'}
                                </span>
                                <span className="stat-location">
                                    {stats.max_precipitation 
                                        ? `${stats.max_precipitation.station_name} (${stats.max_precipitation.county_name})` 
                                        : 'No rain recorded'}
                                </span>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-gust">
                            <span className="stat-icon">💨</span>
                            <div className="stat-info">
                                <span className="stat-label">Peak Wind Gust</span>
                                <span className="stat-value">
                                    {stats.max_gust?.peak_gust_speed !== undefined && stats.max_gust.peak_gust_speed !== null
                                        ? `${stats.max_gust.peak_gust_speed.toFixed(1)} m/s` 
                                        : '-- m/s'}
                                </span>
                                <span className="stat-location">
                                    {stats.max_gust 
                                        ? `${stats.max_gust.station_name} (${stats.max_gust.county_name})` 
                                        : 'No wind gust data'}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="panel chart-panel">
                    <h2>📈 Top Temperature Stations</h2>
                    <div className="chart-container">
                        <Bar data={tempChartData} options={chartOptions} />
                    </div>
                </section>

                <section className="panel chart-panel">
                    <h2>🌧️ Precipitation Leaderboard</h2>
                    <div className="chart-container">
                        {topRainRecords.length > 0 ? (
                            <Bar data={rainChartData} options={chartOptions} />
                        ) : (
                            <div style={{ textAlign: 'center', paddingTop: '40px', color: '#9ca3af', fontSize: '12px' }}>
                                No rainfall recorded currently
                            </div>
                        )}
                    </div>
                </section>

                <footer className="sidebar-footer">
                    <p>Data Source: Central Weather Administration</p>
                    <div className="status-indicator">
                        <span className={`status-dot ${isConnected ? 'online' : 'offline'}`}></span>
                        <span className="status-text">{isConnected ? 'Connected to API' : errorMsg}</span>
                    </div>
                </footer>
            </aside>

            {/* Map Frame */}
            <main className="main-content">
                <div ref={mapContainerRef} id="map"></div>
                <div className="map-legend">
                    <h3>Temperature Range</h3>
                    <div className="legend-scale">
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#2563eb' }}></span>&lt; 20°C</div>
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#059669' }}></span>20 - 25°C</div>
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#d97706' }}></span>25 - 30°C</div>
                        <div className="legend-item"><span className="legend-color" style={{ backgroundColor: '#dc2626' }}></span>&gt; 30°C</div>
                    </div>
                </div>
            </main>
        </div>
    );
};
