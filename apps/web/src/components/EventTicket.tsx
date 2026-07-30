import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Calendar, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EventTicketProps {
  event: any;
  registration: any;
}

export function EventTicket({ event, registration }: EventTicketProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-sm mx-auto bg-[var(--surface)] rounded-3xl overflow-hidden shadow-warm-lg border border-[var(--border)] relative">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" />
      
      <div className="p-6 text-center border-b border-dashed border-[var(--border)] relative">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[var(--primary)]/20">
           <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h3 className="font-black font-heading text-2xl text-[var(--text-primary)] mb-2">{event.title}</h3>
        <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-center gap-1">
          <MapPin className="w-4 h-4 text-[var(--secondary)]" /> {event.locationName}
        </p>
        <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center justify-center gap-1 mt-1">
          <Calendar className="w-4 h-4 text-[var(--primary)]" /> 
          {new Date(event.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="p-8 flex flex-col items-center justify-center relative bg-[var(--background)]/30">
        <div className="absolute top-0 left-[-10px] w-5 h-5 rounded-full bg-[var(--background)] -translate-y-1/2 border-r border-t border-[var(--border)] rotate-45" />
        <div className="absolute top-0 right-[-10px] w-5 h-5 rounded-full bg-[var(--background)] -translate-y-1/2 border-l border-b border-[var(--border)] rotate-45" />

        {registration.status === 'CHECKED_IN' ? (
          <div className="flex flex-col items-center justify-center text-green-500 py-6">
            <CheckCircle className="w-20 h-20 mb-4" />
            <p className="font-bold text-xl">{t('ticket.checkedIn', 'Checked In')}</p>
          </div>
        ) : registration.checkInToken ? (
          <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
            <QRCodeSVG 
              value={registration.checkInToken} 
              size={200}
              fgColor="#1C2B23"
              level="H"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] py-8">{t('ticket.notAvailable', 'Ticket not available')}</p>
        )}
        
        {registration.status !== 'CHECKED_IN' && (
          <p className="text-xs font-bold text-[var(--text-secondary)] mt-6 text-center">
            {t('ticket.scanInstruction', 'Show this QR code to the event organizer to check in.')}
          </p>
        )}
      </div>
    </div>
  );
}
