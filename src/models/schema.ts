/** Additional metadata from Google Places / external providers */
export interface MapNodeMetadata {
  google_place_id?: string;
  rating?: number;
  user_ratings_total?: number;
}

/** Styling config for each node type */
export interface NodeTypeStyle {
  id: string;
  type: string;
  color: string;
  maxRadius: number;
}

/** Main map node entity */
export interface MapNode {
  id: string;
  type: string; 
  label: string;
  latitude: number;
  longitude: number;
  description?: string;
  metadata?: MapNodeMetadata;
}