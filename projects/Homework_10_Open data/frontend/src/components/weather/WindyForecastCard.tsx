import React from 'react';
import { Navigation, Wind, Thermometer, Droplets, Gauge, CloudRain, Cloud } from 'lucide-react';
import { ForecastData } from '../../services/windyPointService';

interface WindyForecastCardProps {
    lat: number;
    lon: number;
    forecastData: ForecastData[];
    activeIndex: number;
    onTimeSelect: (index: number) => void;
}

export const WindyForecastCard: React.FC<WindyForecastCardProps> = ({
    lat,
    lon,
    forecastData,
    activeIndex,
    onTimeSelect
}) => {
    if (!forecastData || forecastData.length === 0) return null;
    
    const activeForecast = forecastData[activeIndex] || forecastData[0];

    return (
        <div style={{ flexGrow: 1, minWidth: '320px' }}>
            {/* Forecast header section */}
            <div className="forecast-header" style={{ marginBottom: '12px', paddingBottom: '8px' }}>
                <div className="forecast-title-group">
                    <h2 style={{ fontSize: '15px' }}>📍 Forecast Details</h2>
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Coordinates: {lat.toFixed(4)}°N, {lon.toFixed(4)}°E</p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="forecast-meta" style={{ fontSize: '10px' }}>
                        <p>Model: <span className="forecast-source">{activeForecast.model}</span></p>
                        <p>Source: <span className="forecast-source">Windy Point Forecast API</span></p>
                    </div>
                </div>
            </div>

            {/* Weather grid */}
            <div className="forecast-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Thermometer size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Temperature</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px', color: activeForecast.temp >= 30 ? '#dc2626' : '#4a6fa5' }}>
                        {activeForecast.temp.toFixed(1)} °C
                    </span>
                </div>
                
                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Droplets size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Humidity</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px' }}>{activeForecast.humidity} %</span>
                </div>
                
                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Wind size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Wind Speed</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px' }}>{activeForecast.windSpeed.toFixed(1)} m/s</span>
                </div>
                
                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Navigation size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Wind Direction</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {activeForecast.windDirection}°
                        <Navigation 
                            size={9} 
                            style={{ transform: `rotate(${activeForecast.windDirection}deg)`, display: 'inline-block' }} 
                        />
                    </span>
                </div>

                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <CloudRain size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Rain</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px', color: '#059669' }}>
                        {activeForecast.rain !== undefined ? `${activeForecast.rain.toFixed(2)} mm` : '0.00 mm'}
                    </span>
                </div>

                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Cloud size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Cloud</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px' }}>
                        {activeForecast.cloud !== undefined ? `${activeForecast.cloud} %` : '0 %'}
                    </span>
                </div>
                
                <div className="f-card" style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                        <Gauge size={12} className="text-secondary" />
                        <span className="f-label" style={{ fontSize: '9px' }}>Air Pressure</span>
                    </div>
                    <span className="f-value" style={{ fontSize: '15px' }}>{activeForecast.pressure.toFixed(1)} hPa</span>
                </div>
            </div>

            {/* Forecast timeline controls */}
            <div className="forecast-timeline" style={{ paddingTop: '8px' }}>
                <span className="f-label" style={{ marginRight: '6px', fontSize: '9px' }}>Timeline:</span>
                {forecastData.map((f, idx) => (
                    <button
                        key={f.time}
                        className={`timeline-btn ${idx === activeIndex ? 'active' : ''}`}
                        onClick={() => onTimeSelect(idx)}
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                    >
                        {f.time}
                    </button>
                ))}
            </div>
        </div>
    );
};
