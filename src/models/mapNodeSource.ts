import type { MapNode } from '@/models/schema';

/**
 * Port: anything that can list map nodes (static JSON today, Prisma/API tomorrow).
 * Swap implementations without changing callers.
 */
export interface MapNodeSource {
  list(): Promise<MapNode[]>;
  listByType?(type: string): Promise<MapNode[]>;
}
