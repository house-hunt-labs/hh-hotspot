'use client';

import dynamic from 'next/dynamic';

const GoogleMapView = dynamic(() => import('@/components/GoogleMapView'), { ssr: false });

export default function Home() {
  return <GoogleMapView />;
}
