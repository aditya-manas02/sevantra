'use client';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { CalendarHeart, MapPin, Users, Settings, Plus, QrCode, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function ManageEventsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ['hosted-events'],
    queryFn: async () => (await api.get('/events/my/hosted')).data.events
  });

  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await api.delete(`/events/${eventId}`);
    },
    onSuccess: () => {
      toast.success('Event deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['hosted-events'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete event');
    }
  });

  if (isLoading) {
    return <div className="p-8 text-[var(--text-secondary)] font-medium text-center bg-[var(--surface)] rounded-3xl shadow-soft mt-8 max-w-4xl mx-auto">Loading your events...</div>;
  }

  return (
    <div className="py-6 space-y-6 bg-transparent min-h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black font-heading text-[var(--text-primary)] tracking-tight flex items-center gap-3">
            <CalendarHeart className="w-8 h-8 text-[var(--primary)]" />
            {t('events.manageTitle', 'Manage Hosted Events')}
          </h1>
          <p className="text-[var(--text-secondary)] font-medium mt-1">{t('events.manageSubtitle', 'Track and manage events you are organizing.')}</p>
        </div>
        <Button onClick={() => router.push('/events/new')} className="shadow-soft hover:shadow-md flex items-center gap-2">
          <Plus className="w-4 h-4" /> {t('events.createNewEvent', 'Create New Event')}
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-[var(--surface)] p-12 rounded-3xl shadow-soft border border-[var(--border)] text-center">
          <div className="w-20 h-20 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--border)]">
            <CalendarHeart className="w-10 h-10 text-[var(--text-secondary)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{t('events.noHostedEvents', 'No Hosted Events Yet')}</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{t('events.noHostedEventsDesc', "You haven't created any events or you aren't an admin of any organizations hosting events.")}</p>
          <Button onClick={() => router.push('/events/new')}>{t('events.hostFirstEvent', 'Host Your First Event')}</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event: any) => {
            const rsvpCount = event._count.registrations;
            const capacityText = event.capacity ? `${rsvpCount} / ${event.capacity}` : `${rsvpCount} (Unlimited)`;
            const isFull = event.capacity && rsvpCount >= event.capacity;

            return (
              <div key={event.id} className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)] relative overflow-hidden group hover:border-[var(--primary)] transition-all flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-bl-full pointer-events-none group-hover:bg-[var(--primary)]/10 transition-colors" />
                
                <div className="flex-1 mb-6 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full mb-3 inline-block">
                    {event.organization.name}
                  </span>
                  <h3 className="text-xl font-black font-heading text-[var(--text-primary)] mb-2 leading-tight">{event.title}</h3>
                  
                  <div className="space-y-2 mt-4 text-sm font-medium text-[var(--text-secondary)]">
                    <div className="flex items-center gap-2">
                      <CalendarHeart className="w-4 h-4 shrink-0" />
                      {new Date(event.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="truncate">{event.locationName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className={`w-4 h-4 shrink-0 ${isFull ? 'text-amber-500' : 'text-green-500'}`} />
                      <span className={isFull ? 'text-amber-600 font-bold' : ''}>{capacityText} {t('events.rsvps', 'RSVPs')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-auto pt-4 border-t border-[var(--border)] relative z-10">
                  <Button 
                    variant="default" 
                    className="flex-1 shadow-soft-sm flex items-center gap-2"
                    onClick={() => router.push(`/events/${event.id}/checkin`)}
                  >
                    <QrCode className="w-4 h-4" /> {t('events.checkIn', 'Check-in Attendees')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-none px-4 shadow-soft-sm"
                    onClick={() => router.push(`/events/${event.id}`)}
                  >
                    {t('events.view', 'View')}
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-none px-4 shadow-soft-sm hover:bg-red-600"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
                        deleteMutation.mutate(event.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
