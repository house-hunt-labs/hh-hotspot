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
 * This overlay uses a DOM div per node and recalculates the pixel radius
 * whenever the map is redrawn, so the circle represents a fixed meter radius.
 */
export function createRadiantNodeHalosOverlay(nodes: MapNode[]): google.maps.OverlayView {
  if (typeof window === 'undefined' || typeof google === 'undefined' || !google.maps?.OverlayView) {
    throw new Error('Google Maps API must be loaded before createRadiantNodeHalosOverlay()');
  }

  class RadiantNodeHalosOverlayImpl extends google.maps.OverlayView {
    private readonly root: HTMLDivElement;
    private readonly nodeList: MapNode[];
    private readonly nodeDivs: Map<MapNode, HTMLDivElement>;

    constructor(nodeList: MapNode[]) {
      super();
      this.nodeList = nodeList;
      this.nodeDivs = new Map();

      this.root = document.createElement('div');
      this.root.style.position = 'absolute';
      this.root.style.inset = '0';
      this.root.style.pointerEvents = 'none';
      this.root.style.overflow = 'visible';
    }

    onAdd(): void {
      const panes = this.getPanes();
      if (!panes?.overlayLayer) return;

      for (const node of this.nodeList) {
        const color = appearanceForType(node.type).color;
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.border = 'none';
        div.style.borderRadius = '50%';
        div.style.pointerEvents = 'none';
        div.style.background = `radial-gradient(circle, ${rgbaFromHex(color, 0.72)} 0%, ${rgbaFromHex(color, 0.24)} 60%, rgba(255,255,255,0) 100%)`;
        div.style.willChange = 'width, height, left, top';

        this.nodeDivs.set(node, div);
        panes.overlayLayer.appendChild(div);
      }

      this.draw();
    }

    draw(): void {
      const projection = this.getProjection();
      if (!projection) return;

      for (const node of this.nodeList) {
        const div = this.nodeDivs.get(node);
        if (!div) continue;

        const latLng = new google.maps.LatLng(node.latitude, node.longitude);
        const centerPixel = projection.fromLatLngToDivPixel(latLng);
        if (!centerPixel) continue;

        const radiusM = Math.max(1, radiusMetersForNode(node));
        const radiusPx = this.getPixelRadius(projection, latLng, radiusM);
        const size = Math.max(0, radiusPx * 2);

        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        div.style.left = `${centerPixel.x - radiusPx}px`;
        div.style.top = `${centerPixel.y - radiusPx}px`;
      }
    }

    private getPixelRadius(projection: google.maps.MapCanvasProjection, center: google.maps.LatLng, radiusMeters: number): number {
      const metersPerDegree = 111320 * Math.cos(center.lat() * Math.PI / 180);
      const radiusInDegrees = radiusMeters / metersPerDegree;
      const edgeLatLng = new google.maps.LatLng(center.lat(), center.lng() + radiusInDegrees);
      const p1 = projection.fromLatLngToDivPixel(center);
      const p2 = projection.fromLatLngToDivPixel(edgeLatLng);
      if (!p1 || !p2) return 0;
      return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    onRemove(): void {
      for (const div of this.nodeDivs.values()) {
        if (div.parentNode) {
          div.parentNode.removeChild(div);
        }
      }
      this.nodeDivs.clear();
    }
  }

  return new RadiantNodeHalosOverlayImpl(nodes);
}
