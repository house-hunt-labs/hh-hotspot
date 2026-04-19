'use client';

import { useCallback } from 'react';
import type { MapNodeType } from '@/nodes/types';
import { MAP_NODE_TYPES } from '@/nodes/types';
import { NODE_TYPE_STYLE } from '@/nodes/nodeTypeAppearance';

interface TypeToggleProps {
  selectedTypes: Set<MapNodeType>;
  onToggle: (type: MapNodeType) => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
}

export function TypeToggle({ selectedTypes, onToggle, showMarkers, onToggleMarkers }: TypeToggleProps) {
  const handleToggle = useCallback((type: MapNodeType) => {
    onToggle(type);
  }, [onToggle]);

  return (
    <div className="type-toggle-panel">
      <div className="type-toggle-header">
        <span className="type-toggle-title">Map Layers</span>
        <button 
          className={`marker-toggle-btn ${showMarkers ? 'active' : ''}`}
          onClick={onToggleMarkers}
          title={showMarkers ? 'Hide markers' : 'Show markers'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {showMarkers ? 'Markers On' : 'Markers Off'}
        </button>
      </div>
      <div className="type-toggle-list">
        {MAP_NODE_TYPES.map((type) => {
          const isSelected = selectedTypes.has(type);
          const style = NODE_TYPE_STYLE[type];
          return (
            <button
              key={type}
              className={`type-toggle-item ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(type)}
              style={{
                '--type-color': style.color,
              } as React.CSSProperties}
            >
              <span className="type-toggle-indicator" style={{ backgroundColor: style.color }} />
              <span className="type-toggle-label">{type.replace('_', ' ')}</span>
              <span className="type-toggle-radius">{style.maxRadius}m</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}