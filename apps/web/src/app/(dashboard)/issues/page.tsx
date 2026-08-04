'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AlertCircle, MapPin, CheckCircle2, Clock, Plus, Image as ImageIcon, Check, Filter, Search, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export default function CivicIssuesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isReporting, setIsReporting] = useState(false);
  const [resolvingIssue, setResolvingIssue] = useState<any>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('POTHOLE');
  const [locationName, setLocationName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [resolutionImageUrl, setResolutionImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolutionInputRef = useRef<HTMLInputElement>(null);

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ['civic-issues', activeTab],
    queryFn: async () => {
      const url = activeTab === 'ALL' ? '/issues' : `/issues?status=${activeTab}`;
      return (await api.get(url)).data.issues;
    }
  });

  const createIssueMutation = useMutation({
    mutationFn: async () => {
      return api.post('/issues', {
        title,
        description,
        category,
        locationName: locationName || 'Local Area',
        latitude: 28.6139,
        longitude: 77.2090,
        imageUrl
      });
    },
    onSuccess: () => {
      toast.success(t('issues.reportedSuccess', 'Civic issue reported successfully!'));
      setIsReporting(false);
      setTitle('');
      setDescription('');
      setLocationName('');
      setImageUrl(null);
      queryClient.invalidateQueries({ queryKey: ['civic-issues'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to report issue')
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ issueId, status }: { issueId: string; status: string }) => {
      return api.patch(`/issues/${issueId}/status`, {
        status,
        resolutionImageUrl
      });
    },
    onSuccess: () => {
      toast.success(t('issues.updatedSuccess', 'Issue status updated successfully!'));
      setResolvingIssue(null);
      setResolutionImageUrl(null);
      queryClient.invalidateQueries({ queryKey: ['civic-issues'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update status')
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'POTHOLE': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'WASTE': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'STREETLIGHT': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'WATER': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs font-bold rounded-full flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> Open</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-bold rounded-full flex items-center gap-1"><Clock className="w-3.5 h-3.5"/> In Progress</span>;
      case 'RESOLVED': return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-bold rounded-full flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Resolved</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading text-[var(--primary)] tracking-tight flex items-center gap-3">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-500" />
            {t('issues.title', 'Civic Issue Reporting & Resolution')}
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-lg font-medium">{t('issues.subtitle', 'Report infrastructure issues, waste dumps, or potholes and track community resolutions.')}</p>
        </div>

        <Button onClick={() => setIsReporting(true)} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-2xl px-6 py-6 shadow-soft flex items-center gap-2">
          <Plus className="w-5 h-5" /> {t('issues.reportButton', 'Report Civic Issue')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-[var(--primary)] text-white shadow-soft' : 'text-[var(--text-secondary)] hover:bg-[var(--surface)]'}`}
          >
            {tab === 'ALL' ? t('issues.tabAll', 'All Alerts') : tab === 'OPEN' ? t('issues.tabOpen', 'Open') : tab === 'IN_PROGRESS' ? t('issues.tabInProgress', 'In Progress') : t('issues.tabResolved', 'Resolved')}
          </button>
        ))}
      </div>

      {/* Issues Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-[var(--text-secondary)] animate-pulse font-medium">Loading civic alerts...</div>
      ) : issuesData?.length === 0 ? (
        <div className="text-center py-16 bg-[var(--surface)] rounded-3xl border border-[var(--border)] p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-[var(--text-secondary)] opacity-30" />
          <h3 className="text-xl font-bold text-[var(--text-primary)]">No civic issues found</h3>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Be the first to report a local problem to bring community action.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issuesData?.map((issue: any) => (
            <div key={issue.id} className="bg-[var(--surface)] p-6 rounded-3xl border border-[var(--border)] shadow-soft hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${getCategoryBadge(issue.category)}`}>
                    {issue.category}
                  </span>
                  {getStatusBadge(issue.status)}
                </div>

                <h3 className="text-xl font-bold text-[var(--text-primary)] leading-tight">{issue.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] line-clamp-3 whitespace-pre-wrap">{issue.description}</p>
                
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--secondary)] pt-1">
                  <MapPin className="w-4 h-4" /> {issue.locationName}
                </div>

                {issue.imageUrl && (
                  <img src={issue.imageUrl} alt="Issue photo" className="w-full h-44 object-cover rounded-2xl border border-[var(--border)]" />
                )}

                {issue.status === 'RESOLVED' && issue.resolutionImageUrl && (
                  <div className="bg-green-500/10 p-3 rounded-2xl border border-green-500/30">
                    <p className="text-xs font-bold text-green-600 mb-2">Proof of Resolution:</p>
                    <img src={issue.resolutionImageUrl} alt="Resolution proof" className="w-full h-36 object-cover rounded-xl" />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex justify-between items-center text-xs font-medium text-[var(--text-secondary)]">
                <span>Reported by {issue.reporter?.firstName || 'Citizen'}</span>
                
                {issue.status !== 'RESOLVED' && (
                  <Button 
                    size="sm"
                    onClick={() => setResolvingIssue(issue)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs"
                  >
                    Update / Resolve
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {isReporting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertCircle className="text-red-500 w-6 h-6" /> Report Civic Issue
            </h2>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Issue Title</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Large Pothole on Main St" className="bg-[var(--background)]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-medium">
                  <option value="POTHOLE">Pothole / Road Damage</option>
                  <option value="WASTE">Garbage / Overflowing Dump</option>
                  <option value="STREETLIGHT">Broken Streetlight</option>
                  <option value="WATER">Water Leakage / Pipe Burst</option>
                  <option value="OTHER">Other Civic Concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Location Name</label>
                <Input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="e.g. Near City Park Entrance" className="bg-[var(--background)]" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details to help local teams fix it..." className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 min-h-[80px] text-sm resize-none" />
              </div>

              <div>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={e => handleImageUpload(e, setImageUrl)} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full border-dashed font-bold flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {imageUrl ? 'Photo Attached ✓' : 'Upload Photo'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setIsReporting(false)} className="flex-1">Cancel</Button>
              <Button onClick={() => createIssueMutation.mutate()} disabled={!title || !description || createIssueMutation.isPending} className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold">
                {createIssueMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE ISSUE MODAL */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Update Issue Status</h2>
            <p className="text-xs text-[var(--text-secondary)] font-medium">Updating "{resolvingIssue.title}"</p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1">New Status</label>
                <select id="resolveStatusSelect" className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-medium">
                  <option value="IN_PROGRESS">In Progress (Claimed by Team)</option>
                  <option value="RESOLVED">Resolved (Fixed)</option>
                </select>
              </div>

              <div>
                <input type="file" accept="image/*" className="hidden" ref={resolutionInputRef} onChange={e => handleImageUpload(e, setResolutionImageUrl)} />
                <Button variant="outline" onClick={() => resolutionInputRef.current?.click()} className="w-full border-dashed font-bold flex items-center justify-center gap-2">
                  <ImageIcon className="w-4 h-4" /> {resolutionImageUrl ? 'Proof Photo Attached ✓' : 'Attach Resolution Proof Photo'}
                </Button>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
              <Button variant="outline" onClick={() => setResolvingIssue(null)} className="flex-1">Cancel</Button>
              <Button 
                onClick={() => {
                  const sel = document.getElementById('resolveStatusSelect') as HTMLSelectElement;
                  updateStatusMutation.mutate({ issueId: resolvingIssue.id, status: sel.value });
                }} 
                disabled={updateStatusMutation.isPending} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Save Update'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
