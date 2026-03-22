import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Volume2, Save, ChevronDown, ChevronUp, Loader2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  speed: number;
}

interface CharacterRow {
  id: string;
  name: string;
  animal: string;
  emoji: string;
  description: string;
  color: string;
  bg_color: string;
  voice_description: string | null;
  voice_id: string | null;
  voice_provider: string;
  voice_settings: VoiceSettings;
  role_title: string | null;
  gender: string | null;
  vibe_style: string | null;
  focus_areas: string[] | null;
  motto: string | null;
  greeting: string | null;
  backstory: string | null;
  bio: string | null;
  micro_intro: string | null;
  team_role: string | null;
  sort_order: number;
  updated_at: string;
}

export default function CharactersTab() {
  const [characters, setCharacters] = useState<CharacterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<CharacterRow>>>({});

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const { data, error } = await supabase
      .from('story_characters')
      .select('*')
      .order('sort_order');
    if (error) {
      toast.error('Eroare la încărcare personaje');
      console.error(error);
    } else {
      setCharacters((data as unknown as CharacterRow[]) || []);
    }
    setLoading(false);
  };

  const getEdit = (id: string): CharacterRow => {
    const base = characters.find(c => c.id === id)!;
    return { ...base, ...edits[id] };
  };

  const updateField = (id: string, field: string, value: unknown) => {
    setEdits(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const updateVoiceSetting = (id: string, key: keyof VoiceSettings, value: number) => {
    const current = getEdit(id).voice_settings;
    updateField(id, 'voice_settings', { ...current, [key]: value });
  };

  const handleSave = async (id: string) => {
    const changes = edits[id];
    if (!changes || Object.keys(changes).length === 0) {
      toast.info('Nu există modificări');
      return;
    }
    setSaving(id);
    const { error } = await supabase
      .from('story_characters')
      .update({ ...changes, updated_at: new Date().toISOString() } as Record<string, unknown>)
      .eq('id', id);
    if (error) {
      toast.error('Eroare la salvare');
      console.error(error);
    } else {
      toast.success(`${getEdit(id).name} actualizat!`);
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      fetchCharacters();
    }
    setSaving(null);
  };

  const handlePreview = async (id: string) => {
    const char = getEdit(id);
    const sampleText = `Bună! Eu sunt ${char.name}, ${char.description.toLowerCase()}. Hai să descoperim împreună o poveste minunată!`;
    setPreviewingId(id);
    try {
      const { generateTTS } = await import('@/api/stories');
      const url = await generateTTS(sampleText, id, char.voice_settings.speed);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error(err);
      toast.error('Eroare la preview voce');
    }
    setPreviewingId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Personaje & Voci AI</h2>
        <p className="text-sm text-muted-foreground">Configurează personajele și setările vocale ElevenLabs. Modificările se propagă instant la toți clienții.</p>
      </div>

      {characters.map(char => {
        const c = getEdit(char.id);
        const isExpanded = expandedId === char.id;
        const hasChanges = !!edits[char.id] && Object.keys(edits[char.id]).length > 0;

        return (
          <Collapsible key={char.id} open={isExpanded} onOpenChange={() => setExpandedId(isExpanded ? null : char.id)}>
            <Card className={`transition-all ${hasChanges ? 'ring-2 ring-primary/50' : ''}`}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                    <div className={`h-10 w-10 rounded-full ${c.bg_color} flex items-center justify-center text-lg`}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        {c.name}
                        <Badge variant="secondary" className="text-xs font-normal">{c.animal}</Badge>
                        {hasChanges && <Badge className="bg-warning/15 text-warning text-xs">Nesalvat</Badge>}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.voice_id && <Badge variant="outline" className="text-xs">🎙️ {c.voice_provider}</Badge>}
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="space-y-6 pt-0">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Nume</Label>
                      <Input value={c.name} onChange={e => updateField(char.id, 'name', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Animal</Label>
                      <Input value={c.animal} onChange={e => updateField(char.id, 'animal', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Emoji</Label>
                      <Input value={c.emoji} onChange={e => updateField(char.id, 'emoji', e.target.value)} className="w-20" />
                    </div>
                    <div>
                      <Label className="text-xs">Gen</Label>
                      <Input value={c.gender || ''} onChange={e => updateField(char.id, 'gender', e.target.value)} placeholder="masculin/feminin" />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Descriere personalitate</Label>
                    <Textarea value={c.description} onChange={e => updateField(char.id, 'description', e.target.value)} rows={2} />
                  </div>

                  {/* Voice Settings */}
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <h3 className="text-sm font-semibold flex items-center gap-2">🎙️ Setări Voce ElevenLabs</h3>
                    
                    <div>
                      <Label className="text-xs">Voice ID</Label>
                      <Input value={c.voice_id || ''} onChange={e => updateField(char.id, 'voice_id', e.target.value)} placeholder="ElevenLabs Voice ID" className="font-mono text-xs" />
                    </div>

                    <div>
                      <Label className="text-xs">Descriere voce</Label>
                      <Textarea value={c.voice_description || ''} onChange={e => updateField(char.id, 'voice_description', e.target.value)} rows={2} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Stability: {c.voice_settings.stability.toFixed(2)}</Label>
                        <Slider
                          value={[c.voice_settings.stability]}
                          onValueChange={([v]) => updateVoiceSetting(char.id, 'stability', v)}
                          min={0} max={1} step={0.05}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Mai mic = mai expresiv, mai mare = mai constant</p>
                      </div>
                      <div>
                        <Label className="text-xs">Similarity Boost: {c.voice_settings.similarity_boost.toFixed(2)}</Label>
                        <Slider
                          value={[c.voice_settings.similarity_boost]}
                          onValueChange={([v]) => updateVoiceSetting(char.id, 'similarity_boost', v)}
                          min={0} max={1} step={0.05}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Cât de aproape de vocea originală</p>
                      </div>
                      <div>
                        <Label className="text-xs">Style: {c.voice_settings.style.toFixed(2)}</Label>
                        <Slider
                          value={[c.voice_settings.style]}
                          onValueChange={([v]) => updateVoiceSetting(char.id, 'style', v)}
                          min={0} max={1} step={0.05}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Exagerare stil (doar multilingual v2+)</p>
                      </div>
                      <div>
                        <Label className="text-xs">Speed: {c.voice_settings.speed.toFixed(2)}</Label>
                        <Slider
                          value={[c.voice_settings.speed]}
                          onValueChange={([v]) => updateVoiceSetting(char.id, 'speed', v)}
                          min={0.7} max={1.3} step={0.05}
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">Viteza vorbirii (0.7–1.3)</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" className="gap-2" onClick={() => handlePreview(char.id)} disabled={previewingId === char.id}>
                      {previewingId === char.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                      Preview Voce
                    </Button>
                  </div>

                  {/* Extended Profile */}
                  <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <h3 className="text-sm font-semibold">📋 Profil Extins</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Rol educațional</Label>
                        <Input value={c.role_title || ''} onChange={e => updateField(char.id, 'role_title', e.target.value)} />
                      </div>
                      <div>
                        <Label className="text-xs">Rol în echipă</Label>
                        <Input value={c.team_role || ''} onChange={e => updateField(char.id, 'team_role', e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Motto</Label>
                      <Input value={c.motto || ''} onChange={e => updateField(char.id, 'motto', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Salut</Label>
                      <Input value={c.greeting || ''} onChange={e => updateField(char.id, 'greeting', e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs">Micro-intro</Label>
                      <Textarea value={c.micro_intro || ''} onChange={e => updateField(char.id, 'micro_intro', e.target.value)} rows={2} />
                    </div>
                    <div>
                      <Label className="text-xs">Biografie</Label>
                      <Textarea value={c.bio || ''} onChange={e => updateField(char.id, 'bio', e.target.value)} rows={3} />
                    </div>
                    <div>
                      <Label className="text-xs">Backstory</Label>
                      <Textarea value={c.backstory || ''} onChange={e => updateField(char.id, 'backstory', e.target.value)} rows={3} />
                    </div>
                    <div>
                      <Label className="text-xs">Stil narativ</Label>
                      <Input value={c.vibe_style || ''} onChange={e => updateField(char.id, 'vibe_style', e.target.value)} />
                    </div>
                  </div>

                  {/* Save */}
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(char.id)} disabled={saving === char.id || !hasChanges} className="gap-2">
                      {saving === char.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvează {c.name}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
