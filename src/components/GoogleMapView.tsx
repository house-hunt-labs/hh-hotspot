'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CoordinateMarkForm } from '@/components/CoordinateMarkForm';
import { DrawerMenu, MenuButton } from '@/components/DrawerMenu';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { getMapNodes } from '@/services/mapNodeService';
import { markerContentForType, userPlacementContent } from '@/lib/markerIcons';
import { createRadiantNodeHalosOverlay } from '@/lib/radiantHalosOverlay';
import { escapeHtml } from '@/lib/escapeHtml';
import type { MapNode, MapNodeType } from '@/nodes/types';
import { MAP_NODE_TYPES } from '@/nodes/types';
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

interface MapState {
  center: google.maps.LatLngLiteral;
  zoom: number;
  heading: number;
  tilt: number;
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
  const mapStateRef = useRef<MapState | null>(null);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<MapNodeType>>(() => new Set(MAP_NODE_TYPES));
  const [showMarkers, setShowMarkers] = useState(true);
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Save map state before any re-render
  const saveMapState = useCallback(() => {
    const map = mapRef.current;
    if (map) {
      mapStateRef.current = {
        center: map.getCenter()?.toJSON() ?? defaultCenter,
        zoom: map.getZoom() ?? defaultZoom,
        heading: map.getHeading() ?? 0,
        tilt: map.getTilt() ?? 0,
      };
    }
  }, []);

  // Restore map state after re-render
  const restoreMapState = useCallback(() => {
    const map = mapRef.current;
    const state = mapStateRef.current;
    if (map && state) {
      map.setCenter(state.center);
      map.setZoom(state.zoom);
      map.setHeading(state.heading);
      map.setTilt(state.tilt);
    }
  }, []);

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
        
        // Listen for map state changes to keep state ref updated
        map.addListener('center_changed', () => {
          if (mapStateRef.current && map.getCenter()) {
            mapStateRef.current.center = map.getCenter()!.toJSON();
          }
        });
        map.addListener('zoom_changed', () => {
          if (mapStateRef.current) {
            mapStateRef.current.zoom = map.getZoom() ?? defaultZoom;
          }
        });

        const infoWindow = new google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        const fetchedNodes = await getMapNodes();
        if (cancelled) return;

        setNodes(fetchedNodes);

        const filteredNodes = fetchedNodes.filter((node) => selectedTypes.has(node.type));
        const halos = createRadiantNodeHalosOverlay(filteredNodes);
        halos.setMap(map);
        halosOverlayRef.current = halos;

        const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
        const markers: google.maps.marker.AdvancedMarkerElement[] = [];
        for (const node of filteredNodes) {
          const marker = new AdvancedMarkerElement({
            map: showMarkers ? map : null,
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

  // Update markers and halos when selectedTypes or showMarkers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || nodes.length === 0) return;

    // Save current map state before updating
    saveMapState();

    const filteredNodes = nodes.filter((node) => selectedTypes.has(node.type));

    // Update halos
    if (halosOverlayRef.current) {
      halosOverlayRef.current.setMap(null);
    }
    const halos = createRadiantNodeHalosOverlay(filteredNodes);
    halos.setMap(map);
    halosOverlayRef.current = halos;

    // Update markers
    nodeMarkersRef.current.forEach((m) => {
      m.map = null;
    });

    (async () => {
      const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker');
      const markers: google.maps.marker.AdvancedMarkerElement[] = [];
      for (const node of filteredNodes) {
        const marker = new AdvancedMarkerElement({
          map: showMarkers ? map : null,
          position: { lat: node.latitude, lng: node.longitude },
          title: node.label,
          content: markerContentForType(node.type),
        });
        marker.addEventListener('click', () => {
          infoWindowRef.current?.setContent(nodeInfoHtml(node));
          infoWindowRef.current?.open({ map, anchor: marker });
        });
        markers.push(marker);
      }
      nodeMarkersRef.current = markers;
      
      // Restore map state after markers are updated
      restoreMapState();
    })();
  }, [selectedTypes, showMarkers, nodes, saveMapState, restoreMapState]);

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

  const handleTypeToggle = useCallback((type: MapNodeType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleToggleMarkers = useCallback(() => {
    setShowMarkers((prev) => !prev);
  }, []);

  const handleOpenDrawer = useCallback(() => {
    saveMapState();
    setIsDrawerOpen(true);
  }, [saveMapState]);

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <div className="map-app">
      <div ref={containerRef} className="map-canvas" />

      <MenuButton onClick={handleOpenDrawer} />

      {isDrawerOpen && (
        <DrawerMenu
          selectedTypes={selectedTypes}
          onToggle={handleTypeToggle}
          showMarkers={showMarkers}
          onToggleMarkers={handleToggleMarkers}
          onClose={handleCloseDrawer}
        />
      )}

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
