import type { MapNodeType } from '@/nodes/types';

/**
 * Shared type tokens for node color and radius.
 * All node visual properties derive from this single source of truth.
 */
export interface NodeTypeStyle {
  /** Primary node color used for marker fill and heatmap gradient */
  color: string;
  /** Maximum influence radius for the radiant circle, in meters */
  maxRadius: number;
}

export const NODE_TYPE_STYLE: Record<MapNodeType, NodeTypeStyle> = {
  home: {
    color: '#14b8a6',
    maxRadius: 260,
  },
  house: {
    color: '#818cf8',
    maxRadius: 200,
  },
  snack_shop: {
    color: '#fb923c',
    maxRadius: 100,
  },
  gym: {
    color: '#fb7185',
    maxRadius: 500,
  },
  transit: {
    color: '#22d3ee',
    maxRadius: 1500,
  },
  salon: {
    color: '#c084fc',
    maxRadius: 90,
  },
  other: {
    color: '#94a3b8',
    maxRadius: 150,
  },
};

export function appearanceForType(type: MapNodeType): NodeTypeStyle {
  return NODE_TYPE_STYLE[type] ?? NODE_TYPE_STYLE.other;
}
