import { useState, useEffect } from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { getAnnouncements, createAnnouncement, hideFromTicker, restoreToTicker, markAsRead } from '@/api/announcements';
import type { Announcement } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Megaphone, Plus, Check, Eye, EyeOff, MessageCircle, Facebook } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Announcements() {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPriority, setNewPriority] = useState<'normal' | 'urgent'>('normal');
  const [newExpiry, setNewExpiry] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [sendWhatsapp, setSendWhatsapp] = useState(false);
  const [sendFacebook, setSendFacebook] = useState(false);

  const canCreate = user && (areRol(user.status, 'profesor') || areRol(user.status, 'administrator'));

  useEffect(() => {
    getAnnouncements(currentGroup?.id).then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, [currentGroup]);

  // Filter: hide expired from public feed, show all in admin
  const publicAnnouncements = announcements.filter(a => {
    if ((a as any).data_expirare && new Date((a as any).data_expirare) < new Date()) return false;
    if (a.ascuns_banda && !showAdmin) return false;
    return true;
  });

  const handleMarkRead = async (ann: Announcement) => {
    if (ann.citit) return;
    try {
      await markAsRead(ann.id);
      setAnnouncements((prev) =>
        prev.map((a) => a.id === ann.id ? { ...a, citit: true } : a)
      );
      toast.success('Marcat ca citit');
    } catch {
      toast.error('Eroare la marcarea ca citit');
    }
  };

  const handleCreate = async () => {
    const ann = await createAnnouncement({
      titlu: newTitle, continut: newContent, prioritate: newPriority,
      autor: user?.nume_prenume || '', target: currentGroup?.id || 'scoala',
      ...(newExpiry ? { data_expirare: newExpiry } as any : {}),
    });
    setAnnouncements((prev) => [ann, ...prev]);
    setCreateOpen(false);
    setNewTitle(''); setNewContent(''); setNewExpiry('');
    toast.success('Anunț creat!');
  };

  const handleTickerToggle = async (ann: Announcement) => {
    if (ann.ascuns_banda) {
      await restoreToTicker(ann.id);
      toast.success('Repus pe bandă');
    } else {
      await hideFromTicker(ann.id);
      toast.success('Scos de pe bandă');
    }
    setAnnouncements((prev) =>
      prev.map((a) => a.id === ann.id ? { ...a, ascuns_banda: !a.ascuns_banda } : a)
    );
  };

  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold">Anunțuri</h1>
          <p className="text-muted-foreground text-sm">{currentGroup?.nume}</p>
        </div>
        {canCreate && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus className="h-4 w-4" /> Adaugă Anunț</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Anunț nou</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Titlu</Label><Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /></div>
                <div><Label>Conținut</Label><Textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} rows={4} /></div>
                <div>
                  <Label>Prioritate</Label>
                  <Select value={newPriority} onValueChange={(v) => setNewPriority(v as 'normal' | 'urgent')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Data expirare (opțional)</Label>
                  <Input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
                </div>
                <div className="space-y-2 border rounded-lg p-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Distribuie și pe:</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                      <Label className="text-sm">WhatsApp</Label>
                    </div>
                    <Switch checked={sendWhatsapp} onCheckedChange={setSendWhatsapp} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm">Facebook</Label>
                    </div>
                    <Switch checked={sendFacebook} onCheckedChange={setSendFacebook} />
                  </div>
                  {(sendWhatsapp || sendFacebook) && (
                    <p className="text-[10px] text-muted-foreground">
                      Status: <Badge variant="outline" className="text-[10px]">pending</Badge> — trimiterea efectivă este funcție viitoare
                    </p>
                  )}
                </div>
                <Button className="w-full" onClick={handleCreate}>Publică</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Ticker Management */}
      {canCreate && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Bandă anunțuri (Ticker)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {announcements.slice(0, 10).map((ann) => (
                <div key={ann.id} className="flex items-center gap-3 text-sm p-2 rounded border">
                  <Badge
                    variant={ann.ascuns_banda ? 'destructive' : 'default'}
                    className={!ann.ascuns_banda ? 'bg-success text-success-foreground' : ''}
                  >
                    {ann.ascuns_banda ? 'Scos' : `Pe bandă #${ann.pozitie_banda || '-'}`}
                  </Badge>
                  <span className="flex-1 truncate">{ann.titlu}</span>
                  <Button variant="ghost" size="sm" onClick={() => handleTickerToggle(ann)}>
                    {ann.ascuns_banda ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Announcements List (filtered) */}
      <div className="space-y-4">
        {publicAnnouncements.map((ann) => (
          <Card key={ann.id} className={`glass-card ${ann.prioritate === 'urgent' ? 'border-destructive/50' : ''}`}>
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{ann.titlu}</h3>
                  <Badge variant={ann.prioritate === 'urgent' ? 'destructive' : 'secondary'}>
                    {ann.prioritate === 'urgent' ? '⚠️ Urgent' : 'Normal'}
                  </Badge>
                  <Button
                    variant={ann.citit ? 'secondary' : 'outline'}
                    size="sm"
                    className="ml-auto shrink-0 gap-1"
                    onClick={() => handleMarkRead(ann)}
                    disabled={ann.citit}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {ann.citit ? 'Citit' : 'Marchează citit'}
                  </Button>
                </div>
                {(ann as any).imagine && (
                  <div className="rounded-lg overflow-hidden max-h-64">
                    <img src={(ann as any).imagine} alt={ann.titlu} className="w-full h-full object-cover" />
                  </div>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{ann.continut}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{ann.autor}</span>
                  <span>·</span>
                  <span>{format(new Date(ann.data_upload), 'd MMMM yyyy, HH:mm', { locale: ro })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
