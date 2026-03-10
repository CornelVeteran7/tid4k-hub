import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Stethoscope, Plus, Trash2, Edit, Save, Star, Link2, Settings2, User
} from 'lucide-react';
import { toast } from 'sonner';

interface MedicineService {
  id: string;
  name: string;
  description: string;
  price_from: number;
  price_to: number;
  duration_minutes: number;
  ordine: number;
  activ: boolean;
}

interface DoctorProfile {
  id: string;
  name: string;
  photo_url: string;
  specialization: string;
  credentials: string;
  bio: string;
  ordine: number;
  activ: boolean;
}

export default function MedicineAdmin() {
  const { user } = useAuth();
  const orgId = user?.organization_id || '';
  const [services, setServices] = useState<MedicineService[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [googleUrl, setGoogleUrl] = useState('');
  const [editSvc, setEditSvc] = useState<Partial<MedicineService> | null>(null);
  const [editDoc, setEditDoc] = useState<Partial<DoctorProfile> | null>(null);
  const [svcDialogOpen, setSvcDialogOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!orgId) return;
    const [{ data: svcData }, { data: docData }, { data: configData }] = await Promise.all([
      supabase.from('medicine_services').select('*').eq('organization_id', orgId).order('ordine'),
      supabase.from('doctor_profiles').select('*').eq('organization_id', orgId).order('ordine'),
      supabase.from('org_config').select('config_value').eq('organization_id', orgId).eq('config_key', 'google_business_url').maybeSingle(),
    ]);
    setServices((svcData || []) as MedicineService[]);
    setDoctors((docData || []) as DoctorProfile[]);
    if (configData?.config_value) {
      setGoogleUrl(typeof configData.config_value === 'string' ? configData.config_value : (configData.config_value as any)?.url || '');
    }
  }, [orgId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Services CRUD ──
  const saveSvc = async () => {
    if (!editSvc?.name?.trim()) return;
    const payload = {
      organization_id: orgId,
      name: editSvc.name,
      description: editSvc.description || '',
      price_from: editSvc.price_from || 0,
      price_to: editSvc.price_to || 0,
      duration_minutes: editSvc.duration_minutes || 30,
      ordine: editSvc.ordine || services.length + 1,
      activ: editSvc.activ ?? true,
    };
    if (editSvc.id) {
      await supabase.from('medicine_services').update(payload).eq('id', editSvc.id);
    } else {
      await supabase.from('medicine_services').insert(payload);
    }
    toast.success('Serviciu salvat');
    setSvcDialogOpen(false);
    setEditSvc(null);
    loadData();
  };

  const deleteSvc = async (id: string) => {
    await supabase.from('medicine_services').delete().eq('id', id);
    toast.success('Serviciu șters');
    loadData();
  };

  // ── Doctors CRUD ──
  const saveDoc = async () => {
    if (!editDoc?.name?.trim()) return;
    const payload = {
      organization_id: orgId,
      name: editDoc.name,
      photo_url: editDoc.photo_url || '',
      specialization: editDoc.specialization || '',
      credentials: editDoc.credentials || '',
      bio: editDoc.bio || '',
      ordine: editDoc.ordine || doctors.length + 1,
      activ: editDoc.activ ?? true,
    };
    if (editDoc.id) {
      await supabase.from('doctor_profiles').update(payload).eq('id', editDoc.id);
    } else {
      await supabase.from('doctor_profiles').insert(payload);
    }
    toast.success('Profil medic salvat');
    setDocDialogOpen(false);
    setEditDoc(null);
    loadData();
  };

  const deleteDoc = async (id: string) => {
    await supabase.from('doctor_profiles').delete().eq('id', id);
    toast.success('Profil medic șters');
    loadData();
  };

  // ── Google Business URL ──
  const saveGoogleUrl = async () => {
    const { data: existing } = await supabase.from('org_config')
      .select('id').eq('organization_id', orgId).eq('config_key', 'google_business_url').maybeSingle();
    if (existing) {
      await supabase.from('org_config').update({ config_value: { url: googleUrl } }).eq('id', existing.id);
    } else {
      await supabase.from('org_config').insert({
        organization_id: orgId,
        config_key: 'google_business_url',
        config_value: { url: googleUrl },
      });
    }
    toast.success('URL Google salvat');
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-primary" /> Configurare Cabinet Medical
        </h1>
        <p className="text-sm text-muted-foreground">Servicii, medici și setări specifice</p>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" /> Servicii
          </TabsTrigger>
          <TabsTrigger value="doctors" className="gap-1.5">
            <User className="h-3.5 w-3.5" /> Medici
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <Star className="h-3.5 w-3.5" /> Setări
          </TabsTrigger>
        </TabsList>

        {/* ── Services Tab ── */}
        <TabsContent value="services" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={svcDialogOpen} onOpenChange={setSvcDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" onClick={() => setEditSvc({})}>
                  <Plus className="h-4 w-4" /> Adaugă serviciu
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editSvc?.id ? 'Editare' : 'Adaugare'} serviciu</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Nume serviciu</Label>
                    <Input value={editSvc?.name || ''} onChange={e => setEditSvc(p => ({ ...p, name: e.target.value }))}
                      placeholder="ex: Detartraj" />
                  </div>
                  <div>
                    <Label>Descriere</Label>
                    <Textarea value={editSvc?.description || ''} onChange={e => setEditSvc(p => ({ ...p, description: e.target.value }))}
                      placeholder="Descriere scurtă..." rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Preț de la (lei)</Label>
                      <Input type="number" value={editSvc?.price_from || 0} onChange={e => setEditSvc(p => ({ ...p, price_from: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <Label>Preț până la (lei)</Label>
                      <Input type="number" value={editSvc?.price_to || 0} onChange={e => setEditSvc(p => ({ ...p, price_to: Number(e.target.value) }))} />
                    </div>
                  </div>
                  <div>
                    <Label>Durată estimată (min)</Label>
                    <Input type="number" value={editSvc?.duration_minutes || 30} onChange={e => setEditSvc(p => ({ ...p, duration_minutes: Number(e.target.value) }))} />
                  </div>
                  <Button className="w-full gap-1.5" onClick={saveSvc}><Save className="h-4 w-4" /> Salvează</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {services.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Niciun serviciu configurat</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map(svc => (
                <Card key={svc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-foreground">{svc.name}</h3>
                        {svc.description && <p className="text-xs text-muted-foreground mt-1">{svc.description}</p>}
                        <div className="flex gap-2 mt-2">
                          {(svc.price_from > 0 || svc.price_to > 0) && (
                            <Badge variant="secondary" className="text-xs">
                              {svc.price_from === svc.price_to ? `${svc.price_from} lei` : `${svc.price_from}–${svc.price_to} lei`}
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">~{svc.duration_minutes} min</Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => { setEditSvc(svc); setSvcDialogOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteSvc(svc.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Doctors Tab ── */}
        <TabsContent value="doctors" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" onClick={() => setEditDoc({})}>
                  <Plus className="h-4 w-4" /> Adaugă medic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{editDoc?.id ? 'Editare' : 'Adaugare'} profil medic</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label>Nume complet</Label>
                    <Input value={editDoc?.name || ''} onChange={e => setEditDoc(p => ({ ...p, name: e.target.value }))}
                      placeholder="Dr. Popescu Maria" />
                  </div>
                  <div>
                    <Label>URL Fotografie</Label>
                    <Input value={editDoc?.photo_url || ''} onChange={e => setEditDoc(p => ({ ...p, photo_url: e.target.value }))}
                      placeholder="https://..." />
                  </div>
                  <div>
                    <Label>Specializare</Label>
                    <Input value={editDoc?.specialization || ''} onChange={e => setEditDoc(p => ({ ...p, specialization: e.target.value }))}
                      placeholder="Ortodonție" />
                  </div>
                  <div>
                    <Label>Credențiale</Label>
                    <Input value={editDoc?.credentials || ''} onChange={e => setEditDoc(p => ({ ...p, credentials: e.target.value }))}
                      placeholder="15 ani experiență, CMR 12345" />
                  </div>
                  <div>
                    <Label>Bio scurt</Label>
                    <Textarea value={editDoc?.bio || ''} onChange={e => setEditDoc(p => ({ ...p, bio: e.target.value }))}
                      rows={3} placeholder="Descriere scurtă a activității..." />
                  </div>
                  <Button className="w-full gap-1.5" onClick={saveDoc}><Save className="h-4 w-4" /> Salvează</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {doctors.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Niciun medic configurat</CardContent></Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {doctors.map(doc => (
                <Card key={doc.id}>
                  <CardContent className="p-4 flex items-start gap-3">
                    {doc.photo_url ? (
                      <img src={doc.photo_url} alt="" className="h-14 w-14 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Stethoscope className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-foreground">{doc.name}</h3>
                          <p className="text-xs text-primary">{doc.specialization}</p>
                          {doc.credentials && <p className="text-xs text-muted-foreground mt-0.5">{doc.credentials}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => { setEditDoc(doc); setDocDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => deleteDoc(doc.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4" /> Google Reviews
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Adaugă URL-ul paginii Google Business pentru a afișa un QR de recenzii pe display.
              </p>
              <div className="flex gap-2">
                <Input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)}
                  placeholder="https://g.page/r/..." className="flex-1" />
                <Button size="sm" onClick={saveGoogleUrl} className="gap-1.5">
                  <Save className="h-4 w-4" /> Salvează
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">🔒</div>
              <div>
                <h4 className="text-sm font-semibold">Conformitate GDPR</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistemul de coadă NU stochează nume, date medicale sau informații personale.
                  Se folosesc exclusiv numere de tichet. Datele se resetează zilnic.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
