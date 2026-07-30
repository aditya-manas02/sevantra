'use client';
import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { QrCode, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch events where the current user is admin/creator
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['my-managed-events'],
    queryFn: async () => {
      const res = await api.get('/events/my/hosted');
      return res.data.events;
    }
  });

  useEffect(() => {
    if (!selectedEventId) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText) => {
        if (isProcessing) return;
        setScannedResult(decodedText);
        setIsProcessing(true);
        scanner.pause(true);

        try {
          const res = await api.post(`/registrations/${selectedEventId}/checkin`, {
            token: decodedText
          });
          
          toast.success(t('scan.success', 'Volunteer successfully checked in!'));
          if (res.data.badgeAwarded) {
             toast.success(t('scan.badgeAwarded', `New Badge Awarded: ${res.data.badgeAwarded.name}!`), { icon: '🏅' });
          }
        } catch (error: any) {
          toast.error(error.response?.data?.error || t('scan.error', 'Failed to check in volunteer.'));
        } finally {
          setTimeout(() => {
            setScannedResult(null);
            setIsProcessing(false);
            scanner.resume();
          }, 3000); // Wait 3 seconds before next scan
        }
      },
      (error) => {
        // Ignored, happens when no QR code is in view
      }
    );

    return () => {
      scanner.clear().catch(error => console.error('Failed to clear scanner', error));
    };
  }, [selectedEventId, isProcessing, t]);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <QrCode className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-3xl font-black font-heading text-[var(--text-primary)]">{t('scan.title', 'Volunteer Check-in')}</h1>
        <p className="text-[var(--text-secondary)] font-medium">{t('scan.subtitle', 'Select an event and scan volunteer QR codes to mark them as checked in.')}</p>
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)]">
        <div className="mb-6">
          <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
            {t('scan.selectEvent', 'Select Event to Manage')}
          </label>
          <select 
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border border-[var(--border)] bg-transparent text-[var(--text-primary)] font-medium focus:ring-2 focus:ring-[var(--primary)] outline-none"
          >
            <option value="">{t('scan.chooseEvent', '-- Choose an event --')}</option>
            {events?.map((event: any) => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
        </div>

        {selectedEventId ? (
          <div className="relative">
             <div id="reader" className="rounded-2xl overflow-hidden border-2 border-[var(--border)]"></div>
             {isProcessing && (
               <div className="absolute inset-0 bg-[var(--surface)]/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-2xl">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mb-4"></div>
                 <p className="font-bold text-[var(--text-primary)]">{t('scan.processing', 'Processing...')}</p>
               </div>
             )}
          </div>
        ) : (
          <div className="py-12 flex flex-col items-center justify-center text-[var(--text-secondary)] border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--background)]/50">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <p className="font-medium text-center max-w-sm">{t('scan.waitingForEvent', 'Please select an event above to start the scanner.')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
