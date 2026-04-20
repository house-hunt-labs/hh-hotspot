import type { MapNode, NodeTypeStyle } from '@/models/schema';

export function toNodeTypeStyleMap(
  styles: NodeTypeStyle[]
): Record<string, NodeTypeStyle> {
  return Object.fromEntries(
    styles.map((style) => [style.type, style])
  );
}

export function getNodeTypeStyle(
  type: string,
  styleMap: Record<string, NodeTypeStyle>
): NodeTypeStyle | undefined {
  return styleMap[type];
}

export function getNodeRadius(
    node: MapNode,
    styles: Record<string, NodeTypeStyle>
): number {
    return styles[node.type]?.maxRadius ?? 100;
}

export function getNodeColor(
  type: string,
  styles: Record<string, NodeTypeStyle>
): string {
  return styles[type]?.color ?? '#94a3b8';
}