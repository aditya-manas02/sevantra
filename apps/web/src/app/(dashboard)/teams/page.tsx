'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trophy, Users, Plus, Shield, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [search, setSearch] = useState('');

  const { data: leaderboard, isLoading: boardLoading } = useQuery({
    queryKey: ['teams-leaderboard'],
    queryFn: async () => (await api.get('/teams/leaderboard')).data.leaderboard
  });

  const { data: myTeams, isLoading: myTeamsLoading } = useQuery({
    queryKey: ['my-teams'],
    queryFn: async () => (await api.get('/teams/my')).data.teams
  });

  const createTeam = useMutation({
    mutationFn: async () => api.post('/teams', { name: newTeamName, description: newTeamDesc }),
    onSuccess: () => {
      toast.success('Team created successfully!');
      setIsCreating(false);
      setNewTeamName('');
      setNewTeamDesc('');
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams-leaderboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create team')
  });

  const joinTeam = useMutation({
    mutationFn: async (teamId: string) => api.post('/teams/join', { teamId }),
    onSuccess: () => {
      toast.success('Joined team successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams-leaderboard'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to join team')
  });

  const isMyTeam = (teamId: string) => {
    return myTeams?.some((t: any) => t.id === teamId);
  };

  const filteredBoard = leaderboard?.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-heading text-[var(--primary)] flex items-center gap-3">
            <Trophy className="w-8 h-8 text-[var(--secondary)]" /> Corporate Teams
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 font-medium">Join your company or university team and climb the CSR Leaderboard.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-xl shadow-soft">
          <Plus className="w-5 h-5 mr-2" /> Create New Team
        </Button>
      </div>

      {isCreating && (
        <div className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-soft relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--secondary)]" />
          <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Register a Team</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Team Name</label>
              <Input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="e.g. Google Volunteers" className="bg-[var(--background)] border-[var(--border)]" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Description</label>
              <Input value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} placeholder="What is your team about?" className="bg-[var(--background)] border-[var(--border)]" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => createTeam.mutate()} disabled={!newTeamName || createTeam.isPending} className="bg-[var(--secondary)] hover:bg-[#B58B60] text-white">
                {createTeam.isPending ? 'Creating...' : 'Register Team'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {myTeams && myTeams.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--primary)]" /> My Teams
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {myTeams.map((team: any) => (
              <div key={team.id} className="bg-[var(--surface)] p-5 rounded-2xl border border-[var(--primary)]/20 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {team.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{team.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">{team._count?.members || 1} Members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] p-6 md:p-8 rounded-3xl shadow-soft border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl font-black font-heading text-[var(--text-primary)]">Global CSR Leaderboard</h2>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search teams..." 
              className="pl-9 bg-[var(--background)] border-[var(--border)] rounded-xl h-10"
            />
          </div>
        </div>

        {boardLoading ? (
          <div className="text-center py-12 text-[var(--text-secondary)] font-medium animate-pulse">Loading Leaderboard...</div>
        ) : filteredBoard?.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)] font-medium">No teams found. Be the first to create one!</div>
        ) : (
          <div className="space-y-4">
            {filteredBoard?.map((team: any, idx: number) => {
              const isTop3 = idx < 3;
              return (
                <div key={team.id} className={`flex items-center justify-between p-4 sm:p-5 rounded-2xl transition-all ${isTop3 ? 'bg-gradient-to-r from-[var(--primary)]/10 to-transparent border border-[var(--primary)]/20 shadow-sm' : 'bg-[var(--background)] border border-[var(--border)]'}`}>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-8 h-8 flex items-center justify-center font-black text-lg ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-gray-400' : idx === 2 ? 'text-amber-700' : 'text-[var(--text-secondary)]'}`}>
                      #{idx + 1}
                    </div>
                    <div className="w-12 h-12 bg-[var(--surface)] rounded-xl flex items-center justify-center font-bold text-xl text-[var(--primary)] shadow-sm border border-[var(--border)]">
                      {team.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg">{team.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm font-medium text-[var(--text-secondary)] flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" /> {team.memberCount}
                        </p>
                        <p className="text-sm font-bold text-[var(--secondary)]">{team.score} Impact Points</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    {isMyTeam(team.id) ? (
                      <span className="px-4 py-2 bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-sm rounded-lg flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Joined
                      </span>
                    ) : (
                      <Button onClick={() => joinTeam.mutate(team.id)} variant="outline" className="font-bold border-[var(--border)] hover:bg-[var(--primary)] hover:text-white hover:border-[var(--primary)] transition-colors">
                        Join Team
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Temporary CheckCircle icon since it wasn't imported from lucide-react in the chunk above
function CheckCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
