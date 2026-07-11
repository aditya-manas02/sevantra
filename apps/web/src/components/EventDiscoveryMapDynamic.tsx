'use client';
import dynamic from 'next/dynamic';
const EventDiscoveryMap = dynamic(() => import('./EventDiscoveryMap'), { ssr: false });
export default EventDiscoveryMap;
