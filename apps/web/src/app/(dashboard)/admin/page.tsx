'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { 
  Check, X, ShieldCheck, Users, Building2, Calendar, HandHeart, 
  Activity, AlertTriangle, FileText, Mail, Trash2, Star, Ban, UserCheck, 
  Search, Sparkles, ShieldAlert, MessageSquare 
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations' | 'events' | 'content'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.user
  });

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    enabled: user?.role === 'PLATFORM_ADMIN'
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => (await api.get('/admin/users')).data,
    enabled: user?.role === 'PLATFORM_ADMIN' && activeTab === 'users'
  });

  const { data: orgsData, isLoading: orgsLoading } = useQuery({
    queryKey: ['adminOrganizations'],
    queryFn: async () => (await api.get('/admin/organizations')).data,
    enabled: user?.role === 'PLATFORM_ADMIN' && activeTab === 'organizations'
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['adminEvents'],
    queryFn: async () => (await api.get('/admin/events')).data,
    enabled: user?.role === 'PLATFORM_ADMIN' && activeTab === 'events'
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: async () => (await api.get('/admin/posts')).data,
    enabled: user?.role === 'PLATFORM_ADMIN' && activeTab === 'content'
  });

  // Mutations
  const verifyOrgMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/admin/organizations/${id}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
      toast.success('Organization status updated.');
    },
    onError: () => toast.error('Failed to update organization status.')
  });

  const roleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      await api.patch(`/admin/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update user role.')
  });

  const banMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/users/${id}/ban`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User ban status updated.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update ban status.')
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('User deleted successfully.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete user.')
  });

  const featureEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/events/${id}/feature`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      toast.success('Event feature status toggled.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update event.')
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Event deleted successfully.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete event.')
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      toast.success('Post removed from feed.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete post.')
  });

  if (userLoading || adminLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user || user.role !== 'PLATFORM_ADMIN') return (
    <div className="p-8 max-w-2xl mx-auto mt-12 text-center bg-[var(--background)] text-red-700 rounded-3xl shadow-soft border border-[var(--border)] p-12">
      <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
      <h1 className="text-2xl font-bold mb-2">{t('admin.accessRestricted', 'Access Restricted')}</h1>
      <p className="font-medium">{t('admin.accessRestrictedDesc', 'You do not have administrative privileges to view this area.')}</p>
    </div>
  );

  const { stats, recentEvents, pendingOrgs = [], activityData = [] } = adminData || {};

  const statCards = [
    { title: t('admin.communityMembers', 'Community Members'), value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: t('sidebar.organizations', 'Organizations'), value: stats?.totalOrgs || 0, icon: Building2, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: t('admin.totalEvents', 'Total Events'), value: stats?.totalEvents || 0, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: t('admin.eventRSVPs', 'Event RSVPs'), value: stats?.totalRegistrations || 0, icon: HandHeart, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--primary)] tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-[var(--secondary)]" />
            {t('admin.title', 'Admin Command Center')}
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg font-medium">{t('admin.subtitle', 'Full governance, moderation, and management authority.')}</p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-[var(--border)] mb-6 overflow-x-auto">
        <button 
          onClick={() => { setActiveTab('overview'); setSearchQuery(''); }} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          {t('admin.tabOverview', 'Platform Overview')}
        </button>
        <button 
          onClick={() => { setActiveTab('users'); setSearchQuery(''); }} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          {t('admin.tabUsers', 'User Management')}
        </button>
        <button 
          onClick={() => { setActiveTab('events'); setSearchQuery(''); }} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'events' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          {t('admin.tabEvents', 'Event Governance')}
        </button>
        <button 
          onClick={() => { setActiveTab('organizations'); setSearchQuery(''); }} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'organizations' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          {t('admin.tabOrgs', 'Organizations')} {pendingOrgs.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingOrgs.length}</span>}
        </button>
        <button 
          onClick={() => { setActiveTab('content'); setSearchQuery(''); }} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'content' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          {t('admin.tabContent', 'Content Moderation')}
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
              <div key={stat.title} className="p-6 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-soft relative overflow-hidden">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className="font-bold text-sm text-[var(--text-secondary)]">{stat.title}</p>
                </div>
                <p className="text-4xl font-black text-[var(--text-primary)] font-heading">{stat.value}</p>
              </div>
            ))}
          </div>

          {pendingOrgs.length > 0 && (
            <div className="bg-[var(--surface)] p-8 md:p-10 rounded-3xl shadow-soft border border-amber-500/30">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
                <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
                  <AlertTriangle className="text-amber-500 w-6 h-6" /> {t('admin.pendingRequests', 'Pending Verification Requests')}
                </h2>
                <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-400 text-sm py-1 px-3 rounded-full font-bold">{pendingOrgs.length} Pending</span>
              </div>
              
              <div className="space-y-4">
                {pendingOrgs.map((org: any) => (
                  <div key={org.id} className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-soft-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-[var(--text-primary)] text-xl">{org.name}</h3>
                        <span className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-xs font-bold uppercase">{org.type}</span>
                      </div>
                      <p className="text-[var(--text-secondary)] mb-4 font-medium">{org.description}</p>
                      {org.verificationDocUrl && (
                        <a href={org.verificationDocUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:underline">
                          <FileText className="w-4 h-4" /> View Verification Link
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                      <Button onClick={() => verifyOrgMutation.mutate({ id: org.id, status: 'VERIFIED' })} disabled={verifyOrgMutation.isPending} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-bold">
                        <Check className="w-4 h-4 mr-2" /> {t('admin.approve', 'Approve')}
                      </Button>
                      <Button variant="outline" onClick={() => verifyOrgMutation.mutate({ id: org.id, status: 'REJECTED' })} disabled={verifyOrgMutation.isPending} className="flex-1 md:flex-none text-red-600 hover:text-red-700">
                        <X className="w-4 h-4 mr-2" /> {t('admin.reject', 'Reject')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)]">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[var(--primary)]" />
                  <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">{t('admin.userSignups', 'User Signups (Last 7 Days)')}</h2>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', borderWidth: '1px', fontWeight: 'bold' }} itemStyle={{ color: 'var(--primary)' }} />
                    <Area type="monotone" dataKey="active" stroke="var(--primary)" strokeWidth={3} fillOpacity={0.1} fill="var(--primary)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] flex flex-col">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
                <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">{t('admin.recentEvents', 'Recent Events')}</h2>
                <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 font-bold rounded-full">{recentEvents?.length || 0} Recent</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {recentEvents?.map((event: any) => (
                  <div key={event.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                    <h3 className="font-bold text-[var(--text-primary)] mb-1 leading-tight line-clamp-2">{event.title}</h3>
                    <div className="flex justify-between items-center text-xs mt-2 font-medium">
                      <span className="text-[var(--secondary)] truncate max-w-[60%]">{event.organization?.name}</span>
                      <span className="text-[var(--text-secondary)]">{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
              <Users className="text-[var(--primary)] w-6 h-6" /> {t('admin.tabUsers', 'User Management')}
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search users..." 
                className="pl-9 bg-[var(--background)] border-[var(--border)] rounded-xl"
              />
            </div>
          </div>
          
          {usersLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Loading user directory...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-sm">
                    <th className="pb-4 font-bold">User</th>
                    <th className="pb-4 font-bold">Role</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold">Joined</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {usersData
                    ?.filter((u: any) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchQuery.toLowerCase()))
                    ?.map((u: any) => (
                      <tr key={u.id} className={`hover:bg-[var(--background)] transition-colors ${u.isBanned ? 'bg-red-500/5' : ''}`}>
                        <td className="py-4">
                          <div className="font-bold text-[var(--text-primary)]">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-[var(--text-secondary)]">{u.email}</div>
                        </td>
                        <td className="py-4">
                          <button 
                            onClick={() => roleMutation.mutate({ id: u.id, role: u.role === 'PLATFORM_ADMIN' ? 'CITIZEN' : 'PLATFORM_ADMIN' })}
                            title="Click to toggle Admin Role"
                            className={`px-3 py-1 text-xs font-bold rounded-full cursor-pointer transition-transform hover:scale-105 ${u.role === 'PLATFORM_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}
                          >
                            {u.role}
                          </button>
                        </td>
                        <td className="py-4">
                          {u.isBanned ? (
                            <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full"><ShieldAlert className="w-3.5 h-3.5"/> Banned</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full"><Check className="w-3.5 h-3.5"/> Active</span>
                          )}
                        </td>
                        <td className="py-4 text-[var(--text-secondary)] text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 text-right space-x-2">
                          <Button 
                            size="sm"
                            variant={u.isBanned ? "default" : "outline"}
                            onClick={() => banMutation.mutate(u.id)}
                            className={u.isBanned ? "bg-green-600 hover:bg-green-700 text-white font-bold" : "text-amber-600 border-amber-300 hover:bg-amber-50"}
                          >
                            {u.isBanned ? <><UserCheck className="w-3.5 h-3.5 mr-1"/> {t('admin.unban', 'Unban')}</> : <><Ban className="w-3.5 h-3.5 mr-1"/> {t('admin.ban', 'Ban')}</>}
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${u.firstName}'s account permanently?`)) {
                                deleteUserMutation.mutate(u.id);
                              }
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVENT GOVERNANCE */}
      {activeTab === 'events' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
              <Calendar className="text-[var(--primary)] w-6 h-6" /> {t('admin.tabEvents', 'Event Governance')}
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search events..." 
                className="pl-9 bg-[var(--background)] border-[var(--border)] rounded-xl"
              />
            </div>
          </div>

          {eventsLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Loading events...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-sm">
                    <th className="pb-4 font-bold">Event Title</th>
                    <th className="pb-4 font-bold">Host Organization</th>
                    <th className="pb-4 font-bold">Category</th>
                    <th className="pb-4 font-bold">RSVPs</th>
                    <th className="pb-4 font-bold">Featured</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {eventsData
                    ?.filter((e: any) => e.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    ?.map((ev: any) => (
                      <tr key={ev.id} className="hover:bg-[var(--background)] transition-colors">
                        <td className="py-4">
                          <Link href={`/events/${ev.id}`} className="font-bold text-[var(--text-primary)] hover:text-[var(--primary)] hover:underline">
                            {ev.title}
                          </Link>
                          <div className="text-xs text-[var(--text-secondary)]">{new Date(ev.startDate).toLocaleDateString()}</div>
                        </td>
                        <td className="py-4 text-[var(--text-secondary)] font-medium">{ev.organization?.name}</td>
                        <td className="py-4 text-xs font-bold uppercase text-[var(--secondary)]">{ev.category?.name}</td>
                        <td className="py-4 font-bold text-[var(--text-primary)]">{ev._count?.registrations || 0}</td>
                        <td className="py-4">
                          <button 
                            onClick={() => featureEventMutation.mutate(ev.id)}
                            title="Toggle featured status"
                            className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${ev.isFeatured ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}
                          >
                            <Star className={`w-3.5 h-3.5 ${ev.isFeatured ? 'fill-amber-500' : ''}`} />
                            {ev.isFeatured ? t('admin.featured', 'Featured') : t('admin.standard', 'Standard')}
                          </button>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Delete event "${ev.title}"? This cannot be undone.`)) {
                                deleteEventMutation.mutate(ev.id);
                              }
                            }}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('admin.delete', 'Delete')}
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ORGANIZATIONS */}
      {activeTab === 'organizations' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
              <Building2 className="text-[var(--primary)] w-6 h-6" /> {t('admin.tabOrgs', 'Organizations')}
            </h2>
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search organizations..." 
                className="pl-9 bg-[var(--background)] border-[var(--border)] rounded-xl"
              />
            </div>
          </div>
          
          {orgsLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Loading organizations...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-sm">
                    <th className="pb-4 font-bold">Organization</th>
                    <th className="pb-4 font-bold">Type</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold">Members</th>
                    <th className="pb-4 font-bold">Events</th>
                    <th className="pb-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orgsData
                    ?.filter((o: any) => o.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    ?.map((org: any) => (
                      <tr key={org.id} className="hover:bg-[var(--background)] transition-colors">
                        <td className="py-4">
                          <div className="font-bold text-[var(--text-primary)]">{org.name}</div>
                          <div className="text-xs text-[var(--text-secondary)] truncate max-w-[250px]">{org.description}</div>
                        </td>
                        <td className="py-4 text-[var(--text-secondary)] text-sm font-bold uppercase">{org.type}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${org.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : org.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                            {org.verificationStatus}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-[var(--text-primary)]">{org._count?.members || 0}</td>
                        <td className="py-4 font-bold text-[var(--text-primary)]">{org._count?.events || 0}</td>
                        <td className="py-4 text-right space-x-2">
                          {org.verificationStatus !== 'VERIFIED' && (
                            <Button size="sm" onClick={() => verifyOrgMutation.mutate({ id: org.id, status: 'VERIFIED' })} className="bg-green-600 hover:bg-green-700 text-white font-bold">
                              {t('admin.verify', 'Verify')}
                            </Button>
                          )}
                          {org.verificationStatus === 'VERIFIED' && (
                            <Button size="sm" variant="outline" onClick={() => verifyOrgMutation.mutate({ id: org.id, status: 'REJECTED' })} className="text-red-600 hover:bg-red-50 border-red-200">
                              {t('admin.revoke', 'Revoke')}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CONTENT MODERATION */}
      {activeTab === 'content' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
              <Sparkles className="text-[var(--primary)] w-6 h-6" /> {t('admin.tabContent', 'Content Moderation')}
            </h2>
          </div>

          {postsLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Loading feed posts...</div>
          ) : postsData?.length === 0 ? (
            <div className="p-12 text-center text-[var(--text-secondary)] font-medium">No community feed posts found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {postsData?.map((post: any) => (
                <div key={post.id} className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border)] shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      {post.user.avatarUrl ? (
                        <img src={post.user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full" />
                      )}
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] text-sm">{post.user.firstName} {post.user.lastName}</h4>
                        <p className="text-xs text-[var(--text-secondary)]">{post.user.email}</p>
                      </div>
                    </div>
                    <p className="text-[var(--text-primary)] font-medium text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
                    {post.imageUrl && (
                      <img src={post.imageUrl} alt="Post" className="w-full h-48 object-cover rounded-xl border border-[var(--border)]" />
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
                    <span className="text-xs text-[var(--text-secondary)]">{new Date(post.createdAt).toLocaleDateString()}</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        if (confirm('Delete this post from the public feed?')) {
                          deletePostMutation.mutate(post.id);
                        }
                      }}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" /> {t('admin.delete', 'Delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
