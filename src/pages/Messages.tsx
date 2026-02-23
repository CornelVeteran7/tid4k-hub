import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, getMessages, sendMessage } from '@/api/messages';
import type { Conversation, Message } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) getConversations(user.id_utilizator).then(setConversations);
  }, [user]);

  useEffect(() => {
    if (selectedConvo && user) {
      getMessages(selectedConvo.grupa, user.id_utilizator).then(setMessages);
    }
  }, [selectedConvo, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConvo || !user) return;
    const msg = await sendMessage(selectedConvo.grupa, selectedConvo.contact_id, newMessage);
    setMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  const openConvo = (convo: Conversation) => {
    setSelectedConvo(convo);
    setMobileShowChat(true);
  };

  return (
    <div className="space-y-4 min-w-0">
      <h1 className="text-xl sm:text-2xl font-display font-bold">Mesaje</h1>

      <div className="flex gap-4 h-[calc(100vh-200px)] min-w-0">
        {/* Conversations List */}
        <Card className={cn("w-full md:w-72 lg:w-80 shrink-0 flex flex-col min-w-0", mobileShowChat && "hidden md:flex")}>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => openConvo(convo)}
                className={cn(
                  "w-full text-left p-3 sm:p-4 border-b hover:bg-muted/50 transition-colors",
                  selectedConvo?.id === convo.id && "bg-muted"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{convo.contact_nume}</span>
                  {convo.necitite > 0 && (
                    <Badge variant="destructive" className="text-xs h-5 min-w-[20px] shrink-0">{convo.necitite}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 truncate">{convo.ultimul_mesaj}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {format(new Date(convo.data_ultimul_mesaj), 'd MMM, HH:mm', { locale: ro })}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className={cn("flex-1 flex flex-col min-w-0", !mobileShowChat && "hidden md:flex")}>
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-4 border-b flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setMobileShowChat(false)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                  {selectedConvo.contact_nume.split(' ').map((n) => n[0]).join('')}
                </div>
                <span className="font-medium truncate">{selectedConvo.contact_nume}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = msg.expeditor === user?.id_utilizator;
                  return (
                    <div key={msg.id_mesaj} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                        isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                      )}>
                        <p className="break-words">{msg.mesaj}</p>
                        <p className={cn("text-[10px] mt-1", isMine ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {format(new Date(msg.data), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 sm:p-4 border-t flex gap-2">
                <Input
                  placeholder="Scrie un mesaj..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 min-w-0"
                />
                <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Selectează o conversație</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
