import type { MapNode, MapNodeType } from '@/nodes/types';
import { appearanceForType } from '@/nodes/nodeTypeAppearance';

/**
 * Radius policy is centralized on the node type style mapping.
 * Each node type defines a max radius in meters.
 */
export function radiusMetersForNode(node: Pick<MapNode, 'type'>): number {
  return appearanceForType(node.type).maxRadius;
}

export function formatRadiusRange(type: MapNodeType): string {
  return `${appearanceForType(type).maxRadius}m`;
}
