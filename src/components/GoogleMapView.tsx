'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { CoordinateMarkForm } from '@/components/CoordinateMarkForm';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { getMapNodes } from '@/services/mapNodeService';
import { markerContentForType, userPlacementContent } from '@/lib/markerIcons';
import { createRadiantNodeHalosOverlay } from '@/lib/radiantHalosOverlay';
import { escapeHtml } from '@/lib/escapeHtml';
import type { MapNode } from '@/nodes/types';
import { radiusMetersForNode } from '@/nodes/nodeTypeRadius';

const defaultCenter = { lat: 12.9716, lng: 77.5946 };
const defaultZoom = 11;

let mapsScriptPromise: Promise<void> | null = null;

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (
    window.google?.maps?.Map &&
    window.google.maps.geometry?.spherical &&
    window.google.maps.marker?.AdvancedMarkerElement
  ) {
    return Promise.resolve();
  }

  if (mapsScriptPromise) return mapsScriptPromise;

  setOptions({
    key: apiKey,
    v: 'weekly',
    libraries: ['geometry'],
  });

  mapsScriptPromise = Promise.all([
    importLibrary('maps'),
    importLibrary('geometry'),
  ])
    .then(() => undefined)
    .catch((error: unknown) => {
      mapsScriptPromise = null;
      throw error;
    });

  return mapsScriptPromise;
}

function nodeInfoHtml(node: MapNode): string {
  const title = escapeHtml(node.label);
  const kind = escapeHtml(node.type);
  const r = radiusMetersForNode(node);
  const radiusLine = escapeHtml(`Influence: ${r}m (max radius)`);
  const desc = node.description ? `<div class="map-iw-desc">${escapeHtml(node.description)}</div>` : '';
  return `<div class="map-iw"><div class="map-iw-title">${title}</div><div class="map-iw-type">${kind}</div><div class="map-iw-radius">${radiusLine}</div>${desc}</div>`;
}

export default function GoogleMapView() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const nodeMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const geocodeMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const halosOverlayRef = useRef<google.maps.OverlayView | null>(null);

  const [query, setQuery] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setLoadError('Missing Google Maps API key. Set GOOGLE_MAP_DEMO_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.');
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        await loadGoogleMapsScript(apiKey);
        if (cancelled || !containerRef.current) return;

        const map = new google.maps.Map(containerRef.current, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID,
          draggable: true,
          scrollwheel: true,
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM,
          },
        });

        mapRef.current = map;
        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        const nodes = await getMapNodes();
        if (cancelled) return;

        const halos = createRadiantNodeHalosOverlay(nodes);
        halos.setMap(map);
        halosOverlayRef.current = halos;

        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        const markers: google.maps.marker.AdvancedMarkerElement[] = [];
        for (const node of nodes) {
          const marker = new AdvancedMarkerElement({
            map,
            position: { lat: node.latitude, lng: node.longitude },
            title: node.label,
            content: markerContentForType(node.type),
          });
          marker.addEventListener('click', () => {
            infoWindow.setContent(nodeInfoHtml(node));
            infoWindow.open({ map, anchor: marker });
          });
          markers.push(marker);
        }
        nodeMarkersRef.current = markers;
      } catch {
        if (!cancelled) setLoadError('Could not load Google Maps.');
      }
    })();

    return () => {
      cancelled = true;
      infoWindowRef.current?.close();
      infoWindowRef.current = null;
      halosOverlayRef.current?.setMap(null);
      halosOverlayRef.current = null;
      nodeMarkersRef.current.forEach((m) => {
        m.map = null;
      });
      nodeMarkersRef.current = [];
      if (geocodeMarkerRef.current) {
        geocodeMarkerRef.current.map = null;
      }
      geocodeMarkerRef.current = null;
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
      }
      userMarkerRef.current = null;
      mapRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [apiKey]);

  const handleSearch = useCallback(() => {
    const q = query.trim();
    setSearchError(null);
    if (!q) return;

    const map = mapRef.current;
    if (!map || !window.google?.maps) {
      setSearchError('Map is not ready yet.');
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: q }, (results, status) => {
      if (status !== 'OK' || !results?.[0]?.geometry?.location) {
        setSearchError('Geocode unavailable or no results (common on restricted demo keys). Use coordinates instead.');
        return;
      }

      const loc = results[0].geometry.location;
      map.panTo(loc);
      map.setZoom(15);

      if (geocodeMarkerRef.current) {
        geocodeMarkerRef.current.map = null;
      }
      geocodeMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: loc,
        title: results[0].formatted_address ?? q,
      });
      infoWindowRef.current?.close();
    });
  }, [query]);

  const handlePlaceByCoordinates = useCallback((latitude: number, longitude: number) => {
    const map = mapRef.current;
    if (!map || !window.google?.maps) return;

    const position = { lat: latitude, lng: longitude };
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
    }
    userMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map,
      position,
      title: 'Coordinate pin',
      content: userPlacementContent(),
    });
    map.panTo(position);
    const z = map.getZoom() ?? defaultZoom;
    map.setZoom(Math.max(z, 14));
    infoWindowRef.current?.close();
  }, []);

  return (
    <div className="map-app">
      <div ref={containerRef} className="map-canvas" />

      <div className="map-search-anchor">
        <div className="map-search-stack">
          <div className="map-search-surface">
            <SearchBar query={query} onQueryChange={setQuery} onSearch={handleSearch} />            
          </div>
          {searchError ? (
            <p className="map-search-status" role="status">
              {searchError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="map-coords-anchor">
        <CoordinateMarkForm onPlace={handlePlaceByCoordinates} />
      </div>

      {loadError ? (
        <div className="map-error-screen">
          <p className="map-error-text">{loadError}</p>
        </div>
      ) : null}
    </div>
  );
}
