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
import { BookOpen, Plus, Heart, Play, Pause, Volume2, ArrowLeft, Square, Headphones, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'all', label: 'Toate' },
  { value: 'educative', label: 'Educative' },
  { value: 'morale', label: 'Morale' },
  { value: 'distractive', label: 'Distractive' },
];

const AGE_COLORS: Record<string, string> = {
  '3-4': 'bg-success/10 text-success',
  '4-5': 'bg-accent/10 text-accent',
  '5-6': 'bg-warning/10 text-warning',
  '3-5': 'bg-success/10 text-success',
  '5-7': 'bg-accent/10 text-accent',
  '7-10': 'bg-warning/10 text-warning',
};

type MediaMode = 'all' | 'read' | 'audio' | 'video';

const MEDIA_MODES: { value: MediaMode; label: string; description: string; icon: typeof BookOpen; emoji: string }[] = [
  { value: 'read', label: 'Citește', description: 'Povești scrise', icon: BookOpen, emoji: '📖' },
  { value: 'audio', label: 'Ascultă', description: 'Inky povestește', icon: Headphones, emoji: '🎧' },
  { value: 'video', label: 'Video', description: 'Povești animate', icon: Video, emoji: '🎬' },
];

// Demo video stories for when DB is empty
const DEMO_VIDEO_STORIES: Story[] = [
  {
    id: 'demo-video-1',
    titlu: 'Inky și Steaua Căzătoare',
    continut: 'Într-o noapte senină, Inky a văzut o stea căzătoare și a plecat într-o aventură magică prin pădure...',
    categorie: 'distractive',
    varsta: '3-5',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: undefined,
    media_type: 'video',
    favorit: false,
  },
  {
    id: 'demo-video-2',
    titlu: 'Vixie învață să împartă',
    continut: 'Vixie avea o comoară de mere dar niciun prieten cu care să le mănânce. A învățat că bucuria vine din a împărți...',
    categorie: 'morale',
    varsta: '3-5',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: undefined,
    media_type: 'video',
    favorit: false,
  },
  {
    id: 'demo-video-3',
    titlu: 'Nuko și Curcubeul',
    continut: 'După o ploaie de vară, Nuko a descoperit că fiecare culoare a curcubeului ascunde o lecție despre prietenie...',
    categorie: 'educative',
    varsta: '4-5',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    thumbnail: undefined,
    media_type: 'video',
    favorit: false,
  },
];

// ElevenLabs TTS audio cache (storyId:characterId → blob URL)
const elevenLabsCache = new Map<string, string>();

