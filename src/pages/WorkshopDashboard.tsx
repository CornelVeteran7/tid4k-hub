import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Car, Plus, Trash2, Wrench, Calendar, Clock, Phone, User, Star
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  getVehicles, createVehicle, updateVehicle, deleteVehicle,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  type VehicleProfile, type WorkshopAppointment
} from '@/api/workshops';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-500/10 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-500/10 text-amber-700 border-amber-200',
  done: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Programat',
  in_progress: 'În lucru',
  done: 'Finalizat',
  cancelled: 'Anulat',
};

export default function WorkshopDashboard() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [tab, setTab] = useState('appointments');
  const [vehicles, setVehicles] = useState<VehicleProfile[]>([]);
  const [appointments, setAppointments] = useState<WorkshopAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddAppt, setShowAddAppt] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ nr_inmatriculare: '', marca: '', model: '', an_fabricatie: 2020, culoare: '', owner_name: '', owner_phone: '' });
  const [newAppt, setNewAppt] = useState({ client_name: '', client_phone: '', appointment_date: format(new Date(), 'yyyy-MM-dd'), time_slot: '09:00', service_description: '', assigned_mechanic: '', vehicle_profile_id: '' });

  const reloadVehicles = async () => { if (!orgId) return; setVehicles(await getVehicles(orgId)); };
  const reloadAppts = async () => {
    if (!orgId) return;
    const data = await getAppointments(orgId, selectedDate);
    setAppointments(data);
    setLoading(false);
  };

  useEffect(() => { reloadVehicles(); reloadAppts(); }, [orgId]);
  useEffect(() => { reloadAppts(); }, [selectedDate]);

  const handleAddVehicle = async () => {
    if (!newVehicle.nr_inmatriculare || !orgId) return toast.error('Nr. înmatriculare obligatoriu');
    try {
      await createVehicle({ organization_id: orgId, ...newVehicle });
      toast.success('Vehicul adăugat');
      setShowAddVehicle(false);
      setNewVehicle({ nr_inmatriculare: '', marca: '', model: '', an_fabricatie: 2020, culoare: '', owner_name: '', owner_phone: '' });
      reloadVehicles();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddAppt = async () => {
    if (!newAppt.client_name || !orgId) return toast.error('Numele clientului e obligatoriu');
    try {
      await createAppointment({
        organization_id: orgId,
        ...newAppt,
        vehicle_profile_id: newAppt.vehicle_profile_id || undefined,
      } as any);
      toast.success('Programare creată');
      setShowAddAppt(false);
      setNewAppt({ client_name: '', client_phone: '', appointment_date: format(new Date(), 'yyyy-MM-dd'), time_slot: '09:00', service_description: '', assigned_mechanic: '', vehicle_profile_id: '' });
      reloadAppts();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAppointment(id, { status: newStatus } as any);
      toast.success(`Status: ${STATUS_LABELS[newStatus]}`);
      reloadAppts();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!orgId) return null;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" /> Atelier & Programări
          </h1>
          <p className="text-sm text-muted-foreground">Vehicule, programări și lucrări</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="appointments">Programări azi</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicule ({vehicles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <div className="flex items-center gap-3">
            <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-48" />
            <Dialog open={showAddAppt} onOpenChange={setShowAddAppt}>
              <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Programare</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Programare nouă</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Client</Label><Input value={newAppt.client_name} onChange={e => setNewAppt(p => ({ ...p, client_name: e.target.value }))} /></div>
                    <div><Label>Telefon</Label><Input value={newAppt.client_phone} onChange={e => setNewAppt(p => ({ ...p, client_phone: e.target.value }))} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Data</Label><Input type="date" value={newAppt.appointment_date} onChange={e => setNewAppt(p => ({ ...p, appointment_date: e.target.value }))} /></div>
                    <div><Label>Ora</Label><Input type="time" value={newAppt.time_slot} onChange={e => setNewAppt(p => ({ ...p, time_slot: e.target.value }))} /></div>
                  </div>
                  <div><Label>Vehicul</Label>
                    <Select value={newAppt.vehicle_profile_id} onValueChange={v => setNewAppt(p => ({ ...p, vehicle_profile_id: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selectează vehicul" /></SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id}>{v.nr_inmatriculare} — {v.marca} {v.model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Lucrare</Label><Textarea value={newAppt.service_description} onChange={e => setNewAppt(p => ({ ...p, service_description: e.target.value }))} /></div>
                  <div><Label>Mecanic</Label><Input value={newAppt.assigned_mechanic} onChange={e => setNewAppt(p => ({ ...p, assigned_mechanic: e.target.value }))} /></div>
                  <Button onClick={handleAddAppt} className="w-full">Creează</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
          ) : appointments.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Nicio programare pentru {selectedDate}</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {appointments.map(appt => (
                <Card key={appt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-sm">{appt.time_slot}</span>
                          <Badge className={STATUS_COLORS[appt.status]}>{STATUS_LABELS[appt.status]}</Badge>
                        </div>
                        <p className="text-sm text-foreground"><User className="h-3 w-3 inline mr-1" />{appt.client_name}</p>
                        {appt.client_phone && <p className="text-xs text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" />{appt.client_phone}</p>}
                        <p className="text-sm text-muted-foreground">{appt.service_description}</p>
                        {appt.assigned_mechanic && <p className="text-xs text-muted-foreground"><Wrench className="h-3 w-3 inline mr-1" />{appt.assigned_mechanic}</p>}
                      </div>
                      <div className="flex gap-1.5">
                        {appt.status === 'scheduled' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(appt.id, 'in_progress')}>
                            Începe
                          </Button>
                        )}
                        {appt.status === 'in_progress' && (
                          <Button size="sm" onClick={() => handleStatusChange(appt.id, 'done')}>
                            <Star className="h-3 w-3 mr-1" /> Gata
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={async () => { await deleteAppointment(appt.id); reloadAppts(); }}>
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

        <TabsContent value="vehicles" className="space-y-4">
          <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
            <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Vehicul</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Vehicul nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nr. înmatriculare</Label><Input value={newVehicle.nr_inmatriculare} onChange={e => setNewVehicle(p => ({ ...p, nr_inmatriculare: e.target.value }))} placeholder="B 123 ABC" /></div>
                  <div><Label>Marca</Label><Input value={newVehicle.marca} onChange={e => setNewVehicle(p => ({ ...p, marca: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label>Model</Label><Input value={newVehicle.model} onChange={e => setNewVehicle(p => ({ ...p, model: e.target.value }))} /></div>
                  <div><Label>An</Label><Input type="number" value={newVehicle.an_fabricatie} onChange={e => setNewVehicle(p => ({ ...p, an_fabricatie: Number(e.target.value) }))} /></div>
                  <div><Label>Culoare</Label><Input value={newVehicle.culoare} onChange={e => setNewVehicle(p => ({ ...p, culoare: e.target.value }))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Proprietar</Label><Input value={newVehicle.owner_name} onChange={e => setNewVehicle(p => ({ ...p, owner_name: e.target.value }))} /></div>
                  <div><Label>Telefon</Label><Input value={newVehicle.owner_phone} onChange={e => setNewVehicle(p => ({ ...p, owner_phone: e.target.value }))} /></div>
                </div>
                <Button onClick={handleAddVehicle} className="w-full">Adaugă</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.map(v => (
              <Card key={v.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">{v.nr_inmatriculare}</span>
                      </div>
                      <p className="text-sm text-foreground">{v.marca} {v.model} ({v.an_fabricatie})</p>
                      {v.culoare && <p className="text-xs text-muted-foreground">Culoare: {v.culoare}</p>}
                      {v.owner_name && <p className="text-xs text-muted-foreground mt-1"><User className="h-3 w-3 inline mr-1" />{v.owner_name}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={async () => { await deleteVehicle(v.id); reloadVehicles(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
