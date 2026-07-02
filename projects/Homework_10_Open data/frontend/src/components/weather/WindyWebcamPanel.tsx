import React from 'react';
import { WebcamData } from '../../services/windyWebcamService';
import { WindyWebcamCard } from './WindyWebcamCard';
import { Camera, AlertCircle } from 'lucide-react';

interface WindyWebcamPanelProps {
    webcams: WebcamData[];
    isLoading: boolean;
    error: string | null;
}

export const WindyWebcamPanel: React.FC<WindyWebcamPanelProps> = ({
    webcams,
    isLoading,
    error
}) => {
    return (
        <div style={{ flexGrow: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Camera size={16} className="text-secondary" />
                <span className="f-label" style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '11px' }}>Nearby Webcams</span>
            </div>

            {/* Loading state */}
            {isLoading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px dashed #d1d5db' }}>
                    <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
                    <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '8px' }}>Loading nearby webcams...</span>
                </div>
            )}

            {/* Error state */}
            {!isLoading && error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(220, 38, 38, 0.06)', borderRadius: '8px', border: '1px solid rgba(220, 38, 38, 0.2)' }}>
                    <AlertCircle size={14} style={{ color: '#dc2626' }} />
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>{error}</span>
                </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && webcams.length === 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', background: 'rgba(0,0,0,0.02)', borderRadius: '10px', border: '1px dashed #d1d5db' }}>
                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>No nearby webcams found within 50km</span>
                </div>
            )}

            {/* Webcams List Grid */}
            {!isLoading && !error && webcams.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    {webcams.slice(0, 3).map((webcam) => (
                        <WindyWebcamCard key={webcam.id} webcam={webcam} />
                    ))}
                </div>
            )}
        </div>
    );
};
