import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { FileText, MessageSquare, ListTodo, Plus } from 'lucide-react';

const STATUS_BADGE: Record<string, string> = {
  lead: 'bg-slate-100 text-slate-700',
  onboarding: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  at_risk: 'bg-yellow-100 text-yellow-700',
  churned: 'bg-red-100 text-red-700',
};

type Props = {
  clientId: string | null;
  onClose: () => void;
};

export default function CRMClientDetail({ clientId, onClose }: Props) {
  const qc = useQueryClient();
  const [noteContent, setNoteContent] = useState('');
  const [noteType, setNoteType] = useState('internal');

  const { data: client } = useQuery({
    queryKey: ['crm-client', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data } = await supabase.from('crm_clients').select('*, organizations(name, vertical_type)').eq('id', clientId).single();
      return data;
    },
    enabled: !!clientId,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['crm-client-contracts', clientId],
    queryFn: async () => {
      const { data } = await supabase.from('crm_contracts').select('*').eq('client_id', clientId!).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!clientId,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['crm-client-notes', clientId],
    queryFn: async () => {
      const { data } = await supabase.from('crm_notes').select('*').eq('client_id', clientId!).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!clientId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['crm-client-tasks', clientId],
    queryFn: async () => {
      const { data } = await supabase.from('crm_tasks').select('*').eq('client_id', clientId!).order('due_date', { ascending: true });
      return data || [];
    },
    enabled: !!clientId,
  });

  const addNote = useMutation({
    mutationFn: async () => {
      if (!noteContent.trim() || !clientId) return;
      await supabase.from('crm_notes').insert({ client_id: clientId, content: noteContent, note_type: noteType, author_name: 'Superadmin' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-client-notes', clientId] });
      setNoteContent('');
      toast.success('Notă adăugată');
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      if (!clientId) return;
      const updates: any = { status: newStatus, updated_at: new Date().toISOString() };
      if (newStatus === 'churned') updates.churned_at = new Date().toISOString();
      if (newStatus === 'active') updates.onboarding_completed_at = new Date().toISOString();
      await supabase.from('crm_clients').update(updates).eq('id', clientId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-client', clientId] });
      qc.invalidateQueries({ queryKey: ['crm-clients'] });
      toast.success('Status actualizat');
    },
  });

  const orgName = (client as any)?.organizations?.name || 'Client';

  return (
    <Sheet open={!!clientId} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-lg">{orgName}</SheetTitle>
          {client && (
            <div className="flex items-center gap-2 mt-1">
              <Badge className={STATUS_BADGE[client.status] || ''}>{client.status}</Badge>
              <span className="text-xs text-muted-foreground">Score: {client.health_score}/100</span>
            </div>
          )}
        </SheetHeader>

        {client && (
          <div className="px-4 pb-2">
            <Select value={client.status} onValueChange={(v) => updateStatus.mutate(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['lead', 'onboarding', 'active', 'at_risk', 'churned'].map(s => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        <Tabs defaultValue="notes" className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="notes" className="gap-1 text-xs"><MessageSquare className="h-3 w-3" /> Note ({notes.length})</TabsTrigger>
            <TabsTrigger value="contracts" className="gap-1 text-xs"><FileText className="h-3 w-3" /> Contracte ({contracts.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1 text-xs"><ListTodo className="h-3 w-3" /> Task-uri ({tasks.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="notes" className="px-4 pb-4 space-y-3 mt-2">
              {/* Add note form */}
              <div className="space-y-2 border border-border rounded-lg p-3">
                <Textarea
                  placeholder="Adaugă o notă..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex gap-2">
                  <Select value={noteType} onValueChange={setNoteType}>
                    <SelectTrigger className="h-7 text-xs w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['call', 'email', 'meeting', 'internal', 'system'].map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="h-7 text-xs" onClick={() => addNote.mutate()} disabled={!noteContent.trim()}>
                    <Plus className="h-3 w-3 mr-1" /> Adaugă
                  </Button>
                </div>
              </div>
              {/* Notes list */}
              {notes.map((note: any) => (
                <div key={note.id} className="border border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{note.note_type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(note.created_at), 'dd MMM yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-foreground">{note.content}</p>
                  {note.author_name && <p className="text-[10px] text-muted-foreground">— {note.author_name}</p>}
                </div>
              ))}
              {notes.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Nicio notă încă</p>}
            </TabsContent>

            <TabsContent value="contracts" className="px-4 pb-4 space-y-3 mt-2">
              {contracts.map((c: any) => (
                <div key={c.id} className="border border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px]">{c.contract_type}</Badge>
                    <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{c.status}</Badge>
                  </div>
                  <p className="text-lg font-bold text-foreground">{Number(c.amount_ron).toLocaleString()} {c.currency}</p>
                  <div className="text-[10px] text-muted-foreground flex gap-3">
                    <span>Start: {format(new Date(c.start_date), 'dd MMM yyyy')}</span>
                    {c.end_date && <span>End: {format(new Date(c.end_date), 'dd MMM yyyy')}</span>}
                    {c.renewal_date && <span>Reînnoire: {format(new Date(c.renewal_date), 'dd MMM yyyy')}</span>}
                  </div>
                  {c.notes && <p className="text-xs text-muted-foreground mt-1">{c.notes}</p>}
                </div>
              ))}
              {contracts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Niciun contract</p>}
            </TabsContent>

            <TabsContent value="tasks" className="px-4 pb-4 space-y-3 mt-2">
              {tasks.map((t: any) => (
                <div key={t.id} className="border border-border rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">{t.title}</span>
                    <Badge variant={t.status === 'done' ? 'default' : t.status === 'todo' ? 'secondary' : 'outline'} className="text-[10px]">{t.status}</Badge>
                  </div>
                  {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">{t.priority}</Badge>
                    {t.due_date && <span>Scadent: {format(new Date(t.due_date), 'dd MMM yyyy')}</span>}
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Niciun task</p>}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
