import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface QueueEntry {
  id: string;
  numar_tichet: number;
  status: string;
  cabinet: string | null;
  called_at: string | null;
}

interface QueueDisplayProps {
  organizationId: string;
  primaryColor: string;
}

export function QueueDisplay({ organizationId, primaryColor }: QueueDisplayProps) {
  const [serving, setServing] = useState<QueueEntry[]>([]);
  const [waiting, setWaiting] = useState<QueueEntry[]>([]);

  const loadQueue = async () => {
    const today = new Date().toISOString().split('T')[0];

    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('created_at', today + 'T00:00:00')
      .in('status', ['waiting', 'called', 'serving'])
      .order('numar_tichet');

    const entries = (data || []) as QueueEntry[];
    setServing(entries.filter(e => e.status === 'called' || e.status === 'serving'));
    setWaiting(entries.filter(e => e.status === 'waiting'));
  };

  useEffect(() => {
    loadQueue();
    // Realtime subscription
    const channel = supabase
      .channel('queue-display')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `organization_id=eq.${organizationId}`,
      }, () => loadQueue())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [organizationId]);

  return (
    <div className="absolute inset-0 flex flex-col px-[4vw] py-[10vh]">
      {/* Currently serving — BIG numbers */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {serving.length > 0 ? (
          <div className="space-y-[3vh]">
            {serving.map(entry => (
              <div key={entry.id} className="text-center">
                <div className="text-[3vh] uppercase tracking-wider opacity-60 mb-[1vh]">
                  Acum servim
                </div>
                <div
                  className="text-[20vh] font-bold leading-none tabular-nums"
                  style={{ color: primaryColor }}
                >
                  #{entry.numar_tichet}
                </div>
                {entry.cabinet && (
                  <div className="text-[4vh] mt-[1vh] font-semibold opacity-80">
                    {entry.cabinet}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center opacity-40">
            <div className="text-[8vh] mb-[2vh]">🏥</div>
            <div className="text-[3vh]">Niciun pacient în așteptare</div>
          </div>
        )}
      </div>

      {/* Waiting queue — bottom strip, NO names */}
      {waiting.length > 0 && (
        <div className="bg-white/10 rounded-2xl p-[2vh] mt-auto">
          <div className="text-[1.8vh] uppercase tracking-wider opacity-50 mb-[1vh]">
            Următorii ({waiting.length})
          </div>
          <div className="flex gap-[1.5vw] flex-wrap">
            {waiting.slice(0, 12).map(entry => (
              <div
                key={entry.id}
                className="bg-white/10 rounded-xl px-[1.5vw] py-[1vh] text-[3vh] font-bold tabular-nums"
              >
                #{entry.numar_tichet}
              </div>
            ))}
            {waiting.length > 12 && (
              <div className="rounded-xl px-[1.5vw] py-[1vh] text-[3vh] opacity-50">
                +{waiting.length - 12}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
