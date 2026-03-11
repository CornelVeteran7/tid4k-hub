import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, MailOpen, ExternalLink, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import { ro } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GuestMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  mesaj: string;
  read: boolean;
  replied: boolean;
  created_at: string;
}

interface GuestInboxProps {
  orgId: string;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Ieri ' + format(d, 'HH:mm');
  return format(d, 'd MMM HH:mm', { locale: ro });
}

export default function GuestInbox({ orgId }: GuestInboxProps) {
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState<GuestMessage | null>(null);

  useEffect(() => {
    loadMessages();
  }, [orgId]);

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_messages' as any)
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages((data as any[]) || []);
    } catch (err) {
      console.error('Failed to load guest messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (msg: GuestMessage) => {
    if (msg.read) return;
    try {
      await supabase
        .from('guest_messages' as any)
        .update({ read: true })
        .eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: true } : m));
    } catch {}
  };

  const handleSelect = (msg: GuestMessage) => {
    setSelectedMsg(msg);
    markAsRead(msg);
  };

  const handleReply = (email: string, name: string) => {
    window.open(`mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Răspuns pentru ${name}`)}`);
    // Mark as replied
    supabase
      .from('guest_messages' as any)
      .update({ replied: true })
      .eq('id', selectedMsg?.id)
      .then(() => {
        setMessages(prev => prev.map(m => m.id === selectedMsg?.id ? { ...m, replied: true } : m));
      });
  };

  const unreadCount = messages.filter(m => !m.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Se încarcă...
      </div>
    );
  }

  if (selectedMsg) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-card/60">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMsg(null)} className="shrink-0">
            ← Înapoi
          </Button>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{selectedMsg.sender_name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{selectedMsg.sender_email}</p>
          </div>
          {selectedMsg.replied && (
            <Badge variant="outline" className="text-[10px] shrink-0">Răspuns trimis</Badge>
          )}
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <div className="text-xs text-muted-foreground">
              {format(new Date(selectedMsg.created_at), "d MMMM yyyy, HH:mm", { locale: ro })}
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMsg.mesaj}</p>
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border/50">
          <Button
            className="w-full gap-2"
            onClick={() => handleReply(selectedMsg.sender_email, selectedMsg.sender_name)}
          >
            <ExternalLink className="h-4 w-4" />
            Răspunde pe email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between bg-card/60">
        <div className="flex items-center gap-2">
          <Inbox className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Mesaje vizitatori</span>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive" className="text-[10px]">{unreadCount} necitite</Badge>
        )}
      </div>

      <ScrollArea className="flex-1">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Niciun mesaj</p>
            <p className="text-sm mt-1">Nu ai primit mesaje de la vizitatori.</p>
          </div>
        ) : (
          messages.map(msg => (
            <button
              key={msg.id}
              onClick={() => handleSelect(msg)}
              className={cn(
                "w-full text-left px-4 py-3 flex items-start gap-3 transition-all hover:bg-muted/60 border-b border-border/20",
                !msg.read && "bg-primary/5"
              )}
            >
              <div className="shrink-0 mt-0.5">
                {msg.read ? (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Mail className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn("text-sm truncate", !msg.read && "font-bold")}>
                    {msg.sender_name}
                  </span>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{msg.sender_email}</p>
                <p className={cn("text-xs truncate mt-0.5", !msg.read ? "text-foreground" : "text-muted-foreground")}>
                  {msg.mesaj}
                </p>
              </div>
              {msg.replied && (
                <Badge variant="outline" className="text-[9px] shrink-0 mt-1">Răspuns</Badge>
              )}
            </button>
          ))
        )}
      </ScrollArea>
    </div>
  );
}
