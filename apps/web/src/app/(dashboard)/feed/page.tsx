'use client';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Image as ImageIcon, Send, MessageCircle, Heart, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function FeedPage() {
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ['community-feed'],
    queryFn: async () => (await api.get('/feed')).data.posts
  });

  const createPost = useMutation({
    mutationFn: async () => api.post('/feed', { content, imageUrl: imageBase64 }),
    onSuccess: () => {
      setContent('');
      setImageBase64(null);
      toast.success('Posted successfully!');
      queryClient.invalidateQueries({ queryKey: ['community-feed'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to post')
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = () => {
    if (!content.trim()) return;
    createPost.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8 bg-transparent min-h-screen">
      <div className="text-center space-y-3 mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-soft">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-black font-heading text-[var(--text-primary)]">Community Feed</h1>
        <p className="text-[var(--text-secondary)] font-medium">Share your impact stories, photos, and inspire others!</p>
      </div>

      <div className="bg-[var(--surface)] p-6 rounded-3xl shadow-soft border border-[var(--border)]">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex-shrink-0 border-2 border-white shadow-sm" />
          <div className="flex-1 space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What impact did you make today?"
              className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--text-primary)]"
            />
            
            {imageBase64 && (
              <div className="relative rounded-2xl overflow-hidden border border-[var(--border)]">
                <img src={imageBase64} alt="Upload preview" className="w-full max-h-[300px] object-cover" />
                <button 
                  onClick={() => setImageBase64(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <Button variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/10 flex items-center gap-2 font-bold" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-5 h-5" /> Add Photo
              </Button>
              <Button 
                onClick={handlePost} 
                disabled={!content.trim() || createPost.isPending}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold rounded-full px-6 flex items-center gap-2"
              >
                {createPost.isPending ? 'Posting...' : 'Share Impact'} <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12 text-[var(--text-secondary)] font-medium animate-pulse">Loading amazing stories...</div>
        ) : posts?.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-secondary)] font-medium bg-[var(--surface)] rounded-3xl border border-[var(--border)]">No stories yet. Be the first to share!</div>
        ) : (
          posts?.map((post: any) => (
            <div key={post.id} className="bg-[var(--surface)] p-6 rounded-3xl shadow-sm border border-[var(--border)] hover:shadow-soft transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-4">
                {post.user.avatarUrl ? (
                  <img src={post.user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-[var(--border)]" />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-[var(--text-primary)]">{post.user.firstName} {post.user.lastName}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">{new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              
              <p className="text-[var(--text-primary)] font-medium mb-4 whitespace-pre-wrap">{post.content}</p>
              
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-[var(--border)] mb-4">
                  <img src={post.imageUrl} alt="Post image" className="w-full max-h-[400px] object-cover" />
                </div>
              )}
              
              <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)]">
                <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-red-500 font-bold text-sm transition-colors group">
                  <Heart className="w-5 h-5 group-hover:fill-red-500 transition-all" /> Like
                </button>
                <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-500 font-bold text-sm transition-colors">
                  <MessageCircle className="w-5 h-5" /> Comment
                </button>
                <button className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-green-500 font-bold text-sm transition-colors ml-auto">
                  <Share2 className="w-5 h-5" /> Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
