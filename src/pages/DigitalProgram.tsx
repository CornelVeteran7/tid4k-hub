import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Theater, Clock, Globe, Music, ChevronDown, ExternalLink, Heart, Star, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  getShowById, getCast, getShowSponsors,
  type CultureShow, type ShowCast, type ShowSponsor
} from '@/api/culture';

export default function DigitalProgram() {
  const { showId } = useParams<{ showId: string }>();
  const [show, setShow] = useState<CultureShow | null>(null);
  const [cast, setCast] = useState<ShowCast[]>([]);
  const [sponsors, setSponsors] = useState<ShowSponsor[]>([]);
  const [org, setOrg] = useState<{ name: string; logo_url: string | null; primary_color: string; slug: string } | null>(null);
  const [expandedCast, setExpandedCast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    async function load() {
      const [s, c, sp] = await Promise.all([getShowById(showId!), getCast(showId!), getShowSponsors(showId!)]);
      setShow(s);
      setCast(c);
      setSponsors(sp);
      if (s?.organization_id) {
        const { data: orgData } = await supabase.from('organizations').select('name, logo_url, primary_color, slug').eq('id', s.organization_id).maybeSingle();
        if (orgData) setOrg(orgData as any);
      }
      setLoading(false);
    }
    load();
  }, [showId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!show) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Spectacol negăsit</div>;

  const mainSponsors = sponsors.filter(s => s.tier === 'main');
  const partnerSponsors = sponsors.filter(s => s.tier === 'partner');
  const mediaSponsors = sponsors.filter(s => s.tier === 'media');
  const primaryColor = org?.primary_color || '#4F46E5';
  const houseInfo = (show.house_info || {}) as Record<string, string>;

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Hero section */}
      <div className="text-center px-6 pt-8 pb-6" style={{ background: `linear-gradient(180deg, ${primaryColor}18 0%, transparent 100%)` }}>
        {org?.logo_url && <img src={org.logo_url} alt="" className="h-12 w-12 mx-auto rounded-xl object-contain mb-3" />}
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">{org?.name || ''}</p>
        <h1 className="text-3xl font-display font-bold text-foreground mb-3">{show.title}</h1>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {show.show_date} · {show.show_time?.slice(0, 5)}</span>
          <span>{show.duration_minutes} min · {show.acts} acte</span>
          <span className="flex items-center gap-1"><Globe className="h-4 w-4" /> {show.language?.toUpperCase()}</span>
        </div>
        {show.has_surtitles && (
          <Badge className="mt-3 bg-primary/10 text-primary border-primary/20">
            <Theater className="h-3 w-3 mr-1" /> Supratitrat: DA
          </Badge>
        )}
        {show.has_surtitles && (
          <div className="mt-3">
            <Button variant="outline" size="sm" asChild className="gap-1.5">
              <a href={`/surtitle/audience/${show.id}`}>
                <Theater className="h-4 w-4" /> Deschide supratitrarea
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pb-10 space-y-6">
        {/* Cast & Creatives */}
        {cast.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-primary" /> Distribuție
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {cast.map(c => (
                <Card key={c.id} className="cursor-pointer" onClick={() => setExpandedCast(expandedCast === c.id ? null : c.id)}>
                  <CardContent className="p-4">
                    {c.artist_photo_url && (
                      <img src={c.artist_photo_url} alt={c.artist_name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    )}
                    <p className="text-sm font-semibold text-foreground">{c.artist_name}</p>
                    <p className="text-xs text-primary">{c.role_name}</p>
                    {expandedCast === c.id && c.artist_bio && (
                      <p className="text-xs text-muted-foreground mt-2 animate-in fade-in">{c.artist_bio}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Synopsis */}
        {show.synopsis && (
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Sinopsis</h2>
            <Card>
              <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {show.synopsis}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Director's note */}
        {show.director_note && (
          <Collapsible>
            <CollapsibleTrigger className="flex items-center gap-2 text-lg font-display font-semibold text-foreground w-full">
              <span>Nota regizorului</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground italic leading-relaxed whitespace-pre-line">
                  {show.director_note}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="space-y-4">
            {mainSponsors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sponsori principali</h3>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {mainSponsors.map(s => (
                    <SponsorItem key={s.id} sponsor={s} />
                  ))}
                </div>
              </div>
            )}
            {partnerSponsors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parteneri</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {partnerSponsors.map(s => (
                    <SponsorItem key={s.id} sponsor={s} size="sm" />
                  ))}
                </div>
              </div>
            )}
            {mediaSponsors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Parteneri media</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {mediaSponsors.map(s => (
                    <SponsorItem key={s.id} sponsor={s} size="sm" />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* House info */}
        {Object.keys(houseInfo).length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold text-foreground mb-3">Informații sală</h2>
            <Card>
              <CardContent className="p-4 space-y-2">
                {Object.entries(houseInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-foreground font-medium">{value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        )}

        {/* CTAs */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="gap-1.5 h-12">
              <Heart className="h-4 w-4" /> Donați
            </Button>
            <Button variant="outline" className="gap-1.5 h-12">
              <Star className="h-4 w-4" /> Abonament
            </Button>
          </div>
          <Button variant="outline" className="w-full gap-1.5">
            <Star className="h-4 w-4" /> Lăsați o recenzie
          </Button>
        </section>

        <p className="text-center text-xs text-muted-foreground pt-4">
          {org?.name} · Program digital
        </p>
      </div>
    </div>
  );
}

function SponsorItem({ sponsor, size = 'md' }: { sponsor: ShowSponsor; size?: 'sm' | 'md' }) {
  const inner = (
    <div className={`flex-shrink-0 rounded-xl border border-border bg-card flex flex-col items-center justify-center ${size === 'sm' ? 'p-3 w-24' : 'p-4 w-32'}`}>
      {sponsor.sponsor_logo_url ? (
        <img src={sponsor.sponsor_logo_url} alt={sponsor.sponsor_name} className={`object-contain ${size === 'sm' ? 'h-8' : 'h-12'}`} />
      ) : (
        <span className={`font-semibold text-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{sponsor.sponsor_name}</span>
      )}
    </div>
  );
  if (sponsor.sponsor_url) {
    return <a href={sponsor.sponsor_url} target="_blank" rel="noopener noreferrer">{inner}</a>;
  }
  return inner;
}
