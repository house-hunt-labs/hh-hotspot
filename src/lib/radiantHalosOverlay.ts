import type { MapNode } from '@/nodes/types';
import { appearanceForType } from '@/nodes/nodeTypeAppearance';
import { radiusMetersForNode } from '@/nodes/nodeTypeRadius';

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => `${char}${char}`).join('')
    : normalized;
  const bigint = parseInt(value, 16);
  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

function rgbaFromHex(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Draws a soft, type-based circle around each node location.
 * This is a separate overlay from the node pin marker itself.
 * It uses true map-distance radius values from the type style mapping,
 * so the circle scales correctly with zoom and stays centered on the node.
 */
export function createRadiantNodeHalosOverlay(nodes: MapNode[]): google.maps.OverlayView {
  if (typeof window === 'undefined' || typeof google === 'undefined' || !google.maps?.OverlayView) {
    throw new Error('Google Maps API must be loaded before createRadiantNodeHalosOverlay()');
  }

  class RadiantNodeHalosOverlayImpl extends google.maps.OverlayView {
    private readonly root: HTMLDivElement;
    private readonly canvas: HTMLCanvasElement;
    private readonly nodeList: MapNode[];
    private listeners: google.maps.MapsEventListener[] = [];

    constructor(nodeList: MapNode[]) {
      super();
      this.nodeList = nodeList;
      this.root = document.createElement('div');
      this.root.style.position = 'absolute';
      this.root.style.inset = '0';
      this.root.style.pointerEvents = 'none';

      this.canvas = document.createElement('canvas');
      this.canvas.style.display = 'block';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.root.appendChild(this.canvas);
    }

    onAdd(): void {
      const panes = this.getPanes();
      if (!panes?.overlayLayer) return;

      panes.overlayLayer.appendChild(this.root);

      const map = this.getMap();
      if (!map) return;

      const redraw = () => {
        this.draw();
      };

      this.listeners = [
        map.addListener('bounds_changed', redraw),
        map.addListener('zoom_changed', redraw),
        map.addListener('center_changed', redraw),
        map.addListener('projection_changed', redraw),
        map.addListener('idle', redraw),
      ];

      redraw();
    }

    onRemove(): void {
      this.listeners.forEach((l) => {
        google.maps.event.removeListener(l);
      });
      this.listeners = [];
      if (this.root.parentNode) {
        this.root.parentNode.removeChild(this.root);
      }
    }

    draw(): void {
      const map = this.getMap();
      const projection = this.getProjection();
      if (!map || !projection || !(map instanceof google.maps.Map)) return;

      const spherical = google.maps.geometry?.spherical;
      if (!spherical) return;

      const mapDiv = map.getDiv();
      const w = mapDiv.clientWidth;
      const h = mapDiv.clientHeight;
      if (w === 0 || h === 0) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      this.canvas.width = Math.floor(w * dpr);
      this.canvas.height = Math.floor(h * dpr);

      const ctx = this.canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      for (const node of this.nodeList) {
        const radiusM = Math.max(1, radiusMetersForNode(node));
        const latLng = new google.maps.LatLng(node.latitude, node.longitude);
        const center = projection.fromLatLngToDivPixel(latLng);
        if (!center) continue;

        const edgeLatLng = spherical.computeOffset(latLng, radiusM, 90);
        const edge = projection.fromLatLngToDivPixel(edgeLatLng);
        if (!edge) continue;

        let r = Math.hypot(edge.x - center.x, edge.y - center.y);
        r = Math.max(r, 10);

        const { color } = appearanceForType(node.type);
        const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, r);
        grad.addColorStop(0, rgbaFromHex(color, 0.84));
        grad.addColorStop(0.2, rgbaFromHex(color, 0.52));
        grad.addColorStop(0.45, rgbaFromHex(color, 0.28));
        grad.addColorStop(0.8, rgbaFromHex(color, 0.12));
        grad.addColorStop(1, rgbaFromHex(color, 0));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  return new RadiantNodeHalosOverlayImpl(nodes);
}
