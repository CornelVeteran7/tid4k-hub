import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  HardHat, MapPin, DollarSign, Users, AlertTriangle, CheckCircle2,
  Clock, Plus, Calendar, TrendingUp, ArrowRight, Trash2, Building2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getSites, getTeams, getTasks, getCosts, getAssignments,
  createTask, updateTask, createCost, upsertSite, upsertAssignment, deleteAssignment,
  type ConstructionSite, type ConstructionTeam, type ConstructionTask,
  type ConstructionCost, type TeamAssignment
} from '@/api/construction';
import { format, startOfWeek, addDays, isBefore, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';

export default function ConstructionDashboard() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [sites, setSites] = useState<ConstructionSite[]>([]);
  const [teams, setTeams] = useState<ConstructionTeam[]>([]);
  const [tasks, setTasks] = useState<ConstructionTask[]>([]);
  const [costs, setCosts] = useState<ConstructionCost[]>([]);
  const [assignments, setAssignments] = useState<TeamAssignment[]>([]);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;
    Promise.all([
      getSites(orgId),
      getTeams(orgId),
      getTasks(orgId),
      getCosts(orgId),
      getAssignments(orgId),
    ]).then(([s, t, tk, c, a]) => {
      setSites(s); setTeams(t); setTasks(tk); setCosts(c); setAssignments(a);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orgId]);

  if (!orgId) return null;
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const today = format(new Date(), 'yyyy-MM-dd');
  const thisWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const thisWeekEnd = format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'yyyy-MM-dd');

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <HardHat className="h-6 w-6 text-primary" /> Panou Patron
        </h1>
        <p className="text-sm text-muted-foreground">Gestionare șantiere, echipe și costuri</p>
      </div>

      {/* Site Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sites.map(site => (
          <SiteCard
            key={site.id}
            site={site}
            tasks={tasks.filter(t => t.site_id === site.id)}
            costs={costs.filter(c => c.site_id === site.id)}
            teams={teams}
            assignments={assignments.filter(a => a.site_id === site.id && a.saptamana_start <= thisWeekEnd && a.saptamana_end >= thisWeekStart)}
            today={today}
            onSelect={() => setSelectedSite(site.id)}
            isSelected={selectedSite === site.id}
          />
        ))}
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5"><CheckCircle2 className="h-4 w-4" /> Taskuri</TabsTrigger>
          <TabsTrigger value="teams" className="gap-1.5"><Users className="h-4 w-4" /> Echipe</TabsTrigger>
          <TabsTrigger value="costs" className="gap-1.5"><DollarSign className="h-4 w-4" /> Costuri</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TasksPanel orgId={orgId} tasks={selectedSite ? tasks.filter(t => t.site_id === selectedSite) : tasks}
            teams={teams} sites={sites} selectedSite={selectedSite}
            onRefresh={() => getTasks(orgId).then(setTasks)} />
        </TabsContent>
        <TabsContent value="teams">
          <TeamsPanel orgId={orgId} teams={teams} sites={sites} assignments={assignments}
            onRefresh={() => getAssignments(orgId).then(setAssignments)} />
        </TabsContent>
        <TabsContent value="costs">
          <CostsPanel orgId={orgId} costs={selectedSite ? costs.filter(c => c.site_id === selectedSite) : costs}
            sites={sites} selectedSite={selectedSite}
            onRefresh={() => getCosts(orgId).then(setCosts)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ════════════════════════════════════════════════
   Site Card
   ════════════════════════════════════════════════ */
function SiteCard({ site, tasks, costs, teams, assignments, today, onSelect, isSelected }: {
  site: ConstructionSite;
  tasks: ConstructionTask[];
  costs: ConstructionCost[];
  teams: ConstructionTeam[];
  assignments: TeamAssignment[];
  today: string;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const totalCost = costs.reduce((s, c) => s + c.total, 0);
  const budgetPct = site.buget > 0 ? Math.round((totalCost / site.buget) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.data_limita && t.data_limita < today);
  const activeTasks = tasks.filter(t => t.status !== 'done');
  const assignedTeams = assignments.map(a => teams.find(t => t.id === a.team_id)).filter(Boolean);
  const budgetColor = budgetPct >= 80 ? 'text-destructive' : budgetPct >= 60 ? 'text-warning' : 'text-success';

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-display">{site.nume}</CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {site.adresa}
            </p>
          </div>
          <Badge variant={site.status === 'activ' ? 'default' : 'secondary'}>
            {site.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Progres</span>
            <span className="font-semibold">{site.progress_pct}%</span>
          </div>
          <Progress value={site.progress_pct} className="h-2" />
        </div>

        {/* Budget */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-muted-foreground"><DollarSign className="h-3.5 w-3.5" /> Buget</span>
          <span className={`font-semibold ${budgetColor}`}>
            {totalCost.toLocaleString('ro-RO')} / {site.buget.toLocaleString('ro-RO')} lei ({budgetPct}%)
          </span>
        </div>

        {/* Teams */}
        <div className="flex flex-wrap gap-1">
          {assignedTeams.map(t => t && (
            <Badge key={t.id} variant="secondary" className="text-[10px]">
              <Users className="h-3 w-3 mr-1" /> {t.nume}
            </Badge>
          ))}
          {assignedTeams.length === 0 && <span className="text-xs text-muted-foreground">Nicio echipă asignată</span>}
        </div>

        {/* Stats row */}
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {tasks.filter(t => t.status === 'done').length} finalizate
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {activeTasks.length} active
          </span>
          {overdueTasks.length > 0 && (
            <span className="flex items-center gap-1 text-destructive font-semibold">
              <AlertTriangle className="h-3.5 w-3.5" /> {overdueTasks.length} întârziate
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ════════════════════════════════════════════════
   Tasks Panel
   ════════════════════════════════════════════════ */
function TasksPanel({ orgId, tasks, teams, sites, selectedSite, onRefresh }: {
  orgId: string;
  tasks: ConstructionTask[];
  teams: ConstructionTeam[];
  sites: ConstructionSite[];
  selectedSite: string | null;
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ titlu: '', descriere: '', prioritate: 'normal', assignee: '', locatie: '', data_limita: '', site_id: selectedSite || '', team_id: '' });
  const today = format(new Date(), 'yyyy-MM-dd');

  const handleAdd = async () => {
    if (!newTask.titlu || !newTask.site_id) { toast.error('Completează titlul și șantierul'); return; }
    try {
      await createTask({
        organization_id: orgId,
        titlu: newTask.titlu,
        descriere: newTask.descriere,
        prioritate: newTask.prioritate,
        assignee: newTask.assignee,
        locatie: newTask.locatie,
        data_limita: newTask.data_limita || undefined,
        site_id: newTask.site_id,
        team_id: newTask.team_id || undefined,
        status: 'todo',
      } as any);
      toast.success('Task creat!');
      setShowAdd(false);
      setNewTask({ titlu: '', descriere: '', prioritate: 'normal', assignee: '', locatie: '', data_limita: '', site_id: selectedSite || '', team_id: '' });
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateTask(id, {
        status,
        ...(status === 'done' ? { completed_at: new Date().toISOString() } : {}),
      });
      toast.success(status === 'done' ? 'Task finalizat!' : 'Status actualizat');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (a.status !== 'done' && b.status === 'done') return -1;
    if (a.prioritate === 'urgent' && b.prioritate !== 'urgent') return -1;
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Taskuri {selectedSite ? `— ${sites.find(s => s.id === selectedSite)?.nume}` : '— Toate'}</CardTitle>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Adaugă</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Task nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Titlu</Label><Input value={newTask.titlu} onChange={e => setNewTask(p => ({ ...p, titlu: e.target.value }))} /></div>
                <div><Label>Descriere</Label><Textarea value={newTask.descriere} onChange={e => setNewTask(p => ({ ...p, descriere: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Șantier</Label>
                    <Select value={newTask.site_id} onValueChange={v => setNewTask(p => ({ ...p, site_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Alege" /></SelectTrigger>
                      <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id}>{s.nume}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Echipă</Label>
                    <Select value={newTask.team_id} onValueChange={v => setNewTask(p => ({ ...p, team_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Alege" /></SelectTrigger>
                      <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.nume}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Assignee</Label><Input value={newTask.assignee} onChange={e => setNewTask(p => ({ ...p, assignee: e.target.value }))} /></div>
                  <div><Label>Locație</Label><Input value={newTask.locatie} onChange={e => setNewTask(p => ({ ...p, locatie: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Prioritate</Label>
                    <Select value={newTask.prioritate} onValueChange={v => setNewTask(p => ({ ...p, prioritate: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Termen</Label><Input type="date" value={newTask.data_limita} onChange={e => setNewTask(p => ({ ...p, data_limita: e.target.value }))} /></div>
                </div>
                <Button onClick={handleAdd} className="w-full">Creează task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {sorted.map(task => {
            const isOverdue = task.status !== 'done' && task.data_limita && task.data_limita < today;
            const team = teams.find(t => t.id === task.team_id);
            return (
              <div key={task.id} className={`py-3 flex items-start gap-3 ${task.status === 'done' ? 'opacity-50' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through' : ''}`}>{task.titlu}</p>
                    {task.prioritate === 'urgent' && <Badge variant="destructive" className="text-[10px]">URGENT</Badge>}
                    {isOverdue && <Badge variant="destructive" className="text-[10px] gap-1"><AlertTriangle className="h-3 w-3" /> ÎNTÂRZIAT</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.assignee && `${task.assignee} · `}
                    {task.locatie && `📍 ${task.locatie} · `}
                    {team && `👷 ${team.nume} · `}
                    {task.data_limita && `⏰ ${task.data_limita}`}
                  </p>
                  {task.photo_url && (
                    <img src={task.photo_url} alt="Dovadă" className="mt-2 h-20 rounded-lg object-cover" />
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  {task.status !== 'done' && (
                    <>
                      {task.status === 'todo' && (
                        <Button size="sm" variant="outline" onClick={() => handleStatusChange(task.id, 'in_progress')}>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="default" onClick={() => handleStatusChange(task.id, 'done')}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">Niciun task</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ════════════════════════════════════════════════
   Teams Panel
   ════════════════════════════════════════════════ */
function TeamsPanel({ orgId, teams, sites, assignments, onRefresh }: {
  orgId: string;
  teams: ConstructionTeam[];
  sites: ConstructionSite[];
  assignments: TeamAssignment[];
  onRefresh: () => void;
}) {
  const [addTeamId, setAddTeamId] = useState('');
  const [addSiteId, setAddSiteId] = useState('');
  const [addWeek, setAddWeek] = useState(format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'));

  const handleAssign = async () => {
    if (!addTeamId || !addSiteId) { toast.error('Selectează echipa și șantierul'); return; }
    const weekStart = parseISO(addWeek);
    const weekEnd = addDays(weekStart, 6);
    try {
      await upsertAssignment({
        organization_id: orgId,
        team_id: addTeamId,
        site_id: addSiteId,
        saptamana_start: format(weekStart, 'yyyy-MM-dd'),
        saptamana_end: format(weekEnd, 'yyyy-MM-dd'),
      });
      toast.success('Echipă asignată!');
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleRemove = async (id: string) => {
    await deleteAssignment(id);
    toast.success('Asignare eliminată');
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Echipe & Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Teams list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {teams.map(team => (
            <div key={team.id} className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold">{team.nume}</p>
              <p className="text-xs text-muted-foreground">{team.nr_membri} membri · {team.specialitate}</p>
            </div>
          ))}
        </div>

        {/* Add assignment */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <p className="text-sm font-medium">Asignare echipă la șantier</p>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <Select value={addTeamId} onValueChange={setAddTeamId}>
              <SelectTrigger><SelectValue placeholder="Echipă" /></SelectTrigger>
              <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.nume}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={addSiteId} onValueChange={setAddSiteId}>
              <SelectTrigger><SelectValue placeholder="Șantier" /></SelectTrigger>
              <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id}>{s.nume}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="date" value={addWeek} onChange={e => setAddWeek(e.target.value)} />
            <Button onClick={handleAssign} className="gap-1.5"><Calendar className="h-4 w-4" /> Asignează</Button>
          </div>
        </div>

        {/* Current assignments */}
        <div className="divide-y divide-border">
          {assignments.map(a => {
            const team = teams.find(t => t.id === a.team_id);
            const site = sites.find(s => s.id === a.site_id);
            return (
              <div key={a.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{team?.nume} → {site?.nume}</p>
                  <p className="text-xs text-muted-foreground">{a.saptamana_start} — {a.saptamana_end}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleRemove(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ════════════════════════════════════════════════
   Costs Panel
   ════════════════════════════════════════════════ */
function CostsPanel({ orgId, costs, sites, selectedSite, onRefresh }: {
  orgId: string;
  costs: ConstructionCost[];
  sites: ConstructionSite[];
  selectedSite: string | null;
  onRefresh: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCost, setNewCost] = useState({ site_id: selectedSite || '', categorie: 'materiale', descriere: '', cantitate: 1, pret_unitar: 0, furnizor: '', suma_platita: 0 });

  const handleAdd = async () => {
    if (!newCost.site_id || !newCost.descriere) { toast.error('Completează câmpurile'); return; }
    try {
      await createCost({
        organization_id: orgId,
        site_id: newCost.site_id,
        categorie: newCost.categorie,
        descriere: newCost.descriere,
        cantitate: newCost.cantitate,
        pret_unitar: newCost.pret_unitar,
        furnizor: newCost.furnizor,
        suma_platita: newCost.suma_platita,
        data_inregistrare: format(new Date(), 'yyyy-MM-dd'),
      });
      toast.success('Cost adăugat!');
      setShowAdd(false);
      onRefresh();
    } catch (e: any) { toast.error(e.message); }
  };

  // Summary by category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    costs.forEach(c => { map[c.categorie] = (map[c.categorie] || 0) + c.total; });
    return map;
  }, [costs]);

  const totalSpent = costs.reduce((s, c) => s + c.total, 0);
  const site = selectedSite ? sites.find(s => s.id === selectedSite) : null;
  const budgetPct = site && site.buget > 0 ? Math.round((totalSpent / site.buget) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Costuri {site ? `— ${site.nume}` : '— Toate'}</CardTitle>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Adaugă cost</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cost nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Șantier</Label>
                  <Select value={newCost.site_id} onValueChange={v => setNewCost(p => ({ ...p, site_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Alege" /></SelectTrigger>
                    <SelectContent>{sites.map(s => <SelectItem key={s.id} value={s.id}>{s.nume}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categorie</Label>
                  <Select value={newCost.categorie} onValueChange={v => setNewCost(p => ({ ...p, categorie: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="materiale">Materiale</SelectItem>
                      <SelectItem value="manopera">Manoperă</SelectItem>
                      <SelectItem value="subcontractare">Subcontractare</SelectItem>
                      <SelectItem value="utilaje">Utilaje</SelectItem>
                      <SelectItem value="altele">Altele</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Descriere</Label><Input value={newCost.descriere} onChange={e => setNewCost(p => ({ ...p, descriere: e.target.value }))} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Cantitate</Label><Input type="number" value={newCost.cantitate} onChange={e => setNewCost(p => ({ ...p, cantitate: Number(e.target.value) }))} /></div>
                  <div><Label>Preț unitar (lei)</Label><Input type="number" value={newCost.pret_unitar} onChange={e => setNewCost(p => ({ ...p, pret_unitar: Number(e.target.value) }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Furnizor</Label><Input value={newCost.furnizor} onChange={e => setNewCost(p => ({ ...p, furnizor: e.target.value }))} /></div>
                  <div><Label>Sumă plătită</Label><Input type="number" value={newCost.suma_platita} onChange={e => setNewCost(p => ({ ...p, suma_platita: Number(e.target.value) }))} /></div>
                </div>
                <div className="text-sm font-semibold text-right">
                  Total: {(newCost.cantitate * newCost.pret_unitar).toLocaleString('ro-RO')} lei
                </div>
                <Button onClick={handleAdd} className="w-full">Adaugă cost</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget summary */}
        {site && (
          <div className={`rounded-lg p-4 ${budgetPct >= 80 ? 'bg-destructive/10 border border-destructive/30' : 'bg-muted/50'}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Buget {site.nume}</p>
                <p className="text-2xl font-display font-bold">{totalSpent.toLocaleString('ro-RO')} lei</p>
                <p className="text-xs text-muted-foreground">din {site.buget.toLocaleString('ro-RO')} lei</p>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-bold ${budgetPct >= 80 ? 'text-destructive' : budgetPct >= 60 ? 'text-warning' : 'text-success'}`}>
                  {budgetPct}%
                </p>
                {budgetPct >= 80 && (
                  <p className="text-xs text-destructive font-semibold flex items-center gap-1 mt-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> ATENȚIE BUGET!
                  </p>
                )}
              </div>
            </div>
            <Progress value={budgetPct} className="h-2 mt-3" />
          </div>
        )}

        {/* Category breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(byCategory).map(([cat, total]) => (
            <div key={cat} className="rounded-lg border border-border p-3 text-center">
              <p className="text-xs text-muted-foreground capitalize">{cat}</p>
              <p className="text-sm font-semibold">{total.toLocaleString('ro-RO')} lei</p>
            </div>
          ))}
        </div>

        {/* Cost list */}
        <div className="divide-y divide-border">
          {costs.map(c => (
            <div key={c.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.descriere}</p>
                <p className="text-xs text-muted-foreground">
                  {c.categorie} · {c.cantitate} × {c.pret_unitar.toLocaleString('ro-RO')} lei
                  {c.furnizor && ` · ${c.furnizor}`}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">{c.total.toLocaleString('ro-RO')} lei</p>
                {c.suma_platita < c.total && (
                  <p className="text-[10px] text-warning">Plătit: {c.suma_platita.toLocaleString('ro-RO')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
