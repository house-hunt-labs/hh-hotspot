import type { MapNodeType } from '@/nodes/types';
import type { NodeTypeStyle } from '@/nodes/nodeTypeAppearance';

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Fetches node type styles from the API at localhost:8080
 * Throws error if API fails (no fallback to local defaults)
 */
export async function fetchNodeTypeStyles(): Promise<Partial<Record<MapNodeType, NodeTypeStyle>>> {
  const response = await fetch(`${API_BASE_URL}/node-type-styles`);
  if (!response.ok) {
    throw new Error(`Failed to fetch node type styles: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const styles = Array.isArray(data) ? data : data.styles ?? [];
  
  // Convert array to Record
  const result: Partial<Record<MapNodeType, NodeTypeStyle>> = {};
  for (const style of styles) {
    if (style.type && style.color !== undefined && style.maxRadius !== undefined) {
      result[style.type as MapNodeType] = {
        color: style.color,
        maxRadius: style.maxRadius,
      };
    }
  }
  return result;
}

/**
 * Fetch a single node type style by type
 * Throws error if API fails (no fallback to local defaults)
 */
export async function fetchNodeTypeStyleByType(type: string): Promise<NodeTypeStyle> {
  const response = await fetch(`${API_BASE_URL}/node-type-styles?type=${encodeURIComponent(type)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch node type style: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  const styles = Array.isArray(data) ? data : data.styles ?? [];
  if (styles.length > 0) {
    const style = styles[0];
    return {
      color: style.color,
      maxRadius: style.maxRadius,
    };
  }
  throw new Error(`No style found for type: ${type}`);
}