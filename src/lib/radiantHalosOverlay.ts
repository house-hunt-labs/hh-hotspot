import type {
  MapNode,
  NodeTypeStyle,
} from '@/models/schema';

import {
  getNodeColor,
  getNodeRadius,
} from '@/lib/nodeTypeStyleUtils';

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace('#', '');

  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => `${c}${c}`)
          .join('')
      : normalized;

  const bigint = parseInt(value, 16);

  return [
    (bigint >> 16) & 255,
    (bigint >> 8) & 255,
    bigint & 255,
  ];
}

function rgbaFromHex(
  hex: string,
  alpha: number
): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function createRadiantNodeHalosOverlay(
  nodes: MapNode[],
  nodeTypeStyles: Record<string, NodeTypeStyle>
): google.maps.OverlayView {
  class RadiantNodeHalosOverlayImpl extends google.maps.OverlayView {
    private readonly nodeList: MapNode[];
    private readonly nodeDivs =
      new Map<MapNode, HTMLDivElement>();

    constructor(nodeList: MapNode[]) {
      super();
      this.nodeList = nodeList;
    }

    onAdd(): void {
      const panes = this.getPanes();

      if (!panes?.overlayLayer) return;

      for (const node of this.nodeList) {
        const color = getNodeColor(
          node.type,
          nodeTypeStyles
        );

        const div = document.createElement('div');

        div.style.position = 'absolute';
        div.style.borderRadius = '50%';
        div.style.pointerEvents = 'none';
        div.style.background = `
          radial-gradient(
            circle,
            ${rgbaFromHex(color, 0.72)} 0%,
            ${rgbaFromHex(color, 0.24)} 60%,
            rgba(255,255,255,0) 100%
          )
        `;

        div.style.willChange =
          'width,height,left,top';

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

        const latLng = new google.maps.LatLng(
          node.latitude,
          node.longitude
        );

        const center =
          projection.fromLatLngToDivPixel(latLng);

        if (!center) continue;

        const radiusMeters = getNodeRadius(
          node,
          nodeTypeStyles
        );

        const radiusPx = this.getPixelRadius(
          projection,
          latLng,
          radiusMeters
        );

        const size = radiusPx * 2;

        div.style.width = `${size}px`;
        div.style.height = `${size}px`;
        div.style.left = `${center.x - radiusPx}px`;
        div.style.top = `${center.y - radiusPx}px`;
      }
    }

    private getPixelRadius(
      projection: google.maps.MapCanvasProjection,
      center: google.maps.LatLng,
      radiusMeters: number
    ): number {
      const metersPerDegree =
        111320 *
        Math.cos(
          (center.lat() * Math.PI) / 180
        );

      const deltaLng =
        radiusMeters / metersPerDegree;

      const edge = new google.maps.LatLng(
        center.lat(),
        center.lng() + deltaLng
      );

      const p1 =
        projection.fromLatLngToDivPixel(center);

      const p2 =
        projection.fromLatLngToDivPixel(edge);

      if (!p1 || !p2) return 0;

      return Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
          Math.pow(p2.y - p1.y, 2)
      );
    }

    onRemove(): void {
      for (const div of this.nodeDivs.values()) {
        div.remove();
      }

      this.nodeDivs.clear();
    }
  }

  return new RadiantNodeHalosOverlayImpl(nodes);
}