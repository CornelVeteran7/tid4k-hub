import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, getMessages, sendMessage, getOrCreateGroupConversation } from '@/api/messages';
import { getDemoConversations, getDemoMessages } from '@/data/demoMessages';
import { getDemoPolls } from '@/data/demoPolls';
import { getPolls } from '@/api/polls';
import type { Conversation, Message } from '@/types';
import type { Poll } from '@/types/poll';
import type { VerticalType } from '@/config/verticalConfig';
import { useFeatureToggles } from '@/hooks/useFeatureToggles';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, ArrowLeft, MessageSquare, Search, Check, CheckCheck, BarChart3, Plus, Megaphone, Inbox } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import PollList from '@/components/polls/PollList';
import ContactPicker from '@/components/messages/ContactPicker';
import GuestMessageForm from '@/components/messages/GuestMessageForm';
import GuestInbox from '@/components/messages/GuestInbox';
import { areRol } from '@/utils/roles';

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

interface MessagesProps {
  embedded?: boolean;
  initialTab?: string;
  isGuest?: boolean;
  guestOrgId?: string;
  guestOrgName?: string;
}

export default function Messages({ embedded, initialTab, isGuest, guestOrgId, guestOrgName }: MessagesProps) {
  const { user, isDemo } = useAuth();
  const { isEnabled } = useFeatureToggles();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConvos, setFilteredConvos] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  const vertical = (user?.vertical_type || 'kids') as VerticalType;

  const mesajeEnabled = isEnabled('mesaje');
  const sondajeEnabled = isEnabled('sondaje');

  // Guest users only see the contact form
  if (isGuest && guestOrgId) {
    return (
      <div className="space-y-4 min-w-0">
        {!embedded && (
          <h1 className="text-xl sm:text-2xl font-display font-bold">Contact</h1>
        )}
        <div className="h-[calc(100dvh-10rem)] rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
          <GuestMessageForm orgId={guestOrgId} orgName={guestOrgName} />
        </div>
      </div>
    );
  }

  const userRoles = user?.status || '';
  const isDirector = areRol(userRoles, 'director') || areRol(userRoles, 'administrator') || areRol(userRoles, 'inky');
  const isTeacher = areRol(userRoles, 'profesor');
  const isParent = areRol(userRoles, 'parinte') && !isTeacher && !isDirector;

  const showTabs = mesajeEnabled && sondajeEnabled;
  const defaultTab = initialTab === 'sondaje' ? 'sondaje' : (initialTab === 'vizitatori' ? 'vizitatori' : (mesajeEnabled ? 'mesaje' : 'sondaje'));

  const isAdmin = useMemo(() => {
    if (!user?.status) return false;
    const roles = user.status.split(',').map(r => r.trim().toLowerCase());
    return roles.some(r => ['administrator', 'director', 'inky'].includes(r));
  }, [user?.status]);

  // Determine if selected convo is a read-only group (parent can't send)
  const isGroupConvo = selectedConvo && (selectedConvo as any).is_group;
  const canSendInConvo = !isGroupConvo || isTeacher || isDirector;

  // Load polls
  const loadPolls = async () => {
    if (!user) return;
    if (isDemo) {
      const demoPolls = getDemoPolls(vertical);
      setPolls(demoPolls);
    } else if (user.organization_id) {
      try {
        const rawPolls = await getPolls(user.organization_id);
        const mapped: Poll[] = rawPolls.map((p: any) => {
          const votes = p.poll_votes || [];
          const userVoted = votes.some((v: any) => v.user_id === user.id);
          const optionsList = (p.poll_options || [])
            .sort((a: any, b: any) => a.position - b.position)
            .map((opt: any) => ({
              id: opt.id,
              label: opt.label,
              position: opt.position,
              vote_count: votes.filter((v: any) => v.option_id === opt.id).length,
            }));
          return {
            id: p.id,
            title: p.title,
            description: p.description,
            poll_type: p.poll_type,
            results_visibility: p.results_visibility,
            deadline: p.deadline,
            created_by: p.created_by,
            creator_name: p.creator_profile?.nume_prenume,
            is_closed: p.is_closed,
            created_at: p.created_at,
            organization_id: p.organization_id,
            options: optionsList,
            total_votes: new Set(votes.map((v: any) => v.user_id)).size,
            user_voted: userVoted,
          };
        });
        setPolls(mapped);
      } catch (err) {
        console.error('Failed to load polls:', err);
      }
    }
  };

  useEffect(() => {
    if (sondajeEnabled) loadPolls();
  }, [user, isDemo, vertical, sondajeEnabled]);

  // Load conversations - demo or real
  useEffect(() => {
    if (!user || !mesajeEnabled) return;
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
  }, [user, isDemo, vertical, mesajeEnabled]);

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
    if (!selectedConvo || isDemo) return;
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
      if (isDemo) {
        const demoMsg: Message = {
          id: `demo-msg-${Date.now()}`,
          expeditor: user.id,
          expeditor_nume: user.nume_prenume,
          destinatar: selectedConvo.contact_id,
          mesaj: newMessage,
          data: new Date().toISOString(),
          citit: false,
        };
        setMessages(prev => [...prev, demoMsg]);
        setNewMessage('');
        setConversations(prev => prev.map(c =>
          c.id === selectedConvo.id
            ? { ...c, ultimul_mesaj: newMessage, data_ultimul_mesaj: new Date().toISOString() }
            : c
        ));
        inputRef.current?.focus();
      } else {
        const msg = await sendMessage(selectedConvo.grupa, selectedConvo.contact_id, newMessage, selectedConvo.id);
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
        setConversations(prev => prev.map(c =>
          c.id === selectedConvo.id
            ? { ...c, ultimul_mesaj: newMessage, data_ultimul_mesaj: new Date().toISOString() }
            : c
        ));
        inputRef.current?.focus();
      }
    } finally {
      setIsSending(false);
    }
  };

  const openConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);
    if (convo.necitite > 0) {
      setConversations(prev => prev.map(c =>
        c.id === convo.id ? { ...c, necitite: 0 } : c
      ));
    }
  };

  const handleSelectContact = async (contact: { id: string; nume_prenume: string }) => {
    // Check if conversation already exists
    const existing = conversations.find(c => c.contact_id === contact.id);
    if (existing) {
      openConvo(existing);
      return;
    }
    // Create a placeholder and open it
    const newConvo: Conversation = {
      id: `new-${contact.id}`,
      contact_nume: contact.nume_prenume,
      contact_id: contact.id,
      ultimul_mesaj: '',
      data_ultimul_mesaj: new Date().toISOString(),
      necitite: 0,
      grupa: user?.grupa_clasa_copil || '',
    };
    setConversations(prev => [newConvo, ...prev]);
    openConvo(newConvo);
  };

  const handleCreateGroupBroadcast = async (groupId: string, groupName: string) => {
    if (!user || isDemo) return;
    try {
      const convoId = await getOrCreateGroupConversation(user.id, groupId, groupName);
      // Reload conversations to pick up the new group convo
      const convos = await getConversations(user.id);
      setConversations(convos);
      setFilteredConvos(convos);
      const groupConvo = convos.find(c => c.id === convoId);
      if (groupConvo) openConvo(groupConvo);
    } catch (err) {
      console.error('Failed to create group broadcast:', err);
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
  const unvotedPolls = polls.filter(p => !p.user_voted && !p.is_closed && new Date(p.deadline) > new Date()).length;

  const chatUI = (
    <div className="flex gap-0 h-[calc(100dvh-10rem)] min-w-0 rounded-xl overflow-hidden border border-border/50 shadow-sm">
      {/* Conversations List */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 shrink-0 flex flex-col min-w-0 bg-card/80 backdrop-blur-sm border-r border-border/50",
        mobileShowChat && "hidden md:flex"
      )}>
        <div className="p-3 border-b border-border/50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută conversații..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
          {!isDemo && user && (
            <Button
              size="icon"
              variant="outline"
              className="shrink-0 h-10 w-10"
              onClick={() => setShowContactPicker(true)}
              title="Conversație nouă"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

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
                <div className={cn(
                  "h-11 w-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm",
                  (convo as any).is_group ? 'bg-primary/80' : getAvatarColor(convo.contact_nume)
                )}>
                  {(convo as any).is_group
                    ? <Megaphone className="h-5 w-5" />
                    : getInitials(convo.contact_nume)
                  }
                </div>

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
                    <div className="flex items-center gap-1 shrink-0">
                      {(convo as any).is_group && (
                        <Badge variant="outline" className="text-[9px] px-1 py-0">Grup</Badge>
                      )}
                      {convo.necitite > 0 && (
                        <span className="h-5 min-w-[20px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1.5">
                          {convo.necitite}
                        </span>
                      )}
                    </div>
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
                isGroupConvo ? 'bg-primary/80' : getAvatarColor(selectedConvo.contact_nume)
              )}>
                {isGroupConvo
                  ? <Megaphone className="h-4 w-4" />
                  : getInitials(selectedConvo.contact_nume)
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{selectedConvo.contact_nume}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isGroupConvo
                    ? 'Canal de grup · doar citire pentru părinți'
                    : selectedConvo.grupa.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                  }
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-1 min-h-full flex flex-col justify-end">
                {groupedMessages.map(group => (
                  <div key={group.date}>
                    <div className="flex items-center justify-center my-4">
                      <span className="text-[11px] text-muted-foreground bg-muted/80 px-3 py-1 rounded-full font-medium">
                        {formatDateLabel(group.messages[0].data)}
                      </span>
                    </div>

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

                          <div className="max-w-[75%] sm:max-w-[65%] group relative">
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

            {/* Input bar — hidden for parents in group convos */}
            {canSendInConvo ? (
              <div className="p-3 border-t border-border/50 bg-card/60 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      placeholder={isGroupConvo ? "Anunț pentru grupă..." : "Scrie un mesaj..."}
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
            ) : (
              <div className="p-3 border-t border-border/50 bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">Canal de anunțuri — doar citire</p>
              </div>
            )}
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
  );

  const pollsUI = (
    <div className="h-[calc(100dvh-10rem)] rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
      <PollList
        polls={polls}
        userId={user?.id || ''}
        isAdmin={isAdmin}
        isDemo={isDemo}
        orgId={user?.organization_id}
        onPollCreated={loadPolls}
        onVoted={loadPolls}
      />
    </div>
  );

  const guestInboxUI = isDirector && user?.organization_id ? (
    <div className="h-[calc(100dvh-10rem)] rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card/80 backdrop-blur-sm">
      <GuestInbox orgId={user.organization_id} />
    </div>
  ) : null;

  // Determine which tabs to show
  const hasVizitatori = isDirector;
  const tabCount = (mesajeEnabled ? 1 : 0) + (sondajeEnabled ? 1 : 0) + (hasVizitatori ? 1 : 0);

  // If only one feature enabled and not director, show directly without tabs
  if (tabCount <= 1 && !hasVizitatori) {
    return (
      <div className="space-y-4 min-w-0">
        {!embedded && (
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-display font-bold">
              {mesajeEnabled ? 'Mesaje' : 'Sondaje'}
            </h1>
            {mesajeEnabled && totalUnread > 0 && (
              <Badge variant="destructive" className="text-xs">{totalUnread} necitite</Badge>
            )}
            {sondajeEnabled && unvotedPolls > 0 && (
              <Badge variant="secondary" className="text-xs">{unvotedPolls} noi</Badge>
            )}
          </div>
        )}
        {mesajeEnabled ? chatUI : pollsUI}
        {showContactPicker && user && (
          <ContactPicker
            open={showContactPicker}
            onClose={() => setShowContactPicker(false)}
            user={user}
            onSelectContact={handleSelectContact}
            onCreateGroupBroadcast={isTeacher ? handleCreateGroupBroadcast : undefined}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 min-w-0">
      {!embedded && (
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-display font-bold">Mesaje & Sondaje</h1>
          {totalUnread > 0 && (
            <Badge variant="destructive" className="text-xs">{totalUnread} necitite</Badge>
          )}
          {unvotedPolls > 0 && (
            <Badge variant="secondary" className="text-xs">{unvotedPolls} sondaje noi</Badge>
          )}
        </div>
      )}

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={cn("w-full", tabCount > 2 ? "max-w-md" : "max-w-xs")}>
          {mesajeEnabled && (
            <TabsTrigger value="mesaje" className="flex-1 gap-1.5 text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4 hidden sm:block" />
              Mesaje
              {totalUnread > 0 && (
                <span className="h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {totalUnread}
                </span>
              )}
            </TabsTrigger>
          )}
          {sondajeEnabled && (
            <TabsTrigger value="sondaje" className="flex-1 gap-1.5 text-xs sm:text-sm">
              <BarChart3 className="h-4 w-4 hidden sm:block" />
              Sondaje
              {unvotedPolls > 0 && (
                <span className="h-5 min-w-[20px] rounded-full bg-secondary-foreground/20 text-secondary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                  {unvotedPolls}
                </span>
              )}
            </TabsTrigger>
          )}
          {hasVizitatori && (
            <TabsTrigger value="vizitatori" className="flex-1 gap-1.5 text-xs sm:text-sm">
              <Inbox className="h-4 w-4 hidden sm:block" />
              Vizitatori
            </TabsTrigger>
          )}
        </TabsList>

        {mesajeEnabled && (
          <TabsContent value="mesaje" className="mt-3">
            {chatUI}
          </TabsContent>
        )}

        {sondajeEnabled && (
          <TabsContent value="sondaje" className="mt-3">
            {pollsUI}
          </TabsContent>
        )}

        {hasVizitatori && (
          <TabsContent value="vizitatori" className="mt-3">
            {guestInboxUI}
          </TabsContent>
        )}
      </Tabs>

      {showContactPicker && user && (
        <ContactPicker
          open={showContactPicker}
          onClose={() => setShowContactPicker(false)}
          user={user}
          onSelectContact={handleSelectContact}
          onCreateGroupBroadcast={isTeacher ? handleCreateGroupBroadcast : undefined}
        />
      )}
    </div>
  );
}
