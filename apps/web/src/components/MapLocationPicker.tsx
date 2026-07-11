'use client';
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Target } from 'lucide-react';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function MapLocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [center, setCenter] = useState<[number, number]>([51.505, -0.09]);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (position) {
      onLocationSelect(position[0], position[1]);
    }
  }, [position, onLocationSelect]);

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const latLng: [number, number] = [lat, lng];
          setCenter(latLng);
          setPosition(latLng);
          if (mapRef.current) {
            mapRef.current.flyTo(latLng, 14);
          }
        },
        (error) => toast.error('Could not get your location. Please allow location access.')
      );
    }
  };

  return (
    <div className="relative h-[300px] w-full rounded-[var(--radius-md)] overflow-hidden border border-[var(--border)] shadow-warm-sm z-0 group">
      <button 
        onClick={handleLocateMe}
        className="absolute top-4 right-4 z-[1000] bg-[var(--surface)] p-2 rounded-[var(--radius-sm)] shadow-md border border-[var(--border)] hover:bg-[var(--background)] transition-colors text-[var(--text-primary)] flex items-center gap-2 font-medium text-sm"
      >
        <LocateFixed className="w-4 h-4 text-[var(--primary)]" />
        Locate Me
      </button>
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
