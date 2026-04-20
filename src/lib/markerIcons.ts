import type { MapNodeType } from '@/nodes/types';
import { appearanceForType } from '@/nodes/nodeTypeAppearance';

// This file only creates the location pin content for each node.
// The separate soft circle around the node is rendered by radiantHalosOverlay.ts.
function pinSvg(fill: string): string {
  const stroke = 'rgba(15, 23, 42, 0.85)';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 28 40" aria-hidden="true">
    <path
      d="M14 2C8 2 3 7.5 3 13.6c0 7.7 11 18.7 11 18.7s11-11 11-18.7C25 7.5 20 2 14 2Z"
      fill="${fill}"
      stroke="${stroke}"
      stroke-width="1.2"
    />
    <circle cx="14" cy="14" r="4" fill="white" opacity="0.5"/>
  </svg>`;
}

function svgToElement(svg: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = svg;
  return wrapper.firstElementChild as HTMLElement;
}

export function markerContentForType(type: MapNodeType): Node {
  return svgToElement(pinSvg(appearanceForType(type).color));
}

/** Marker colors come from `nodeTypeAppearance` (single palette). */
export function markerIconForType(type: MapNodeType): google.maps.Icon {
  const fill = appearanceForType(type).color;
  const svg = pinSvg(fill);
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(32, 40),
    anchor: new google.maps.Point(16, 40),
  };
}

/** Distinct look for user-placed coordinate pins. */
export function userPlacementIcon(): google.maps.Icon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
  <circle cx="15" cy="15" r="8.5" fill="#38bdf8" fill-opacity="0.92" stroke="#ffffff" stroke-width="2"/>
  <circle cx="15" cy="13" r="3.6" fill="#ffffff" fill-opacity="0.92"/>
</svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(30, 30),
    anchor: new google.maps.Point(15, 15),
  };
}

export function userPlacementContent(): Node {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true">
  <circle cx="15" cy="15" r="8.5" fill="#38bdf8" fill-opacity="0.92" stroke="#ffffff" stroke-width="2"/>
  <circle cx="15" cy="13" r="3.6" fill="#ffffff" fill-opacity="0.92"/>
</svg>`;
  return svgToElement(svg);
}
