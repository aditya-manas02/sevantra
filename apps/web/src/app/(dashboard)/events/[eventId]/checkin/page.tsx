'use client';
import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CheckInScannerPage() {
  const { eventId } = useParams();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [manualCode, setManualCode] = useState('');

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    
    try {
      await api.post(`/registrations/${eventId}/checkin`, { token: manualCode.trim() });
      setMessage(`Successfully checked in user!`);
      setManualCode('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.error || 'Failed to check in'}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: { width: 250, height: 250 },
      fps: 5,
    }, false);

    scanner.render(
      async (decodedText) => {
        setScanResult(decodedText);
        scanner.pause(true);
        
        try {
          // decodedText should be the checkInToken string
          await api.post(`/registrations/${eventId}/checkin`, { token: decodedText });
          setMessage(`Successfully checked in user!`);
          setTimeout(() => {
            setMessage('');
            setScanResult(null);
            scanner.resume();
          }, 3000);
        } catch (error: any) {
          setMessage(`Error: ${error.response?.data?.error || 'Failed to check in'}`);
          setTimeout(() => {
            setMessage('');
            setScanResult(null);
            scanner.resume();
          }, 3000);
        }
      },
      (error) => {
        // Ignore frame errors
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [eventId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[var(--background)]">
      <div className="w-full max-w-md bg-[var(--surface)] p-8 rounded-xl shadow-warm-md border border-[var(--border)]">
        <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)] mb-6 text-center">Event Check-In Scanner</h1>
        
        <div id="reader" className="w-full mb-6"></div>

        <div className="mb-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--surface)] text-[var(--text-secondary)] font-medium">Or enter manually</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="flex gap-2 mb-6">
          <input 
            type="text" 
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Enter 8-character code"
            className="flex-1 p-3 rounded-lg border border-[var(--border)] bg-[var(--background)] font-mono text-center uppercase tracking-widest focus:ring-2 focus:ring-[var(--primary)] outline-none"
            maxLength={8}
          />
          <Button type="submit" className="shrink-0 shadow-soft" disabled={!manualCode.trim()}>
            Verify
          </Button>
        </form>

        {message && (
          <div className={`p-4 rounded-md text-center font-medium ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
