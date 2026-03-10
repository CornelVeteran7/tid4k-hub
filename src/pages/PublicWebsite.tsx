import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, FileText, Users, Phone, MapPin, Calendar, Image, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface WebsiteData {
  org: {
    id: string;
    name: string;
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    address: string | null;
    contact_info: any;
    vertical_type: string;
  };
  config: {
    is_published: boolean;
    pages_enabled: string[];
    hero_title: string;
    hero_subtitle: string;
    template: string;
  };
  announcements: any[];
  documents: any[];
}

export default function PublicWebsite() {
  const { orgSlug } = useParams();
  const [data, setData] = useState<WebsiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!orgSlug) return;
    loadData();
  }, [orgSlug]);

  const loadData = async () => {
    // Try slug first, then id
    let orgQuery = supabase.from('organizations').select('*').eq('slug', orgSlug).maybeSingle();
    let { data: org } = await orgQuery;
    if (!org) {
      const { data: orgById } = await supabase.from('organizations').select('*').eq('id', orgSlug).maybeSingle();
      org = orgById;
    }
    if (!org) { setLoading(false); return; }

    const { data: config } = await supabase
      .from('website_config')
      .select('*')
      .eq('organization_id', org.id)
      .eq('is_published', true)
      .maybeSingle() as any;

    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: documents } = await supabase
      .from('documents')
      .select('*')
      .eq('organization_id', org.id)
      .order('created_at', { ascending: false })
      .limit(20);

    setData({
      org,
      config: config || { is_published: false, pages_enabled: ['home'], hero_title: '', hero_subtitle: '', template: org.vertical_type },
      announcements: announcements || [],
      documents: documents || [],
    });
    setLoading(false);
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );

  if (!data || !data.config.is_published) return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Website indisponibil</h1>
        <p className="text-muted-foreground">Acest website nu este publicat sau nu există.</p>
      </div>
    </div>
  );

  const { org, config, announcements, documents } = data;
  const primaryColor = org.primary_color || 'hsl(var(--primary))';
  const pages = config.pages_enabled || [];

  const NAV_ITEMS = [
    { key: 'home', label: 'Acasă', icon: MapPin },
    pages.includes('announcements') && { key: 'announcements', label: 'Anunțuri', icon: Megaphone },
    pages.includes('gallery') && { key: 'gallery', label: 'Galerie', icon: Image },
    pages.includes('documents') && { key: 'documents', label: 'Documente', icon: FileText },
    pages.includes('schedule') && { key: 'schedule', label: 'Program', icon: Calendar },
    pages.includes('team') && { key: 'team', label: 'Echipă', icon: Users },
    pages.includes('contact') && { key: 'contact', label: 'Contact', icon: Phone },
  ].filter(Boolean) as { key: string; label: string; icon: any }[];

  return (
    <div className="min-h-screen bg-background">
      {/* SEO meta */}
      <title>{org.name}</title>
      <meta name="description" content={config.hero_subtitle || `Website ${org.name}`} />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {org.logo_url && <img src={org.logo_url} alt={org.name} className="h-8 w-8 rounded-lg object-contain" />}
            <span className="font-display font-bold text-foreground text-sm">{org.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? 'default' : 'ghost'}
                size="sm"
                className="text-xs"
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden overflow-x-auto scrollbar-hide border-t">
          <div className="flex px-2 py-1 gap-1">
            {NAV_ITEMS.map(item => (
              <Button
                key={item.key}
                variant={activeSection === item.key ? 'default' : 'ghost'}
                size="sm"
                className="text-[10px] shrink-0"
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* HOME */}
        {activeSection === 'home' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-8 md:p-12 text-center" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${org.secondary_color || primaryColor}88)` }}>
              {org.logo_url && <img src={org.logo_url} alt="" className="h-16 w-16 rounded-2xl mx-auto mb-4 object-contain bg-white/90 p-2" />}
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
                {config.hero_title || org.name}
              </h1>
              <p className="text-white/80 text-lg max-w-md mx-auto">
                {config.hero_subtitle || `Bine ați venit pe website-ul ${org.name}`}
              </p>
              {org.address && (
                <p className="text-white/60 text-sm mt-4 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" /> {org.address}
                </p>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pages.includes('announcements') && (
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('announcements')}>
                  <CardContent className="p-4 text-center">
                    <Megaphone className="h-6 w-6 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold text-foreground">{announcements.length}</p>
                    <p className="text-xs text-muted-foreground">Anunțuri</p>
                  </CardContent>
                </Card>
              )}
              {pages.includes('documents') && (
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSection('documents')}>
                  <CardContent className="p-4 text-center">
                    <FileText className="h-6 w-6 mx-auto text-primary mb-1" />
                    <p className="text-2xl font-bold text-foreground">{documents.length}</p>
                    <p className="text-xs text-muted-foreground">Documente</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Recent announcements */}
            {announcements.length > 0 && pages.includes('announcements') && (
              <div>
                <h2 className="text-lg font-display font-bold text-foreground mb-3">Ultimele anunțuri</h2>
                <div className="space-y-2">
                  {announcements.slice(0, 3).map(a => (
                    <Card key={a.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">{a.titlu}</h3>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.continut}</p>
                          </div>
                          <Badge variant="secondary" className="text-[10px] shrink-0">
                            {format(new Date(a.created_at), 'd MMM', { locale: ro })}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => setActiveSection('announcements')}>
                    Vezi toate <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeSection === 'announcements' && (
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Anunțuri</h2>
            {announcements.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Niciun anunț publicat</p>
            ) : (
              <div className="space-y-3">
                {announcements.map(a => (
                  <Card key={a.id}>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-2">
                        {a.prioritate === 'urgent' && <Badge variant="destructive" className="text-[10px]">Urgent</Badge>}
                        <Badge variant="secondary" className="text-[10px]">
                          {format(new Date(a.created_at), 'd MMMM yyyy', { locale: ro })}
                        </Badge>
                      </div>
                      <h3 className="text-base font-semibold text-foreground mb-1">{a.titlu}</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.continut}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS */}
        {activeSection === 'documents' && (
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Documente</h2>
            {documents.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">Niciun document publicat</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {documents.map(d => (
                  <Card key={d.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <FileText className="h-8 w-8 text-primary mb-2" />
                      <h3 className="text-sm font-semibold text-foreground truncate">{d.nume_fisier}</h3>
                      <p className="text-[10px] text-muted-foreground">{d.categorie || 'General'}</p>
                      <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => window.open(d.url, '_blank')}>
                        Descarcă
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACT */}
        {activeSection === 'contact' && (
          <div>
            <h2 className="text-xl font-display font-bold text-foreground mb-4">Contact</h2>
            <Card>
              <CardContent className="p-6 space-y-3">
                <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                {org.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0" /> {org.address}
                  </p>
                )}
                {org.contact_info?.phone && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary shrink-0" /> {org.contact_info.phone}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fallback for other sections */}
        {['gallery', 'schedule', 'team', 'services'].includes(activeSection) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Această secțiune va fi disponibilă în curând.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {org.name}. Powered by InfoDisplay.</p>
        </div>
      </footer>
    </div>
  );
}
