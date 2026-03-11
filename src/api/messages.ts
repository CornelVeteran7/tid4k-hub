import { supabase } from '@/integrations/supabase/client';
import type { Conversation, Message } from '@/types';

export async function getConversations(userId: string): Promise<Conversation[]> {
  // Get 1-to-1 conversations
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      id, grupa, updated_at, is_group, group_id, group_name,
      participant_1, participant_2,
      p1:profiles!conversations_participant_1_fkey(id, nume_prenume),
      p2:profiles!conversations_participant_2_fkey(id, nume_prenume),
      messages(mesaj, citit, created_at, sender_id)
    `)
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  const convos: Conversation[] = (data || []).map(c => {
    const isP1 = c.participant_1 === userId;
    const contact = isP1 ? c.p2 : c.p1;
    const msgs = (c.messages as any[]) || [];
    const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
    const unread = msgs.filter((m: any) => !m.citit && m.sender_id !== userId).length;

    const convo: any = {
      id: c.id,
      contact_nume: c.is_group ? (c.group_name || 'Grup') : ((contact as any)?.nume_prenume || 'Necunoscut'),
      contact_id: isP1 ? c.participant_2 : c.participant_1,
      ultimul_mesaj: lastMsg?.mesaj || '',
      data_ultimul_mesaj: lastMsg?.created_at || c.updated_at || '',
      necitite: unread,
      grupa: c.grupa || '',
      is_group: c.is_group || false,
      group_id: c.group_id,
    };
    return convo;
  });

  // Also get group conversations where user is a member (via conversation_members)
  const { data: memberConvos } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('user_id', userId);

  if (memberConvos && memberConvos.length > 0) {
    const memberConvoIds = memberConvos.map(m => m.conversation_id);
    const existingIds = new Set(convos.map(c => c.id));
    const missingIds = memberConvoIds.filter(id => !existingIds.has(id));

    if (missingIds.length > 0) {
      const { data: groupData } = await supabase
        .from('conversations')
        .select(`
          id, grupa, updated_at, is_group, group_id, group_name,
          participant_1, participant_2,
          p1:profiles!conversations_participant_1_fkey(id, nume_prenume),
          messages(mesaj, citit, created_at, sender_id)
        `)
        .in('id', missingIds)
        .order('updated_at', { ascending: false });

      if (groupData) {
        for (const c of groupData) {
          const msgs = (c.messages as any[]) || [];
          const lastMsg = msgs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
          const unread = msgs.filter((m: any) => !m.citit && m.sender_id !== userId).length;

          convos.push({
            id: c.id,
            contact_nume: c.group_name || 'Grup',
            contact_id: c.participant_1,
            ultimul_mesaj: lastMsg?.mesaj || '',
            data_ultimul_mesaj: lastMsg?.created_at || c.updated_at || '',
            necitite: unread,
            grupa: c.grupa || '',
            is_group: true,
            group_id: c.group_id,
          } as any);
        }
      }
    }
  }

  // Sort by last message date
  convos.sort((a, b) => new Date(b.data_ultimul_mesaj).getTime() - new Date(a.data_ultimul_mesaj).getTime());

  return convos;
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

export async function sendMessage(grupa: string, destinatar: string, mesaj: string, existingConvoId?: string): Promise<Message> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let conversationId: string;

  if (existingConvoId && !existingConvoId.startsWith('new-')) {
    // Use existing conversation
    conversationId = existingConvoId;
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
  } else {
    // Find or create conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_1.eq.${user.id},participant_2.eq.${destinatar}),and(participant_1.eq.${destinatar},participant_2.eq.${user.id})`)
      .eq('is_group', false)
      .single();

    if (existing) {
      conversationId = existing.id;
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversationId);
    } else {
      const { data: newConvo, error } = await supabase
        .from('conversations')
        .insert({ participant_1: user.id, participant_2: destinatar, grupa, is_group: false })
        .select()
        .single();
      if (error) throw error;
      conversationId = newConvo.id;
    }
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

export async function getOrCreateGroupConversation(teacherId: string, groupId: string, groupName: string): Promise<string> {
  // Check if a group conversation already exists for this group
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('is_group', true)
    .eq('group_id', groupId)
    .single();

  if (existing) return existing.id;

  // Create group conversation
  const { data: newConvo, error } = await supabase
    .from('conversations')
    .insert({
      participant_1: teacherId,
      participant_2: teacherId, // self-reference for group
      grupa: '',
      is_group: true,
      group_id: groupId,
      group_name: `📢 ${groupName}`,
    })
    .select()
    .single();

  if (error) throw error;

  // Add all parents from this group as members
  const { data: children } = await supabase
    .from('children')
    .select('parinte_id')
    .eq('group_id', groupId);

  const parentIds = [...new Set((children || []).map(c => c.parinte_id).filter(Boolean))];

  if (parentIds.length > 0) {
    const members = parentIds.map(pid => ({
      conversation_id: newConvo.id,
      user_id: pid!,
    }));

    // Also add the teacher
    members.push({ conversation_id: newConvo.id, user_id: teacherId });

    await supabase.from('conversation_members').insert(members);
  }

  return newConvo.id;
}
