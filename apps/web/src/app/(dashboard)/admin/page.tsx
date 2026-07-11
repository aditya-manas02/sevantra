'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Check, X, ShieldCheck, Users, Building2, Calendar, HandHeart, Activity, AlertTriangle, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const activityData = [
  { name: 'Mon', active: 400 },
  { name: 'Tue', active: 300 },
  { name: 'Wed', active: 550 },
  { name: 'Thu', active: 450 },
  { name: 'Fri', active: 700 },
  { name: 'Sat', active: 1200 },
  { name: 'Sun', active: 900 },
];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data.user
  });

  const { data: adminData, isLoading: adminLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => (await api.get('/admin/stats')).data,
    enabled: user?.role === 'PLATFORM_ADMIN'
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/admin/organizations/${id}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Organization verification status updated.');
    },
    onError: () => {
      toast.error('Failed to update organization status.');
    }
  });

  if (userLoading || adminLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user || user.role !== 'PLATFORM_ADMIN') return (
    <div className="p-8 max-w-2xl mx-auto mt-12 text-center bg-[var(--background)] text-red-700 rounded-3xl shadow-soft border border-[var(--border)] p-12">
      <ShieldCheck className="w-16 h-16 mx-auto mb-4 text-red-500 opacity-50" />
      <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
      <p className="font-medium">You do not have administrative privileges to view this area.</p>
    </div>
  );

  const { stats, recentEvents, pendingOrgs = [] } = adminData;

  const statCards = [
    { title: "Community Members", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-[var(--background)]" },
    { title: "Organizations", value: stats.totalOrgs, icon: Building2, color: "text-amber-600", bg: "bg-[var(--background)]" },
    { title: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Event RSVPs", value: stats.totalRegistrations, icon: HandHeart, color: "text-purple-600", bg: "bg-[var(--background)]" }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--primary)] tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-[var(--secondary)]" />
            Platform Dashboard
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg font-medium">Manage and support our community growth.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div 
            key={stat.title}
            className={`p-6 bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-soft relative overflow-hidden`}
          >
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

      <div className="bg-[var(--surface)] p-8 md:p-10 rounded-3xl shadow-soft border border-[var(--border)] mt-8">
        <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
          <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
            <AlertTriangle className="text-amber-500 w-6 h-6" /> Verification Requests
          </h2>
          <span className="bg-[var(--accent)]/20 text-amber-900 text-sm py-1 px-3 rounded-full font-bold">{pendingOrgs.length} Pending</span>
        </div>
        
        {pendingOrgs.length === 0 ? (
          <div className="text-center p-12 bg-[var(--background)] rounded-3xl border border-[var(--border)] shadow-inner">
            <ShieldCheck className="w-12 h-12 text-[var(--primary)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)] font-semibold text-lg mb-2">All caught up!</p>
            <p className="text-[var(--text-secondary)]">There are no organizations waiting for verification.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingOrgs.map((org: any) => (
              <div key={org.id} className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-soft-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-md transition-shadow">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-[var(--text-primary)] text-xl">{org.name}</h3>
                    <span className="bg-[var(--secondary)]/10 text-[var(--secondary)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{org.type}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] mb-4 font-medium">{org.description}</p>
                  
                  {org.verificationDocUrl && (
                    <a 
                      href={org.verificationDocUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] bg-[var(--surface)] px-4 py-2 rounded-xl border border-[var(--primary)]/20 shadow-sm transition-colors"
                    >
                      <FileText className="w-4 h-4" /> View Supporting Document
                    </a>
                  )}
                </div>
                
                <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                  <Button 
                    onClick={() => verifyMutation.mutate({ id: org.id, status: 'VERIFIED' })}
                    disabled={verifyMutation.isPending}
                    className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-soft font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => verifyMutation.mutate({ id: org.id, status: 'REJECTED' })}
                    disabled={verifyMutation.isPending}
                    className="flex-1 md:flex-none border-[var(--border)] text-red-600 hover:bg-[var(--background)] hover:text-red-700 hover:border-red-300 shadow-sm font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)]">
          <div className="flex items-center gap-3 mb-8 border-b border-[var(--border)]/50 pb-4">
            <Activity className="w-6 h-6 text-[var(--primary)]" />
            <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">Engagement Metrics</h2>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', borderWidth: '1px', fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="active" stroke="var(--primary)" strokeWidth={3} fillOpacity={0.1} fill="var(--primary)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] flex flex-col">
          <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
            <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">
              Event Log
            </h2>
            <span className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1 font-bold rounded-full">
              {recentEvents?.length || 0} Recent
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {recentEvents?.map((event: any) => (
              <div key={event.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] group hover:shadow-soft-sm transition-all">
                <h3 className="font-bold text-[var(--text-primary)] mb-1 leading-tight line-clamp-2">{event.title}</h3>
                <div className="flex justify-between items-center text-xs mt-2 font-medium">
                  <span className="text-[var(--secondary)] truncate max-w-[60%]">{event.organization.name}</span>
                  <span className="text-[var(--text-secondary)]">{new Date(event.createdAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/events/${event.id}`}>
                  <button className="w-full mt-4 py-2 text-sm font-bold text-[var(--primary)] bg-[var(--surface)] rounded-xl hover:bg-[var(--primary)] hover:text-white transition-colors border border-[var(--primary)]/20 shadow-sm">
                    View Event
                  </button>
                </Link>
              </div>
            ))}
            {(!recentEvents || recentEvents.length === 0) && (
              <div className="h-full flex items-center justify-center font-medium text-[var(--text-secondary)] bg-[var(--background)] rounded-2xl border border-[var(--border)] border-dashed p-8 text-center">No community events logged recently.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
