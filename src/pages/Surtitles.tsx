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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Theater, Plus, Play, ChevronRight, ChevronLeft, Trash2, Radio, Eye, Settings2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getShows, createShow, updateShow, deleteShow,
  getBlocks, upsertBlock, deleteBlock, subscribeToShow,
  type SurtitleShow, type SurtitleBlock
} from '@/api/surtitles';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SurtitlesPage() {
  const { user } = useAuth();
  const orgId = user?.organization_id;
  const [shows, setShows] = useState<SurtitleShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState<SurtitleShow | null>(null);
  const [blocks, setBlocks] = useState<SurtitleBlock[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [newShow, setNewShow] = useState({ titlu: '', data_spectacol: format(new Date(), 'yyyy-MM-dd') });
  const [newBlock, setNewBlock] = useState({ sequence_nr: 0, text_ro: '', text_en: '', text_fr: '', nota_operator: '' });
  const [operatorMode, setOperatorMode] = useState(false);
  const [audienceMode, setAudienceMode] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en' | 'fr'>('ro');

  const reload = async () => {
    if (!orgId) return;
    const data = await getShows(orgId);
    setShows(data);
    setLoading(false);
  };

  useEffect(() => { reload(); }, [orgId]);

  const selectShow = async (show: SurtitleShow) => {
    setSelectedShow(show);
    const b = await getBlocks(show.id);
    setBlocks(b);
  };

  // Subscribe to realtime for audience mode
  useEffect(() => {
    if (!selectedShow || !audienceMode) return;
    const channel = subscribeToShow(selectedShow.id, (updated) => {
      setSelectedShow(updated);
    });
    return () => { supabase.removeChannel(channel); };
  }, [selectedShow?.id, audienceMode]);

  const handleAddShow = async () => {
    if (!newShow.titlu || !orgId) { toast.error('Completează titlul'); return; }
    try {
      const show = await createShow({ organization_id: orgId, ...newShow });
      toast.success('Spectacol creat!');
      setShowAdd(false);
      setNewShow({ titlu: '', data_spectacol: format(new Date(), 'yyyy-MM-dd') });
      reload();
      if (show) selectShow(show);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAddBlock = async () => {
    if (!selectedShow || !newBlock.text_ro) { toast.error('Completează textul RO'); return; }
    try {
      await upsertBlock({
        show_id: selectedShow.id,
        sequence_nr: newBlock.sequence_nr || blocks.length + 1,
        text_ro: newBlock.text_ro,
        text_en: newBlock.text_en,
        text_fr: newBlock.text_fr,
        nota_operator: newBlock.nota_operator,
      });
      toast.success('Bloc adăugat!');
      setShowAddBlock(false);
      setNewBlock({ sequence_nr: 0, text_ro: '', text_en: '', text_fr: '', nota_operator: '' });
      const b = await getBlocks(selectedShow.id);
      setBlocks(b);
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteBlock = async (id: string) => {
    try { await deleteBlock(id); const b = await getBlocks(selectedShow!.id); setBlocks(b); } catch (e: any) { toast.error(e.message); }
  };

  const advanceBlock = async (nr: number) => {
    if (!selectedShow) return;
    try {
      await updateShow(selectedShow.id, { current_block: nr, status: 'live' });
      setSelectedShow({ ...selectedShow, current_block: nr, status: 'live' });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteShow = async (id: string) => {
    try { await deleteShow(id); toast.success('Șters'); setSelectedShow(null); reload(); } catch (e: any) { toast.error(e.message); }
  };

  if (!orgId) return null;
  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // Audience fullscreen view
  if (audienceMode && selectedShow) {
    const currentBlock = blocks.find(b => b.sequence_nr === selectedShow.current_block);
    const getText = (b: SurtitleBlock) => lang === 'en' ? (b.text_en || b.text_ro) : lang === 'fr' ? (b.text_fr || b.text_ro) : b.text_ro;

    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <div className="absolute top-4 right-4 flex gap-2">
          <Select value={lang} onValueChange={v => setLang(v as any)}>
            <SelectTrigger className="w-20 bg-white/10 text-white border-white/20"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ro">RO</SelectItem>
              <SelectItem value="en">EN</SelectItem>
              <SelectItem value="fr">FR</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10" onClick={() => setAudienceMode(false)}>✕ Închide</Button>
        </div>
        <div className="text-center px-8 max-w-4xl">
          {currentBlock ? (
            <p className="text-4xl md:text-6xl font-bold text-white leading-tight">{getText(currentBlock)}</p>
          ) : (
            <p className="text-2xl text-white/50">Așteptare...</p>
          )}
        </div>
        <div className="absolute bottom-4 text-white/30 text-sm">
          {selectedShow.titlu} · Bloc {selectedShow.current_block}/{blocks.length} · {lang.toUpperCase()}
        </div>
      </div>
    );
  }

  // Operator mode
  if (operatorMode && selectedShow) {
    const currentIdx = blocks.findIndex(b => b.sequence_nr === selectedShow.current_block);
    const currentBlock = blocks[currentIdx];
    const prevBlock = currentIdx > 0 ? blocks[currentIdx - 1] : null;
    const nextBlock = currentIdx < blocks.length - 1 ? blocks[currentIdx + 1] : null;

    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Radio className="h-5 w-5 text-destructive animate-pulse" /> Operator: {selectedShow.titlu}
            </h1>
            <p className="text-sm text-muted-foreground">Bloc {selectedShow.current_block} din {blocks.length}</p>
          </div>
          <Button variant="outline" onClick={() => setOperatorMode(false)}>Ieși din operator</Button>
        </div>

        {/* Previous */}
        {prevBlock && (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">← Anterior (#{prevBlock.sequence_nr})</p>
              <p className="text-sm">{prevBlock.text_ro}</p>
            </CardContent>
          </Card>
        )}

        {/* Current */}
        <Card className="ring-2 ring-primary">
          <CardContent className="p-6 text-center">
            <Badge className="mb-2">ACTIV — #{selectedShow.current_block}</Badge>
            {currentBlock ? (
              <>
                <p className="text-2xl font-bold">{currentBlock.text_ro}</p>
                {currentBlock.text_en && <p className="text-lg text-muted-foreground mt-2">EN: {currentBlock.text_en}</p>}
                {currentBlock.nota_operator && <p className="text-xs text-orange-500 mt-2">📝 {currentBlock.nota_operator}</p>}
              </>
            ) : (
              <p className="text-lg text-muted-foreground">Niciun bloc selectat</p>
            )}
          </CardContent>
        </Card>

        {/* Next */}
        {nextBlock && (
          <Card className="opacity-50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Următor → (#{nextBlock.sequence_nr})</p>
              <p className="text-sm">{nextBlock.text_ro}</p>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons — BIG */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-20 text-lg font-bold gap-2"
            disabled={currentIdx <= 0}
            onClick={() => prevBlock && advanceBlock(prevBlock.sequence_nr)}
          >
            <ChevronLeft className="h-8 w-8" /> Înapoi
          </Button>
          <Button
            size="lg"
            className="h-20 text-lg font-bold gap-2"
            disabled={!nextBlock}
            onClick={() => nextBlock && advanceBlock(nextBlock.sequence_nr)}
          >
            Avansează <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Quick jump */}
        <div className="flex flex-wrap gap-1">
          {blocks.map(b => (
            <Button
              key={b.id}
              size="sm"
              variant={b.sequence_nr === selectedShow.current_block ? 'default' : 'outline'}
              onClick={() => advanceBlock(b.sequence_nr)}
            >
              {b.sequence_nr}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Theater className="h-6 w-6 text-primary" /> Supratitrare
          </h1>
          <p className="text-sm text-muted-foreground">Gestionare spectacole și subtitrări live</p>
        </div>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="h-4 w-4" /> Spectacol nou</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Spectacol nou</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Titlu</Label><Input value={newShow.titlu} onChange={e => setNewShow(p => ({ ...p, titlu: e.target.value }))} placeholder="Ex: Carmen" /></div>
              <div><Label>Data</Label><Input type="date" value={newShow.data_spectacol} onChange={e => setNewShow(p => ({ ...p, data_spectacol: e.target.value }))} /></div>
              <Button onClick={handleAddShow} className="w-full">Creează</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shows list */}
        <div className="space-y-2">
          {shows.map(show => (
            <Card
              key={show.id}
              className={`cursor-pointer transition-all ${selectedShow?.id === show.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => selectShow(show)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{show.titlu}</p>
                  <p className="text-xs text-muted-foreground">{show.data_spectacol}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={show.status === 'live' ? 'destructive' : show.status === 'terminat' ? 'secondary' : 'default'}>
                    {show.status}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); handleDeleteShow(show.id); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {shows.length === 0 && <p className="text-center py-8 text-muted-foreground">Niciun spectacol</p>}
        </div>

        {/* Selected show detail */}
        {selectedShow && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{selectedShow.titlu} — {blocks.length} blocuri</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1.5" onClick={() => setAudienceMode(true)}>
                  <Eye className="h-4 w-4" /> Audiență
                </Button>
                <Button className="gap-1.5" onClick={() => setOperatorMode(true)}>
                  <Settings2 className="h-4 w-4" /> Operator
                </Button>
              </div>
            </div>

            {/* Add block */}
            <Dialog open={showAddBlock} onOpenChange={setShowAddBlock}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-1.5"><Plus className="h-4 w-4" /> Adaugă bloc</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Bloc subtitrare nou</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Nr. secvență</Label><Input type="number" value={newBlock.sequence_nr} onChange={e => setNewBlock(p => ({ ...p, sequence_nr: Number(e.target.value) }))} /></div>
                  <div><Label>Text RO</Label><Textarea value={newBlock.text_ro} onChange={e => setNewBlock(p => ({ ...p, text_ro: e.target.value }))} /></div>
                  <div><Label>Text EN</Label><Textarea value={newBlock.text_en} onChange={e => setNewBlock(p => ({ ...p, text_en: e.target.value }))} /></div>
                  <div><Label>Text FR (opțional)</Label><Textarea value={newBlock.text_fr} onChange={e => setNewBlock(p => ({ ...p, text_fr: e.target.value }))} /></div>
                  <div><Label>Notă operator</Label><Input value={newBlock.nota_operator} onChange={e => setNewBlock(p => ({ ...p, nota_operator: e.target.value }))} placeholder="Ex: Pauză lungă după acest bloc" /></div>
                  <Button onClick={handleAddBlock} className="w-full">Adaugă bloc</Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Blocks list */}
            <div className="space-y-2">
              {blocks.map(block => (
                <Card key={block.id} className={`${selectedShow.current_block === block.sequence_nr ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                  <CardContent className="p-3 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">#{block.sequence_nr}</Badge>
                        {selectedShow.current_block === block.sequence_nr && <Badge variant="destructive" className="text-[10px]">ACTIV</Badge>}
                      </div>
                      <p className="text-sm mt-1">{block.text_ro}</p>
                      {block.text_en && <p className="text-xs text-muted-foreground">EN: {block.text_en}</p>}
                      {block.nota_operator && <p className="text-[10px] text-orange-500">📝 {block.nota_operator}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => advanceBlock(block.sequence_nr)}>
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteBlock(block.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
