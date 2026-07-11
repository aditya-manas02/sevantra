'use client';
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Heart, Sprout, Sun, Leaf, Trophy, MapPin, ChevronRight, CheckCircle, Clock, CalendarHeart, Edit2, X, Phone, Info, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    locationCity: '',
    skills: ''
  });

  const { data: currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.user
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', currentUser?.id],
    queryFn: async () => (await api.get(`/profiles/users/${currentUser?.id}`)).data.user,
    enabled: !!currentUser?.id
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        phoneNumber: profile.phoneNumber || '',
        locationCity: profile.locationCity || '',
        skills: profile.skills ? profile.skills.join(', ') : ''
      });
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        skills: data.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      };
      return api.patch('/profiles/users/me', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setIsEditing(false);
    }
  });

  if (isLoading) return <div className="p-8 text-[var(--text-secondary)] font-medium text-center bg-[var(--surface)] rounded-3xl shadow-soft">{t('profile.loading', 'Loading your profile...')}</div>;
  if (!profile) return <div className="p-8 text-[var(--text-primary)] text-center font-bold">{t('profile.pleaseLogIn', 'Please log in to view your impact.')}</div>;

  const getImpactLevel = (points: number) => {
    if (points > 1000) return { title: 'Forest Guardian', icon: Trophy, color: 'text-amber-500', bg: 'bg-amber-100' };
    if (points > 500) return { title: 'Tree Planter', icon: Leaf, color: 'text-[var(--primary)]', bg: 'bg-[var(--primary)]/10' };
    if (points > 100) return { title: 'Sprout', icon: Sprout, color: 'text-[var(--secondary)]', bg: 'bg-[var(--secondary)]/10' };
    return { title: 'Seedling', icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-100' };
  };

  const level = getImpactLevel(profile.gamificationPoints);
  const LevelIcon = level.icon;
  const impactData = profile.impactDistribution || [];

  return (
    <div className="py-6 space-y-6 bg-transparent min-h-full">
      <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-soft border border-[var(--border)] relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[80px] opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-2 nature-gradient opacity-80" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center font-black text-4xl shadow-inner border-4 border-white shrink-0 relative z-10 transition-transform hover:scale-105">
          {profile.firstName.charAt(0)}
        </div>
        <div className="flex-1 text-center md:text-left relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-black font-heading text-[var(--text-primary)] tracking-tight">{profile.firstName} {profile.lastName}</h1>
              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full ${level.bg} ${level.color} text-sm font-bold shadow-sm transform hover:scale-105 transition-all`}>
                <LevelIcon className="w-4 h-4" />
                {level.title}
              </div>
            </div>
            {currentUser?.id === profile.id && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" /> {t('profile.editProfile', 'Edit Profile')}
              </button>
            )}
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-base mb-4">{profile.email}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
            <div className="bg-gradient-to-br from-[var(--background)] to-white border border-[var(--border)] px-5 py-3 rounded-2xl shadow-soft-sm flex items-center gap-3 min-w-[150px] group hover:border-[var(--primary)] hover:shadow-soft transition-all">
              <div className="p-2.5 bg-[var(--secondary)]/10 rounded-xl text-[var(--secondary)] group-hover:bg-[var(--secondary)] group-hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-secondary)]">{t('profile.impactPoints', 'Impact Points')}</p>
                <p className="font-black text-xl text-[var(--text-primary)]">{profile.gamificationPoints || 0}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[var(--background)] to-white border border-[var(--border)] px-5 py-3 rounded-2xl shadow-soft-sm flex items-center gap-3 min-w-[150px] group hover:border-[var(--primary)] hover:shadow-soft transition-all">
              <div className="p-2.5 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-secondary)]">{t('profile.hours', 'Hours')}</p>
                <p className="font-black text-xl text-[var(--text-primary)]">{profile.stats?.totalHours || 0}</p>
              </div>
            </div>
          </div>

          {(profile.bio || profile.locationCity || profile.phoneNumber || (profile.skills && profile.skills.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border)]/50 text-left">
              {profile.bio && (
                <div className="md:col-span-2">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> {t('profile.aboutMe', 'About Me')}</h3>
                  <p className="text-[var(--text-primary)] text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
              {profile.locationCity && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t('profile.location', 'Location')}</h3>
                  <p className="text-[var(--text-primary)] font-medium text-sm">{profile.locationCity}</p>
                </div>
              )}
              {profile.phoneNumber && (
                <div>
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {t('profile.contact', 'Contact')}</h3>
                  <p className="text-[var(--text-primary)] font-medium text-sm">{profile.phoneNumber}</p>
                </div>
              )}
              {profile.skills && profile.skills.length > 0 && (
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> {t('profile.skills', 'Skills & Interests')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] text-xs font-bold rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-soft border border-[var(--border)]">
            <h2 className="text-xl font-black font-heading text-[var(--text-primary)] mb-5 flex items-center gap-3 border-b border-[var(--border)]/50 pb-3">
              <Leaf className="w-5 h-5 text-[var(--primary)]" />
              {t('profile.impactFocus', 'Impact Focus')}
            </h2>
            
            {impactData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-6 w-full h-56">
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={impactData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="var(--surface)" strokeWidth={2}>
                        {impactData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', borderWidth: '1px' }}
                        itemStyle={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-3 md:border-l border-[var(--border)]/50 md:pl-6">
                  {impactData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--background)] transition-colors">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-sm text-[var(--text-secondary)]">{item.name}</span>
                      </div>
                      <span className="font-black text-sm text-[var(--text-primary)]">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-center py-8 text-[var(--text-secondary)] text-sm font-bold bg-[var(--background)] rounded-2xl border border-[var(--border)] border-dashed">
                {t('profile.noEvents', "You haven't participated in any events yet.")}
              </div>
            )}
          </div>

          <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-soft border border-[var(--border)]">
            <h2 className="text-xl font-black font-heading text-[var(--text-primary)] mb-5 flex items-center gap-3 border-b border-[var(--border)]/50 pb-3">
              <Sprout className="w-5 h-5 text-[var(--secondary)]" />
              {t('profile.communityGroups', 'Community Groups')}
            </h2>
            {!profile.orgMembers || profile.orgMembers.length === 0 ? (
              <div className="text-center p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] border-dashed">
                <p className="text-[var(--text-secondary)] text-sm font-medium mb-3">{t('profile.noGroups', "You aren't part of any community groups.")}</p>
                <Link href="/organizations/new" className="text-[var(--primary)] text-sm font-bold hover:underline">{t('profile.startGroup', 'Start a new group →')}</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.orgMembers.map((member: any) => (
                  <div key={member.id} className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-soft-sm group hover:border-[var(--primary)] hover:shadow-soft transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--primary)] opacity-5 rounded-bl-full" />
                    <h3 className="font-black text-[var(--text-primary)] text-base mb-0.5 line-clamp-1">{member.organization.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">{member.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)]">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border)]/50 pb-3">
              <Trophy className="w-4 h-4 text-amber-500" /> {t('profile.earnedBadges', 'Earned Badges')}
            </h2>
            {profile.badges.length === 0 ? (
              <div className="bg-[var(--background)] p-4 rounded-xl border border-dashed border-[var(--border)] text-center text-xs font-bold text-[var(--text-secondary)]">
                {t('profile.firstBadge', 'Join events to earn your first badge!')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {profile.badges.map((badge: any, i: number) => (
                  <div 
                    key={badge.id} 
                    className="flex flex-col items-center justify-center p-3 bg-gradient-to-b from-[var(--background)] to-white rounded-2xl border border-[var(--border)] shadow-soft-sm relative group hover:border-[var(--primary)] transition-all hover:-translate-y-1"
                  >
                    <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    </div>
                    <div className="w-10 h-10 bg-[var(--surface)] rounded-full border border-[var(--border)] flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-all">
                      <span className="text-lg">🏅</span> 
                    </div>
                    <p className="text-[10px] font-black text-[var(--text-primary)] text-center leading-tight uppercase tracking-wide">{badge.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)]">
            <h2 className="text-lg font-black text-[var(--text-primary)] mb-4 flex items-center gap-2 border-b border-[var(--border)]/50 pb-3">
              <CalendarHeart className="w-4 h-4 text-[var(--primary)]" /> {t('profile.activity', 'Activity')}
            </h2>
            {profile.recentEvents.length === 0 ? (
              <p className="text-[var(--text-secondary)] text-xs font-bold text-center p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] border-dashed">{t('profile.noActivity', 'No recent activity.')}</p>
            ) : (
              <div className="space-y-2">
                {profile.recentEvents.map((event: any) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <div className="p-3 bg-[var(--background)] rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all group flex items-center gap-3 cursor-pointer">
                      <div className="w-2 h-2 rounded-full bg-[var(--secondary)] group-hover:scale-150 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[var(--text-primary)] text-sm truncate">{event.title}</h3>
                        <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] gap-1 mt-0.5">
                          <MapPin className="w-2.5 h-2.5" /> {event.locationName}
                        </div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-[var(--border)] group-hover:text-[var(--primary)] transition-colors shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[var(--surface)] w-full max-w-xl rounded-3xl shadow-lg border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">{t('profile.editProfile', 'Edit Profile')}</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-[var(--background)] rounded-full hover:bg-[var(--border)] transition-colors">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.firstName', 'First Name')}</label>
                  <input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.lastName', 'Last Name')}</label>
                  <input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.aboutMe', 'About Me / Bio')}</label>
                <textarea rows={3} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder={t('profile.bioPlaceholder', 'Tell the community about yourself...')} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.city', 'Location (City)')}</label>
                  <input value={formData.locationCity} onChange={e => setFormData({...formData, locationCity: e.target.value})} placeholder="e.g. San Francisco" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.phone', 'Phone Number')}</label>
                  <input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="+1 234 567 8900" className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">{t('profile.skills', 'Skills & Interests')}</label>
                <input value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} placeholder={t('profile.skillsPlaceholder', 'e.g. Environment, Teaching')} className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] transition-colors" />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--background)] flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-xl font-bold text-sm text-[var(--text-secondary)] hover:bg-[var(--border)] transition-colors">{t('profile.cancel', 'Cancel')}</button>
              <button 
                onClick={() => updateMutation.mutate(formData)} 
                disabled={updateMutation.isPending}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? t('profile.saving', 'Saving...') : t('profile.saveProfile', 'Save Profile')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
