import type { MapNode } from '@/nodes/types';
import type { MapNodeSource } from '@/nodes/mapNodeSource';
import { StaticMapNodeSource } from '@/nodes/staticMapNodeSource';

/** Default source: static mock. Inject a DB-backed source here later. */
let activeSource: MapNodeSource = new StaticMapNodeSource();

/** For tests or wiring a repository without touching call sites. */
export function setMapNodeSource(source: MapNodeSource) {
  activeSource = source;
}

export async function getMapNodes(): Promise<MapNode[]> {
  return activeSource.list();
}
