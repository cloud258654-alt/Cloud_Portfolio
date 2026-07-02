import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SUPPORTED_CITIES } from '../../services/windyMapService';

interface WindySearchBoxProps {
    onSearch: (cityKey: string) => void;
}

export const WindySearchBox: React.FC<WindySearchBoxProps> = ({ onSearch }) => {
    const [input, setInput] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const normalized = input.toLowerCase().trim();
        if (SUPPORTED_CITIES[normalized]) {
            onSearch(normalized);
            setShowSuggestions(false);
        } else {
            // Find fuzzy matches or alert
            const found = Object.keys(SUPPORTED_CITIES).find(k => k.includes(normalized) || normalized.includes(k));
            if (found) {
                onSearch(found);
                setInput(SUPPORTED_CITIES[found].name);
            }
            setShowSuggestions(false);
        }
    };

    const suggestions = Object.keys(SUPPORTED_CITIES).filter(k => 
        k.includes(input.toLowerCase().trim())
    );

    return (
        <div style={{ position: 'relative' }}>
            <form onSubmit={handleSubmit} className="windy-search-box">
                <Search size={14} className="text-secondary" />
                <input
                    type="text"
                    placeholder="Search City (e.g. Hualien)"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && input.trim() && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: '#ffffff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 1100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    maxHeight: '150px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((key) => (
                        <div
                            key={key}
                            style={{
                                padding: '8px 12px',
                                fontSize: '12px',
                                color: '#1a1a2e',
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseDown={() => {
                                setInput(SUPPORTED_CITIES[key].name);
                                onSearch(key);
                                setShowSuggestions(false);
                            }}
                            onMouseEnter={(e) => {
                                (e.target as HTMLDivElement).style.backgroundColor = 'rgba(74, 111, 165, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                (e.target as HTMLDivElement).style.backgroundColor = 'transparent';
                            }}
                        >
                            {SUPPORTED_CITIES[key].name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
