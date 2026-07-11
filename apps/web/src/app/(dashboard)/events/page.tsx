'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import EventDiscoveryMapDynamic from '@/components/EventDiscoveryMapDynamic';
import { Input } from '@/components/ui/input';
import { Leaf, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function EventDiscoveryPage() {
  const { t } = useTranslation();
  const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [radius, setRadius] = useState(10); // miles
  const [hasLocated, setHasLocated] = useState(false);

  useEffect(() => {
    if (navigator.geolocation && !hasLocated) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
          setHasLocated(true);
        },
        (error) => console.log('Geolocation error', error)
      );
    }
  }, [hasLocated]);

  const { data: events, isLoading } = useQuery({
    queryKey: ['events', center.lat, center.lng, radius],
    queryFn: async () => (await api.get(`/events?lat=${center.lat}&lng=${center.lng}&radius=${radius}`)).data.events
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--border)] relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--primary)] tracking-tight flex items-center gap-3">
            <Leaf className="w-8 h-8 md:w-10 md:h-10 text-[var(--secondary)]" />
            {t('events.discoverTitle', 'Community Events')}
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg font-medium">{t('events.discoverSubtitle', 'Find ways to give back to nature and your community.')}</p>
        </div>
        <div className="flex items-center gap-4 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] shadow-soft-sm relative z-10">
          <label className="text-sm font-bold text-[var(--text-primary)]">{t('events.searchArea', 'Search Area (Miles)')}</label>
          <Input 
            type="number" 
            className="w-24 text-center font-bold" 
            value={radius} 
            onChange={(e) => setRadius(Number(e.target.value))} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mt-8 relative z-10">
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-[var(--text-secondary)] font-medium p-12 text-center bg-[var(--surface)]/50 rounded-3xl border border-[var(--border)] shadow-sm">{t('events.loadingEvents', 'Discovering local events...')}</p>
          ) : events?.length === 0 ? (
            <p className="text-[var(--text-secondary)] font-medium p-12 text-center bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-soft-sm">{t('events.noEventsFound', "We couldn't find any events right here. Try expanding your search area!")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events?.map((event: any) => (
                <Link key={event.id} href={`/events/${event.id}`} className="block group">
                  <div className="p-6 h-full bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-soft hover:shadow-lg transition-all flex flex-col relative overflow-hidden transform hover:-translate-y-1">
                    <div className="absolute top-0 left-0 w-full h-2 nature-gradient opacity-80" />
                    <h3 className="font-black font-heading text-2xl text-[var(--text-primary)] mb-3 leading-tight mt-2 line-clamp-2 group-hover:text-[var(--primary)] transition-colors">{event.title}</h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)] mb-6 flex-1 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[var(--secondary)] shrink-0 mt-0.5" />
                      {event.locationName}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-5 border-t border-[var(--border)]/50">
                      <div className="text-xs font-bold text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1.5 rounded-full">
                        {new Date(event.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {event.distance !== undefined && (
                        <p className="text-xs font-bold text-[var(--secondary)]">{event.distance.toFixed(1)} {t('events.milesAway', 'miles away')}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
