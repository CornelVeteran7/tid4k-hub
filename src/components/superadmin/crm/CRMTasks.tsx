import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, isBefore } from 'date-fns';
import { Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function CRMTasks() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterPriority, setFilterPriority] = useState('all');
  const [form, setForm] = useState({
    client_id: '', title: '', description: '', due_date: '', priority: 'medium', task_type: 'custom', assigned_to: '',
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['crm-tasks'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_tasks').select('*, crm_clients(id, organizations(name))').order('due_date', { ascending: true });
      return data || [];
    },
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['crm-clients'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_clients').select('id, organizations(name)');
      return data || [];
    },
  });

  const addTask = useMutation({
    mutationFn: async () => {
      await supabase.from('crm_tasks').insert({
        client_id: form.client_id || null,
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        priority: form.priority,
        task_type: form.task_type,
        assigned_to: form.assigned_to || null,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
      setDialogOpen(false);
      setForm({ client_id: '', title: '', description: '', due_date: '', priority: 'medium', task_type: 'custom', assigned_to: '' });
      toast.success('Task creat');
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      await supabase.from('crm_tasks').update({
        status: done ? 'done' : 'todo',
        completed_at: done ? new Date().toISOString() : null,
      }).eq('id', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-tasks'] });
    },
  });

  const filtered = tasks.filter((t: any) => {
    if (filterStatus === 'active' && (t.status === 'done' || t.status === 'cancelled')) return false;
    if (filterStatus === 'done' && t.status !== 'done') return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  const overdue = tasks.filter((t: any) => t.status !== 'done' && t.status !== 'cancelled' && t.due_date && isBefore(new Date(t.due_date), new Date()));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 flex items-center gap-2"><Clock className="h-4 w-4 text-blue-500" /><div><p className="text-[10px] uppercase text-muted-foreground font-semibold">Active</p><p className="text-xl font-bold">{tasks.filter((t: any) => t.status !== 'done' && t.status !== 'cancelled').length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-500" /><div><p className="text-[10px] uppercase text-muted-foreground font-semibold">Restante</p><p className="text-xl font-bold">{overdue.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /><div><p className="text-[10px] uppercase text-muted-foreground font-semibold">Completate</p><p className="text-xl font-bold">{tasks.filter((t: any) => t.status === 'done').length}</p></div></CardContent></Card>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="done">Completate</SelectItem>
            <SelectItem value="all">Toate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Task Nou</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Task Nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Titlu *</Label><Input className="h-8 text-xs" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label className="text-xs">Descriere</Label><Textarea className="text-xs min-h-[50px]" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div>
                <Label className="text-xs">Client (opțional)</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Global (fără client)" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{(c as any).organizations?.name || c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">Scadent</Label><Input type="date" className="h-8 text-xs" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} /></div>
                <div>
                  <Label className="text-xs">Prioritate</Label>
                  <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tip</Label>
                  <Select value={form.task_type} onValueChange={v => setForm(f => ({ ...f, task_type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="nps">NPS</SelectItem>
                      <SelectItem value="renewal">Reînnoire</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Asignat la</Label><Input className="h-8 text-xs" placeholder="Nume..." value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))} /></div>
              <Button onClick={() => addTask.mutate()} disabled={!form.title.trim()} className="w-full">Crează Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task: any) => {
          const isOverdue = task.status !== 'done' && task.due_date && isBefore(new Date(task.due_date), new Date());
          const isDone = task.status === 'done';
          return (
            <Card key={task.id} className={`border-border ${isOverdue ? 'border-l-2 border-l-destructive' : ''} ${isDone ? 'opacity-60' : ''}`}>
              <CardContent className="p-3 flex items-start gap-3">
                <Checkbox
                  checked={isDone}
                  onCheckedChange={(checked) => toggleTask.mutate({ id: task.id, done: !!checked })}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</span>
                    <Badge className={`text-[9px] ${PRIORITY_COLORS[task.priority] || ''}`}>{task.priority}</Badge>
                    <Badge variant="outline" className="text-[9px]">{task.task_type}</Badge>
                  </div>
                  {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    {(task as any).crm_clients?.organizations?.name && (
                      <span>📍 {(task as any).crm_clients.organizations.name}</span>
                    )}
                    {task.due_date && (
                      <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        📅 {format(new Date(task.due_date), 'dd MMM yyyy')}
                      </span>
                    )}
                    {task.assigned_to && <span>👤 {task.assigned_to}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">Niciun task în această categorie</p>
        )}
      </div>
    </div>
  );
}
