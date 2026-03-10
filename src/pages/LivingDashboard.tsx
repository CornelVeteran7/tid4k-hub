import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2, Plus, Trash2, Wallet, Home, Shield, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  getExpenses, createExpense, deleteExpense,
  getApartments, createApartment, updateApartment, deleteApartment,
  getExternalAdmins, createExternalAdmin, deleteExternalAdmin,
  type LivingExpense, type LivingApartment, type ExternalAdmin
} from '@/api/living';

const CATEGORY_LABELS: Record<string, string> = {
  utilitati: 'Utilități',
  fond_reparatii: 'Fond reparații',
  curatenie: 'Curățenie',
  administrativ: 'Administrativ',
  alte: 'Altele',
};

const CATEGORY_COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280'];

const ENTITY_LABELS: Record<string, string> = {
  primarie: 'Primărie',
  politie: 'Poliție',
  anpc: 'ANPC',
  anaf: 'ANAF',
  other: 'Altul',
};

export default function LivingDashboard() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const now = new Date();
  const [tab, setTab] = useState('expenses');
  const [expenses, setExpenses] = useState<LivingExpense[]>([]);
  const [apartments, setApartments] = useState<LivingApartment[]>([]);
  const [externalAdmins, setExternalAdmins] = useState<ExternalAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddApt, setShowAddApt] = useState(false);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: 'utilitati', description: '', amount: 0 });
  const [newApt, setNewApt] = useState({ apartment_number: '', floor: 0, owner_name: '' });
  const [newAdmin, setNewAdmin] = useState({ entity_name: '', entity_type: 'primarie' });

  const reload = async () => {
    if (!orgId) return;
    const [e, a, ea] = await Promise.all([
      getExpenses(orgId, selYear, selMonth),
      getApartments(orgId),
      getExternalAdmins(orgId),
    ]);
    setExpenses(e);
    setApartments(a);
    setExternalAdmins(ea);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId, selYear, selMonth]);

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const categoryTotals = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + Number(e.amount); return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: CATEGORY_LABELS[name] || name, value }));

  const handleAddExpense = async () => {
    if (!newExpense.amount || !orgId) return toast.error('Suma e obligatorie');
    try {
      await createExpense({ organization_id: orgId, month: selMonth, year: selYear, ...newExpense });
      toast.success('Cheltuială adăugată');
      setShowAddExpense(false);
      setNewExpense({ category: 'utilitati', description: '', amount: 0 });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddApt = async () => {
    if (!newApt.apartment_number || !orgId) return toast.error('Nr. apartament obligatoriu');
    try {
      await createApartment({ organization_id: orgId, ...newApt });
      toast.success('Apartament adăugat');
      setShowAddApt(false);
      setNewApt({ apartment_number: '', floor: 0, owner_name: '' });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.entity_name || !orgId) return toast.error('Numele entității e obligatoriu');
    try {
      await createExternalAdmin({ organization_id: orgId, ...newAdmin } as any);
      toast.success('Admin extern adăugat');
      setShowAddAdmin(false);
      setNewAdmin({ entity_name: '', entity_type: 'primarie' });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  if (!orgId) return null;

  const MONTHS = ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" /> Administrare Bloc
        </h1>
        <p className="text-sm text-muted-foreground">Cheltuieli, apartamente și administrare externă</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="expenses">Cheltuieli</TabsTrigger>
          <TabsTrigger value="apartments">Apartamente ({apartments.length})</TabsTrigger>
          <TabsTrigger value="external">Admini Externi ({externalAdmins.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={String(selMonth)} onValueChange={v => setSelMonth(Number(v))}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>{MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Input type="number" value={selYear} onChange={e => setSelYear(Number(e.target.value))} className="w-24" />
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Cheltuială</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Cheltuială nouă — {MONTHS[selMonth - 1]} {selYear}</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Categorie</Label>
                    <Select value={newExpense.category} onValueChange={v => setNewExpense(p => ({ ...p, category: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Descriere</Label><Input value={newExpense.description} onChange={e => setNewExpense(p => ({ ...p, description: e.target.value }))} /></div>
                  <div><Label>Sumă (LEI)</Label><Input type="number" value={newExpense.amount} onChange={e => setNewExpense(p => ({ ...p, amount: Number(e.target.value) }))} /></div>
                  <Button onClick={handleAddExpense} className="w-full">Adaugă</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4" /> Total {MONTHS[selMonth - 1]} {selYear}</CardTitle></CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-foreground">{totalExpenses.toLocaleString('ro')} LEI</p>
                <p className="text-xs text-muted-foreground mt-1">{expenses.length} cheltuieli înregistrate</p>
              </CardContent>
            </Card>
            {categoryTotals.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pe categorii</CardTitle></CardHeader>
                <CardContent className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryTotals} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name }) => name}>
                        {categoryTotals.map((_, i) => <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${v.toLocaleString('ro')} LEI`} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Expense list */}
          <div className="space-y-2">
            {expenses.map(e => (
              <Card key={e.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <Badge variant="secondary" className="text-[10px] mr-2">{CATEGORY_LABELS[e.category]}</Badge>
                    <span className="text-sm text-foreground">{e.description || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{Number(e.amount).toLocaleString('ro')} LEI</span>
                    <Button size="sm" variant="ghost" onClick={async () => { await deleteExpense(e.id); reload(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="apartments" className="space-y-4">
          <Dialog open={showAddApt} onOpenChange={setShowAddApt}>
            <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Apartament</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Apartament nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Nr. Apartament</Label><Input value={newApt.apartment_number} onChange={e => setNewApt(p => ({ ...p, apartment_number: e.target.value }))} /></div>
                  <div><Label>Etaj</Label><Input type="number" value={newApt.floor} onChange={e => setNewApt(p => ({ ...p, floor: Number(e.target.value) }))} /></div>
                </div>
                <div><Label>Proprietar</Label><Input value={newApt.owner_name} onChange={e => setNewApt(p => ({ ...p, owner_name: e.target.value }))} /></div>
                <Button onClick={handleAddApt} className="w-full">Adaugă</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apartments.map(a => (
              <Card key={a.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="h-4 w-4 text-primary" />
                        <span className="font-bold text-sm">Apt. {a.apartment_number}</span>
                        <Badge variant="secondary" className="text-[10px]">Et. {a.floor}</Badge>
                      </div>
                      {a.owner_name && <p className="text-xs text-muted-foreground">{a.owner_name}</p>}
                      <p className={`text-sm font-semibold mt-1 ${Number(a.balance) < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                        Sold: {Number(a.balance).toLocaleString('ro')} LEI
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={async () => { await deleteApartment(a.id); reload(); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="external" className="space-y-4">
          <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
            <DialogTrigger asChild><Button className="gap-1.5"><UserPlus className="h-4 w-4" /> Admin extern</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Admin extern nou</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Entitate</Label><Input value={newAdmin.entity_name} onChange={e => setNewAdmin(p => ({ ...p, entity_name: e.target.value }))} placeholder="Ex: Primăria Sector 3" /></div>
                <div><Label>Tip</Label>
                  <Select value={newAdmin.entity_type} onValueChange={v => setNewAdmin(p => ({ ...p, entity_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(ENTITY_LABELS).map(([k, l]) => <SelectItem key={k} value={k}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddAdmin} className="w-full">Adaugă</Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="space-y-3">
            {externalAdmins.map(ea => (
              <Card key={ea.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{ea.entity_name}</p>
                      <p className="text-xs text-muted-foreground">{ENTITY_LABELS[ea.entity_type] || ea.entity_type}</p>
                    </div>
                    {ea.can_post_announcements && <Badge variant="secondary" className="text-[10px]">Poate posta anunțuri</Badge>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={async () => { await deleteExternalAdmin(ea.id); reload(); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            {externalAdmins.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun admin extern</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
