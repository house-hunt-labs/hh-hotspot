'use client';

import { useCallback } from 'react';
import type { MapNodeType } from '@/nodes/types';
import { MAP_NODE_TYPES } from '@/nodes/types';
import { NODE_TYPE_STYLE } from '@/nodes/nodeTypeAppearance';

interface DrawerMenuProps {
  selectedTypes: Set<MapNodeType>;
  onToggle: (type: MapNodeType) => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  onClose: () => void;
}

export function DrawerMenu({ selectedTypes, onToggle, showMarkers, onToggleMarkers, onClose }: DrawerMenuProps) {
  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer-panel open">
        <div className="drawer-header">
          <h2 className="drawer-title">Map Layers</h2>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-header">
            <span className="drawer-section-title">Markers</span>
          </div>
          <button 
            className={`drawer-toggle-row ${showMarkers ? 'active' : ''}`}
            onClick={onToggleMarkers}
          >
            <span className="drawer-toggle-label">Show markers on map</span>
            <span className="drawer-toggle-switch">
              <span className="drawer-toggle-knob" />
            </span>
          </button>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-header">
            <span className="drawer-section-title">Layer Types</span>
            <span className="drawer-section-subtitle">{selectedTypes.size} of {MAP_NODE_TYPES.length} selected</span>
          </div>
          <div className="drawer-type-list">
            {MAP_NODE_TYPES.map((type) => {
              const isSelected = selectedTypes.has(type);
              const style = NODE_TYPE_STYLE[type];
              return (
                <button
                  key={type}
                  className={`drawer-type-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => onToggle(type)}
                >
                  <span className="drawer-type-indicator" style={{ backgroundColor: style.color }} />
                  <span className="drawer-type-name">{type.replace('_', ' ')}</span>
                  <span className="drawer-type-radius">{style.maxRadius}m</span>
                  <span className={`drawer-type-check ${isSelected ? 'visible' : ''}`}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="drawer-footer">
          <p className="drawer-footer-text">Tap a type to toggle visibility</p>
        </div>
      </div>
    </>
  );
}

interface MenuButtonProps {
  onClick: () => void;
}

export function MenuButton({ onClick }: MenuButtonProps) {
  return (
    <button className="menu-button" onClick={onClick} aria-label="Open menu">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 12h18M3 6h18M3 18h18" />
      </svg>
    </button>
  );
}