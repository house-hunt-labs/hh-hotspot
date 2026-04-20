'use client';

import type { NodeTypeStyle } from '@/models/schema';

interface DrawerMenuProps {
  selectedTypes: Set<string>;
  nodeTypeStyles: Record<string, NodeTypeStyle>;
  onToggle: (type: string) => void;
  showMarkers: boolean;
  onToggleMarkers: () => void;
  onClose: () => void;
}

export function DrawerMenu({
  selectedTypes,
  nodeTypeStyles,
  onToggle,
  showMarkers,
  onToggleMarkers,
  onClose,
}: DrawerMenuProps) {
  const types = Object.keys(nodeTypeStyles);

  return (
    <>
      <div
        className="drawer-overlay"
        onClick={onClose}
      />

      <div className="drawer-panel open">
        <div className="drawer-header">
          <h2 className="drawer-title">
            Map Layers
          </h2>

          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-header">
            <span className="drawer-section-title">
              Markers
            </span>
          </div>

          <button
            className={`drawer-toggle-row ${
              showMarkers ? 'active' : ''
            }`}
            onClick={onToggleMarkers}
          >
            <span className="drawer-toggle-label">
              Show markers on map
            </span>

            <span className="drawer-toggle-switch">
              <span className="drawer-toggle-knob" />
            </span>
          </button>
        </div>

        <div className="drawer-section">
          <div className="drawer-section-header">
            <span className="drawer-section-title">
              Layer Types
            </span>

            <span className="drawer-section-subtitle">
              {selectedTypes.size} of {types.length} selected
            </span>
          </div>

          <div className="drawer-type-list">
            {types.map((type) => {
              const style =
                nodeTypeStyles[type];

              const isSelected =
                selectedTypes.has(type);

              return (
                <button
                  key={type}
                  className={`drawer-type-item ${
                    isSelected
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() =>
                    onToggle(type)
                  }
                >
                  <span
                    className="drawer-type-indicator"
                    style={{
                      backgroundColor:
                        style.color,
                    }}
                  />

                  <span className="drawer-type-name">
                    {type.replace(/_/g, ' ')}
                  </span>

                  <span className="drawer-type-radius">
                    {style.maxRadius}m
                  </span>

                  <span
                    className={`drawer-type-check ${
                      isSelected
                        ? 'visible'
                        : ''
                    }`}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="drawer-footer">
          <p className="drawer-footer-text">
            Tap a type to toggle visibility
          </p>
        </div>
      </div>
    </>
  );
}

interface MenuButtonProps {
  onClick: () => void;
}

export function MenuButton({
  onClick,
}: MenuButtonProps) {
  return (
    <button
      className="menu-button"
      onClick={onClick}
      aria-label="Open menu"
    >
      ☰
    </button>
  );
}