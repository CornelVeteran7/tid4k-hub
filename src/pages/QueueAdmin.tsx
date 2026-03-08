import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users, PhoneForwarded, CheckCircle2, SkipForward, RotateCcw,
  Plus, Trash2, Clock, BarChart3, Settings2, AlertTriangle, Timer
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

interface QueueConfig {
  id: string;
  service_points: string[];
  daily_reset_time: string;
  prefix: string;
  avg_service_minutes: number;
}

export default function QueueAdmin() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [queueConfig, setQueueConfig] = useState<QueueConfig | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newCabinet, setNewCabinet] = useState('');
  const [avgMinutes, setAvgMinutes] = useState(10);
  const orgId = user?.organization_id || '';
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;
  const vDef = VERTICAL_DEFINITIONS[verticalType];

  // Vertical-aware labels
  const servicePointLabel = verticalType === 'medicine' ? 'Cabinet' : 'Ghișeu';
  const servicePointLabelPlural = verticalType === 'medicine' ? 'Cabinete' : 'Ghișee';
  const clientLabel = vDef?.memberLabel || 'Persoană';
  const clientLabelPlural = vDef?.memberLabelPlural || 'Persoane';

  const todayStart = format(new Date(), 'yyyy-MM-dd') + 'T00:00:00';

  const cabinets = queueConfig?.service_points || ['Cabinet 1', 'Cabinet 2', 'Cabinet 3'];

  const loadConfig = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from('queue_config')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    if (data) {
      setQueueConfig({
        id: data.id,
        service_points: Array.isArray(data.service_points) ? data.service_points as string[] : JSON.parse(data.service_points as string),
        daily_reset_time: data.daily_reset_time,
        prefix: data.prefix,
        avg_service_minutes: data.avg_service_minutes,
      });
      setAvgMinutes(data.avg_service_minutes);
    }
  }, [orgId]);

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

  useEffect(() => { loadConfig(); loadEntries(); }, [loadConfig, loadEntries]);

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
    await supabase.from('queue_entries').update({
      status: 'waiting', cabinet: null, called_at: null
    }).eq('id', id);
    toast.success('Tichet rechemat');
  };

  // Persist config to DB
  const saveConfig = async (servicePoints: string[], avgMins?: number) => {
    const payload = {
      organization_id: orgId,
      service_points: servicePoints,
      avg_service_minutes: avgMins ?? avgMinutes,
    };
    if (queueConfig) {
      await supabase.from('queue_config').update(payload).eq('id', queueConfig.id);
    } else {
      await supabase.from('queue_config').insert(payload);
    }
    await loadConfig();
  };

  const addCabinet = async () => {
    if (!newCabinet.trim()) return;
    const updated = [...cabinets, newCabinet.trim()];
    await saveConfig(updated);
    setNewCabinet('');
    toast.success(`${servicePointLabel} adăugat`);
  };

  const removeCabinet = async (c: string) => {
    const updated = cabinets.filter(x => x !== c);
    await saveConfig(updated);
    toast.success(`${servicePointLabel} șters`);
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
    if (completed.length === 0) return '0';
    const first = new Date(entries[0]?.created_at || new Date());
    const hoursElapsed = Math.max(1, differenceInMinutes(new Date(), first) / 60);
    return (completed.length / hoursElapsed).toFixed(1);
  })();

  // Peak hours analysis
  const peakHours = (() => {
    const hourCounts = new Map<number, number>();
    entries.forEach(e => {
      const hour = new Date(e.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour, count]) => ({ hour: `${hour}:00–${hour + 1}:00`, count }));
  })();

  const estimatedWaitForNew = waiting.length * (avgWaitMinutes || avgMinutes);

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
            {estimatedWaitForNew > 0 && (
              <span className="ml-2">· ~{estimatedWaitForNew} min așteptare estimată</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings2 className="h-4 w-4" /> {servicePointLabelPlural}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Configurare {servicePointLabelPlural.toLowerCase()}</DialogTitle></DialogHeader>
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
                    placeholder={`Nume ${servicePointLabel.toLowerCase()} nou`}
                    onKeyDown={e => e.key === 'Enter' && addCabinet()} />
                  <Button onClick={addCabinet} size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
                <div className="pt-3 border-t">
                  <Label className="text-xs text-muted-foreground">Timp mediu estimat per tichet (minute)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input type="number" value={avgMinutes} min={1} max={120}
                      onChange={e => setAvgMinutes(Number(e.target.value))} />
                    <Button size="sm" variant="secondary" onClick={() => saveConfig(cabinets, avgMinutes)}>
                      Salvează
                    </Button>
                  </div>
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
                            {' · '}{differenceInMinutes(new Date(), new Date(e.called_at))} min
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
              <p className="text-sm text-muted-foreground py-4 text-center">
                {verticalType === 'medicine' ? 'Niciun pacient în așteptare' : 'Niciun student în așteptare'}
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {waiting.map((e, idx) => (
                  <Card key={e.id}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold">#{e.numar_tichet}</span>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(e.created_at), 'HH:mm')}
                          <span className="ml-1 text-primary">~{(idx + 1) * (avgWaitMinutes || avgMinutes)} min</span>
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

        <TabsContent value="analytics" className="mt-4 space-y-6">
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

          {/* Peak hours */}
          {peakHours.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Timer className="h-4 w-4" /> Ore de vârf</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {peakHours.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-mono w-28">{p.hour}</span>
                      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full transition-all"
                          style={{ width: `${(p.count / (peakHours[0]?.count || 1)) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold w-8 text-right">{p.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Per-cabinet breakdown */}
          <h3 className="text-sm font-semibold text-muted-foreground">Per {servicePointLabel.toLowerCase()}</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {cabinets.map(c => {
              const cabinetCompleted = completed.filter(e => e.cabinet === c);
              const cabinetServing = serving.find(e => e.cabinet === c);
              const cabinetAvgWait = (() => {
                const cWithWait = cabinetCompleted.filter(e => e.called_at && e.created_at);
                if (cWithWait.length === 0) return 0;
                const total = cWithWait.reduce((s, e) => s + differenceInMinutes(new Date(e.called_at!), new Date(e.created_at)), 0);
                return Math.round(total / cWithWait.length);
              })();
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
                      {cabinetCompleted.length} {clientLabelPlural.toLowerCase()} deserviți
                      {cabinetAvgWait > 0 && ` · ~${cabinetAvgWait} min așteptare`}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* GDPR notice */}
          <Card className="border-primary/20">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                🔒
              </div>
              <div>
                <h4 className="text-sm font-semibold">Conformitate GDPR</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistemul de coadă NU stochează nume, date medicale sau informații personale.
                  Se folosesc exclusiv numere de tichet și identificatoare de {servicePointLabel.toLowerCase()}.
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