async function fetchElevenLabsTTS(text: string, characterId: string, speed: number): Promise<string> {
  const cacheKey = `${characterId}:${text.slice(0, 50)}:${speed}`;
  if (elevenLabsCache.has(cacheKey)) return elevenLabsCache.get(cacheKey)!;

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ text, characterId, speed }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `TTS failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  elevenLabsCache.set(cacheKey, url);
  return url;
}

export default function Stories({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [category, setCategory] = useState('all');
  const [mediaMode, setMediaMode] = useState<MediaMode>('all');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [newStory, setNewStory] = useState({ titlu: '', continut: '', categorie: 'educative', varsta: '3-4' });
  const [selectedCharacter, setSelectedCharacter] = useState<StoryCharacter>(storyCharacters[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const canCreate = user && areRol(user.status, 'profesor');

  useEffect(() => {
    getStories().then(data => {
      const dbIds = new Set(data.map(s => s.id));
      const demoToAdd = DEMO_VIDEO_STORIES.filter(d => !dbIds.has(d.id));
      setStories([...data, ...demoToAdd]);
    });
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const filtered = stories.filter(s => {
    if (category !== 'all' && s.categorie !== category) return false;
    if (mediaMode === 'read') return s.media_type !== 'video';
    if (mediaMode === 'audio') return s.media_type === 'audio' || s.media_type === 'text';
    if (mediaMode === 'video') return s.media_type === 'video';
    return true;
  });

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

  // ElevenLabs TTS Functions
  const handlePlayTTS = useCallback(async () => {
    if (!selectedStory) return;

    // If currently playing, pause
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    // If paused with existing audio, resume
    if (audioRef.current && audioRef.current.paused && audioRef.current.currentTime > 0) {
      audioRef.current.play();
      setIsPlaying(true);
      startProgressFromAudio();
      return;
    }

    // Generate new TTS
    setIsLoadingTTS(true);
    try {
      const audioUrl = await fetchElevenLabsTTS(
        selectedStory.continut,
        selectedCharacter.id,
        playbackSpeed
      );
      const audio = new Audio(audioUrl);
      audio.playbackRate = 1; // Speed is baked into the ElevenLabs request
      
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(100);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
      
      audio.onerror = () => {
        setIsPlaying(false);
        setProgress(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        toast.error('Eroare la redarea audio');
      };

      audioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
      setProgress(0);
      startProgressFromAudio();
    } catch (err) {
      console.error('TTS error:', err);
      // Fallback to browser SpeechSynthesis
      toast.info('Se folosește vocea browser-ului ca alternativă...');
      fallbackBrowserTTS();
    } finally {
      setIsLoadingTTS(false);
    }
  }, [selectedStory, isPlaying, playbackSpeed, selectedCharacter]);

  const startProgressFromAudio = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      if (audioRef.current && audioRef.current.duration) {
        const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(pct);
        if (pct >= 100) {
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }
    }, 200);
  };

  const fallbackBrowserTTS = () => {
    if (!selectedStory) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(selectedStory.continut);
    utterance.lang = 'ro-RO';
    utterance.rate = playbackSpeed;
    const voices = window.speechSynthesis.getVoices();
    const roVoice = voices.find(v => v.lang.startsWith('ro'));
    if (roVoice) utterance.voice = roVoice;
    utterance.onend = () => { setIsPlaying(false); setProgress(100); };
    utterance.onerror = () => { setIsPlaying(false); setProgress(0); toast.error('TTS indisponibil'); };
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setProgress(0);
    // Estimate progress for browser TTS
    const estimatedDuration = (selectedStory.continut.length / 15) * 1000 / playbackSpeed;
    const startTime = Date.now();
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = window.setInterval(() => {
      const pct = Math.min(((Date.now() - startTime) / estimatedDuration) * 100, 99);
      setProgress(pct);
    }, 200);
  };

  const handleStopTTS = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Get media badge for story cards
  const getMediaBadge = (story: Story) => {
    if (story.media_type === 'video') return { icon: Video, label: 'Video', className: 'bg-destructive/10 text-destructive' };
    if (story.media_type === 'audio') return { icon: Headphones, label: 'Audio', className: 'bg-accent/10 text-accent-foreground' };
    return { icon: BookOpen, label: 'Text', className: 'bg-primary/10 text-primary' };
  };

  // Video Player View
  if (selectedStory && selectedStory.media_type === 'video') {
    return (
      <div className="space-y-5 max-w-3xl mx-auto min-w-0">
        <Button variant="ghost" className="gap-2" onClick={() => setSelectedStory(null)}>
          <ArrowLeft className="h-4 w-4" /> Înapoi la povești
        </Button>

        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="secondary">{CATEGORIES.find(c => c.value === selectedStory.categorie)?.label}</Badge>
            <Badge className={AGE_COLORS[selectedStory.varsta]}>{selectedStory.varsta} ani</Badge>
            <Badge className="bg-destructive/10 text-destructive gap-1">
              <Video className="h-3 w-3" /> Video
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold">{selectedStory.titlu}</h1>
        </div>

        {/* Character narrator overlay */}
        <div className="flex items-center gap-3 px-1">
          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-lg">
            🦉
          </div>
          <p className="text-sm text-muted-foreground italic">
            Povestită de <span className="font-semibold text-foreground">Inky</span> și prietenii
          </p>
        </div>

        {/* Video Player */}
        <Card className="glass-card overflow-hidden">
          <div className="relative bg-black rounded-t-lg">
            <video
              ref={videoRef}
              src={selectedStory.video_url}
              controls
              playsInline
              poster={selectedStory.thumbnail}
              className="w-full aspect-video"
            />
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{selectedStory.continut}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Story Reader View (text + audio)
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

        {/* Audio Player — ElevenLabs TTS */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Button size="icon" variant="outline" onClick={handlePlayTTS} disabled={isLoadingTTS} className="shrink-0">
                {isLoadingTTS ? <Loader2 className="h-4 w-4 animate-spin" /> : isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              {(isPlaying || progress > 0) && (
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
                  <SelectItem value="0.8">0.8x</SelectItem>
                  <SelectItem value="0.9">0.9x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.1">1.1x</SelectItem>
                  <SelectItem value="1.2">1.2x</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3">
              <Button variant="outline" className="gap-2 w-full" size="sm" onClick={handlePlayTTS} disabled={isLoadingTTS}>
                {isLoadingTTS ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Se generează vocea...</>
                ) : (
                  <><Volume2 className="h-4 w-4" /> {isPlaying ? 'Pauză' : `${selectedCharacter.name} citește povestea`}</>
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Voce generată de ElevenLabs • Personaj: {selectedCharacter.name}
            </p>
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
                        <SelectItem value="3-4">3-4 ani</SelectItem>
                        <SelectItem value="4-5">4-5 ani</SelectItem>
                        <SelectItem value="5-6">5-6 ani</SelectItem>
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

      {/* Media Mode Filter */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {MEDIA_MODES.map(mode => {
          const Icon = mode.icon;
          const isActive = mediaMode === mode.value;
          return (
            <button
              key={mode.value}
              onClick={() => setMediaMode(prev => prev === mode.value ? 'all' : mode.value)}
              className={`relative flex flex-col items-center gap-1.5 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                isActive
                  ? 'border-primary bg-primary/5 scale-[1.02] shadow-md'
                  : 'border-border bg-card hover:border-primary/30 hover:bg-muted/50'
              }`}
            >
              <div className={`flex items-center gap-1.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <span className="text-lg">{mode.emoji}</span>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className={`text-xs sm:text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                {mode.label}
              </span>
              <span className="text-[10px] sm:text-xs text-muted-foreground leading-tight text-center">
                {mode.description}
              </span>
              {isActive && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-[8px] text-primary-foreground">✓</span>
                </div>
              )}
            </button>
          );
        })}
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">Nicio poveste în această categorie.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(story => {
          const mediaBadge = getMediaBadge(story);
          const MediaIcon = mediaBadge.icon;
          return (
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
                    <Badge className={`text-xs gap-1 ${mediaBadge.className}`}>
                      <MediaIcon className="h-3 w-3" />
                      {mediaBadge.label}
                    </Badge>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(story.id); }}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Heart className={`h-4 w-4 ${story.favorit ? 'fill-destructive text-destructive' : ''}`} />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    story.media_type === 'video' ? 'bg-destructive/10' : 'bg-primary/10'
                  }`}>
                    {story.media_type === 'video'
                      ? <Video className="h-5 w-5 text-destructive" />
                      : <BookOpen className="h-5 w-5 text-primary" />
                    }
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{story.titlu}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{story.continut.slice(0, 100)}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
