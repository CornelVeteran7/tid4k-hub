import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getWhatsappMappings, createMapping, syncStatus } from '@/api/whatsapp';
import type { WhatsappMapping } from '@/api/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Plus, Phone, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

export default function SocialMediaWhatsapp() {
  const { user } = useAuth();
  const [mappings, setMappings] = useState<WhatsappMapping[]>([]);
  const [status, setStatus] = useState<{ status: string; last_sync: string } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newMapping, setNewMapping] = useState({ grupa: '', whatsapp_group: '', sync_type: 'bidirectional' as 'bidirectional' | 'one-way', consent: true });

  useEffect(() => {
    getWhatsappMappings().then(setMappings);
    syncStatus().then(setStatus);
  }, []);

  const handleAdd = async () => {
    if (!newMapping.grupa || !newMapping.whatsapp_group) { toast.error('Completează toate câmpurile'); return; }
    try {
      const m = await createMapping(newMapping);
      setMappings(prev => [...prev, m]);
      setShowAdd(false);
      setNewMapping({ grupa: '', whatsapp_group: '', sync_type: 'bidirectional', consent: true });
      toast.success('Mapare adăugată!');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" /> WhatsApp
          </h1>
          <p className="text-muted-foreground text-sm">Sincronizare grupuri WhatsApp</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="gap-1.5"><Plus className="h-4 w-4" /> Adaugă grup</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Mapare WhatsApp nouă</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Grup/Clasă</Label>
                <Input
                  value={newMapping.grupa}
                  onChange={e => setNewMapping(p => ({ ...p, grupa: e.target.value }))}
                  placeholder="Ex: Grupa Mare"
                />
              </div>
              <div>
                <Label>Număr telefon / Grup WhatsApp</Label>
                <div className="flex gap-2">
                  <Phone className="h-4 w-4 mt-3 text-muted-foreground shrink-0" />
                  <Input
                    value={newMapping.whatsapp_group}
                    onChange={e => setNewMapping(p => ({ ...p, whatsapp_group: e.target.value }))}
                    placeholder="+40 7XX XXX XXX"
                  />
                </div>
              </div>
              <div>
                <Label>Tip sincronizare</Label>
                <Select value={newMapping.sync_type} onValueChange={v => setNewMapping(p => ({ ...p, sync_type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bidirectional">Bidirecțional</SelectItem>
                    <SelectItem value="one-way">Unidirecțional (doar trimitere)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newMapping.consent}
                  onCheckedChange={v => setNewMapping(p => ({ ...p, consent: v }))}
                />
                <Label className="text-sm">Consimțământ GDPR obținut</Label>
              </div>
              <Button onClick={handleAdd} className="w-full">Adaugă mapare</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {status && (
        <Card>
          <CardHeader><CardTitle className="text-base">Status sincronizare</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <Badge className="bg-success text-success-foreground">{status.status}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Ultima sincronizare</span>
              <span>{format(new Date(status.last_sync), 'd MMM yyyy, HH:mm', { locale: ro })}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-1.5 mt-2" onClick={() => toast.info('Sincronizare manuală — funcție viitoare')}>
              <RefreshCw className="h-4 w-4" /> Sincronizează acum
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Mapări grupuri ({mappings.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mappings.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">{m.grupa} → {m.whatsapp_group}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{m.sync_type === 'bidirectional' ? 'Bidirecțional' : 'Unidirecțional'}</Badge>
                    {m.consent && <Badge className="bg-success text-success-foreground text-xs">Consimțământ</Badge>}
                  </div>
                </div>
              </div>
            ))}
            {mappings.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nicio mapare configurată</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
