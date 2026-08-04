'use client';
import React, { useRef, useEffect } from 'react';
import { Download, X, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CertificateProps {
  isOpen: boolean;
  onClose: () => void;
  volunteerName: string;
  eventTitle: string;
  eventDate: string;
  organizationName: string;
}

export function CertificateModal({ isOpen, onClose, volunteerName, eventTitle, eventDate, organizationName }: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-res canvas dimensions (1200x850)
    canvas.width = 1200;
    canvas.height = 850;

    // 1. Soft Background Fill
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Elegant Double Border
    ctx.strokeStyle = '#2D6A4F';
    ctx.lineWidth = 12;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = '#D4AF37'; // Gold inner border
    ctx.lineWidth = 4;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    // 3. Header Stamp
    ctx.fillStyle = '#2D6A4F';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SEVANTRA CIVIC ENGAGEMENT PLATFORM', canvas.width / 2, 120);

    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('OFFICIAL CERTIFICATE OF CIVIC CONTRIBUTION', canvas.width / 2, 165);

    // Divider Line
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 190);
    ctx.lineTo(canvas.width / 2 + 200, 190);
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 4. Recipient Text
    ctx.fillStyle = '#1A1A1A';
    ctx.font = '500 24px serif';
    ctx.fillText('This certificate is proudly awarded to', canvas.width / 2, 260);

    // Volunteer Name (Large Bold)
    ctx.fillStyle = '#2D6A4F';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(volunteerName, canvas.width / 2, 340);

    // Description
    ctx.fillStyle = '#4A4A4A';
    ctx.font = '22px serif';
    ctx.fillText('for extraordinary volunteer service and civic contribution during the event', canvas.width / 2, 420);

    // Event Title
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 38px sans-serif';
    ctx.fillText(`"${eventTitle}"`, canvas.width / 2, 490);

    // Date & Organization
    ctx.fillStyle = '#555555';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Organized by ${organizationName} on ${eventDate}`, canvas.width / 2, 550);

    // 5. Bottom Signatures & Seal
    // Left: Date Stamp
    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Verified Hash: SVT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`, 100, 720);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText('Issued automatically via Sevantra Verification Engine', 100, 745);

    // Right: Authorized Signature Line
    ctx.textAlign = 'right';
    ctx.strokeStyle = '#1A1A1A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 350, 710);
    ctx.lineTo(canvas.width - 100, 710);
    ctx.stroke();

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Event Organizer / Platform Officer', canvas.width - 100, 735);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#777777';
    ctx.fillText(organizationName, canvas.width - 100, 755);

    // Center Gold Seal Graphic
    ctx.save();
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 710, 45, 0, Math.PI * 2);
    ctx.fillStyle = '#D4AF37';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL', canvas.width / 2, 705);
    ctx.fillText('SEAL', canvas.width / 2, 722);
    ctx.restore();

  }, [isOpen, volunteerName, eventTitle, eventDate, organizationName]);

  if (!isOpen) return null;

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `Certificate_${volunteerName.replace(/\s+/g, '_')}.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 max-w-4xl w-full shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex justify-between items-center pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 font-bold">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Certificate of Civic Contribution</h2>
              <p className="text-xs text-[var(--text-secondary)] font-medium">Verified Official Certificate</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--background)] rounded-full text-[var(--text-secondary)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full overflow-x-auto flex justify-center bg-gray-900/5 p-4 rounded-2xl border border-[var(--border)]">
          <canvas ref={canvasRef} className="max-w-full h-auto rounded-xl shadow-lg border border-gray-300" />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={downloadCertificate} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-xl flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Certificate (PNG)
          </Button>
        </div>
      </div>
    </div>
  );
}
