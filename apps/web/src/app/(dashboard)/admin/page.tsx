'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import Link from 'next/link';
import { Check, X, ShieldCheck, Users, Building2, Calendar, HandHeart, Activity, AlertTriangle, FileText, Mail, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'organizations'>('overview');
  
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

  const verifyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/admin/organizations/${id}/verify`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
      toast.success('Organization status updated.');
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

  const { stats, recentEvents, pendingOrgs = [], activityData = [] } = adminData;

  const statCards = [
    { title: "Community Members", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { title: "Organizations", value: stats.totalOrgs, icon: Building2, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { title: "Total Events", value: stats.totalEvents, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { title: "Event RSVPs", value: stats.totalRegistrations, icon: HandHeart, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-900/20" }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--primary)] tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-[var(--secondary)]" />
            Admin Command Center
          </h1>
          <p className="text-[var(--text-secondary)] mt-3 text-lg font-medium">Manage and support our community growth.</p>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-[var(--border)] mb-6 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          Platform Overview
        </button>
        <button 
          onClick={() => setActiveTab('users')} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          User Management
        </button>
        <button 
          onClick={() => setActiveTab('organizations')} 
          className={`px-4 py-3 font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'organizations' ? 'border-b-4 border-[var(--primary)] text-[var(--primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--primary)]'}`}
        >
          Organizations {pendingOrgs.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingOrgs.length}</span>}
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

          {pendingOrgs.length > 0 && (
            <div className="bg-[var(--surface)] p-8 md:p-10 rounded-3xl shadow-soft border border-amber-500/30">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)]/50 pb-4">
                <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] flex items-center gap-3">
                  <AlertTriangle className="text-amber-500 w-6 h-6" /> Verification Requests
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
                        <a 
                          href={org.verificationDocUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary)] hover:underline"
                        >
                          <FileText className="w-4 h-4" /> View Supporting Document
                        </a>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                      <Button 
                        onClick={() => verifyMutation.mutate({ id: org.id, status: 'VERIFIED' })}
                        disabled={verifyMutation.isPending}
                        className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        <Check className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => verifyMutation.mutate({ id: org.id, status: 'REJECTED' })}
                        disabled={verifyMutation.isPending}
                        className="flex-1 md:flex-none text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-2" /> Reject
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
                  <h2 className="text-xl font-black font-heading text-[var(--text-primary)]">User Growth (Last 7 Days)</h2>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12, fontWeight: '500'}} tickLine={false} axisLine={false} allowDecimals={false} />
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
                  <div key={event.id} className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                    <h3 className="font-bold text-[var(--text-primary)] mb-1 leading-tight line-clamp-2">{event.title}</h3>
                    <div className="flex justify-between items-center text-xs mt-2 font-medium">
                      <span className="text-[var(--secondary)] truncate max-w-[60%]">{event.organization.name}</span>
                      <span className="text-[var(--text-secondary)]">{new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] mb-6 flex items-center gap-3">
            <Users className="text-[var(--primary)] w-6 h-6" /> User Management
          </h2>
          
          {usersLoading ? (
            <div className="p-12 text-center text-[var(--text-secondary)]">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-secondary)] text-sm">
                    <th className="pb-4 font-bold">Name</th>
                    <th className="pb-4 font-bold">Email</th>
                    <th className="pb-4 font-bold">Role</th>
                    <th className="pb-4 font-bold">Status</th>
                    <th className="pb-4 font-bold">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {usersData?.map((u: any) => (
                    <tr key={u.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="py-4 font-bold text-[var(--text-primary)]">{u.firstName} {u.lastName}</td>
                      <td className="py-4 text-[var(--text-secondary)]">{u.email}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${u.role === 'PLATFORM_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4">
                        {u.isEmailVerified ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-bold"><Check className="w-4 h-4"/> Verified</span>
                        ) : (
                          <span className="flex items-center gap-1 text-amber-600 text-sm font-bold"><AlertTriangle className="w-4 h-4"/> Pending</span>
                        )}
                      </td>
                      <td className="py-4 text-[var(--text-secondary)] text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="bg-[var(--surface)] p-8 rounded-3xl shadow-soft border border-[var(--border)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-black font-heading text-[var(--text-primary)] mb-6 flex items-center gap-3">
            <Building2 className="text-[var(--primary)] w-6 h-6" /> Organization Management
          </h2>
          
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
                  {orgsData?.map((org: any) => (
                    <tr key={org.id} className="hover:bg-[var(--background)] transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-[var(--text-primary)]">{org.name}</div>
                        <div className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">{org.description}</div>
                      </td>
                      <td className="py-4 text-[var(--text-secondary)] text-sm">{org.type}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${org.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : org.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                          {org.verificationStatus}
                        </span>
                      </td>
                      <td className="py-4 font-medium text-[var(--text-primary)]">{org._count.members}</td>
                      <td className="py-4 font-medium text-[var(--text-primary)]">{org._count.events}</td>
                      <td className="py-4 text-right space-x-2">
                        {org.verificationStatus !== 'VERIFIED' && (
                          <Button 
                            size="sm"
                            onClick={() => verifyMutation.mutate({ id: org.id, status: 'VERIFIED' })}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Verify
                          </Button>
                        )}
                        {org.verificationStatus === 'VERIFIED' && (
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => verifyMutation.mutate({ id: org.id, status: 'REJECTED' })}
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                          >
                            Revoke
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
    </div>
  );
}
