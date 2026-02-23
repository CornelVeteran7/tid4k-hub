import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { getStories, createStory } from '@/api/stories';
import { storyCharacters, type StoryCharacter } from '@/data/storyCharacters';
import type { Story } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Heart, Play, Pause, Download, Volume2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'Toate' },
  { value: 'educative', label: 'Educative' },
  { value: 'morale', label: 'Morale' },
  { value: 'distractive', label: 'Distractive' },
];

const AGE_COLORS: Record<string, string> = {
  '3-5': 'bg-success/10 text-success',
  '5-7': 'bg-accent/10 text-accent',
  '7-10': 'bg-warning/10 text-warning',
};

export default function Stories() {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [category, setCategory] = useState('all');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [newStory, setNewStory] = useState({ titlu: '', continut: '', categorie: 'educative', varsta: '3-5' });
  const [selectedCharacter, setSelectedCharacter] = useState<StoryCharacter>(storyCharacters[0]);

  const canCreate = user && areRol(user.status, 'profesor');

  useEffect(() => {
    getStories().then(setStories);
  }, []);

  const filtered = category === 'all' ? stories : stories.filter((s) => s.categorie === category);

  const handleCreate = async () => {
    const s = await createStory(newStory as Partial<Story>);
    setStories((prev) => [...prev, s]);
    setCreateOpen(false);
    setNewStory({ titlu: '', continut: '', categorie: 'educative', varsta: '3-5' });
    toast.success('Poveste adăugată!');
  };

  const toggleFavorite = (id: number) => {
    setStories((prev) => prev.map((s) => s.id_poveste === id ? { ...s, favorit: !s.favorit } : s));
  };

  // Story Reader View
  if (selectedStory) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Button variant="ghost" className="gap-2" onClick={() => setSelectedStory(null)}>
          <ArrowLeft className="h-4 w-4" /> Înapoi la povești
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{CATEGORIES.find((c) => c.value === selectedStory.categorie)?.label}</Badge>
            <Badge className={AGE_COLORS[selectedStory.varsta]}>{selectedStory.varsta} ani</Badge>
          </div>
          <h1 className="text-3xl font-serif font-bold">{selectedStory.titlu}</h1>
        </div>

        <Card>
          <CardContent className="p-6 lg:p-8">
            <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
              {selectedStory.continut}
            </div>
          </CardContent>
        </Card>

        {/* Audio Player */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button size="icon" variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: isPlaying ? '35%' : '0%' }} />
              </div>
              <Select value={String(playbackSpeed)} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
                <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
            </div>
            <div className="mt-3">
              <Button variant="outline" className="gap-2 w-full">
                <Volume2 className="h-4 w-4" /> Citește Povestea (TTS)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stories Grid
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Biblioteca de Povești</h1>
          <p className="text-muted-foreground">{stories.length} povești disponibile</p>
        </div>
        {canCreate && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Adaugă Poveste</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Poveste nouă</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Titlu</Label><Input value={newStory.titlu} onChange={(e) => setNewStory({ ...newStory, titlu: e.target.value })} /></div>
                <div><Label>Conținut</Label><Textarea value={newStory.continut} onChange={(e) => setNewStory({ ...newStory, continut: e.target.value })} rows={6} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categorie</Label>
                    <Select value={newStory.categorie} onValueChange={(v) => setNewStory({ ...newStory, categorie: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="educative">Educative</SelectItem>
                        <SelectItem value="morale">Morale</SelectItem>
                        <SelectItem value="distractive">Distractive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vârstă</Label>
                    <Select value={newStory.varsta} onValueChange={(v) => setNewStory({ ...newStory, varsta: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3-5">3-5 ani</SelectItem>
                        <SelectItem value="5-7">5-7 ani</SelectItem>
                        <SelectItem value="7-10">7-10 ani</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreate}>Adaugă</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {CATEGORIES.map((c) => (
            <TabsTrigger key={c.value} value={c.value}>{c.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((story) => (
          <Card
            key={story.id_poveste}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedStory(story)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  <Badge variant="secondary" className="text-xs">{CATEGORIES.find((c) => c.value === story.categorie)?.label}</Badge>
                  <Badge className={`text-xs ${AGE_COLORS[story.varsta]}`}>{story.varsta} ani</Badge>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(story.id_poveste); }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Heart className={`h-4 w-4 ${story.favorit ? 'fill-destructive text-destructive' : ''}`} />
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{story.titlu}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.continut.slice(0, 100)}...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
