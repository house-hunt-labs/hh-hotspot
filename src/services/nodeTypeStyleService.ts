import type { NodeTypeStyle } from '@/models/schema';

const API_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Fetch all node type styles
 * Returns object keyed by type
 */
export async function fetchNodeTypeStyles(): Promise<NodeTypeStyle[]> {
  const response = await fetch(`${API_BASE_URL}/node-type-styles`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch node type styles: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const styles = Array.isArray(data) ? data : data.styles ?? [];
  
  return styles;
}

/**
 * Fetch single node type style by type
 */
export async function fetchNodeTypeStyleByType(
  type: string
): Promise<NodeTypeStyle> {
  const response = await fetch(
    `${API_BASE_URL}/node-type-styles?type=${encodeURIComponent(type)}`
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch node type style: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const styles = Array.isArray(data) ? data : data.styles ?? [];

  if (!styles.length) {
    throw new Error(`No style found for type: ${type}`);
  }

  const style = styles[0];
  
  return style;
}