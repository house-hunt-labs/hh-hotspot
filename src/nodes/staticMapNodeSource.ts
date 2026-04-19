import { STATIC_MAP_NODES } from '@/nodes/mockData';
import type { MapNodeSource } from '@/nodes/mapNodeSource';

export class StaticMapNodeSource implements MapNodeSource {
  async list() {
    return Promise.resolve(STATIC_MAP_NODES);
  }
}
