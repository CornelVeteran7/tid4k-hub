import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Clock, Users, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPast, formatDistanceToNow, format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';
import { votePoll, closePoll } from '@/api/polls';
import type { Poll, PollOption } from '@/types/poll';
import { motion } from 'framer-motion';

interface PollDetailProps {
  poll: Poll;
  userId: string;
  isDemo: boolean;
  isAdmin: boolean;
  onBack: () => void;
  onVoted: () => void;
}

export default function PollDetail({ poll, userId, isDemo, isAdmin, onBack, onVoted }: PollDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [freeText, setFreeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(poll.user_voted);
  const [localPoll, setLocalPoll] = useState(poll);

  const isActive = !localPoll.is_closed && !isPast(new Date(localPoll.deadline));
  const canVote = isActive && !hasVoted;

  const canSeeResults = (() => {
    switch (localPoll.results_visibility) {
      case 'always': return true;
      case 'after_vote': return hasVoted;
      case 'after_close': return localPoll.is_closed || isPast(new Date(localPoll.deadline));
      default: return false;
    }
  })();

  const toggleOption = (optId: string) => {
    if (!canVote) return;
    if (localPoll.poll_type === 'single') {
      setSelectedOptions([optId]);
    } else {
      setSelectedOptions(prev =>
        prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
      );
    }
  };

  const handleVote = async () => {
    if (localPoll.poll_type !== 'free_text' && selectedOptions.length === 0) {
      toast.error('Selectează cel puțin o opțiune');
      return;
    }
    if (localPoll.poll_type === 'free_text' && !freeText.trim() && selectedOptions.length === 0) {
      toast.error('Scrie un răspuns');
      return;
    }

    setSubmitting(true);
    try {
      if (!isDemo) {
        await votePoll(localPoll.id, userId, selectedOptions, freeText || undefined);
      }
      setHasVoted(true);
      // Update local vote counts
      setLocalPoll(prev => ({
        ...prev,
        total_votes: prev.total_votes + 1,
        user_voted: true,
        options: prev.options.map(opt => ({
          ...opt,
          vote_count: selectedOptions.includes(opt.id) ? opt.vote_count + 1 : opt.vote_count,
        })),
      }));
      toast.success('Vot înregistrat!');
      onVoted();
    } catch (err: any) {
      toast.error(err.message || 'Eroare la votare');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    try {
      if (!isDemo) {
        await closePoll(localPoll.id);
      }
      setLocalPoll(prev => ({ ...prev, is_closed: true }));
      toast.success('Sondaj închis');
    } catch (err: any) {
      toast.error(err.message || 'Eroare');
    }
  };

  const maxVotes = Math.max(...localPoll.options.map(o => o.vote_count), 1);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3 bg-card/60 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{localPoll.title}</p>
          <p className="text-[11px] text-muted-foreground">
            de {localPoll.creator_name || 'Administrator'}
          </p>
        </div>
        {isAdmin && isActive && (
          <Button variant="outline" size="sm" onClick={handleClose} className="shrink-0 text-xs gap-1">
            <XCircle className="h-3.5 w-3.5" />
            Închide
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Description */}
          {localPoll.description && (
            <p className="text-sm text-muted-foreground">{localPoll.description}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {localPoll.total_votes} voturi
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {isPast(new Date(localPoll.deadline))
                ? `Expirat ${format(new Date(localPoll.deadline), 'd MMM yyyy', { locale: ro })}`
                : `Expiră în ${formatDistanceToNow(new Date(localPoll.deadline), { locale: ro })}`
              }
            </span>
            {hasVoted && (
              <Badge variant="outline" className="text-[10px] gap-1 text-primary border-primary/30">
                <CheckCircle2 className="h-3 w-3" />
                Ai votat
              </Badge>
            )}
            {!isActive && (
              <Badge variant="secondary" className="text-[10px]">
                {localPoll.is_closed ? 'Închis' : 'Expirat'}
              </Badge>
            )}
          </div>

          {/* Options */}
          {localPoll.options.length > 0 && (
            <div className="space-y-2">
              {localPoll.options
                .sort((a, b) => a.position - b.position)
                .map(opt => {
                  const isSelected = selectedOptions.includes(opt.id);
                  const pct = canSeeResults && localPoll.total_votes > 0
                    ? Math.round((opt.vote_count / localPoll.total_votes) * 100)
                    : 0;

                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(opt.id)}
                      disabled={!canVote}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all relative overflow-hidden",
                        canVote
                          ? isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                            : "border-border/50 hover:border-primary/30"
                          : "border-border/30 cursor-default"
                      )}
                    >
                      {/* Result bar */}
                      {canSeeResults && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="absolute inset-y-0 left-0 bg-primary/10 rounded-lg"
                        />
                      )}

                      <div className="relative flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            localPoll.poll_type === 'multiple' ? 'rounded-sm' : '',
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                          </div>
                          <span className="text-sm font-medium">{opt.label}</span>
                        </div>
                        {canSeeResults && (
                          <span className="text-xs font-semibold text-muted-foreground shrink-0">{pct}%</span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          )}

          {/* Free text input */}
          {localPoll.poll_type === 'free_text' && canVote && (
            <div className="space-y-2">
              <Textarea
                placeholder="Scrie răspunsul tău..."
                value={freeText}
                onChange={e => setFreeText(e.target.value)}
                className="min-h-[80px]"
                maxLength={500}
              />
              <p className="text-[11px] text-muted-foreground text-right">{freeText.length}/500</p>
            </div>
          )}

          {/* Results visibility note */}
          {!canSeeResults && !canVote && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>
                {localPoll.results_visibility === 'after_vote'
                  ? 'Rezultatele sunt vizibile doar după ce votezi.'
                  : 'Rezultatele vor fi vizibile după închiderea sondajului.'
                }
              </span>
            </div>
          )}

          {/* Vote button */}
          {canVote && (
            <Button
              className="w-full"
              onClick={handleVote}
              disabled={submitting || (localPoll.poll_type !== 'free_text' && selectedOptions.length === 0)}
            >
              {submitting ? 'Se trimite...' : 'Votează'}
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
