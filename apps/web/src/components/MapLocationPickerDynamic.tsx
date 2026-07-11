'use client';
import dynamic from 'next/dynamic';

const MapLocationPicker = dynamic(() => import('./MapLocationPicker'), { ssr: false });
export default MapLocationPicker;
