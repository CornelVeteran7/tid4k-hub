import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSponsor, getSponsorCampaigns, getSponsorStats, getSponsorPlans } from '@/api/sponsors';
import type { Sponsor, SponsorCampaign, SponsorStats, SponsorPlan } from '@/types/sponsor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import {
  Eye, MousePointerClick, TrendingUp, School, Plus, ChevronDown,
  Play, Pause, Archive, FileEdit, BarChart3, ArrowUpCircle, Layout,
  Megaphone, MessageSquare, Monitor, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import CampaignEditor from '@/components/sponsor/CampaignEditor';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  activ: { label: 'Activ', color: 'bg-emerald-500', icon: Play },
  pauza: { label: 'Pauză', color: 'bg-amber-500', icon: Pause },
  draft: { label: 'Draft', color: 'bg-muted-foreground', icon: FileEdit },
  expirat: { label: 'Expirat', color: 'bg-destructive', icon: Clock },
  arhivat: { label: 'Arhivat', color: 'bg-muted-foreground/50', icon: Archive },
};

const TIP_ICONS: Record<string, React.ElementType> = {
  card_dashboard: Layout,
  ticker: Megaphone,
  inky_popup: MessageSquare,
  infodisplay: Monitor,
};

export default function SponsorDashboard() {
  const { user } = useAuth();
  // Mock: use sponsor ID 1 (Kaufland) for demo
  const sponsorId = 'demo-sponsor-1';

  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [campaigns, setCampaigns] = useState<SponsorCampaign[]>([]);
  const [stats, setStats] = useState<SponsorStats | null>(null);
  const [plans, setPlans] = useState<SponsorPlan[]>([]);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Partial<SponsorCampaign> | undefined>();

  useEffect(() => {
    Promise.all([
      getSponsor(sponsorId),
      getSponsorCampaigns(sponsorId),
      getSponsorStats(sponsorId),
      getSponsorPlans(),
    ]).then(([s, c, st, pl]) => {
      setSponsor(s);
      setCampaigns(c);
      setStats(st);
      setPlans(pl);
    });
  }, []);

  if (!sponsor || !stats) return null;

  const activeCampaigns = campaigns.filter(c => ['activ', 'pauza', 'draft'].includes(c.status));
  const archivedCampaigns = campaigns.filter(c => ['arhivat', 'expirat'].includes(c.status));
  const currentPlan = plans.find(p => p.nume_plan === sponsor.plan);

  const statCards = [
    { icon: Eye, label: 'Afișări totale', value: stats.total_afisari.toLocaleString(), color: 'text-blue-600' },
    { icon: MousePointerClick, label: 'Click-uri', value: stats.total_clickuri.toLocaleString(), color: 'text-emerald-600' },
    { icon: TrendingUp, label: 'CTR mediu', value: `${stats.ctr_mediu}%`, color: 'text-amber-600' },
    { icon: School, label: 'Școli active', value: stats.scoli_active.toString(), color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-xl bg-white shadow-sm flex items-center justify-center p-2 border"
            style={{ borderColor: `${sponsor.culoare_brand}30` }}
          >
            <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard {sponsor.nume}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge style={{ backgroundColor: sponsor.culoare_brand, color: '#fff' }}>{sponsor.plan}</Badge>
              {currentPlan && (
                <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                  <ArrowUpCircle className="h-3 w-3" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
        <Button className="gap-2" onClick={() => { setEditingCampaign(undefined); setEditorOpen(true); }}>
          <Plus className="h-4 w-4" />
          Campanie nouă
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Campaigns */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Campanii active
          </h2>
          <Badge variant="secondary">{activeCampaigns.length}</Badge>
        </div>

        <div className="space-y-3">
          {activeCampaigns.map(campaign => {
            const statusCfg = STATUS_CONFIG[campaign.status];
            const TipIcon = TIP_ICONS[campaign.tip] || Layout;
            return (
              <Card key={campaign.id} className="overflow-hidden">
                <div className="flex items-stretch">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: sponsor.culoare_brand }} />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            <TipIcon className="h-3 w-3" />
                            {campaign.tip.replace('_', ' ')}
                          </Badge>
                          <Badge className={`gap-1 text-[10px] text-white ${statusCfg.color}`}>
                            <statusCfg.icon className="h-2.5 w-2.5" />
                            {statusCfg.label}
                          </Badge>
                        </div>
                        <h3 className="text-sm font-semibold">{campaign.titlu}</h3>
                        <p className="text-xs text-muted-foreground">
                          {campaign.data_start_campanie} → {campaign.data_end_campanie}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-xs text-muted-foreground space-y-0.5">
                          <div>{campaign.statistici.afisari.toLocaleString()} afișări</div>
                          <div>{campaign.statistici.clickuri} click-uri</div>
                        </div>
                        <Switch checked={campaign.status === 'activ'} />
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => { setEditingCampaign(campaign); setEditorOpen(true); }}>
                        <FileEdit className="h-3 w-3 mr-1" />
                        Editează
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Archived Campaigns */}
      {archivedCampaigns.length > 0 && (
        <Collapsible open={archiveOpen} onOpenChange={setArchiveOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-full">
            <Archive className="h-4 w-4" />
            Campanii arhivate ({archivedCampaigns.length})
            <ChevronDown className={`h-4 w-4 transition-transform ${archiveOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {archivedCampaigns.map(campaign => (
              <Card key={campaign.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">{campaign.titlu}</h3>
                      <p className="text-xs text-muted-foreground">
                        {campaign.data_start_campanie} → {campaign.data_end_campanie}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>{campaign.statistici.afisari.toLocaleString()} afișări</div>
                      <div>CTR: {campaign.statistici.ctr}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Campaign Editor Dialog */}
      <CampaignEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        campaign={editingCampaign}
        sponsorNume={sponsor.nume}
        sponsorLogo={sponsor.logo_url}
        sponsorCuloare={sponsor.culoare_brand}
        onSave={(data) => console.log('Save campaign:', data)}
      />
    </div>
  );
}
