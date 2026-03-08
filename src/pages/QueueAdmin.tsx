import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, PhoneForwarded, CheckCircle2, SkipForward, RotateCcw,
  Plus, Trash2, Clock, BarChart3, Settings2, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInMinutes } from 'date-fns';
import { ro } from 'date-fns/locale';

interface QueueEntry {
  id: string;
  numar_tichet: number;
  status: string;
  cabinet: string | null;
  note: string | null;
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
}

const DEFAULT_CABINETS = ['Cabinet 1', 'Cabinet 2', 'Cabinet 3'];

export default function QueueAdmin() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [cabinets, setCabinets] = useState<string[]>(DEFAULT_CABINETS);
  const [selectedCabinet, setSelectedCabinet] = useState(DEFAULT_CABINETS[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [newCabinet, setNewCabinet] = useState('');
  const orgId = user?.organization_id || '';

  const todayStart = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00';

  const loadEntries = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('organization_id', orgId)
      .gte('created_at', todayStart)
      .order('numar_tichet');
    setEntries((data || []) as QueueEntry[]);
  }, [orgId, todayStart]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  // Realtime subscription
  useEffect(() => {
    if (!orgId) return;
    const channel = supabase
      .channel('queue-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries',
        filter: `organization_id=eq.${orgId}` }, () => loadEntries())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orgId, loadEntries]);

  const waiting = entries.filter(e => e.status === 'waiting');
  const serving = entries.filter(e => e.status === 'called' || e.status === 'serving');
  const completed = entries.filter(e => e.status === 'completed');
  const skipped = entries.filter(e => e.status === 'skipped');

  const callNext = async (cabinet: string) => {
    const next = waiting[0];
    if (!next) { toast.info('Nu sunt tichete în așteptare'); return; }
    await supabase.from('queue_entries').update({
      status: 'called', cabinet, called_at: new Date().toISOString()
    }).eq('id', next.id);
    toast.success(`Tichet #${next.numar_tichet} → ${cabinet}`);
  };

  const markDone = async (id: string) => {
    await supabase.from('queue_entries').update({
      status: 'completed', completed_at: new Date().toISOString()
    }).eq('id', id);
  };

  const skipTicket = async (id: string) => {
    await supabase.from('queue_entries').update({ status: 'skipped' }).eq('id', id);
    toast.info('Tichet omis');
  };

  const recallTicket = async (id: string) => {
    // Put back as waiting with original ticket number
    await supabase.from('queue_entries').update({
      status: 'waiting', cabinet: null, called_at: null
    }).eq('id', id);
    toast.success('Tichet rechemat');
  };

  const addCabinet = () => {
    if (!newCabinet.trim()) return;
    setCabinets(prev => [...prev, newCabinet.trim()]);
    setNewCabinet('');
  };

  const removeCabinet = (c: string) => {
    setCabinets(prev => prev.filter(x => x !== c));
  };

  // Analytics
  const avgWaitMinutes = (() => {
    const withWait = completed.filter(e => e.called_at && e.created_at);
    if (withWait.length === 0) return 0;
    const total = withWait.reduce((sum, e) => {
      return sum + differenceInMinutes(new Date(e.called_at!), new Date(e.created_at));
    }, 0);
    return Math.round(total / withWait.length);
  })();

  const avgServiceMinutes = (() => {
    const withService = completed.filter(e => e.completed_at && e.called_at);
    if (withService.length === 0) return 0;
    const total = withService.reduce((sum, e) => {
      return sum + differenceInMinutes(new Date(e.completed_at!), new Date(e.called_at!));
    }, 0);
    return Math.round(total / withService.length);
  })();

  const throughputPerHour = (() => {
    if (completed.length === 0) return 0;
    const first = new Date(entries[0]?.created_at || new Date());
    const hoursElapsed = Math.max(1, differenceInMinutes(new Date(), first) / 60);
    return (completed.length / hoursElapsed).toFixed(1);
  })();

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Gestionare Coadă
          </h1>
          <p className="text-sm text-muted-foreground">
            {waiting.length} în așteptare · {serving.length} în deservire · {completed.length} finalizate
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings2 className="h-4 w-4" /> Cabinete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Configurare cabinete</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {cabinets.map(c => (
                  <div key={c} className="flex items-center justify-between p-2 rounded bg-muted">
                    <span className="text-sm font-medium">{c}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeCabinet(c)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={newCabinet} onChange={e => setNewCabinet(e.target.value)}
                    placeholder="Nume cabinet nou" />
                  <Button onClick={addCabinet} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="queue">
        <TabsList>
          <TabsTrigger value="queue">Coadă</TabsTrigger>
          <TabsTrigger value="analytics">Analiză</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4 mt-4">
          {/* Call next controls */}
          <Card>
            <CardContent className="p-4">
              <Label className="text-xs text-muted-foreground mb-2 block">Cheamă următorul la:</Label>
              <div className="flex flex-wrap gap-2">
                {cabinets.map(c => {
                  const currentlyServing = serving.find(e => e.cabinet === c);
                  return (
                    <div key={c} className="flex flex-col gap-1">
                      <Button
                        onClick={() => callNext(c)}
                        disabled={waiting.length === 0}
                        className="gap-1.5"
                        variant={currentlyServing ? 'secondary' : 'default'}
                      >
                        <PhoneForwarded className="h-4 w-4" /> {c}
                      </Button>
                      {currentlyServing && (
                        <span className="text-xs text-center text-muted-foreground">
                          Acum: #{currentlyServing.numar_tichet}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Currently serving */}
          {serving.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <PhoneForwarded className="h-4 w-4" /> În deservire ({serving.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {serving.map(e => (
                  <Card key={e.id} className="border-primary/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">#{e.numar_tichet}</div>
                        <Badge variant="secondary" className="text-xs mt-1">{e.cabinet}</Badge>
                        {e.called_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Chemat: {format(new Date(e.called_at), 'HH:mm')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button size="sm" onClick={() => markDone(e.id)} className="gap-1">
                          <CheckCircle2 className="h-4 w-4" /> Gata
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => skipTicket(e.id)} className="gap-1">
                          <SkipForward className="h-4 w-4" /> Omite
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Waiting list */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> În așteptare ({waiting.length})
            </h3>
            {waiting.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Niciun pacient în așteptare</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {waiting.map(e => (
                  <Card key={e.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">#{e.numar_tichet}</span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(e.created_at), 'HH:mm')}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => skipTicket(e.id)}>
                        <SkipForward className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Skipped */}
          {skipped.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Omise ({skipped.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {skipped.map(e => (
                  <Card key={e.id} className="opacity-60">
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-lg font-bold">#{e.numar_tichet}</span>
                      <Button size="sm" variant="outline" onClick={() => recallTicket(e.id)} className="gap-1">
                        <RotateCcw className="h-3.5 w-3.5" /> Rechemă
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Finalizate ({completed.length})
              </h3>
              <div className="grid gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {completed.map(e => (
                  <div key={e.id} className="rounded-lg bg-muted/50 p-2 text-center">
                    <span className="text-sm font-medium text-muted-foreground">#{e.numar_tichet}</span>
                    {e.cabinet && <p className="text-[10px] text-muted-foreground">{e.cabinet}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{entries.length}</div>
                <p className="text-sm text-muted-foreground">Total tichete azi</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-foreground">{completed.length}</div>
                <p className="text-sm text-muted-foreground">Finalizate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{avgWaitMinutes} min</div>
                <p className="text-sm text-muted-foreground">Timp mediu așteptare</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{throughputPerHour}/h</div>
                <p className="text-sm text-muted-foreground">Tichete/oră</p>
              </CardContent>
            </Card>
          </div>

          {/* Per-cabinet breakdown */}
          <h3 className="text-sm font-semibold text-muted-foreground mt-6 mb-3">Per cabinet</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {cabinets.map(c => {
              const cabinetCompleted = completed.filter(e => e.cabinet === c);
              const cabinetServing = serving.find(e => e.cabinet === c);
              return (
                <Card key={c}>
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-sm">{c}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={cabinetServing ? 'default' : 'secondary'}>
                        {cabinetServing ? `Acum: #${cabinetServing.numar_tichet}` : 'Liber'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {cabinetCompleted.length} pacienți deserviți
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* GDPR notice */}
          <Card className="mt-6 border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                🔒
              </div>
              <div>
                <h4 className="text-sm font-semibold">Conformitate GDPR</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistemul de coadă NU stochează nume, date medicale sau informații personale.
                  Se folosesc exclusiv numere de tichet și identificatoare de cabinet.
                  Datele se resetează zilnic.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
