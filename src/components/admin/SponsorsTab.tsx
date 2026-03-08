import { useState, useEffect } from 'react';
import { getSponsors, getActivePromos, getSponsorPlans, getAllCampaigns } from '@/api/sponsors';
import { getSchools } from '@/api/schools';
import type { Sponsor, SponsorPromo, SponsorPlan, SponsorCampaign } from '@/types/sponsor';
import type { School } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Award, Plus, Building2, Megaphone, Monitor, MessageSquare, Layout,
  ExternalLink, Calendar, CheckCircle2, XCircle, Eye, BarChart3, Play, Pause, Archive, FileEdit, Clock
} from 'lucide-react';
import CampaignEditor from '@/components/sponsor/CampaignEditor';
import { useExternalLink } from '@/contexts/ExternalLinkContext';

const PROMO_TYPE_LABELS: Record<SponsorPromo['tip'], { label: string; icon: React.ElementType; color: string }> = {
  card_dashboard: { label: 'Card Dashboard', icon: Layout, color: '#2ECC71' },
  infodisplay: { label: 'Infodisplay', icon: Monitor, color: '#3498DB' },
  ticker: { label: 'Ticker', icon: Megaphone, color: '#F39C12' },
  inky_popup: { label: 'Inky Popup', icon: MessageSquare, color: '#9B59B6' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  activ: { label: 'Activ', color: 'bg-emerald-500', icon: Play },
  pauza: { label: 'Pauză', color: 'bg-amber-500', icon: Pause },
  draft: { label: 'Draft', color: 'bg-muted-foreground', icon: FileEdit },
  expirat: { label: 'Expirat', color: 'bg-destructive', icon: Clock },
  arhivat: { label: 'Arhivat', color: 'bg-muted-foreground/50', icon: Archive },
};

export default function SponsorsTab() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [promos, setPromos] = useState<SponsorPromo[]>([]);
  const [plans, setPlans] = useState<SponsorPlan[]>([]);
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<SponsorCampaign> | undefined>();
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const { openLink } = useExternalLink();

  useEffect(() => {
    Promise.all([getSponsors(), getActivePromos(), getSponsorPlans(), getAllCampaigns(), getSchools()]).then(
      ([s, p, pl, c, sc]) => { setSponsors(s); setPromos(p); setPlans(pl); setCampaigns(c); setSchools(sc); }
    );
  }, []);

  const sponsorPromos = selectedSponsor ? promos.filter(p => p.sponsor_id === selectedSponsor.id) : promos;
  const filteredCampaigns = selectedSponsor ? campaigns.filter(c => c.sponsor_id === selectedSponsor.id) : campaigns;

  const openEditorForSponsor = (sponsor: Sponsor, campaign?: Partial<SponsorCampaign>) => {
    setEditingSponsor(sponsor);
    setEditingCampaign(campaign);
    setEditorOpen(true);
  };

  const totalAfisari = campaigns.reduce((sum, c) => sum + c.statistici.afisari, 0);
  const totalClickuri = campaigns.reduce((sum, c) => sum + c.statistici.clickuri, 0);
  const avgCtr = totalAfisari > 0 ? ((totalClickuri / totalAfisari) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{sponsors.length} sponsori activi</p>
        <Button size="sm" className="gap-1.5" onClick={() => toast.info('Funcționalitate în dezvoltare — contactează echipa Inky.')}><Plus className="h-4 w-4" />Sponsor nou</Button>
      </div>

      <Tabs defaultValue="sponsors" className="space-y-4">
        <TabsList className="flex overflow-x-auto scrollbar-hide">
          <TabsTrigger value="sponsors" className="gap-1 shrink-0 text-xs"><Building2 className="h-3.5 w-3.5" />Sponsori</TabsTrigger>
          <TabsTrigger value="promos" className="gap-1 shrink-0 text-xs"><Megaphone className="h-3.5 w-3.5" />Promoții</TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-1 shrink-0 text-xs"><BarChart3 className="h-3.5 w-3.5" />Campanii</TabsTrigger>
          <TabsTrigger value="stats" className="gap-1 shrink-0 text-xs"><Eye className="h-3.5 w-3.5" />Statistici</TabsTrigger>
          <TabsTrigger value="plans" className="gap-1 shrink-0 text-xs"><Award className="h-3.5 w-3.5" />Planuri</TabsTrigger>
        </TabsList>

        {/* SPONSORS */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {sponsors.map(sponsor => (
              <Card key={sponsor.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedSponsor?.id === sponsor.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedSponsor(selectedSponsor?.id === sponsor.id ? null : sponsor)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5 border" style={{ borderColor: `${sponsor.culoare_brand}30` }}>
                        <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{sponsor.nume}</CardTitle>
                        <Badge variant={sponsor.activ ? 'default' : 'secondary'} className="mt-1">{sponsor.activ ? 'Activ' : 'Inactiv'}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2">{sponsor.descriere}</p>
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{sponsor.data_start} — {sponsor.data_expirare}</span>
                    <Badge variant="outline" className="text-[10px]">{sponsor.plan}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PROMOS */}
        <TabsContent value="promos" className="space-y-3">
          {selectedSponsor && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" /><span>Filtrare: <strong>{selectedSponsor.nume}</strong></span>
              <button onClick={() => setSelectedSponsor(null)} className="ml-auto text-xs text-primary hover:underline">Toate</button>
            </div>
          )}
          {sponsorPromos.map(promo => {
            const meta = PROMO_TYPE_LABELS[promo.tip];
            return (
              <Card key={promo.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[10px] text-white" style={{ backgroundColor: meta.color }}><meta.icon className="h-3 w-3 mr-1" />{meta.label}</Badge>
                          <span className="text-xs text-muted-foreground">{promo.sponsor_nume}</span>
                        </div>
                        <h3 className="text-sm font-semibold">{promo.titlu}</h3>
                        {promo.link_url && <button onClick={() => openLink(promo.link_url!)} className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" />{promo.link_url}</button>}
                      </div>
                      <Switch checked={promo.activ} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* CAMPAIGNS */}
        <TabsContent value="campaigns" className="space-y-3">
          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5" onClick={() => { const sp = selectedSponsor || sponsors[0]; if (sp) openEditorForSponsor(sp); }}>
              <Plus className="h-4 w-4" />Campanie nouă
            </Button>
          </div>
          {filteredCampaigns.map(campaign => {
            const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
            const meta = PROMO_TYPE_LABELS[campaign.tip];
            const sp = sponsors.find(s => s.id === campaign.sponsor_id);
            return (
              <Card key={campaign.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: campaign.sponsor_culoare || meta.color }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="text-[10px] text-white" style={{ backgroundColor: meta.color }}><meta.icon className="h-3 w-3 mr-1" />{meta.label}</Badge>
                          <Badge className={`gap-1 text-[10px] text-white ${statusCfg.color}`}><statusCfg.icon className="h-2.5 w-2.5" />{statusCfg.label}</Badge>
                        </div>
                        <h3 className="text-sm font-semibold">{campaign.titlu}</h3>
                        <p className="text-xs text-muted-foreground">{campaign.data_start_campanie} → {campaign.data_end_campanie}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {campaign.scoli_target.includes('all') ? (
                            <Badge variant="outline" className="text-[10px]">Toate școlile</Badge>
                          ) : campaign.scoli_target.map(sid => {
                            const school = schools.find(s => s.id.toString() === sid);
                            return <Badge key={sid} variant="outline" className="text-[10px]">{school?.nume || sid}</Badge>;
                          })}
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <div>{campaign.statistici.afisari.toLocaleString()} afișări</div>
                        <div>CTR: {campaign.statistici.ctr}%</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { if (sp) openEditorForSponsor(sp, campaign); }}><FileEdit className="h-3 w-3 mr-1" />Editează</Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* STATS */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalAfisari.toLocaleString()}</p><p className="text-sm text-muted-foreground mt-1">Afișări totale</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{totalClickuri.toLocaleString()}</p><p className="text-sm text-muted-foreground mt-1">Click-uri totale</p></CardContent></Card>
            <Card><CardContent className="p-4 text-center"><p className="text-3xl font-bold">{avgCtr}%</p><p className="text-sm text-muted-foreground mt-1">CTR mediu</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Performanță per sponsor</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sponsors.map(sponsor => {
                  const spCampaigns = campaigns.filter(c => c.sponsor_id === sponsor.id);
                  const spAfisari = spCampaigns.reduce((s, c) => s + c.statistici.afisari, 0);
                  const spClickuri = spCampaigns.reduce((s, c) => s + c.statistici.clickuri, 0);
                  return (
                    <div key={sponsor.id} className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center p-1.5 border shrink-0" style={{ borderColor: `${sponsor.culoare_brand}30` }}>
                        <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{sponsor.nume}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-0.5">
                          <span>{spAfisari.toLocaleString()} afișări</span>
                          <span>{spClickuri} click-uri</span>
                        </div>
                      </div>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden shrink-0">
                        <div className="h-full rounded-full" style={{ backgroundColor: sponsor.culoare_brand, width: `${Math.min((spAfisari / Math.max(totalAfisari, 1)) * 100, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map(plan => (
              <Card key={plan.id} className={plan.nume_plan === 'Premium' ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.nume_plan}</CardTitle>
                    {plan.nume_plan === 'Premium' && <Badge>Popular</Badge>}
                  </div>
                  <p className="text-2xl font-bold">{plan.pret} <span className="text-sm font-normal text-muted-foreground">RON/lună</span></p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{plan.descriere}</p>
                  <Separator />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">{plan.include_dashboard ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}Card Dashboard</li>
                    <li className="flex items-center gap-2">{plan.include_infodisplay ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}Infodisplay</li>
                    <li className="flex items-center gap-2">{plan.include_ticker ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}Ticker</li>
                    <li className="flex items-center gap-2">{plan.include_inky ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}Inky Popup</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" />{plan.numar_scoli === -1 ? 'Nelimitat' : `${plan.numar_scoli} școli`}</li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {editingSponsor && (
        <CampaignEditor open={editorOpen} onOpenChange={setEditorOpen} campaign={editingCampaign} sponsorNume={editingSponsor.nume} sponsorLogo={editingSponsor.logo_url} sponsorCuloare={editingSponsor.culoare_brand} schools={schools} onSave={data => console.log('Save:', data)} />
      )}
    </div>
  );
}
