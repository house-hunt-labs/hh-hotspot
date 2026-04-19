/** Place / POI category — extend as product grows. */
export const MAP_NODE_TYPES = [
  'home',
  'house',
  /** Juice / chai / sutta kiosk — small footprint */
  'snack_shop',
  'gym',
  /** Bus stop, metro, interchange — large catchment */
  'transit',
  'salon',
  'other',
] as const;

export type MapNodeType = (typeof MAP_NODE_TYPES)[number];

/**
 * Domain model for a mappable entity.
 * Each node now stores a normalized `max_radius` value for radiant circle rendering.
 */
export interface MapNode {
  id: string;
  type: MapNodeType;
  label: string;
  latitude: number;
  longitude: number;
  description?: string;
}
