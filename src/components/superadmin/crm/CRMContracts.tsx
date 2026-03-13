import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format, addDays, isBefore } from 'date-fns';
import { Plus, DollarSign, AlertTriangle, FileText } from 'lucide-react';

export default function CRMContracts() {
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [form, setForm] = useState({
    client_id: '', contract_type: 'subscription', amount_ron: '', start_date: '', end_date: '', renewal_date: '', notes: '', status: 'active',
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['crm-contracts'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_contracts').select('*, crm_clients(id, organizations(name))').order('created_at', { ascending: false });
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

  const addContract = useMutation({
    mutationFn: async () => {
      await supabase.from('crm_contracts').insert({
        client_id: form.client_id,
        contract_type: form.contract_type,
        amount_ron: Number(form.amount_ron) || 0,
        start_date: form.start_date || new Date().toISOString().split('T')[0],
        end_date: form.end_date || null,
        renewal_date: form.renewal_date || null,
        notes: form.notes || null,
        status: form.status,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-contracts'] });
      setDialogOpen(false);
      setForm({ client_id: '', contract_type: 'subscription', amount_ron: '', start_date: '', end_date: '', renewal_date: '', notes: '', status: 'active' });
      toast.success('Contract adăugat');
    },
  });

  const activeContracts = contracts.filter((c: any) => c.status === 'active');
  const mrr = activeContracts
    .filter((c: any) => c.contract_type === 'subscription')
    .reduce((s: number, c: any) => s + Number(c.amount_ron || 0), 0);
  const arr = mrr * 12;
  const renewals7 = contracts.filter((c: any) => c.renewal_date && c.status === 'active' && isBefore(new Date(c.renewal_date), addDays(new Date(), 7)));

  const filtered = contracts.filter((c: any) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (filterType !== 'all' && c.contract_type !== filterType) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-emerald-500" /><span className="text-[10px] uppercase text-muted-foreground font-semibold">MRR</span></div>
            <p className="text-xl font-bold text-foreground">{mrr.toLocaleString()} RON</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><DollarSign className="h-4 w-4 text-blue-500" /><span className="text-[10px] uppercase text-muted-foreground font-semibold">ARR</span></div>
            <p className="text-xl font-bold text-foreground">{arr.toLocaleString()} RON</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><FileText className="h-4 w-4 text-primary" /><span className="text-[10px] uppercase text-muted-foreground font-semibold">Active</span></div>
            <p className="text-xl font-bold text-foreground">{activeContracts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-orange-500" /><span className="text-[10px] uppercase text-muted-foreground font-semibold">Reînnoiri 7 zile</span></div>
            <p className="text-xl font-bold text-foreground">{renewals7.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="expired">Expirate</SelectItem>
            <SelectItem value="cancelled">Anulate</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate tipurile</SelectItem>
            <SelectItem value="subscription">Abonament</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="one_time">One-time</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5"><Plus className="h-3.5 w-3.5" /> Contract Nou</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Contract Nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Client</Label>
                <Select value={form.client_id} onValueChange={v => setForm(f => ({ ...f, client_id: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectează..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{(c as any).organizations?.name || c.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tip</Label>
                  <Select value={form.contract_type} onValueChange={v => setForm(f => ({ ...f, contract_type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscription">Abonament</SelectItem>
                      <SelectItem value="hardware">Hardware</SelectItem>
                      <SelectItem value="one_time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Sumă (RON)</Label>
                  <Input type="number" className="h-8 text-xs" value={form.amount_ron} onChange={e => setForm(f => ({ ...f, amount_ron: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">Start</Label><Input type="date" className="h-8 text-xs" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} /></div>
                <div><Label className="text-xs">End</Label><Input type="date" className="h-8 text-xs" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} /></div>
                <div><Label className="text-xs">Reînnoire</Label><Input type="date" className="h-8 text-xs" value={form.renewal_date} onChange={e => setForm(f => ({ ...f, renewal_date: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Note</Label><Textarea className="text-xs min-h-[50px]" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
              <Button onClick={() => addContract.mutate()} disabled={!form.client_id || !form.amount_ron} className="w-full">Salvează</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Client</TableHead>
              <TableHead className="text-xs">Tip</TableHead>
              <TableHead className="text-xs">Sumă</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Start</TableHead>
              <TableHead className="text-xs">Reînnoire</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="text-xs font-medium">{(c as any).crm_clients?.organizations?.name || '—'}</TableCell>
                <TableCell><Badge variant="outline" className="text-[10px]">{c.contract_type}</Badge></TableCell>
                <TableCell className="text-xs font-semibold">{Number(c.amount_ron).toLocaleString()} {c.currency}</TableCell>
                <TableCell><Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{c.status}</Badge></TableCell>
                <TableCell className="text-xs">{format(new Date(c.start_date), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-xs">{c.renewal_date ? format(new Date(c.renewal_date), 'dd MMM yyyy') : '—'}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">Niciun contract</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
