import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Send, Paintbrush, Clock, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { School } from '@/types';
import { getWorkshops, createWorkshop, updateWorkshop, deleteWorkshop, publishWorkshop, getCategoryLabel } from '@/api/workshops';
import type { Workshop, WorkshopCreate } from '@/api/workshops';

interface WorkshopsTabProps {
  schoolId: string;
  schools: School[];
}

const CATEGORIES: Workshop['categorie'][] = ['arta', 'stiinta', 'muzica', 'sport', 'natura'];

const CATEGORY_COLORS: Record<Workshop['categorie'], string> = {
  arta: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  stiinta: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  muzica: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  sport: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  natura: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

const emptyForm: WorkshopCreate = {
  titlu: '',
  descriere: '',
  luna: new Date().toISOString().slice(0, 7),
  imagine_url: '',
  categorie: 'arta',
  materiale: [],
  instructor: '',
  durata_minute: 45,
  scoli_target: ['all'],
};

export default function WorkshopsTab({ schoolId, schools }: WorkshopsTabProps) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkshopCreate>({ ...emptyForm });
  const [materialeText, setMaterialeText] = useState('');
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishTarget, setPublishTarget] = useState<{ id: string; target: string }>({ id: '', target: 'all' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getWorkshops(schoolId);
      setWorkshops(data);
    } catch { toast.error('Eroare la încărcarea atelierelor'); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [schoolId]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, scoli_target: schoolId === 'all' ? ['all'] : [schoolId] });
    setMaterialeText('');
    setDialogOpen(true);
  };

  const openEdit = (w: Workshop) => {
    setEditingId(w.id_atelier);
    setForm({
      titlu: w.titlu,
      descriere: w.descriere,
      luna: w.luna,
      imagine_url: w.imagine_url,
      categorie: w.categorie,
      materiale: w.materiale,
      instructor: w.instructor,
      durata_minute: w.durata_minute,
      scoli_target: w.scoli_target,
    });
    setMaterialeText(w.materiale.join(', '));
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titlu.trim()) { toast.error('Titlul este obligatoriu'); return; }
    const data = { ...form, materiale: materialeText.split(',').map(s => s.trim()).filter(Boolean) };
    try {
      if (editingId) {
        await updateWorkshop(editingId, data);
        toast.success('Atelier actualizat');
      } else {
        await createWorkshop(data);
        toast.success('Atelier creat');
      }
      setDialogOpen(false);
      fetchData();
    } catch { toast.error('Eroare la salvare'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkshop(id);
      toast.success('Atelier șters');
      fetchData();
    } catch { toast.error('Eroare la ștergere'); }
  };

  const handlePublish = async () => {
    try {
      const target = publishTarget.target === 'all' ? ['all'] : [publishTarget.target];
      await publishWorkshop(publishTarget.id, target);
      toast.success('Atelier publicat și trimis către unități!');
      setPublishDialogOpen(false);
      fetchData();
    } catch { toast.error('Eroare la publicare'); }
  };

  const getSchoolNames = (targets: string[]) => {
    if (targets.includes('all')) return 'Toate unitățile';
    return targets.map(id => schools.find(s => s.id.toString() === id)?.nume || id).join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Paintbrush className="h-5 w-5 text-primary" />
            Ateliere
          </h2>
          <p className="text-sm text-muted-foreground">Creează și publică ateliere pentru unități</p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Atelier nou
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Se încarcă...</div>
      ) : workshops.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Paintbrush className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground">Niciun atelier. Creează primul!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {workshops.map(w => (
            <Card key={w.id_atelier} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{w.titlu}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={CATEGORY_COLORS[w.categorie]}>
                        {getCategoryLabel(w.categorie)}
                      </Badge>
                      <Badge variant={w.publicat ? 'default' : 'secondary'}>
                        {w.publicat ? 'Publicat' : 'Draft'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{w.luna}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{w.descriere}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" />{w.instructor}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.durata_minute} min</span>
                </div>
                <p className="text-xs text-muted-foreground">📍 {getSchoolNames(w.scoli_target)}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => openEdit(w)}>
                    <Pencil className="h-3 w-3" /> Editează
                  </Button>
                  {!w.publicat && (
                    <Button
                      size="sm"
                      className="gap-1"
                      onClick={() => {
                        setPublishTarget({ id: w.id_atelier, target: schoolId });
                        setPublishDialogOpen(true);
                      }}
                    >
                      <Send className="h-3 w-3" /> Publică
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive ml-auto">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ștergi atelierul?</AlertDialogTitle>
                        <AlertDialogDescription>Acțiunea este ireversibilă.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Anulează</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(w.id_atelier)}>Șterge</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editează atelier' : 'Atelier nou'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Titlu *</Label>
              <Input value={form.titlu} onChange={e => setForm(f => ({ ...f, titlu: e.target.value }))} />
            </div>
            <div>
              <Label>Descriere</Label>
              <Textarea value={form.descriere} onChange={e => setForm(f => ({ ...f, descriere: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Categorie</Label>
                <Select value={form.categorie} onValueChange={v => setForm(f => ({ ...f, categorie: v as Workshop['categorie'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{getCategoryLabel(c)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Luna (YYYY-MM)</Label>
                <Input type="month" value={form.luna} onChange={e => setForm(f => ({ ...f, luna: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Instructor</Label>
                <Input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} />
              </div>
              <div>
                <Label>Durată (minute)</Label>
                <Input type="number" value={form.durata_minute} onChange={e => setForm(f => ({ ...f, durata_minute: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label>Materiale (separate prin virgulă)</Label>
              <Input value={materialeText} onChange={e => setMaterialeText(e.target.value)} placeholder="Pensule, Vopsele, Hârtie" />
            </div>
            <div>
              <Label>Destinație</Label>
              <Select value={form.scoli_target[0] || 'all'} onValueChange={v => setForm(f => ({ ...f, scoli_target: [v] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate unitățile</SelectItem>
                  {schools.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nume}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anulează</Button>
            <Button onClick={handleSave}>{editingId ? 'Salvează' : 'Creează'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publică atelierul?</AlertDialogTitle>
            <AlertDialogDescription>
              Atelierul va fi vizibil pe dashboard-ul profesorilor și se vor trimite notificări.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label>Trimite către</Label>
            <Select value={publishTarget.target} onValueChange={v => setPublishTarget(p => ({ ...p, target: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate unitățile ({schools.length})</SelectItem>
                {schools.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.nume}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publică și notifică</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
