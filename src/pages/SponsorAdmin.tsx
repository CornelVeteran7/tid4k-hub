import { useState, useEffect } from 'react';
import { getSponsors, getActivePromos, getSponsorPlans, getAllCampaigns, getSponsorStats } from '@/api/sponsors';
import { getSchools } from '@/api/schools';
import type { Sponsor, SponsorPromo, SponsorPlan, SponsorCampaign, SponsorStats } from '@/types/sponsor';
import type { School } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Award, Plus, ArrowLeft, Megaphone, Monitor, MessageSquare, Layout,
  ExternalLink, Calendar, CheckCircle2, XCircle, Eye, BarChart3, Play, Pause, Archive, FileEdit, Clock,
  TrendingUp, MousePointerClick, Target
} from 'lucide-react';
import CampaignEditor from '@/components/sponsor/CampaignEditor';
import { useExternalLink } from '@/contexts/ExternalLinkContext';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function SponsorAdmin() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [promos, setPromos] = useState<SponsorPromo[]>([]);
  const [plans, setPlans] = useState<SponsorPlan[]>([]);
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<SponsorCampaign> | undefined>();
  const { openLink } = useExternalLink();

  useEffect(() => {
    Promise.all([getSponsors(), getActivePromos(), getSponsorPlans(), getAllCampaigns(), getSchools()]).then(
      ([s, p, pl, c, sc]) => { setSponsors(s); setPromos(p); setPlans(pl); setCampaigns(c); setSchools(sc); }
    );
  }, []);

  // Fetch stats when sponsor selected
  useEffect(() => {
    if (selectedSponsor) {
      getSponsorStats(selectedSponsor.id).then(setStats);
    } else {
      setStats(null);
    }
  }, [selectedSponsor]);

  const openSponsorDetail = (sponsor: Sponsor) => setSelectedSponsor(sponsor);
  const goBack = () => setSelectedSponsor(null);

  const openEditor = (campaign?: Partial<SponsorCampaign>) => {
    if (!selectedSponsor) return;
    setEditingCampaign(campaign);
    setEditorOpen(true);
  };

  // Global stats
  const totalAfisari = campaigns.reduce((sum, c) => sum + c.statistici.afisari, 0);
  const totalClickuri = campaigns.reduce((sum, c) => sum + c.statistici.clickuri, 0);

  return (
    <div className="space-y-5 pb-20">
      <AnimatePresence mode="wait">
        {!selectedSponsor ? (
          <SponsorList
            key="list"
            sponsors={sponsors}
            campaigns={campaigns}
            promos={promos}
            plans={plans}
            totalAfisari={totalAfisari}
            totalClickuri={totalClickuri}
            onSelect={openSponsorDetail}
          />
        ) : (
          <SponsorDetail
            key={`detail-${selectedSponsor.id_sponsor}`}
            sponsor={selectedSponsor}
            promos={promos.filter(p => p.id_sponsor === selectedSponsor.id_sponsor)}
            campaigns={campaigns.filter(c => c.id_sponsor === selectedSponsor.id_sponsor)}
            stats={stats}
            plan={plans.find(p => p.nume_plan === selectedSponsor.plan) || null}
            schools={schools}
            onBack={goBack}
            onNewCampaign={() => openEditor()}
            onEditCampaign={(c) => openEditor(c)}
            openLink={openLink}
          />
        )}
      </AnimatePresence>

      {/* Campaign Editor */}
      {selectedSponsor && (
        <CampaignEditor
          open={editorOpen}
          onOpenChange={setEditorOpen}
          campaign={editingCampaign}
          sponsorNume={selectedSponsor.nume}
          sponsorLogo={selectedSponsor.logo_url}
          sponsorCuloare={selectedSponsor.culoare_brand}
          schools={schools}
          onSave={(data) => console.log('Save campaign:', data)}
        />
      )}
    </div>
  );
}

