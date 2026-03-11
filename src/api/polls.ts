import { supabase } from '@/integrations/supabase/client';

export interface PollCreateData {
  organization_id: string;
  title: string;
  description?: string;
  poll_type: 'single' | 'multiple' | 'free_text';
  results_visibility: 'always' | 'after_vote' | 'after_close';
  deadline: string;
  created_by: string;
  options: string[];
}

export async function getPolls(orgId: string) {
  const { data, error } = await supabase
    .from('polls')
    .select('*, poll_options(*), poll_votes(id, option_id, user_id, free_text), creator_profile:profiles!polls_created_by_fkey(nume_prenume)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getPollById(pollId: string) {
  const { data, error } = await supabase
    .from('polls')
    .select('*, poll_options(*), poll_votes(id, option_id, user_id, free_text), creator_profile:profiles!polls_created_by_fkey(nume_prenume)')
    .eq('id', pollId)
    .single();

  if (error) throw error;
  return data;
}

export async function createPoll(data: PollCreateData) {
  // Insert poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      organization_id: data.organization_id,
      title: data.title,
      description: data.description || null,
      poll_type: data.poll_type,
      results_visibility: data.results_visibility,
      deadline: data.deadline,
      created_by: data.created_by,
    })
    .select()
    .single();

  if (pollError) throw pollError;

  // Insert options
  if (data.options.length > 0) {
    const optionsData = data.options.map((label, idx) => ({
      poll_id: poll.id,
      label,
      position: idx,
    }));

    const { error: optError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optError) throw optError;
  }

  return poll;
}

export async function votePoll(pollId: string, userId: string, optionIds: string[], freeText?: string) {
  // Check if user already voted
  const { data: existingVotes } = await supabase
    .from('poll_votes')
    .select('id')
    .eq('poll_id', pollId)
    .eq('user_id', userId)
    .limit(1);

  if (existingVotes && existingVotes.length > 0) {
    throw new Error('Ai votat deja la acest sondaj');
  }

  const votes = optionIds.map(optId => ({
    poll_id: pollId,
    option_id: optId,
    user_id: userId,
    free_text: freeText || null,
  }));

  // For free_text type with no options selected
  if (votes.length === 0 && freeText) {
    votes.push({
      poll_id: pollId,
      option_id: null as any,
      user_id: userId,
      free_text: freeText,
    });
  }

  const { error } = await supabase
    .from('poll_votes')
    .insert(votes);

  if (error) {
    if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
      throw new Error('Ai votat deja la acest sondaj');
    }
    throw error;
  }
}

export async function closePoll(pollId: string) {
  const { error } = await supabase
    .from('polls')
    .update({ is_closed: true })
    .eq('id', pollId);

  if (error) throw error;
}
