import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Package, Plus, QrCode, ArrowDownToLine, ArrowUpFromLine, History, Trash2, MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import {
  getInventoryItems, createInventoryItem, updateInventoryItem, deleteInventoryItem,
  getMovements, recordMovement,
  type InventoryItem, type InventoryMovement
} from '@/api/inventory';
import { format } from 'date-fns';

const CATEGORIES = ['general', 'piese_auto', 'echipamente', 'consumabile', 'scule', 'materiale', 'electronice'];

export default function InventoryPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [showMovement, setShowMovement] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState('all');
  const [newItem, setNewItem] = useState({ nume: '', categorie: 'general', cantitate: 0, unitate: 'buc', locatie: '', pret_unitar: 0, descriere: '' });
  const [movForm, setMovForm] = useState({ tip: 'out', cantitate: 1, motiv: '' });

  const reload = async () => {
    if (!orgId) return;
    const data = await getInventoryItems(orgId);
    setItems(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId]);

  const handleAdd = async () => {
    if (!newItem.nume || !orgId) { toast.error('Numele e obligatoriu'); return; }
    try {
      await createInventoryItem({ organization_id: orgId, ...newItem, cod_qr: `INV-${Date.now()}` });
      toast.success('Articol adăugat!');
      setShowAdd(false);
      setNewItem({ nume: '', categorie: 'general', cantitate: 0, unitate: 'buc', locatie: '', pret_unitar: 0, descriere: '' });
      reload();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteInventoryItem(id); toast.success('Șters'); reload(); } catch (e: any) { toast.error(e.message); }
  };

  const viewMovements = async (itemId: string) => {
    setSelectedItem(itemId);
    const data = await getMovements(itemId);
    setMovements(data);
  };

  const handleMovement = async () => {
    if (!selectedItem || !orgId) return;
    try {
      await recordMovement({
        organization_id: orgId,
        item_id: selectedItem,
        tip: movForm.tip,
        cantitate: movForm.cantitate,
        motiv: movForm.motiv,
        efectuat_de: user?.nume_prenume || '',
      });
      toast.success(movForm.tip === 'in' ? 'Intrare înregistrată!' : 'Ieșire înregistrată!');
      setShowMovement(false);
      setMovForm({ tip: 'out', cantitate: 1, motiv: '' });
      reload();
      viewMovements(selectedItem);
    } catch (e: any) { toast.error(e.message); }
  };

  if (!orgId) return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <Package className="h-12 w-12 text-muted-foreground/40" />
      <h2 className="text-lg font-semibold text-foreground">Inventar QR</h2>
      <p className="text-sm text-muted-foreground max-w-xs">Nu ești asociat unei organizații. Contactează administratorul pentru a fi adăugat.</p>
    </div>
  );
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const filtered = filterCat === 'all' ? items : items.filter(i => i.categorie === filterCat);
  const selItem = items.find(i => i.id === selectedItem);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" /> Inventar QR
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} articole · Valoare: {items.reduce((s, i) => s + i.cantitate * i.pret_unitar, 0).toLocaleString('ro-RO')} lei</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Adaugă</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Articol nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nume</Label><Input value={newItem.nume} onChange={e => setNewItem(p => ({ ...p, nume: e.target.value }))} placeholder="Ex: Filtru ulei BMW" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categorie</Label>
                  <Select value={newItem.categorie} onValueChange={v => setNewItem(p => ({ ...p, categorie: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c.replace('_', ' ')}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Cantitate</Label><Input type="number" value={newItem.cantitate} onChange={e => setNewItem(p => ({ ...p, cantitate: Number(e.target.value) }))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Unitate</Label><Input value={newItem.unitate} onChange={e => setNewItem(p => ({ ...p, unitate: e.target.value }))} /></div>
                <div><Label>Preț unitar (lei)</Label><Input type="number" value={newItem.pret_unitar} onChange={e => setNewItem(p => ({ ...p, pret_unitar: Number(e.target.value) }))} /></div>
              </div>
              <div><Label>Locație</Label><Input value={newItem.locatie} onChange={e => setNewItem(p => ({ ...p, locatie: e.target.value }))} placeholder="Ex: Raft A3, Depozit 2" /></div>
              <div><Label>Descriere</Label><Textarea value={newItem.descriere} onChange={e => setNewItem(p => ({ ...p, descriere: e.target.value }))} /></div>
              <Button onClick={handleAdd} className="w-full">Adaugă articol</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <Badge variant={filterCat === 'all' ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat('all')}>Toate</Badge>
        {CATEGORIES.map(c => (
          <Badge key={c} variant={filterCat === c ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFilterCat(c)}>{c.replace('_', ' ')}</Badge>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(item => (
            <Card key={item.id} className={`cursor-pointer transition-all ${selectedItem === item.id ? 'ring-2 ring-primary' : ''}`} onClick={() => viewMovements(item.id)}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{item.nume}</p>
                    <Badge variant="secondary" className="text-[10px]">{item.categorie.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.locatie && <><MapPin className="inline h-3 w-3" /> {item.locatie} · </>}
                    {item.pret_unitar > 0 && `${item.pret_unitar} lei/${item.unitate}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${item.cantitate <= 0 ? 'text-destructive' : ''}`}>{item.cantitate}</p>
                    <p className="text-[10px] text-muted-foreground">{item.unitate}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setShowQR(item.id); }}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); handleDelete(item.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun articol</p>}
        </div>

        {/* Detail / movements panel */}
        <div className="space-y-4">
          {selItem && (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{selItem.nume}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{selItem.cantitate}</p>
                    <p className="text-sm text-muted-foreground">{selItem.unitate}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="gap-1.5" variant="outline" onClick={() => { setMovForm({ tip: 'in', cantitate: 1, motiv: '' }); setShowMovement(true); }}>
                      <ArrowDownToLine className="h-4 w-4 text-green-600" /> Intrare
                    </Button>
                    <Button className="gap-1.5" variant="outline" onClick={() => { setMovForm({ tip: 'out', cantitate: 1, motiv: '' }); setShowMovement(true); }}>
                      <ArrowUpFromLine className="h-4 w-4 text-destructive" /> Ieșire
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5"><History className="h-4 w-4" /> Istoric mișcări</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="divide-y divide-border">
                    {movements.map(m => (
                      <div key={m.id} className="py-2 flex items-center justify-between">
                        <div>
                          <Badge variant={m.tip === 'in' ? 'default' : 'destructive'} className="text-[10px]">
                            {m.tip === 'in' ? '+ Intrare' : '− Ieșire'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-0.5">{m.motiv || '—'} · {m.efectuat_de}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${m.tip === 'in' ? 'text-green-600' : 'text-destructive'}`}>
                            {m.tip === 'in' ? '+' : '−'}{m.cantitate}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(m.created_at), 'dd.MM HH:mm')}</p>
                        </div>
                      </div>
                    ))}
                    {movements.length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">Nicio mișcare</p>}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={!!showQR} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader><DialogTitle>Cod QR</DialogTitle></DialogHeader>
          {showQR && (() => {
            const item = items.find(i => i.id === showQR);
            return item ? (
              <div className="space-y-3">
                <div className="flex justify-center"><QRCodeSVG value={`INV:${item.id}:${item.cod_qr}`} size={200} /></div>
                <p className="font-semibold">{item.nume}</p>
                <p className="text-sm text-muted-foreground">{item.categorie} · {item.cantitate} {item.unitate}</p>
                <p className="text-xs text-muted-foreground">{item.locatie}</p>
              </div>
            ) : null;
          })()}
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={showMovement} onOpenChange={setShowMovement}>
        <DialogContent>
          <DialogHeader><DialogTitle>{movForm.tip === 'in' ? 'Intrare stoc' : 'Ieșire stoc'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Tip</Label>
              <Select value={movForm.tip} onValueChange={v => setMovForm(p => ({ ...p, tip: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Intrare (+)</SelectItem>
                  <SelectItem value="out">Ieșire (−)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cantitate</Label><Input type="number" value={movForm.cantitate} onChange={e => setMovForm(p => ({ ...p, cantitate: Number(e.target.value) }))} /></div>
            <div><Label>Motiv</Label><Input value={movForm.motiv} onChange={e => setMovForm(p => ({ ...p, motiv: e.target.value }))} placeholder="Ex: Comandă client, Transfer depozit" /></div>
            <Button onClick={handleMovement} className="w-full">{movForm.tip === 'in' ? 'Înregistrează intrare' : 'Înregistrează ieșire'}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
