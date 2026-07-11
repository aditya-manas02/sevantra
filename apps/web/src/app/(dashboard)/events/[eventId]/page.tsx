'use client';
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, MapPin, Users, HeartHandshake, ArrowRight, MessageCircle, QrCode, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

function DonationWidget({ event }: { event: any }) {
  const [amount, setAmount] = React.useState<number | string>(event.minDonationAmount || 100);
  const [showQR, setShowQR] = React.useState(false);
  
  if (!event.acceptsDonations || !event.upiId) return null;

  const upiLink = `upi://pay?pa=${event.upiId}&pn=${encodeURIComponent(event.organization.name)}&am=${amount}&cu=INR`;

  return (
    <div className="flex-1 min-w-[250px] bg-[var(--surface)] border border-[var(--border)] p-4 rounded-2xl shadow-soft">
      {!showQR ? (
        <div className="space-y-3">
          <p className="text-sm font-bold text-[var(--text-primary)]">Support this event</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">₹</span>
            <input 
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full p-2 border border-[var(--border)] rounded-lg font-mono focus:ring-2 focus:ring-[var(--primary)] outline-none"
              min={event.minDonationAmount || 1}
            />
          </div>
          <Button 
            className="w-full bg-[var(--secondary)] hover:bg-[#B58B60] text-white font-bold"
            onClick={() => {
              const numAmount = Number(amount);
              if (event.minDonationAmount && numAmount < event.minDonationAmount) {
                return toast.error(`Minimum donation is ₹${event.minDonationAmount}`);
              }
              if (numAmount <= 0) return toast.error('Enter a valid amount');
              
              if (typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                window.location.href = upiLink;
              } else {
                setShowQR(true);
              }
            }}
          >
            Donate via UPI
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-[var(--text-secondary)]">Scan with any UPI App</p>
          <div className="p-2 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
            <QRCodeSVG value={upiLink} size={130} />
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowQR(false)} className="w-full">
            Change Amount
          </Button>
        </div>
      )}
    </div>
  );
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => (await api.get(`/events/${eventId}`)).data.event
  });

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.user
  });

  const rsvpMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/registrations/${eventId}/rsvp`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['registration', eventId] });
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to RSVP');
    }
  });

  const { data: registration } = useQuery({
    queryKey: ['registration', eventId],
    queryFn: async () => {
      try {
        return (await api.get(`/registrations/my/${eventId}`)).data.registration;
      } catch (e) {
        return null;
      }
    },
    enabled: !!user
  });

  const downloadCertificate = () => {
    if (!event || !user) return;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFillColor(245, 247, 246); // var(--background)
    doc.rect(0, 0, 297, 210, 'F');
    
    doc.setTextColor(34, 139, 34); // var(--primary)
    doc.setFontSize(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Impact', 148.5, 50, { align: 'center' });
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 75, { align: 'center' });
    
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.firstName} ${user.lastName}`, 148.5, 95, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`has successfully participated in the event`, 148.5, 115, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(event.title, 148.5, 135, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date(event.startDate).toLocaleDateString();
    doc.text(`Hosted by ${event.organization.name} on ${dateStr}`, 148.5, 155, { align: 'center' });
    
    doc.setDrawColor(34, 139, 34);
    doc.setLineWidth(1);
    doc.line(98.5, 175, 198.5, 175);
    doc.text('Sevantra Verified', 148.5, 185, { align: 'center' });
    
    doc.save(`Sevantra-Certificate-${event.id}.pdf`);
  };

  if (isLoading) return <div className="p-8 text-[var(--text-secondary)] font-medium text-center bg-[var(--surface)] rounded-3xl shadow-soft">Loading event details...</div>;
  if (!event) return <div className="p-8 text-white bg-[var(--background)]0 font-bold rounded-3xl text-center shadow-soft">Event not found.</div>;

  const spotsLeft = event.capacity ? event.capacity - event._count.registrations : 'Unlimited';

  const eventStartDate = new Date(event.startDate);
  const now = new Date();
  const hoursUntilEvent = (eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isWithin24Hours = hoursUntilEvent <= 24;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-12 bg-[var(--background)] min-h-screen py-8 md:py-12">
      <div className="bg-[var(--surface)] p-8 md:p-12 rounded-3xl shadow-soft border border-[var(--border)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10 pb-8 mb-8 border-b border-[var(--border)]/50">
          <div className="flex-1">
            <span className="text-[var(--secondary)] font-bold mb-4 inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--secondary)]/10 rounded-full text-sm">
              <HeartHandshake className="w-4 h-4" /> {event.category.name}
            </span>
            <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--text-primary)] leading-tight tracking-tight mt-3">{event.title}</h1>
          </div>
          <div className="text-left md:text-right bg-[var(--background)] p-5 rounded-2xl border border-[var(--border)] shadow-soft-sm shrink-0 min-w-[200px]">
            <p className="text-xs text-[var(--text-secondary)] font-semibold uppercase tracking-wider mb-1">Hosted By</p>
            <p className="font-black font-heading text-[var(--primary)] text-xl">{event.organization.name}</p>
          </div>
        </div>

        <div className="prose max-w-none text-[var(--text-primary)] mb-10 relative z-10 text-lg leading-relaxed font-medium">
          <p>{event.description}</p>
          
          {(event.requirements || event.minimumAge) && (
            <div className="mt-8 bg-[var(--accent)]/10 p-6 rounded-2xl border border-[var(--accent)]/20">
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-3">Participation Requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
                {event.minimumAge && <li><strong>Minimum Age:</strong> {event.minimumAge} years old</li>}
                {event.requirements && <li>{event.requirements}</li>}
              </ul>
            </div>
          )}
          
          {event.providesCertificate && (
            <div className="mt-6 flex items-center gap-3 bg-[var(--primary)]/10 text-[var(--primary)] p-4 rounded-xl border border-[var(--primary)]/20">
              <span className="text-2xl">🎓</span>
              <p className="font-bold">This event provides an official certificate of participation.</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] flex items-start gap-4 shadow-soft-sm">
            <div className="p-3 bg-[var(--primary)]/10 rounded-xl">
              <Calendar className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">When</p>
              <p className="font-bold text-[var(--text-primary)] leading-snug">
                {new Date(event.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] flex items-start gap-4 shadow-soft-sm">
            <div className="p-3 bg-[var(--secondary)]/10 rounded-xl">
              <MapPin className="w-6 h-6 text-[var(--secondary)]" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Where</p>
              <p className="font-bold text-[var(--text-primary)] leading-snug">{event.locationName}</p>
            </div>
          </div>
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] flex items-start gap-4 shadow-soft-sm">
            <div className="p-3 bg-[var(--accent)]/20 rounded-xl">
              <Users className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Availability</p>
              <p className="font-bold text-[var(--text-primary)] text-xl leading-snug">
                <span className="text-amber-600 font-black">{spotsLeft}</span> spots
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap relative z-10">
          {registration ? (
            <div className="w-full">
              {registration.status === 'CHECKED_IN' ? (
                <div className="bg-[var(--background)] border border-green-200 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-800 flex items-center gap-2"><QrCode className="w-6 h-6" /> You're checked in!</h3>
                    <p className="text-green-700 font-medium text-sm mt-1">Thank you for participating and making an impact.</p>
                  </div>
                  {event.providesCertificate && (
                    <Button onClick={downloadCertificate} className="bg-green-700 hover:bg-green-800 text-white shadow-soft shrink-0 py-6 px-6 font-bold flex items-center gap-2">
                      <Download className="w-5 h-5" /> Download Certificate
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">Your Registration Ticket</h3>
                    <p className="text-[var(--text-secondary)] font-medium text-sm mt-1">Show this QR code to the organizer when you arrive to check in.</p>
                  </div>
                  {isWithin24Hours ? (
                    registration.checkInToken ? (
                      <div className="bg-[var(--surface)] p-4 rounded-xl shadow-soft shrink-0 border border-[var(--border)] flex flex-col items-center gap-3">
                        <QRCodeSVG value={registration.checkInToken} size={120} />
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Ticket Code</p>
                          <p className="text-lg font-mono font-black text-[var(--text-primary)] tracking-widest">
                            {registration.checkInToken.split('-')[0].toUpperCase()}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-red-500">Error generating ticket.</p>
                    )
                  ) : (
                    <div className="bg-[var(--background)] p-6 rounded-xl shadow-inner shrink-0 border border-[var(--border)] border-dashed flex flex-col items-center justify-center gap-2 text-center h-[160px] w-[160px]">
                      <div className="w-10 h-10 bg-[var(--surface)] border border-[var(--border)] rounded-full flex items-center justify-center mb-1">
                        <span className="text-xl">🔒</span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-primary)]">Ticket Locked</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">Reveals 24 hours prior to event.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <Button 
              onClick={() => {
                if (!user) {
                  toast.error('Please log in to join this event.');
                  return router.push('/login');
                }
                rsvpMutation.mutate();
              }}
              disabled={rsvpMutation.isPending}
              className="flex-1 text-lg py-7 shadow-soft hover:shadow-md min-w-[200px]"
            >
              {rsvpMutation.isPending ? 'Joining...' : 'Join Event'}
            </Button>
          )}

          {event.acceptsDonations && event.upiId && (
            <DonationWidget event={event} />
          )}

          <Button 
            variant="outline"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, '_blank')}
            className="flex-1 text-lg py-7 shadow-soft-sm min-w-[200px] flex items-center gap-2"
          >
            Get Directions <ArrowRight className="w-4 h-4" />
          </Button>
          
          {user?.orgMembers?.some((m: any) => m.organizationId === event.organizationId) && (
            <Button 
              variant="outline"
              onClick={() => router.push(`/events/${eventId}/checkin`)}
              className="flex-1 text-lg py-7 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white min-w-[200px]"
            >
              Organizer Check-in
            </Button>
          )}
        </div>
      </div>

      <EventComments eventId={eventId as string} user={user} />
    </div>
  );
}

function EventComments({ eventId, user }: { eventId: string, user: any }) {
  const [content, setContent] = React.useState('');
  const [mediaUrl, setMediaUrl] = React.useState('');
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', eventId],
    queryFn: async () => (await api.get(`/community/${eventId}/comments`)).data.comments
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/community/${eventId}/comments`, { content, mediaUrl });
    },
    onSuccess: () => {
      setContent('');
      setMediaUrl('');
      queryClient.invalidateQueries({ queryKey: ['comments', eventId] });
      toast.success('Comment posted!');
    },
    onError: () => {
      toast.error('Failed to post comment.');
    }
  });

  return (
    <div className="bg-[var(--surface)] p-8 md:p-12 rounded-3xl shadow-soft border border-[var(--border)] mt-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--secondary)] to-transparent rounded-full blur-[80px] opacity-10 pointer-events-none" />
      
      <h2 className="text-3xl font-black font-heading text-[var(--text-primary)] mb-8 flex items-center gap-3 relative z-10">
        <MessageCircle className="w-8 h-8 text-[var(--primary)]" />
        Community Discussion
      </h2>
      
      {user ? (
        <div className="mb-10 flex gap-4 md:gap-6 relative z-10">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center font-bold text-xl rounded-full shadow-inner shrink-0">
            {user.firstName.charAt(0)}
          </div>
          <div className="flex-1 space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ask a question, offer a carpool, or share your excitement..."
              className="w-full min-h-[120px] p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all resize-y font-medium text-lg shadow-inner"
            />
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="Optional: Image URL to share a photo"
                className="flex-1 p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-medium shadow-inner"
              />
              <Button 
                onClick={() => postMutation.mutate()} 
                disabled={postMutation.isPending || !content.trim()}
                className="px-8 py-6 font-bold shadow-soft"
              >
                {postMutation.isPending ? 'Posting...' : 'Post Message'}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[var(--background)] border border-[var(--border)] p-8 rounded-2xl text-center mb-10 shadow-inner">
          <p className="text-[var(--text-primary)] font-semibold text-lg">Please log in to join the conversation.</p>
        </div>
      )}

      <div className="space-y-6 relative z-10">
        {isLoading ? (
          <p className="text-[var(--text-secondary)] text-center py-4 font-medium">Loading discussion...</p>
        ) : comments?.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-center py-12 bg-[var(--background)] rounded-2xl border border-[var(--border)] font-medium shadow-inner">No messages yet. Be the first to say hello!</p>
        ) : (
          comments?.map((comment: any) => (
            <div key={comment.id} className="flex gap-4 md:gap-6 group">
              <div className="w-12 h-12 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center font-bold text-lg rounded-full shrink-0 shadow-sm group-hover:border-[var(--primary)] transition-colors">
                {comment.user.firstName.charAt(0)}
              </div>
              <div className="flex-1 bg-[var(--background)] p-6 rounded-2xl rounded-tl-sm border border-[var(--border)] shadow-soft-sm group-hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-[var(--text-primary)] text-lg">{comment.user.firstName || comment.user.name}</span>
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">
                    {new Date(comment.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed font-medium">{comment.content}</p>
                {comment.mediaUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-[var(--border)] inline-block max-w-full">
                    <img src={comment.mediaUrl} alt="Community upload" className="max-h-96 object-contain" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
