import { useState, useEffect } from 'react';
import { getSponsors, getActivePromos, getSponsorPlans } from '@/api/sponsors';
import type { Sponsor, SponsorPromo, SponsorPlan } from '@/types/sponsor';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Award, Plus, Building2, Megaphone, Monitor, MessageSquare, Layout,
  ExternalLink, Calendar, CheckCircle2, XCircle, Eye
} from 'lucide-react';

const PROMO_TYPE_LABELS: Record<SponsorPromo['tip'], { label: string; icon: React.ElementType; color: string }> = {
  card_dashboard: { label: 'Card Dashboard', icon: Layout, color: '#2ECC71' },
  infodisplay: { label: 'Infodisplay', icon: Monitor, color: '#3498DB' },
  ticker: { label: 'Ticker', icon: Megaphone, color: '#F39C12' },
  inky_popup: { label: 'Inky Popup', icon: MessageSquare, color: '#9B59B6' },
};

export default function SponsorAdmin() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [promos, setPromos] = useState<SponsorPromo[]>([]);
  const [plans, setPlans] = useState<SponsorPlan[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);

  useEffect(() => {
    Promise.all([getSponsors(), getActivePromos(), getSponsorPlans()]).then(
      ([s, p, pl]) => { setSponsors(s); setPromos(p); setPlans(pl); }
    );
  }, []);

  const sponsorPromos = selectedSponsor
    ? promos.filter(p => p.id_sponsor === selectedSponsor.id_sponsor)
    : promos;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Administrare Sponsori
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Gestionează sponsorii, promoțiile și planurile de parteneriat
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Sponsor nou
        </Button>
      </div>

      <Tabs defaultValue="sponsors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sponsors" className="gap-1.5">
            <Building2 className="h-4 w-4" />
            Sponsori
          </TabsTrigger>
          <TabsTrigger value="promos" className="gap-1.5">
            <Megaphone className="h-4 w-4" />
            Promoții
          </TabsTrigger>
          <TabsTrigger value="plans" className="gap-1.5">
            <Award className="h-4 w-4" />
            Planuri
          </TabsTrigger>
        </TabsList>

        {/* === SPONSORS TAB === */}
        <TabsContent value="sponsors" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map(sponsor => (
              <Card
                key={sponsor.id_sponsor}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSponsor?.id_sponsor === sponsor.id_sponsor ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedSponsor(
                  selectedSponsor?.id_sponsor === sponsor.id_sponsor ? null : sponsor
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5 border"
                        style={{ borderColor: `${sponsor.culoare_brand}30` }}
                      >
                        <img src={sponsor.logo_url} alt={sponsor.nume} className="h-full w-full object-contain" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{sponsor.nume}</CardTitle>
                        <Badge
                          variant={sponsor.activ ? 'default' : 'secondary'}
                          className="mt-1"
                        >
                          {sponsor.activ ? 'Activ' : 'Inactiv'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground line-clamp-2">{sponsor.descriere}</p>
                  <Separator />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {sponsor.data_start} — {sponsor.data_expirare}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{sponsor.plan}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {promos.filter(p => p.id_sponsor === sponsor.id_sponsor).map(p => {
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
            ))}

            {/* Add new sponsor card */}
            <Card className="border-dashed cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors flex items-center justify-center min-h-[200px]">
              <div className="text-center text-muted-foreground">
                <Plus className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Adaugă sponsor</p>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* === PROMOS TAB === */}
        <TabsContent value="promos" className="space-y-4">
          {selectedSponsor && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span>Filtrare: <strong>{selectedSponsor.nume}</strong></span>
              <button onClick={() => setSelectedSponsor(null)} className="ml-auto text-xs text-primary hover:underline">
                Afișează toate
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Promoție nouă
            </Button>
          </div>

          <div className="space-y-3">
            {sponsorPromos.map(promo => {
              const meta = PROMO_TYPE_LABELS[promo.tip];
              return (
                <Card key={promo.id_promo} className="overflow-hidden">
                  <div className="flex items-stretch">
                    {/* Color bar */}
                    <div className="w-1.5 shrink-0" style={{ backgroundColor: meta.color }} />

                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className="text-[10px] text-white"
                              style={{ backgroundColor: meta.color }}
                            >
                              <meta.icon className="h-3 w-3 mr-1" />
                              {meta.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{promo.sponsor_nume}</span>
                          </div>
                          <h3 className="text-sm font-semibold">{promo.titlu}</h3>
                          {promo.descriere && (
                            <p className="text-xs text-muted-foreground">{promo.descriere}</p>
                          )}
                          {promo.link_url && (
                            <a
                              href={promo.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {promo.link_url}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-xs">
                            {promo.activ ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <Switch checked={promo.activ} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          Școli: {promo.scoli_target.includes('all') ? 'Toate' : promo.scoli_target.join(', ')}
                        </span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">Prioritate: {promo.prioritate}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* === PLANS TAB === */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map(plan => (
              <Card key={plan.id_plan} className={plan.nume_plan === 'Premium' ? 'ring-2 ring-primary' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{plan.nume_plan}</CardTitle>
                    {plan.nume_plan === 'Premium' && (
                      <Badge>Popular</Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {plan.pret} <span className="text-sm font-normal text-muted-foreground">RON/lună</span>
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{plan.descriere}</p>
                  <Separator />
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {plan.include_dashboard ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                      Card pe Dashboard
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.include_infodisplay ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                      Panou Infodisplay
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.include_ticker ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                      Anunț în Ticker
                    </li>
                    <li className="flex items-center gap-2">
                      {plan.include_inky ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-muted-foreground/40" />}
                      Popup Inky
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {plan.numar_scoli === -1 ? 'Școli nelimitate' : `${plan.numar_scoli} școli`}
                    </li>
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
