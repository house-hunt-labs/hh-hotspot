import type { MapNode } from '@/nodes/types';

/** Mock catalog; replace with DB rows mapping to the same fields later. */
export const STATIC_MAP_NODES: MapNode[] = [
  {
    id: 'home-1',
    type: 'home',
    label: 'My home',
    latitude: 12.9716,
    longitude: 77.5946,
    description: 'Example home pin (edit coordinates in mockData.ts)',
  },
  {
    id: 'house-1',
    type: 'house',
    label: 'Sample listing — Koramangala',
    latitude: 12.9352,
    longitude: 77.6245,
    description: 'Mock property node',
  },
  {
    id: 'snack-1',
    type: 'snack_shop',
    label: 'Juice & chai stall',
    latitude: 12.9784,
    longitude: 77.6408,
    description: 'Small kiosk — radius from type (50–100m)',
  },
  {
    id: 'gym-1',
    type: 'gym',
    label: 'FitWorks',
    latitude: 12.9116,
    longitude: 77.6474,
    description: 'Gym — type radius 400–500m',
  },
  {
    id: 'transit-1',
    type: 'transit',
    label: 'Metro entrance',
    latitude: 12.9753,
    longitude: 77.6063,
    description: 'Transit — type radius 1–1.5km',
  },
  {
    id: 'salon-1',
    type: 'salon',
    label: 'Cut & Glow',
    latitude: 12.9698,
    longitude: 77.7499,
  },
];
