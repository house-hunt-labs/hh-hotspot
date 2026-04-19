import type { MapNode } from '@/nodes/types';
import type { MapNodeSource } from '@/nodes/mapNodeSource';

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Fetches map nodes from the API at localhost:8080
 * Throws error if API fails (no fallback to mock data)
 */
export class ApiMapNodeSource implements MapNodeSource {
  async list(): Promise<MapNode[]> {
    const response = await fetch(`${API_BASE_URL}/map-nodes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch map nodes: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    // API returns array directly or wrapped in a property
    return Array.isArray(data) ? data : data.nodes ?? [];
  }

  /**
   * Fetch map nodes filtered by type
   * Throws error if API fails (no fallback to mock data)
   */
  async listByType(type: string): Promise<MapNode[]> {
    const response = await fetch(`${API_BASE_URL}/map-nodes?type=${encodeURIComponent(type)}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch map nodes by type: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data.nodes ?? [];
  }
}