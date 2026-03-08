import { useState, useEffect, useRef, useCallback } from 'react';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Heart, Play, Pause, Download, Volume2, ArrowLeft, Square } from 'lucide-react';
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

// TTS cache
const ttsCache = new Map<string, SpeechSynthesisUtterance>();

export default function Stories({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [category, setCategory] = useState('all');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newStory, setNewStory] = useState({ titlu: '', continut: '', categorie: 'educative', varsta: '3-5' });
  const [selectedCharacter, setSelectedCharacter] = useState<StoryCharacter>(storyCharacters[0]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  const canCreate = user && areRol(user.status, 'profesor');

  useEffect(() => {
    getStories().then(setStories);
  }, []);

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const filtered = category === 'all' ? stories : stories.filter(s => s.categorie === category);

  const handleCreate = async () => {
    const s = await createStory(newStory as Partial<Story>);
    setStories(prev => [...prev, s]);
    setCreateOpen(false);
    setNewStory({ titlu: '', continut: '', categorie: 'educative', varsta: '3-5' });
    toast.success('Poveste adăugată!');
  };

  const toggleFavorite = (id: string) => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, favorit: !s.favorit } : s));
  };

  // TTS Functions using browser SpeechSynthesis
  const handlePlayTTS = useCallback(() => {
    if (!selectedStory) return;

    if (isPlaying) {
      // Pause
      window.speechSynthesis.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // Check if paused (resume)
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      startProgressTracker(selectedStory.continut.length);
      return;
    }

    // New utterance — check cache first
    window.speechSynthesis.cancel();

    let utterance: SpeechSynthesisUtterance;
    if (ttsCache.has(selectedStory.id)) {
      utterance = ttsCache.get(selectedStory.id)!;
    } else {
      utterance = new SpeechSynthesisUtterance(selectedStory.continut);
      utterance.lang = 'ro-RO';
      // Try to find a Romanian voice
      const voices = window.speechSynthesis.getVoices();
      const roVoice = voices.find(v => v.lang.startsWith('ro'));
      if (roVoice) utterance.voice = roVoice;
      ttsCache.set(selectedStory.id, utterance);
    }

    utterance.rate = playbackSpeed;

    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      toast.error('TTS nu este disponibil în acest browser');
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setProgress(0);
    startProgressTracker(selectedStory.continut.length);
  }, [selectedStory, isPlaying, playbackSpeed]);

  const startProgressTracker = (totalChars: number) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    const estimatedDuration = (totalChars / 15) * 1000 / playbackSpeed; // ~15 chars/sec
    const startTime = Date.now();
    progressIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / estimatedDuration) * 100, 99);
      setProgress(pct);
      if (pct >= 99) {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      }
    }, 200);
  };

  const handleStopTTS = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Update speed on existing utterance
  useEffect(() => {
    if (utteranceRef.current) {
      utteranceRef.current.rate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Story Reader View
  if (selectedStory) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto min-w-0">
        <Button variant="ghost" className="gap-2" onClick={() => { handleStopTTS(); setSelectedStory(null); }}>
          <ArrowLeft className="h-4 w-4" /> Înapoi la povești
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary">{CATEGORIES.find(c => c.value === selectedStory.categorie)?.label}</Badge>
            <Badge className={AGE_COLORS[selectedStory.varsta]}>{selectedStory.varsta} ani</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">{selectedStory.titlu}</h1>
        </div>

        {/* Character Selector */}
        <div className="flex flex-col items-center gap-3">
          <ScrollArea className="w-full max-w-sm">
            <div className="flex items-center gap-3 px-2 pb-2">
              {storyCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className={`flex flex-col items-center gap-1 transition-transform shrink-0 ${
                    selectedCharacter.id === char.id ? 'scale-110' : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-full ${char.bgColor} flex items-center justify-center text-lg ring-2 ${
                    selectedCharacter.id === char.id ? char.color : 'ring-transparent'
                  } ring-offset-2 transition-all`}>
                    {char.emoji}
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{char.name}</span>
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
          <p className="text-sm text-muted-foreground italic text-center px-4">
            Povestită de <span className="font-semibold text-foreground">{selectedCharacter.name}</span> — {selectedCharacter.description}
          </p>
        </div>

        <Card className="glass-card">
          <CardContent className="p-5 sm:p-6 lg:p-8">
            <div className="font-serif text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
              {selectedStory.continut}
            </div>
          </CardContent>
        </Card>

        {/* Audio Player — fully wired TTS */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="outline" onClick={handlePlayTTS} className="shrink-0">
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              {isPlaying && (
                <Button size="icon" variant="ghost" onClick={handleStopTTS} className="shrink-0">
                  <Square className="h-4 w-4" />
                </Button>
              )}
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden min-w-0">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{Math.round(progress)}%</span>
              <Select value={String(playbackSpeed)} onValueChange={v => setPlaybackSpeed(Number(v))}>
                <SelectTrigger className="w-16 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3">
              <Button variant="outline" className="gap-2 w-full" size="sm" onClick={handlePlayTTS}>
                <Volume2 className="h-4 w-4" /> {isPlaying ? 'Pauză' : 'Citește Povestea (TTS)'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stories Grid
  return (
    <div className="space-y-5 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {!embedded && (
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Biblioteca de Povești</h1>
            <p className="text-muted-foreground text-sm">{stories.length} povești disponibile</p>
          </div>
        )}
        {canCreate && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm"><Plus className="h-4 w-4" /> Adaugă Poveste</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Poveste nouă</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Titlu</Label><Input value={newStory.titlu} onChange={e => setNewStory({ ...newStory, titlu: e.target.value })} /></div>
                <div><Label>Conținut</Label><Textarea value={newStory.continut} onChange={e => setNewStory({ ...newStory, continut: e.target.value })} rows={6} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categorie</Label>
                    <Select value={newStory.categorie} onValueChange={v => setNewStory({ ...newStory, categorie: v })}>
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
                    <Select value={newStory.varsta} onValueChange={v => setNewStory({ ...newStory, varsta: v })}>
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

      {/* Category filter pills */}
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === c.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(story => (
          <Card
            key={story.id}
            className="glass-card cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
            onClick={() => setSelectedStory(story)}
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs">{CATEGORIES.find(c => c.value === story.categorie)?.label}</Badge>
                  <Badge className={`text-xs ${AGE_COLORS[story.varsta]}`}>{story.varsta} ani</Badge>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); toggleFavorite(story.id); }}
                  className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Heart className={`h-4 w-4 ${story.favorit ? 'fill-destructive text-destructive' : ''}`} />
                </button>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{story.titlu}</h3>
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
