'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, MessageCircle, HelpCircle, Send } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';

export default function SupportPage() {
  const { t } = useTranslation();
  const user = useAuthStore(state => state.user);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    const body = `User: ${user?.firstName} ${user?.lastName} (${user?.email})\n\nMessage:\n${message}`;
    const mailtoLink = `mailto:sevantrateam@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  return (
    <div className="flex flex-col items-center justify-start p-4 md:py-12 bg-transparent min-h-full">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--text-primary)]">{t('supportPage.howCanWeHelp', 'How can we help?')}</h1>
          <p className="text-[var(--text-secondary)] text-lg font-medium max-w-2xl mx-auto">
            {t('supportPage.howCanWeHelpDesc', 'Whether you have a question about an event, need technical assistance, or just want to share some feedback, our team is here for you.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[var(--primary)]/10 rounded-2xl flex items-center justify-center mb-4 text-[var(--primary)] group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t('supportPage.emailUs', 'Email Us')}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{t('supportPage.emailUsDesc', 'Directly reach out to our inbox.')}</p>
            <a href="mailto:sevantrateam@gmail.com" className="text-[var(--primary)] font-bold text-sm hover:underline mt-auto">sevantrateam@gmail.com</a>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[var(--secondary)]/10 rounded-2xl flex items-center justify-center mb-4 text-[var(--secondary)] group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t('supportPage.communityChat', 'Community Chat')}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{t('supportPage.communityChatDesc', 'Join our community discussions on the event pages.')}</p>
            <span className="text-[var(--secondary)] font-bold text-sm mt-auto">{t('supportPage.availableOnEvents', 'Available on events')}</span>
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)] flex flex-col items-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-[var(--accent)]/20 rounded-2xl flex items-center justify-center mb-4 text-amber-600 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{t('supportPage.helpCenter', 'Help Center')}</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4">{t('supportPage.helpCenterDesc', 'Browse our guides and FAQ.')}</p>
            <span className="text-amber-600 font-bold text-sm mt-auto">{t('supportPage.comingSoon', 'Coming Soon')}</span>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-8 md:p-12 rounded-3xl shadow-soft border border-[var(--border)] relative overflow-hidden mt-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[100px] opacity-10 pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] mb-6">{t('supportPage.sendMessageTitle', 'Send us a message')}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">{t('supportPage.nameLabel', 'Name')}</label>
                  <Input 
                    value={`${user?.firstName || ''} ${user?.lastName || ''}`} 
                    disabled 
                    className="bg-[var(--surface)] text-[var(--text-secondary)] font-medium"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">{t('supportPage.emailLabel', 'Email Address')}</label>
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-[var(--surface)] text-[var(--text-secondary)] font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">{t('supportPage.subjectLabel', 'Subject')}</label>
                <Input 
                  placeholder={t('supportPage.subjectPlaceholder', 'What is this regarding?')} 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  required
                  className="bg-[var(--surface)]"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-[var(--text-primary)] mb-2 block">{t('supportPage.messageLabel', 'Message')}</label>
                <textarea 
                  placeholder={t('supportPage.messagePlaceholder', 'How can we help you today?')} 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  className="w-full min-h-[150px] p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-medium resize-y"
                />
              </div>

              <Button type="submit" className="w-full md:w-auto px-8 py-6 text-lg shadow-soft font-bold flex items-center gap-2">
                <Send className="w-5 h-5" /> {t('supportPage.sendMessageButton', 'Send Message')}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
