import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, getMessages, sendMessage } from '@/api/messages';
import { getDemoConversations, getDemoMessages } from '@/data/demoMessages';
import type { Conversation, Message } from '@/types';
import type { VerticalType } from '@/config/verticalConfig';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, ArrowLeft, MessageSquare, Search, Check, CheckCheck, Smile } from 'lucide-react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string) {
  const colors = [
    'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500',
    'bg-violet-500', 'bg-pink-500', 'bg-teal-500', 'bg-indigo-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Azi';
  if (isYesterday(d)) return 'Ieri';
  return format(d, 'd MMMM yyyy', { locale: ro });
}

function formatConvoTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Ieri';
  return format(d, 'd MMM', { locale: ro });
}

export default function Messages({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConvos, setFilteredConvos] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  const { isDemo } = useAuth();

  const vertical = (user?.vertical_type || 'kids') as VerticalType;

  // Load conversations - demo or real
  useEffect(() => {
    if (!user) return;
    if (isDemo) {
      const demoConvos = getDemoConversations(vertical);
      setConversations(demoConvos);
      setFilteredConvos(demoConvos);
    } else {
      getConversations(user.id).then(c => {
        setConversations(c);
        setFilteredConvos(c);
      });
    }
  }, [user, isDemo, vertical]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConvos(conversations);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredConvos(conversations.filter(c =>
        c.contact_nume.toLowerCase().includes(q) ||
        c.ultimul_mesaj.toLowerCase().includes(q)
      ));
    }
  }, [searchQuery, conversations]);

  useEffect(() => {
    if (selectedConvo && user) {
      if (isDemo) {
        setMessages(getDemoMessages(vertical, selectedConvo.id));
      } else {
        getMessages(selectedConvo.grupa, user.id, selectedConvo.id).then(setMessages);
      }
    }
  }, [selectedConvo, user, isDemo, vertical]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!selectedConvo) return;
    
    import('@/integrations/supabase/client').then(({ supabase: sb }) => {
      const channel = sb
        .channel(`messages:${selectedConvo.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConvo.id}`,
        }, (payload: any) => {
          const m = payload.new;
          if (m.sender_id === user?.id) return;
          setMessages(prev => {
            if (prev.some(msg => msg.id === m.id)) return prev;
            return [...prev, {
              id: m.id,
              expeditor: m.sender_id,
              expeditor_nume: '',
              destinatar: user?.id || '',
              mesaj: m.mesaj,
              data: m.created_at,
              citit: false,
            }];
          });
        })
        .subscribe();

      channelRef.current = channel;
    });

    return () => { channelRef.current?.unsubscribe(); };
  }, [selectedConvo?.id, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo || !user || isSending) return;
    setIsSending(true);
    try {
      const msg = await sendMessage(selectedConvo.grupa, selectedConvo.contact_id, newMessage);
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
      // Update conversation preview
      setConversations(prev => prev.map(c =>
        c.id === selectedConvo.id
          ? { ...c, ultimul_mesaj: newMessage, data_ultimul_mesaj: new Date().toISOString() }
          : c
      ));
      inputRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  const openConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);
    // Mark as read
    if (convo.necitite > 0) {
      setConversations(prev => prev.map(c =>
        c.id === convo.id ? { ...c, necitite: 0 } : c
      ));
    }
  };

  // Group messages by date for separators
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach(msg => {
    const dateKey = format(new Date(msg.data), 'yyyy-MM-dd');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  const totalUnread = conversations.reduce((sum, c) => sum + c.necitite, 0);

  return (
    <div className="space-y-4 min-w-0">
      {!embedded && (
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-display font-bold">Mesaje</h1>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-xs">{totalUnread} necitite</Badge>
          )}
        </div>
      )}

      <div className="flex gap-0 h-[calc(100vh-200px)] min-w-0 rounded-xl overflow-hidden border border-border/50 shadow-sm">
        {/* Conversations List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 shrink-0 flex flex-col min-w-0 bg-card/80 backdrop-blur-sm border-r border-border/50",
          mobileShowChat && "hidden md:flex"
        )}>
          {/* Search */}
          <div className="p-3 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută conversații..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {filteredConvos.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground text-sm">
                {searchQuery ? 'Nicio conversație găsită' : 'Nicio conversație'}
              </div>
            ) : (
              filteredConvos.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => openConvo(convo)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex items-center gap-3 transition-all hover:bg-muted/60",
                    selectedConvo?.id === convo.id && "bg-primary/8 border-l-2 border-l-primary",
                    convo.necitite > 0 && "bg-primary/5"
                  )}
                >
                  {/* Avatar */}
                  <div className={cn(
                    "h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm",
                    getAvatarColor(convo.contact_nume)
                  )}>
                    {getInitials(convo.contact_nume)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "text-sm truncate",
                        convo.necitite > 0 ? "font-bold text-foreground" : "font-medium text-foreground"
                      )}>
                        {convo.contact_nume}
                      </span>
                      <span className={cn(
                        "text-[11px] shrink-0",
                        convo.necitite > 0 ? "text-primary font-semibold" : "text-muted-foreground"
                      )}>
                        {formatConvoTime(convo.data_ultimul_mesaj)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p className={cn(
                        "text-xs truncate",
                        convo.necitite > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
                        {convo.ultimul_mesaj}
                      </p>
                      {convo.necitite > 0 && (
                        <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
                          {convo.necitite}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat View */}
        <div className={cn(
          "flex-1 flex flex-col min-w-0 bg-background",
          !mobileShowChat && "hidden md:flex"
        )}>
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-card/60 backdrop-blur-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden shrink-0 h-8 w-8"
                  onClick={() => setMobileShowChat(false)}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className={cn(
                  "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm",
                  getAvatarColor(selectedConvo.contact_nume)
                )}>
                  {getInitials(selectedConvo.contact_nume)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{selectedConvo.contact_nume}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {selectedConvo.grupa.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-1 min-h-full flex flex-col justify-end">
                  {groupedMessages.map(group => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center justify-center my-4">
                        <span className="text-[11px] text-muted-foreground bg-muted/80 px-3 py-1 rounded-full font-medium">
                          {formatDateLabel(group.messages[0].data)}
                        </span>
                      </div>

                      {/* Messages in this date group */}
                      {group.messages.map((msg, idx) => {
                        const isMine = msg.expeditor === user?.id;
                        const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                        const isConsecutive = prevMsg && prevMsg.expeditor === msg.expeditor;

                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className={cn(
                              "flex",
                              isMine ? "justify-end" : "justify-start",
                              isConsecutive ? "mt-0.5" : "mt-3"
                            )}
                          >
                            {/* Other's avatar (only first in consecutive group) */}
                            {!isMine && !isConsecutive && (
                              <div className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 mr-2 mt-1",
                                getAvatarColor(msg.expeditor_nume)
                              )}>
                                {getInitials(msg.expeditor_nume)}
                              </div>
                            )}
                            {!isMine && isConsecutive && (
                              <div className="w-7 mr-2 shrink-0" />
                            )}

                            <div className={cn(
                              "max-w-[75%] sm:max-w-[65%] group relative",
                            )}>
                              {/* Sender name (only first in consecutive, only for others) */}
                              {!isMine && !isConsecutive && (
                                <p className="text-[11px] font-medium text-muted-foreground mb-0.5 ml-1">
                                  {msg.expeditor_nume}
                                </p>
                              )}
                              <div className={cn(
                                "px-3.5 py-2 text-[13.5px] leading-relaxed break-words",
                                isMine
                                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm"
                                  : "bg-muted/80 text-foreground rounded-2xl rounded-bl-md",
                              )}>
                                <p>{msg.mesaj}</p>
                                <div className={cn(
                                  "flex items-center justify-end gap-1 mt-0.5",
                                  isMine ? "text-primary-foreground/50" : "text-muted-foreground"
                                )}>
                                  <span className="text-[10px]">
                                    {format(new Date(msg.data), 'HH:mm')}
                                  </span>
                                  {isMine && (
                                    msg.citit
                                      ? <CheckCheck className="h-3 w-3" />
                                      : <Check className="h-3 w-3" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-border/50 bg-card/60 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder="Scrie un mesaj..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      className="pr-10 bg-muted/40 border-border/50 focus-visible:ring-1 rounded-xl"
                    />
                  </div>
                  <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!newMessage.trim() || isSending}
                    className={cn(
                      "shrink-0 rounded-xl h-10 w-10 transition-all",
                      newMessage.trim()
                        ? "bg-primary shadow-md hover:shadow-lg scale-100"
                        : "bg-muted text-muted-foreground scale-95"
                    )}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Selectează o conversație</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Alege din lista din stânga pentru a vedea mesajele
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
