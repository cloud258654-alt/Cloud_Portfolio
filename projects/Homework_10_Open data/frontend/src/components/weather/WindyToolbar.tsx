import React from 'react';
import { 
    Thermometer, 
    Wind, 
    CloudRain, 
    Gauge, 
    Cloud, 
    RefreshCw 
} from 'lucide-react';
import { WindySearchBox } from './WindySearchBox';
import { SUPPORTED_LAYERS } from '../../services/windyMapService';

interface WindyToolbarProps {
    activeLayer: string;
    onLayerChange: (layer: string) => void;
    onSearch: (cityKey: string) => void;
    onRefresh: () => void;
}

export const WindyToolbar: React.FC<WindyToolbarProps> = ({
    activeLayer,
    onLayerChange,
    onSearch,
    onRefresh
}) => {
    // Icons helper
    const getLayerIcon = (key: string) => {
        switch (key) {
            case 'temp': return <Thermometer size={14} />;
            case 'wind': return <Wind size={14} />;
            case 'rain': return <CloudRain size={14} />;
            case 'pressure': return <Gauge size={14} />;
            case 'clouds': return <Cloud size={14} />;
            default: return <Thermometer size={14} />;
        }
    };

    return (
        <div className="windy-toolbar">
            {/* New Autocomplete Search Box */}
            <div className="toolbar-group">
                <WindySearchBox onSearch={onSearch} />
            </div>

            {/* Layer Control Buttons */}
            <div className="toolbar-group">
                {SUPPORTED_LAYERS.map((layer) => (
                    <button
                        key={layer.key}
                        className={`windy-btn ${activeLayer === layer.key ? 'active' : ''}`}
                        onClick={() => onLayerChange(layer.key)}
                    >
                        {getLayerIcon(layer.key)}
                        <span>{layer.label}</span>
                    </button>
                ))}
            </div>

            {/* Refresh Trigger */}
            <button className="windy-btn" onClick={onRefresh}>
                <RefreshCw size={14} />
                <span>Refresh</span>
            </button>
        </div>
    );
};
