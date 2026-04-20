import type { MapNode } from '@/models/schema';

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Fetch all map nodes directly from API
 */
export async function getMapNodes(): Promise<MapNode[]> {
  const response = await fetch(`${API_BASE_URL}/map-nodes`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch map nodes: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.nodes ?? [];
}

/**
 * Fetch map nodes filtered by type directly from API
 */
export async function getMapNodesByType(
  type: string
): Promise<MapNode[]> {
  const response = await fetch(
    `${API_BASE_URL}/map-nodes?type=${encodeURIComponent(type)}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch map nodes by type: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  return Array.isArray(data) ? data : data.nodes ?? [];
}