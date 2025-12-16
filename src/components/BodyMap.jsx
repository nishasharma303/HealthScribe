import React, { useState } from 'react';

const BodyMap = ({ onLocationSelect, selectedLocations = [] }) => {
  const [hoveredPart, setHoveredPart] = useState(null);

  const bodyParts = [
    { id: 'head', x: 100, y: 40, r: 18, label: 'Head', cx: 100, cy: 40 },
    { id: 'neck', x: 100, y: 65, r: 12, label: 'Neck', cx: 100, cy: 65 },
    { id: 'chest', x: 100, y: 95, r: 22, label: 'Chest', cx: 100, cy: 95 },
    { id: 'abdomen', x: 100, y: 130, r: 20, label: 'Abdomen', cx: 100, cy: 130 },
    { id: 'left-shoulder', x: 70, y: 80, r: 12, label: 'L. Shoulder', cx: 70, cy: 80 },
    { id: 'right-shoulder', x: 130, y: 80, r: 12, label: 'R. Shoulder', cx: 130, cy: 80 },
    { id: 'left-arm', x: 55, y: 110, r: 10, label: 'L. Arm', cx: 55, cy: 110 },
    { id: 'right-arm', x: 145, y: 110, r: 10, label: 'R. Arm', cx: 145, cy: 110 },
    { id: 'left-leg', x: 85, y: 175, r: 12, label: 'L. Leg', cx: 85, cy: 175 },
    { id: 'right-leg', x: 115, y: 175, r: 12, label: 'R. Leg', cx: 115, cy: 175 },
    { id: 'back-upper', x: 250, y: 90, r: 22, label: 'Upper Back', cx: 250, cy: 90 },
    { id: 'back-lower', x: 250, y: 130, r: 20, label: 'Lower Back', cx: 250, cy: 130 },
  ];

  const handleClick = (part) => {
    const isSelected = selectedLocations.some(loc => loc.id === part.id);
    if (isSelected) {
      onLocationSelect(selectedLocations.filter(loc => loc.id !== part.id));
    } else {
      onLocationSelect([...selectedLocations, part]);
    }
  };

  const isSelected = (partId) => {
    return selectedLocations.some(loc => loc.id === partId);
  };

  return (
    <div className="body-map-wrapper">
      <div className="body-map-header">
        <h4 className="body-map-title">Mark Pain or Symptom Location</h4>
        <p className="body-map-subtitle">Click on body parts to indicate affected areas</p>
      </div>
      
      <svg viewBox="0 0 320 230" className="body-map-svg">
        {/* Grid lines for reference */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f0f9ff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>
        </defs>

        {/* Front View Label */}
        <text x="100" y="20" textAnchor="middle" className="view-label">Front View</text>
        
        {/* Front body outline */}
        <g className="body-outline">
          {/* Head */}
          <ellipse cx="100" cy="40" rx="18" ry="22" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          
          {/* Neck */}
          <rect x="92" y="58" width="16" height="12" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          
          {/* Torso */}
          <rect x="75" y="70" width="50" height="35" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          <rect x="75" y="105" width="50" height="40" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          
          {/* Arms */}
          <line x1="70" y1="80" x2="50" y2="120" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round"/>
          <line x1="130" y1="80" x2="150" y2="120" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round"/>
          
          {/* Legs */}
          <line x1="85" y1="145" x2="80" y2="190" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round"/>
          <line x1="115" y1="145" x2="120" y2="190" stroke="#94a3b8" strokeWidth="12" strokeLinecap="round"/>
        </g>

        {/* Back View Label */}
        <text x="250" y="20" textAnchor="middle" className="view-label">Back View</text>
        
        {/* Back body outline */}
        <g className="body-outline">
          {/* Head back */}
          <ellipse cx="250" cy="40" rx="18" ry="22" fill="none" stroke="#94a3b8" strokeWidth="2"/>
          
          {/* Back torso */}
          <rect x="225" y="70" width="50" height="80" rx="8" fill="none" stroke="#94a3b8" strokeWidth="2"/>
        </g>

        {/* Interactive clickable circles */}
        {bodyParts.map((part) => {
          const selected = isSelected(part.id);
          const hovered = hoveredPart === part.id;
          
          return (
            <g key={part.id}>
              <circle
                cx={part.cx}
                cy={part.cy}
                r={part.r}
                fill={selected ? '#ef4444' : hovered ? '#fca5a5' : 'rgba(59, 130, 246, 0.1)'}
                stroke={selected ? '#dc2626' : hovered ? '#f87171' : '#3b82f6'}
                strokeWidth={selected ? 3 : 2}
                className="body-part-clickable"
                onClick={() => handleClick(part)}
                onMouseEnter={() => setHoveredPart(part.id)}
                onMouseLeave={() => setHoveredPart(null)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
              {(hovered || selected) && (
                <text
                  x={part.cx}
                  y={part.cy + part.r + 12}
                  textAnchor="middle"
                  className="body-part-label"
                  style={{ 
                    fontSize: '10px', 
                    fill: selected ? '#dc2626' : '#1e40af', 
                    fontWeight: '600',
                    pointerEvents: 'none'
                  }}
                >
                  {part.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {selectedLocations.length > 0 && (
        <div className="selected-locations-display">
          <strong className="selected-label">Selected Areas:</strong>
          <div className="location-pills">
            {selectedLocations.map((loc) => (
              <span key={loc.id} className="location-pill">
                {loc.label}
                <button
                  onClick={() => handleClick(loc)}
                  className="remove-pill-btn"
                  aria-label="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMap;