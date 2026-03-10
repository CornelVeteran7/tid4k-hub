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
import { Switch } from '@/components/ui/switch';
import {
  Theater, Plus, Trash2, Users, Award, Radio, Eye, Settings2, GripVertical,
  ChevronRight, FileText, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  getShows, createShow, updateShow, deleteShow,
  getCast, upsertCast, deleteCast,
  getShowSponsors, upsertShowSponsor, deleteShowSponsor,
  getSurtitleBlocks, upsertSurtitleBlock, deleteSurtitleBlock,
  type CultureShow, type ShowCast, type ShowSponsor, type CultureSurtitleBlock
} from '@/api/culture';
import { useNavigate } from 'react-router-dom';

export default function CultureShowEditor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const orgId = user?.organization_id;
  const [shows, setShows] = useState<CultureShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<CultureShow | null>(null);
  const [cast, setCast] = useState<ShowCast[]>([]);
  const [sponsors, setSponsors] = useState<ShowSponsor[]>([]);
  const [blocks, setBlocks] = useState<CultureSurtitleBlock[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newShow, setNewShow] = useState({ title: '', show_date: format(new Date(), 'yyyy-MM-dd'), show_time: '19:00', duration_minutes: 120, acts: 2, language: 'ro' });
  const [activeTab, setActiveTab] = useState('details');

  const reload = async () => {
    if (!orgId) return;
    const data = await getShows(orgId);
    setShows(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId]);

  const selectShow = async (show: CultureShow) => {
    setSelected(show);
    const [c, s, b] = await Promise.all([getCast(show.id), getShowSponsors(show.id), getSurtitleBlocks(show.id)]);
    setCast(c);
    setSponsors(s);
    setBlocks(b);
  };

  const handleCreate = async () => {
    if (!newShow.title || !orgId) return toast.error('Completează titlul');
    try {
      const show = await createShow({ organization_id: orgId, ...newShow });
      toast.success('Spectacol creat!');
      setShowAddDialog(false);
      setNewShow({ title: '', show_date: format(new Date(), 'yyyy-MM-dd'), show_time: '19:00', duration_minutes: 120, acts: 2, language: 'ro' });
      reload();
      if (show) selectShow(show);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteShow(id); toast.success('Șters'); setSelected(null); reload(); } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!selected) return;
    try {
      await updateShow(selected.id, { [field]: value } as any);
      setSelected({ ...selected, [field]: value });
    } catch (e: any) { toast.error(e.message); }
  };

  // Cast handlers
  const handleAddCast = async () => {
    if (!selected) return;
    try {
      await upsertCast({ show_id: selected.id, artist_name: 'Nou artist', role_name: 'Rol', sort_order: cast.length });
      setCast(await getCast(selected.id));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteCast = async (id: string) => {
    try { await deleteCast(id); setCast(await getCast(selected!.id)); } catch (e: any) { toast.error(e.message); }
  };

  // Sponsor handlers
  const handleAddSponsor = async () => {
    if (!selected) return;
    try {
      await upsertShowSponsor({ show_id: selected.id, sponsor_name: 'Sponsor nou', tier: 'partner', sort_order: sponsors.length });
      setSponsors(await getShowSponsors(selected.id));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteSponsor = async (id: string) => {
    try { await deleteShowSponsor(id); setSponsors(await getShowSponsors(selected!.id)); } catch (e: any) { toast.error(e.message); }
  };

  // Block handlers
  const handleAddBlock = async () => {
    if (!selected) return;
    try {
      await upsertSurtitleBlock({ show_id: selected.id, sequence_number: blocks.length + 1, text_ro: '', act_number: 1, scene_number: 1 });
      setBlocks(await getSurtitleBlocks(selected.id));
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteBlock = async (id: string) => {
    try { await deleteSurtitleBlock(id); setBlocks(await getSurtitleBlocks(selected!.id)); } catch (e: any) { toast.error(e.message); }
  };

  const handleBulkPaste = async () => {
    if (!selected) return;
    const text = prompt('Lipește textul supratitrărilor (un bloc pe linie):');
    if (!text) return;
    const lines = text.split('\n').filter(l => l.trim());
    for (let i = 0; i < lines.length; i++) {
      await upsertSurtitleBlock({ show_id: selected.id, sequence_number: blocks.length + i + 1, text_ro: lines[i].trim(), act_number: 1, scene_number: 1 });
    }
    toast.success(`${lines.length} blocuri adăugate`);
    setBlocks(await getSurtitleBlocks(selected.id));
  };

  if (!orgId) return null;
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Theater className="h-6 w-6 text-primary" /> Spectacole & Supratitrare
          </h1>
          <p className="text-sm text-muted-foreground">Gestionare spectacole, distribuție, sponsori și supratitrări</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Spectacol nou</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Spectacol nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titlu</Label><Input value={newShow.title} onChange={e => setNewShow(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Carmen" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Data</Label><Input type="date" value={newShow.show_date} onChange={e => setNewShow(p => ({ ...p, show_date: e.target.value }))} /></div>
                <div><Label>Ora</Label><Input type="time" value={newShow.show_time} onChange={e => setNewShow(p => ({ ...p, show_time: e.target.value }))} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label>Durata (min)</Label><Input type="number" value={newShow.duration_minutes} onChange={e => setNewShow(p => ({ ...p, duration_minutes: Number(e.target.value) }))} /></div>
                <div><Label>Acte</Label><Input type="number" value={newShow.acts} onChange={e => setNewShow(p => ({ ...p, acts: Number(e.target.value) }))} /></div>
                <div><Label>Limba</Label>
                  <Select value={newShow.language} onValueChange={v => setNewShow(p => ({ ...p, language: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">Română</SelectItem>
                      <SelectItem value="it">Italiană</SelectItem>
                      <SelectItem value="de">Germană</SelectItem>
                      <SelectItem value="fr">Franceză</SelectItem>
                      <SelectItem value="en">Engleză</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">Creează</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Shows list */}
        <div className="space-y-2">
          {shows.map(show => (
            <Card
              key={show.id}
              className={`cursor-pointer transition-all ${selected?.id === show.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => selectShow(show)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{show.title}</p>
                  <p className="text-xs text-muted-foreground">{show.show_date} · {show.show_time?.slice(0, 5)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={show.status === 'live' ? 'destructive' : show.status === 'archived' ? 'secondary' : 'default'}>
                    {show.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); handleDelete(show.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {shows.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun spectacol</p>}
        </div>

        {/* Selected show detail */}
        {selected && (
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1.5" onClick={() => window.open(`/program/${selected.id}`, '_blank')}>
                  <FileText className="h-4 w-4" /> Program digital
                </Button>
                <Button variant="outline" className="gap-1.5" onClick={() => navigate(`/surtitle/operate/${selected.id}`)}>
                  <Settings2 className="h-4 w-4" /> Operator
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="details">Detalii</TabsTrigger>
                <TabsTrigger value="cast">Distribuție ({cast.length})</TabsTrigger>
                <TabsTrigger value="sponsors">Sponsori ({sponsors.length})</TabsTrigger>
                <TabsTrigger value="surtitles">Supratitrări ({blocks.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Status</Label>
                        <Select value={selected.status} onValueChange={v => handleUpdateField('status', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="upcoming">Viitor</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="archived">Arhivat</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>Supratitrat</Label>
                        <Switch checked={selected.has_surtitles} onCheckedChange={v => handleUpdateField('has_surtitles', v)} />
                      </div>
                    </div>
                    <div>
                      <Label>Sinopsis</Label>
                      <Textarea value={selected.synopsis} onChange={e => handleUpdateField('synopsis', e.target.value)} rows={4} placeholder="Descrierea spectacolului..." />
                    </div>
                    <div>
                      <Label>Nota regizorului</Label>
                      <Textarea value={selected.director_note} onChange={e => handleUpdateField('director_note', e.target.value)} rows={3} placeholder="Nota regizorului..." />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="cast" className="space-y-3">
                <Button variant="outline" className="gap-1.5" onClick={handleAddCast}><Plus className="h-4 w-4" /> Adaugă artist</Button>
                {cast.map(c => (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Rol</Label>
                          <Input value={c.role_name} onChange={e => { const v = e.target.value; upsertCast({ ...c, role_name: v }); setCast(prev => prev.map(x => x.id === c.id ? { ...x, role_name: v } : x)); }} />
                        </div>
                        <div>
                          <Label className="text-xs">Artist</Label>
                          <Input value={c.artist_name} onChange={e => { const v = e.target.value; upsertCast({ ...c, artist_name: v }); setCast(prev => prev.map(x => x.id === c.id ? { ...x, artist_name: v } : x)); }} />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">Bio</Label>
                          <Textarea value={c.artist_bio} onChange={e => { const v = e.target.value; upsertCast({ ...c, artist_bio: v }); setCast(prev => prev.map(x => x.id === c.id ? { ...x, artist_bio: v } : x)); }} rows={2} />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteCast(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="sponsors" className="space-y-3">
                <Button variant="outline" className="gap-1.5" onClick={handleAddSponsor}><Plus className="h-4 w-4" /> Adaugă sponsor</Button>
                {sponsors.map(s => (
                  <Card key={s.id}>
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Nume</Label>
                          <Input value={s.sponsor_name} onChange={e => { const v = e.target.value; upsertShowSponsor({ ...s, sponsor_name: v }); setSponsors(prev => prev.map(x => x.id === s.id ? { ...x, sponsor_name: v } : x)); }} />
                        </div>
                        <div>
                          <Label className="text-xs">URL</Label>
                          <Input value={s.sponsor_url} onChange={e => { const v = e.target.value; upsertShowSponsor({ ...s, sponsor_url: v }); setSponsors(prev => prev.map(x => x.id === s.id ? { ...x, sponsor_url: v } : x)); }} />
                        </div>
                        <div>
                          <Label className="text-xs">Nivel</Label>
                          <Select value={s.tier} onValueChange={v => { upsertShowSponsor({ ...s, tier: v as any }); setSponsors(prev => prev.map(x => x.id === s.id ? { ...x, tier: v as any } : x)); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="main">Principal</SelectItem>
                              <SelectItem value="partner">Partener</SelectItem>
                              <SelectItem value="media">Media</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSponsor(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="surtitles" className="space-y-3">
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-1.5" onClick={handleAddBlock}><Plus className="h-4 w-4" /> Adaugă bloc</Button>
                  <Button variant="outline" className="gap-1.5" onClick={handleBulkPaste}><Upload className="h-4 w-4" /> Import text</Button>
                </div>
                {blocks.map(block => (
                  <Card key={block.id} className="group">
                    <CardContent className="p-3 flex items-start gap-3">
                      <Badge variant="secondary" className="text-[10px] mt-1">#{block.sequence_number}</Badge>
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] text-muted-foreground">RO</Label>
                            <Textarea value={block.text_ro} rows={2} onChange={e => { const v = e.target.value; upsertSurtitleBlock({ ...block, text_ro: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, text_ro: v } : x)); }} />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">EN</Label>
                            <Textarea value={block.text_en} rows={2} onChange={e => { const v = e.target.value; upsertSurtitleBlock({ ...block, text_en: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, text_en: v } : x)); }} />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">FR</Label>
                            <Textarea value={block.text_fr} rows={2} onChange={e => { const v = e.target.value; upsertSurtitleBlock({ ...block, text_fr: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, text_fr: v } : x)); }} />
                          </div>
                          <div>
                            <Label className="text-[10px] text-muted-foreground">DE</Label>
                            <Textarea value={block.text_de} rows={2} onChange={e => { const v = e.target.value; upsertSurtitleBlock({ ...block, text_de: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, text_de: v } : x)); }} />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Input placeholder="Indicație scenă" value={block.stage_direction} className="text-xs" onChange={e => { const v = e.target.value; upsertSurtitleBlock({ ...block, stage_direction: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, stage_direction: v } : x)); }} />
                          <Input type="number" placeholder="Act" value={block.act_number} className="w-16 text-xs" onChange={e => { const v = Number(e.target.value); upsertSurtitleBlock({ ...block, act_number: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, act_number: v } : x)); }} />
                          <Input type="number" placeholder="Scenă" value={block.scene_number} className="w-16 text-xs" onChange={e => { const v = Number(e.target.value); upsertSurtitleBlock({ ...block, scene_number: v }); setBlocks(prev => prev.map(x => x.id === block.id ? { ...x, scene_number: v } : x)); }} />
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteBlock(block.id)} className="opacity-0 group-hover:opacity-100"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
