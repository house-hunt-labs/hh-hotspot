import type { MapNode } from '@/nodes/types';
import type { MapNodeSource } from '@/nodes/mapNodeSource';
import { StaticMapNodeSource } from '@/nodes/staticMapNodeSource';
import { ApiMapNodeSource } from '@/nodes/apiMapNodeSource';

/** Default source: API-backed source pointing to localhost:8080 */
let activeSource: MapNodeSource = new ApiMapNodeSource();

/** For tests or wiring a repository without touching call sites. */
export function setMapNodeSource(source: MapNodeSource) {
  activeSource = source;
}

/** Switch to static mock data source */
export function useStaticSource() {
  activeSource = new StaticMapNodeSource();
}

/** Switch to API source */
export function useApiSource() {
  activeSource = new ApiMapNodeSource();
}

export async function getMapNodes(): Promise<MapNode[]> {
  return activeSource.list();
}

export async function getMapNodesByType(type: string): Promise<MapNode[]> {
  if (activeSource.listByType) {
    return activeSource.listByType(type);
  }
  // Fallback: filter from all nodes
  const allNodes = await activeSource.list();
  return allNodes.filter((node) => node.type === type);
}
