import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message } from '@/types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, grupa, updated_at,
      participant_1, participant_2,
      p1:profiles!conversations_participant_1_fkey(id, nume_prenume),
      p2:profiles!conversations_participant_2_fkey(id, nume_prenume),
      messages(mesaj, citit, created_at, sender_id)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(c => {
    const isP1 = c.participant_1 === userId;
    const contact = isP1 ? c.p2 : c.p1;
    const msgs = (c.messages as any[]) || [];
    const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const unread = msgs.filter((m: any) => !m.citit && m.sender_id !== userId).length;

    return {
      id: c.id,
      contact_nume: (contact as any)?.nume_prenume || 'Necunoscut',
      contact_id: isP1 ? c.participant_2 : c.participant_1,
      ultimul_mesaj: lastMsg?.mesaj || '',
      data_ultimul_mesaj: lastMsg?.created_at || c.updated_at || '',
      necitite: unread,
      grupa: c.grupa || '',
    };
  });
}

export async function getMessages(grupa: string, userId: string, conversationId?: string): Promise<Message[]> {
  if (!conversationId) return [];

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(nume_prenume)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Get conversation to find the other participant
  const { data: convo } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversationId)
    .single();

  return (data || []).map(m => ({
    id: m.id,
    expeditor: m.sender_id,
    expeditor_nume: (m.profiles as any)?.nume_prenume || '',
    destinatar: convo ? (m.sender_id === convo.participant_1 ? convo.participant_2 : convo.participant_1) : '',
    mesaj: m.mesaj,
    data: m.created_at,
    citit: m.citit,
  }));
}

export async function sendMessage(grupa: string, destinatar: string, mesaj: string): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find or create conversation
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .or(`and(participant_1.eq.${user.id},participant_2.eq.${destinatar}),and(participant_1.eq.${destinatar},participant_2.eq.${user.id})`)
    .single();

  let conversationId: string;
  if (existing) {
    conversationId = existing.id;
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
  } else {
    const { data: newConvo, error } = await supabase
      .from('conversations')
      .insert({ participant_1: user.id, participant_2: destinatar, grupa })
      .select()
      .single();
    if (error) throw error;
    conversationId = newConvo.id;
  }

  const { data: msg, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.id, mesaj })
    .select()
    .single();

  if (error) throw error;

  const { data: profile } = await supabase.from('profiles').select('nume_prenume').eq('id', user.id).single();

  return {
    id: msg.id,
    expeditor: user.id,
    expeditor_nume: profile?.nume_prenume || '',
    destinatar,
    mesaj: msg.mesaj,
    data: msg.created_at,
    citit: false,
  };
}
