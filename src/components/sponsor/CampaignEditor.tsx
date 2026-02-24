import { useState } from 'react';
import type { SponsorCampaign, SponsorStyleCard, SponsorStyleTicker, SponsorStyleInky } from '@/types/sponsor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Palette, Eye, Target, Megaphone, Layout, MessageSquare, Save } from 'lucide-react';
import CardPreview from './previews/CardPreview';
import TickerPreview from './previews/TickerPreview';
import InkyPreview from './previews/InkyPreview';

import type { School } from '@/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Partial<SponsorCampaign>;
  sponsorNume?: string;
  sponsorLogo?: string;
  sponsorCuloare?: string;
  schools?: School[];
  onSave: (data: Partial<SponsorCampaign>) => void;
}

export default function CampaignEditor({ open, onOpenChange, campaign, sponsorNume, sponsorLogo, sponsorCuloare = '#e1001a', schools = [], onSave }: Props) {
  const [form, setForm] = useState<Partial<SponsorCampaign>>({
    tip: 'card_dashboard',
    titlu: '',
    descriere: '',
    cta_text: '',
    link_url: '',
    prioritate: 1,
    scoli_target: ['all'],
    data_start_campanie: new Date().toISOString().split('T')[0],
    data_end_campanie: '',
    stil_card: { background: '', text_color: '', border_color: '', border_radius: '16px', shadow_style: '', banner_url: '' },
    stil_ticker: { bg_color: sponsorCuloare, text_color: '#ffffff', badge_bg: sponsorCuloare, badge_text: sponsorNume || 'Sponsor', glow_effect: false },
    stil_inky: { bg_color: sponsorCuloare, text_color: '#ffffff', cta_bg: '#ffffff', cta_text: sponsorCuloare, icon_color: sponsorCuloare, costume_url: '', banner_url: '' },
    ...campaign,
  });

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const updateStyle = <T extends SponsorStyleCard | SponsorStyleTicker | SponsorStyleInky>(
    styleKey: 'stil_card' | 'stil_ticker' | 'stil_inky',
    field: string,
    value: string | boolean
  ) => {
    setForm(prev => ({
      ...prev,
      [styleKey]: { ...(prev[styleKey] as T), [field]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            {campaign?.id_campanie ? 'Editare campanie' : 'Campanie nouă'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="continut" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="continut" className="gap-1 text-xs"><FileText className="h-3 w-3" />Conținut</TabsTrigger>
            <TabsTrigger value="stil_card" className="gap-1 text-xs"><Layout className="h-3 w-3" />Card</TabsTrigger>
            <TabsTrigger value="stil_ticker" className="gap-1 text-xs"><Megaphone className="h-3 w-3" />Ticker</TabsTrigger>
            <TabsTrigger value="stil_inky" className="gap-1 text-xs"><MessageSquare className="h-3 w-3" />Inky</TabsTrigger>
            <TabsTrigger value="targetare" className="gap-1 text-xs"><Target className="h-3 w-3" />Target</TabsTrigger>
          </TabsList>

          {/* === CONTINUT === */}
          <TabsContent value="continut" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tip campanie</Label>
                <Select value={form.tip} onValueChange={(v) => update('tip', v as SponsorCampaign['tip'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card_dashboard">Card Dashboard</SelectItem>
                    <SelectItem value="ticker">Ticker</SelectItem>
                    <SelectItem value="inky_popup">Inky Popup</SelectItem>
                    <SelectItem value="infodisplay">Infodisplay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Prioritate</Label>
                <Input type="number" min={1} max={10} value={form.prioritate} onChange={e => update('prioritate', Number(e.target.value))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Titlu</Label>
              <Input value={form.titlu} onChange={e => update('titlu', e.target.value)} placeholder="Titlu campanie..." />
            </div>
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Textarea value={form.descriere} onChange={e => update('descriere', e.target.value)} placeholder="Descriere campanie..." rows={3} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input value={form.cta_text} onChange={e => update('cta_text', e.target.value)} placeholder="Vezi oferta" />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={form.link_url} onChange={e => update('link_url', e.target.value)} placeholder="https://..." />
              </div>
            </div>
          </TabsContent>

          {/* === STIL CARD === */}
          <TabsContent value="stil_card" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" /> Stilizare Card</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Background CSS</Label>
                    <Input value={form.stil_card?.background || ''} onChange={e => updateStyle('stil_card', 'background', e.target.value)} placeholder="linear-gradient(...)" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare text</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.stil_card?.text_color || '#1a1a1a'} onChange={e => updateStyle('stil_card', 'text_color', e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.stil_card?.text_color || ''} onChange={e => updateStyle('stil_card', 'text_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare border</Label>
                    <Input value={form.stil_card?.border_color || ''} onChange={e => updateStyle('stil_card', 'border_color', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Border radius</Label>
                    <Input value={form.stil_card?.border_radius || '16px'} onChange={e => updateStyle('stil_card', 'border_radius', e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Shadow</Label>
                    <Input value={form.stil_card?.shadow_style || ''} onChange={e => updateStyle('stil_card', 'shadow_style', e.target.value)} placeholder="0 4px 20px rgba(...)" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Banner URL</Label>
                    <Input value={form.stil_card?.banner_url || ''} onChange={e => updateStyle('stil_card', 'banner_url', e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</h3>
                <CardPreview
                  titlu={form.titlu || 'Titlu campanie'}
                  descriere={form.descriere || 'Descriere campanie...'}
                  cta_text={form.cta_text}
                  sponsor_nume={sponsorNume}
                  sponsor_logo={sponsorLogo}
                  sponsor_culoare={sponsorCuloare}
                  stil={form.stil_card}
                />
              </div>
            </div>
          </TabsContent>

          {/* === STIL TICKER === */}
          <TabsContent value="stil_ticker" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" /> Stilizare Ticker</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare badge</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.stil_ticker?.badge_bg || sponsorCuloare} onChange={e => updateStyle('stil_ticker', 'badge_bg', e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.stil_ticker?.badge_bg || ''} onChange={e => updateStyle('stil_ticker', 'badge_bg', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Text badge</Label>
                    <Input value={form.stil_ticker?.badge_text || ''} onChange={e => updateStyle('stil_ticker', 'badge_text', e.target.value)} placeholder="Kaufland" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare text</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.stil_ticker?.text_color || '#ffffff'} onChange={e => updateStyle('stil_ticker', 'text_color', e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.stil_ticker?.text_color || ''} onChange={e => updateStyle('stil_ticker', 'text_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={form.stil_ticker?.glow_effect || false} onCheckedChange={v => updateStyle('stil_ticker', 'glow_effect', v)} />
                    <Label className="text-xs">Efect glow/pulse</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</h3>
                <TickerPreview
                  titlu={form.titlu || 'Titlu campanie...'}
                  sponsor_culoare={sponsorCuloare}
                  stil={form.stil_ticker}
                />
              </div>
            </div>
          </TabsContent>

          {/* === STIL INKY === */}
          <TabsContent value="stil_inky" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Palette className="h-4 w-4" /> Stilizare Inky</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare fundal acțiune</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.stil_inky?.bg_color || sponsorCuloare} onChange={e => updateStyle('stil_inky', 'bg_color', e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.stil_inky?.bg_color || ''} onChange={e => updateStyle('stil_inky', 'bg_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Culoare text</Label>
                    <div className="flex gap-2">
                      <input type="color" value={form.stil_inky?.text_color || '#ffffff'} onChange={e => updateStyle('stil_inky', 'text_color', e.target.value)} className="h-9 w-12 rounded border cursor-pointer" />
                      <Input value={form.stil_inky?.text_color || ''} onChange={e => updateStyle('stil_inky', 'text_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Costume URL (imagine Inky)</Label>
                    <Input value={form.stil_inky?.costume_url || ''} onChange={e => updateStyle('stil_inky', 'costume_url', e.target.value)} placeholder="https://... (Inky cu șapcă Kaufland)" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Banner URL (în popup)</Label>
                    <Input value={form.stil_inky?.banner_url || ''} onChange={e => updateStyle('stil_inky', 'banner_url', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Eye className="h-4 w-4" /> Preview</h3>
                <InkyPreview
                  titlu={form.titlu || 'Titlu campanie...'}
                  descriere={form.descriere || 'Descriere...'}
                  cta_text={form.cta_text}
                  sponsor_nume={sponsorNume}
                  sponsor_logo={sponsorLogo}
                  sponsor_culoare={sponsorCuloare}
                  stil={form.stil_inky}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="targetare" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Data start</Label>
                <Input type="date" value={form.data_start_campanie || ''} onChange={e => update('data_start_campanie', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Data sfârșit</Label>
                <Input type="date" value={form.data_end_campanie || ''} onChange={e => update('data_end_campanie', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Școli target</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.scoli_target?.includes('all') || false}
                    onChange={e => {
                      if (e.target.checked) update('scoli_target', ['all']);
                      else update('scoli_target', []);
                    }}
                    className="rounded"
                  />
                  Toate școlile
                </label>
                {!form.scoli_target?.includes('all') && schools.length > 0 && (
                  <div className="pl-4 space-y-1.5 border-l-2 border-muted ml-2">
                    {schools.map(school => (
                      <label key={school.id_scoala} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.scoli_target?.includes(school.id_scoala.toString()) || false}
                          onChange={e => {
                            const current = form.scoli_target || [];
                            if (e.target.checked) {
                              update('scoli_target', [...current, school.id_scoala.toString()]);
                            } else {
                              update('scoli_target', current.filter(s => s !== school.id_scoala.toString()));
                            }
                          }}
                          className="rounded"
                        />
                        {school.nume}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
          <Button className="gap-2" onClick={() => { onSave(form); onOpenChange(false); }}>
            <Save className="h-4 w-4" />
            Salvează
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
