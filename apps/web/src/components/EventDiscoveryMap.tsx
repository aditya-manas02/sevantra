'use client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapEvents({ onMoveEnd }: { onMoveEnd: (lat: number, lng: number) => void }) {
  useMapEvents({
    moveend(e) {
      const center = e.target.getCenter();
      onMoveEnd(center.lat, center.lng);
    }
  });
  return null;
}

import { useMap } from 'react-leaflet';

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function EventDiscoveryMap({ 
  events, 
  onCenterChange,
  initialCenter = [51.505, -0.09] 
}: { 
  events: any[], 
  onCenterChange: (lat: number, lng: number) => void,
  initialCenter?: [number, number]
}) {
  return (
    <div className="h-[500px] w-full rounded-md overflow-hidden border border-[var(--border)] shadow-warm-sm z-0">
      <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <ChangeView center={initialCenter} />
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onMoveEnd={onCenterChange} />
        {events.map((event) => (
          <Marker key={event.id} position={[event.latitude, event.longitude]}>
            <Popup>
              <strong>{event.title}</strong><br/>
              {event.locationName}<br/>
              {new Date(event.startDate).toLocaleDateString()}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