// ========== SPONSOR LIST VIEW ==========
function SponsorList({
  sponsors, campaigns, promos, plans, totalAfisari, totalClickuri, onSelect,
}: {
  sponsors: Sponsor[];
  campaigns: SponsorCampaign[];
  promos: SponsorPromo[];
  plans: SponsorPlan[];
  totalAfisari: number;
  totalClickuri: number;
  onSelect: (s: Sponsor) => void;
}) {
  const avgCtr = totalAfisari > 0 ? ((totalClickuri / totalAfisari) * 100).toFixed(1) : '0';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Sponsori
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Selectează un sponsor pentru a vedea detaliile complete
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Sponsor nou
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid gap-3 grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold">{sponsors.filter(s => s.activ).length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Sponsori activi</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold">{totalAfisari.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Afișări totale</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xl sm:text-2xl font-bold">{avgCtr}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">CTR mediu</p>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sponsors.map(sponsor => {
          const spCampaigns = campaigns.filter(c => c.id_sponsor === sponsor.id_sponsor);
          const spPromos = promos.filter(p => p.id_sponsor === sponsor.id_sponsor);
          const spAfisari = spCampaigns.reduce((s, c) => s + c.statistici.afisari, 0);

          return (
            <Card
              key={sponsor.id_sponsor}
              className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
              onClick={() => onSelect(sponsor)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5 border transition-colors group-hover:border-primary/40"
                      style={{ borderColor: `${sponsor.culoare_brand}30` }}
                    >
                      <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
                    </div>
                    <div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{sponsor.nume}</CardTitle>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant={sponsor.activ ? 'default' : 'secondary'} className="text-[10px]">
                          {sponsor.activ ? 'Activ' : 'Inactiv'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">{sponsor.plan}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground line-clamp-2">{sponsor.descriere}</p>
                <Separator />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{spCampaigns.length} campanii · {spPromos.length} promoții</span>
                  <span>{spAfisari.toLocaleString()} afișări</span>
                </div>
                <div className="flex gap-1">
                  {spPromos.map(p => {
                    const meta = PROMO_TYPE_LABELS[p.tip];
                    return (
                      <span
                        key={p.id_promo}
                        className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full text-white font-medium"
                        style={{ backgroundColor: meta.color }}
                        title={meta.label}
                      >
                        <meta.icon className="h-2.5 w-2.5" />
                      </span>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}

// ========== SPONSOR DETAIL VIEW ==========
function SponsorDetail({
  sponsor, promos, campaigns, stats, plan, schools, onBack, onNewCampaign, onEditCampaign, openLink,
}: {
  sponsor: Sponsor;
  promos: SponsorPromo[];
  campaigns: SponsorCampaign[];
  stats: SponsorStats | null;
  plan: SponsorPlan | null;
  schools: School[];
  onBack: () => void;
  onNewCampaign: () => void;
  onEditCampaign: (c: Partial<SponsorCampaign>) => void;
  openLink: (url: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      {/* Header with back button */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="shrink-0 mt-0.5" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 border shrink-0"
            style={{ borderColor: `${sponsor.culoare_brand}30` }}
          >
            <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-display font-bold truncate">{sponsor.nume}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={sponsor.activ ? 'default' : 'secondary'}>{sponsor.activ ? 'Activ' : 'Inactiv'}</Badge>
              <Badge variant="outline">{sponsor.plan}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {sponsor.data_start} — {sponsor.data_expirare}
              </span>
            </div>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={onNewCampaign}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Campanie nouă</span>
        </Button>
      </div>

      {/* Sponsor description */}
      <p className="text-sm text-muted-foreground ml-12">{sponsor.descriere}</p>

      {/* Stats cards */}
      {stats && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                <Eye className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total_afisari.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Afișări</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <MousePointerClick className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.total_clickuri.toLocaleString()}</p>
                <p className="text-[11px] text-muted-foreground">Click-uri</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.ctr_mediu}%</p>
                <p className="text-[11px] text-muted-foreground">CTR mediu</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                <Target className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <p className="text-lg font-bold">{stats.scoli_active}</p>
                <p className="text-[11px] text-muted-foreground">Școli active</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan info */}
      {plan && (
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Plan {plan.nume_plan}</p>
                  <p className="text-xs text-muted-foreground">{plan.descriere}</p>
                </div>
              </div>
              <p className="text-lg font-bold">{plan.pret} <span className="text-xs font-normal text-muted-foreground">RON/lună</span></p>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {plan.include_dashboard && <Badge variant="outline" className="text-[10px] gap-1"><Layout className="h-3 w-3" />Dashboard</Badge>}
              {plan.include_ticker && <Badge variant="outline" className="text-[10px] gap-1"><Megaphone className="h-3 w-3" />Ticker</Badge>}
              {plan.include_infodisplay && <Badge variant="outline" className="text-[10px] gap-1"><Monitor className="h-3 w-3" />Infodisplay</Badge>}
              {plan.include_inky && <Badge variant="outline" className="text-[10px] gap-1"><MessageSquare className="h-3 w-3" />Inky</Badge>}
              {plan.include_custom_inky && <Badge variant="outline" className="text-[10px] gap-1"><Award className="h-3 w-3" />Custom Inky</Badge>}
              <Badge variant="outline" className="text-[10px]">{plan.numar_scoli === -1 ? 'Școli nelimitate' : `${plan.numar_scoli} școli`}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Campanii ({campaigns.length})
          </h2>
        </div>
        {campaigns.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center text-muted-foreground">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nicio campanie încă</p>
              <Button size="sm" variant="outline" className="mt-3 gap-1" onClick={onNewCampaign}>
                <Plus className="h-3 w-3" />Creează prima campanie
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {campaigns.map(campaign => {
              const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
              const meta = PROMO_TYPE_LABELS[campaign.tip];
              return (
                <Card key={campaign.id_campanie} className="overflow-hidden">
                  <div className="flex items-stretch">
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="text-[10px] text-white" style={{ backgroundColor: meta.color }}>
                              <meta.icon className="h-3 w-3 mr-1" />{meta.label}
                            </Badge>
                            <Badge className={`gap-1 text-[10px] text-white ${statusCfg.color}`}>
                              <statusCfg.icon className="h-2.5 w-2.5" />{statusCfg.label}
                            </Badge>
                          </div>
                          <h3 className="text-sm font-semibold">{campaign.titlu}</h3>
                          <p className="text-xs text-muted-foreground">{campaign.data_start_campanie} → {campaign.data_end_campanie}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {campaign.scoli_target.includes('all') ? (
                              <Badge variant="outline" className="text-[10px]">Toate școlile</Badge>
                            ) : campaign.scoli_target.map(sid => {
                              const school = schools.find(s => s.id_scoala.toString() === sid);
                              return <Badge key={sid} variant="outline" className="text-[10px]">{school?.nume || `Școala ${sid}`}</Badge>;
                            })}
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0 space-y-0.5">
                          <div>{campaign.statistici.afisari.toLocaleString()} afișări</div>
                          <div>{campaign.statistici.clickuri} click-uri</div>
                          <div className="font-semibold">CTR: {campaign.statistici.ctr}%</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onEditCampaign(campaign)}>
                          <FileEdit className="h-3 w-3 mr-1" />Editează
                        </Button>
                        {campaign.status === 'activ' && (
                          <Button variant="outline" size="sm" className="text-xs h-7 text-amber-600">
                            <Pause className="h-3 w-3 mr-1" />Pauză
                          </Button>
                        )}
                        {campaign.status === 'pauza' && (
                          <Button variant="outline" size="sm" className="text-xs h-7 text-emerald-600">
                            <Play className="h-3 w-3 mr-1" />Activează
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Active promos section */}
      <div>
        <h2 className="text-base font-semibold flex items-center gap-2 mb-3">
          <Megaphone className="h-4 w-4 text-muted-foreground" />
          Promoții active ({promos.filter(p => p.activ).length})
        </h2>
        {promos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              Nicio promoție activă
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {promos.map(promo => {
              const meta = PROMO_TYPE_LABELS[promo.tip];
              return (
                <Card key={promo.id_promo} className="overflow-hidden">
                  <div className="flex items-stretch">
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: meta.color }} />
                    <div className="flex-1 p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge className="text-[10px] text-white shrink-0" style={{ backgroundColor: meta.color }}>
                          <meta.icon className="h-3 w-3 mr-1" />{meta.label}
                        </Badge>
                        <span className="text-sm font-medium truncate">{promo.titlu}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {promo.link_url && (
                          <button onClick={() => openLink(promo.link_url!)} className="text-primary hover:text-primary/80">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <Switch checked={promo.activ} />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
