'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MessageSquare, Send, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['recent-chats'],
    queryFn: async () => (await api.get('/messages/chats')).data.chats
  });

  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['conversation', activeChat?.user?.id],
    queryFn: async () => (await api.get(`/messages/${activeChat.user.id}`)).data.messages,
    enabled: !!activeChat,
    refetchInterval: 3000 // Poll every 3 seconds for new messages
  });

  const sendMessage = useMutation({
    mutationFn: async () => api.post('/messages', { receiverId: activeChat.user.id, content: message }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation', activeChat?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
    }
  });

  useEffect(() => {
    // Scroll to bottom when messages load
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeChat) return;
    sendMessage.mutate();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black font-heading text-[var(--primary)] flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[var(--secondary)]" /> Direct Messages
        </h1>
        <p className="text-[var(--text-secondary)] mt-1 font-medium">Chat with event organizers and fellow volunteers.</p>
      </div>

      <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-3xl shadow-soft flex overflow-hidden">
        
        {/* Sidebar: Chat List */}
        <div className="w-1/3 min-w-[250px] border-r border-[var(--border)] flex flex-col bg-[var(--background)]/50">
          <div className="p-4 border-b border-[var(--border)]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <Input placeholder="Search messages..." className="pl-9 bg-[var(--surface)] border-[var(--border)] rounded-full h-10" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {chatsLoading ? (
              <div className="p-4 text-center text-sm text-[var(--text-secondary)]">Loading chats...</div>
            ) : chats?.length === 0 ? (
              <div className="p-8 text-center text-sm text-[var(--text-secondary)] flex flex-col items-center">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                No messages yet.
              </div>
            ) : (
              chats?.map((chat: any) => (
                <button 
                  key={chat.user.id}
                  onClick={() => setActiveChat(chat)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-[var(--primary)]/5 transition-colors border-b border-[var(--border)] ${activeChat?.user?.id === chat.user.id ? 'bg-[var(--primary)]/10 border-l-4 border-l-[var(--primary)]' : 'border-l-4 border-l-transparent'}`}
                >
                  {chat.user.avatarUrl ? (
                    <img src={chat.user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-[var(--text-primary)] truncate">{chat.user.firstName} {chat.user.lastName}</h3>
                      <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap ml-2">
                        {new Date(chat.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-[var(--secondary)] rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-[var(--surface)]">
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--background)]/30">
                {activeChat.user.avatarUrl ? (
                  <img src={activeChat.user.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <h2 className="font-bold text-[var(--text-primary)]">{activeChat.user.firstName} {activeChat.user.lastName}</h2>
                  <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Online
                  </p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messagesLoading ? (
                  <div className="text-center text-sm text-[var(--text-secondary)]">Loading messages...</div>
                ) : (
                  messages?.map((msg: any) => {
                    const isMine = msg.senderId !== activeChat.user.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? 'bg-[var(--primary)] text-white rounded-tr-sm' : 'bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'}`}>
                          <p>{msg.content}</p>
                          <span className={`text-[10px] mt-1 block ${isMine ? 'text-white/70 text-right' : 'text-[var(--text-secondary)] text-left'}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-[var(--border)] bg-[var(--background)]/30">
                <form onSubmit={handleSend} className="flex gap-2">
                  <Input 
                    value={message} 
                    onChange={e => setMessage(e.target.value)} 
                    placeholder="Type your message..." 
                    className="flex-1 bg-[var(--surface)] border-[var(--border)] rounded-full px-4 h-12" 
                  />
                  <Button 
                    type="submit" 
                    disabled={!message.trim() || sendMessage.isPending}
                    className="w-12 h-12 rounded-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 flex items-center justify-center p-0 flex-shrink-0"
                  >
                    <Send className="w-5 h-5 text-white ml-1" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)]">
              <div className="w-24 h-24 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-12 h-12 text-[var(--primary)]/40" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Your Messages</h2>
              <p className="max-w-xs text-center">Select a conversation from the left to start chatting with organizers or volunteers.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
