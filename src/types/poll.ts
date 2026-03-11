export interface Poll {
  id: string;
  title: string;
  description?: string;
  poll_type: 'single' | 'multiple' | 'free_text';
  results_visibility: 'always' | 'after_vote' | 'after_close';
  deadline: string;
  created_by: string;
  creator_name?: string;
  is_closed: boolean;
  created_at: string;
  organization_id: string;
  options: PollOption[];
  total_votes: number;
  user_voted: boolean;
}

export interface PollOption {
  id: string;
  label: string;
  position: number;
  vote_count: number;
}

export interface PollVote {
  id: string;
  poll_id: string;
  option_id?: string;
  free_text?: string;
  user_id: string;
}
