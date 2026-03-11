import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Clock, Users, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, isPast } from 'date-fns';
import { ro } from 'date-fns/locale';
import type { Poll } from '@/types/poll';
import PollDetail from './PollDetail';
import PollCreator from './PollCreator';

interface PollListProps {
  polls: Poll[];
  userId: string;
  isAdmin: boolean;
  isDemo: boolean;
  orgId?: string;
  onPollCreated: () => void;
  onVoted: () => void;
}

function getPollStatus(poll: Poll): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (poll.is_closed) return { label: 'Închis', variant: 'secondary' };
  if (isPast(new Date(poll.deadline))) return { label: 'Expirat', variant: 'destructive' };
  return { label: 'Activ', variant: 'default' };
}

function getTypeLabel(type: string) {
  switch (type) {
    case 'single': return 'Alegere unică';
    case 'multiple': return 'Alegere multiplă';
    case 'free_text': return 'Text liber';
    default: return type;
  }
}

export default function PollList({ polls, userId, isAdmin, isDemo, orgId, onPollCreated, onVoted }: PollListProps) {
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [showCreator, setShowCreator] = useState(false);

  if (selectedPoll) {
    return (
      <PollDetail
        poll={selectedPoll}
        userId={userId}
        isDemo={isDemo}
        isAdmin={isAdmin}
        onBack={() => setSelectedPoll(null)}
        onVoted={onVoted}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {isAdmin && (
        <div className="p-3 border-b border-border/50 flex justify-end">
          <Button size="sm" onClick={() => setShowCreator(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Sondaj nou
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        {polls.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
            <p className="font-medium">Niciun sondaj</p>
            <p className="text-sm mt-1">
              {isAdmin ? 'Creează primul sondaj pentru organizația ta.' : 'Nu există sondaje active momentan.'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {polls.map(poll => {
              const status = getPollStatus(poll);
              const isActive = !poll.is_closed && !isPast(new Date(poll.deadline));

              return (
                <button
                  key={poll.id}
                  onClick={() => setSelectedPoll(poll)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all hover:shadow-sm",
                    isActive
                      ? "border-border/50 bg-card hover:border-primary/30"
                      : "border-border/30 bg-muted/30 opacity-80"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight flex-1">{poll.title}</h3>
                    <Badge variant={status.variant} className="shrink-0 text-[10px]">{status.label}</Badge>
                  </div>

                  {poll.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{poll.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {poll.total_votes} voturi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isPast(new Date(poll.deadline))
                        ? 'Expirat'
                        : `Mai ${formatDistanceToNow(new Date(poll.deadline), { locale: ro })}`
                      }
                    </span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getTypeLabel(poll.poll_type)}</Badge>
                    {poll.user_voted && (
                      <span className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="h-3 w-3" />
                        Votat
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {showCreator && (
        <PollCreator
          open={showCreator}
          onClose={() => setShowCreator(false)}
          userId={userId}
          orgId={orgId || ''}
          isDemo={isDemo}
          onCreated={() => {
            setShowCreator(false);
            onPollCreated();
          }}
        />
      )}
    </div>
  );
}
