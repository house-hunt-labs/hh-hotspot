'use client';

import { useState } from 'react';

type CoordinateMarkFormProps = {
  onPlace: (latitude: number, longitude: number) => void;
};

function parseCoord(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function CoordinateMarkForm({ onPlace }: CoordinateMarkFormProps) {
  const [latText, setLatText] = useState('');
  const [lngText, setLngText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    const lat = parseCoord(latText);
    const lng = parseCoord(lngText);
    if (lat === null || lng === null) {
      setError('Enter valid numbers for latitude and longitude.');
      return;
    }
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90.');
      return;
    }
    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180.');
      return;
    }
    onPlace(lat, lng);
  };

  const clear = () => {
    setLatText('');
    setLngText('');
    setError(null);
  };

  return (
    <div className="map-coords-panel">
      <p className="map-coords-title">Pin by coordinates</p>
      <div className="map-coords-row">
        <input
          className="map-coords-input"
          inputMode="decimal"
          placeholder="Lat (e.g. 12.97)"
          aria-label="Latitude"
          value={latText}
          onChange={(e) => setLatText(e.target.value)}
        />
        <input
          className="map-coords-input"
          inputMode="decimal"
          placeholder="Lng (e.g. 77.59)"
          aria-label="Longitude"
          value={lngText}
          onChange={(e) => setLngText(e.target.value)}
        />
      </div>
      <div className="map-coords-actions">
        <button type="button" className="map-coords-btn map-coords-btn-primary" onClick={submit}>
          Show on map
        </button>
        <button type="button" className="map-coords-btn map-coords-btn-ghost" onClick={clear}>
          Clear
        </button>
      </div>
      {error ? (
        <p className="map-coords-msg" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
