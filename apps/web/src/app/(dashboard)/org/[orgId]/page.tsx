"use client";
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Building2, Users, Calendar, HandHeart } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function OrgProfilePage() {
  const { orgId } = useParams();

  const { data: org, isLoading } = useQuery({
    queryKey: ['orgProfile', orgId],
    queryFn: async () => (await api.get(`/profiles/orgs/${orgId}`)).data.organization
  });

  if (isLoading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!org) return <div className="p-8 text-red-500 glass rounded-xl">Organization not found.</div>;

  // Mock data for the activity chart
  const impactData = [
    { name: 'Jan', volunteers: 40 },
    { name: 'Feb', volunteers: 65 },
    { name: 'Mar', volunteers: 80 },
    { name: 'Apr', volunteers: 120 },
    { name: 'May', volunteers: 250 },
    { name: 'Jun', volunteers: parseInt(org.stats.totalVolunteers.toString()) },
  ];

  const statCards = [
    { title: "Events Hosted", value: org.stats.eventsHosted, icon: Calendar, color: "text-blue-500", bg: "bg-[var(--background)]0/10", border: "border-blue-500/20" },
    { title: "Volunteers Engaged", value: org.stats.totalVolunteers, icon: Users, color: "text-green-500", bg: "bg-[var(--background)]0/10", border: "border-green-500/20" },
    { title: "Total Impact Hours", value: org.stats.totalImpactHours, icon: HandHeart, color: "text-purple-500", bg: "bg-[var(--background)]0/10", border: "border-purple-500/20" }
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-[var(--background)] min-h-screen">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 border border-[var(--border)] shadow-warm-lg overflow-hidden relative text-center"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-full blur-[100px] opacity-20 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#FF9F1C] to-transparent rounded-full blur-[80px] opacity-20 -z-10" />
        
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] p-1 shadow-2xl mb-6 relative z-10">
          <div className="w-full h-full rounded-2xl bg-[var(--surface)] flex items-center justify-center text-5xl font-black font-heading text-[var(--primary)]">
            {org.name.charAt(0)}
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--text-primary)] mb-4 relative z-10">{org.name}</h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8 font-medium relative z-10">{org.description}</p>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={async () => {
            try {
              const res = await api.post('/donations/checkout', { amount: 50, organizationId: orgId });
              window.location.href = res.data.url;
            } catch (e) {
              toast.error('Failed to initialize donation');
            }
          }}
          className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-[var(--primary)]/30 text-lg relative z-10"
        >
          Support Our Cause ($50)
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2, type: "spring", stiffness: 200 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`p-6 glass rounded-2xl border ${stat.border} shadow-warm-md relative overflow-hidden group cursor-pointer`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-4xl font-black text-[var(--text-primary)] mb-1 font-heading">{stat.value}</p>
            <p className="font-semibold text-sm text-[var(--text-secondary)] uppercase tracking-wider">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Analytics Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass p-8 rounded-2xl border border-[var(--border)] shadow-warm-md"
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold font-heading text-[var(--text-primary)]">Volunteer Engagement</h2>
            <p className="text-[var(--text-secondary)] text-sm">Growth in community participation over the last 6 months.</p>
          </div>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impactData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-secondary)" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
              <RechartsTooltip 
                cursor={{ fill: 'var(--border)', opacity: 0.4 }}
                contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text-primary)', boxShadow: 'var(--shadow-md)' }}
                itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              />
              <Bar dataKey="volunteers" radius={[6, 6, 0, 0]}>
                {impactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === impactData.length - 1 ? 'var(--primary)' : 'var(--secondary)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
