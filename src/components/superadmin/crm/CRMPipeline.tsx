import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Building2, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CRMClientDetail from './CRMClientDetail';

const COLUMNS = [
  { key: 'lead', label: 'Lead', color: 'bg-slate-200' },
  { key: 'onboarding', label: 'Onboarding', color: 'bg-blue-200' },
  { key: 'active', label: 'Activ', color: 'bg-green-200' },
  { key: 'at_risk', label: 'La Risc', color: 'bg-yellow-200' },
  { key: 'churned', label: 'Pierdut', color: 'bg-red-200' },
];

export default function CRMPipeline() {
  const qc = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const { data: clients = [] } = useQuery({
    queryKey: ['crm-clients'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_clients').select('*, organizations(name, vertical_type)');
      return data || [];
    },
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['crm-contracts'],
    queryFn: async () => {
      const { data } = await supabase.from('crm_contracts').select('*');
      return data || [];
    },
  });

  const { data: orgs = [] } = useQuery({
    queryKey: ['all-orgs'],
    queryFn: async () => {
      const { data } = await supabase.from('organizations').select('id, name');
      return data || [];
    },
  });

  const existingOrgIds = new Set(clients.map((c: any) => c.organization_id));
  const availableOrgs = orgs.filter((o: any) => !existingOrgIds.has(o.id));

  const moveClient = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === 'churned') updates.churned_at = new Date().toISOString();
      if (status === 'active') updates.onboarding_completed_at = new Date().toISOString();
      await supabase.from('crm_clients').update(updates).eq('id', id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-clients'] });
      toast.success('Status actualizat');
    },
  });

  const addClient = useMutation({
    mutationFn: async () => {
      if (!selectedOrgId) return;
      await supabase.from('crm_clients').insert({ organization_id: selectedOrgId, status: 'lead' });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['crm-clients'] });
      setAddDialogOpen(false);
      setSelectedOrgId('');
      toast.success('Client adăugat în pipeline');
    },
  });

  const getClientMRR = (clientId: string) => {
    return contracts
      .filter((c: any) => c.client_id === clientId && c.status === 'active' && c.contract_type === 'subscription')
      .reduce((sum: number, c: any) => sum + Number(c.amount_ron || 0), 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pipeline Clienți</h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Adaugă Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adaugă organizație în CRM</DialogTitle>
            </DialogHeader>
            <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="Selectează organizația..." />
              </SelectTrigger>
              <SelectContent>
                {availableOrgs.map((o: any) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => addClient.mutate()} disabled={!selectedOrgId}>Adaugă</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {COLUMNS.map((col) => {
          const colClients = clients.filter((c: any) => c.status === col.key);
          return (
            <div key={col.key} className="flex flex-col">
              <div className={`rounded-t-lg px-3 py-2 ${col.color} flex items-center justify-between`}>
                <span className="text-xs font-semibold text-foreground">{col.label}</span>
                <Badge variant="secondary" className="text-[10px] h-5">{colClients.length}</Badge>
              </div>
              <ScrollArea className="border border-t-0 border-border rounded-b-lg bg-card min-h-[200px] max-h-[60vh]">
                <div className="p-2 space-y-2">
                  {colClients.map((client: any) => {
                    const mrr = getClientMRR(client.id);
                    return (
                      <Card
                        key={client.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-border"
                        onClick={() => setSelectedClientId(client.id)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm font-medium text-foreground truncate">
                              {client.organizations?.name || 'Organizație'}
                            </span>
                          </div>
                          {client.organizations?.vertical_type && (
                            <Badge variant="outline" className="text-[9px]">{client.organizations.vertical_type}</Badge>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span>Health</span>
                              <span>{client.health_score}%</span>
                            </div>
                            <Progress value={client.health_score} className="h-1.5" />
                          </div>
                          {mrr > 0 && (
                            <p className="text-xs font-semibold text-emerald-600">{mrr.toLocaleString()} RON/lună</p>
                          )}
                          {/* Quick status buttons */}
                          <div className="flex flex-wrap gap-1">
                            {COLUMNS.filter(c => c.key !== col.key).map(target => (
                              <Button
                                key={target.key}
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[9px] px-1.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveClient.mutate({ id: client.id, status: target.key });
                                }}
                              >
                                → {target.label}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {colClients.length === 0 && (
                    <p className="text-[10px] text-muted-foreground text-center py-6">Gol</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      <CRMClientDetail clientId={selectedClientId} onClose={() => setSelectedClientId(null)} />
    </div>
  );
}
