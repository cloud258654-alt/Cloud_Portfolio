import React from 'react';
import { WebcamData } from '../../services/windyWebcamService';
import { Video, ExternalLink } from 'lucide-react';

interface WindyWebcamCardProps {
    webcam: WebcamData;
}

export const WindyWebcamCard: React.FC<WindyWebcamCardProps> = ({ webcam }) => {
    return (
        <div className="f-card" style={{ padding: '0', overflow: 'hidden', position: 'relative' }}>
            {/* Webcam Preview Image */}
            <div style={{ position: 'relative', width: '100%', height: '100px', backgroundColor: '#e8ecf1' }}>
                {webcam.previewUrl ? (
                    <img 
                        src={webcam.previewUrl} 
                        alt={webcam.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=400&q=80';
                        }}
                    />
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <Video size={24} />
                    </div>
                )}
                
                {/* Distance Badge */}
                <div style={{ 
                    position: 'absolute', 
                    top: '8px', 
                    left: '8px', 
                    background: 'rgba(0, 0, 0, 0.7)', 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '9px',
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: '0.5px'
                }}>
                    📍 {webcam.distance} km
                </div>
            </div>

            {/* Webcam Details */}
            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: '#1a1a2e',
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                }}>
                    {webcam.title}
                </h4>
                
                <p style={{ fontSize: '9px', color: '#6b7280' }}>
                    {webcam.city || webcam.region || "Taiwan"}
                </p>

                <a 
                    href={webcam.windyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-btn"
                    style={{ 
                        marginTop: '6px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '4px',
                        fontSize: '9px',
                        textDecoration: 'none',
                        padding: '4px 8px',
                        textAlign: 'center'
                    }}
                >
                    <span>View on Windy</span>
                    <ExternalLink size={10} />
                </a>
            </div>
        </div>
    );
};
