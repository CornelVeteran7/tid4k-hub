import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Stethoscope, Ticket as TicketIcon, HardHat, ShieldCheck } from 'lucide-react';
import { Megaphone, FileText, MessageSquare, Clock, Shield, Calendar, Users, LogIn, ChevronRight, MapPin } from 'lucide-react';
import { format, startOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { ro } from 'date-fns/locale';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface PublicAnnouncement {
  id: string;
  titlu: string;
  continut: string;
  prioritate: string;
  created_at: string;
}

interface OrgInfo {
  id: string;
  name: string;
  logo_url: string | null;
  primary_color: string;
  vertical_type: string;
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */

export default function QRCancelarie() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const [scheduleToday, setScheduleToday] = useState<{ ora: string; materie: string; profesor: string; culoare: string }[]>([]);
  const [timetableToday, setTimetableToday] = useState<{ period_number: number; subject: string; teacher_name: string; room: string; class_id: string }[]>([]);
  const [magazineArticles, setMagazineArticles] = useState<{ id: string; titlu: string; autor_nume: string; categorie: string }[]>([]);
  const [medicineDoctors, setMedicineDoctors] = useState<{ name: string; specialization: string; credentials: string }[]>([]);
  const [medicineServices, setMedicineServices] = useState<{ name: string; price_from: number; price_to: number }[]>([]);
  const [constructionTasks, setConstructionTasks] = useState<{ id: string; titlu: string; status: string; prioritate: string; locatie: string }[]>([]);
  const [constructionSites, setConstructionSites] = useState<{ id: string; nume: string; adresa: string; beneficiar: string; contractor: string; numar_autorizatie: string }[]>([]);
  const [ssmStatus, setSsmStatus] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Load org info
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, name, logo_url, primary_color, vertical_type')
        .eq('slug', orgSlug || '')
        .maybeSingle();

      if (orgData) setOrg(orgData as OrgInfo);
      const orgId = orgData?.id || '';

      // Load public announcements
      const { data: annData } = await supabase
        .from('announcements')
        .select('id, titlu, continut, prioritate, created_at')
        .eq('organization_id', orgId)
        .eq('ascuns_banda', false)
        .or('data_expirare.is.null,data_expirare.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10);
      setAnnouncements(annData || []);

      // Load today's schedule (public)
      const todayRO = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'][new Date().getDay()] || '';
      const { data: schedData } = await supabase
        .from('schedule')
        .select('ora, materie, profesor, culoare')
        .eq('organization_id', orgId)
        .eq('zi', todayRO)
        .order('ora');
      setScheduleToday(schedData || []);

      // Schools-specific: timetable + magazine
      if (orgData?.vertical_type === 'schools') {
        const dayOfWeek = new Date().getDay();
        const dayNum = dayOfWeek === 0 ? 7 : dayOfWeek;
        const [{ data: ttData }, { data: magData }] = await Promise.all([
          dayNum <= 5
            ? supabase.from('timetable_entries').select('period_number, subject, teacher_name, room, class_id')
                .eq('organization_id', orgId).eq('day_of_week', dayNum).order('period_number')
            : Promise.resolve({ data: [] as any[] }),
          supabase.from('magazine_articles').select('id, titlu, autor_nume, categorie')
            .eq('organization_id', orgId).eq('status', 'published')
            .order('published_at', { ascending: false }).limit(5),
        ]);
        setTimetableToday(ttData || []);
        setMagazineArticles(magData || []);
      }

      // Medicine-specific: doctors + services
      if (orgData?.vertical_type === 'medicine') {
        const [{ data: docData }, { data: svcData }] = await Promise.all([
          supabase.from('doctor_profiles').select('name, specialization, credentials')
            .eq('organization_id', orgId).eq('activ', true).order('ordine'),
          supabase.from('medicine_services').select('name, price_from, price_to')
            .eq('organization_id', orgId).eq('activ', true).order('ordine'),
        ]);
        setMedicineDoctors(docData || []);
        setMedicineServices(svcData || []);
      }

      // Construction-specific: tasks, sites, SSM status
      if (orgData?.vertical_type === 'construction') {
        const todayDate = format(new Date(), 'yyyy-MM-dd');
        const [{ data: tasksData }, { data: sitesData }, { data: ssmData }] = await Promise.all([
          supabase.from('construction_tasks').select('id, titlu, status, prioritate, locatie')
            .eq('organization_id', orgId).in('status', ['todo', 'in_progress'])
            .order('created_at', { ascending: false }).limit(10),
          supabase.from('construction_sites').select('id, nume, adresa, beneficiar, contractor, numar_autorizatie')
            .eq('organization_id', orgId).eq('status', 'activ'),
          supabase.from('ssm_checklists').select('id, status')
            .eq('organization_id', orgId).eq('data', todayDate),
        ]);
        setConstructionTasks(tasksData || []);
        setConstructionSites((sitesData || []) as any[]);
        const ssmList = ssmData || [];
        setSsmStatus({ completed: ssmList.filter((s: any) => s.status === 'completed').length, total: ssmList.length });
      }

      setLoading(false);
    }
    load();
  }, [orgSlug]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const orgName = org?.name || orgSlug || '';
  const primaryColor = org?.primary_color || '#4F46E5';

  return (
    <div className="min-h-screen bg-background safe-top safe-bottom">
      {/* Header */}
      <div className="text-center px-4 pt-6 pb-4" style={{ background: `linear-gradient(135deg, ${primaryColor}18, transparent)` }}>
        {org?.logo_url && (
          <img src={org.logo_url} alt="" className="h-14 w-14 mx-auto rounded-xl object-contain mb-3"
            style={{ background: `${primaryColor}15`, padding: 4 }} />
        )}
        <h1 className="text-2xl font-display font-bold text-foreground">{orgName}</h1>
        <p className="text-muted-foreground text-sm mt-1">Informații publice</p>
        {isAuthenticated && (
          <Badge className="mt-2 bg-success text-success-foreground">
            <Shield className="h-3 w-3 mr-1" /> Conectat ca {user?.nume_prenume}
          </Badge>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 space-y-6">
        {/* ── PUBLIC: Announcements ── */}
        <Section icon={<Megaphone className="h-5 w-5" />} title="Anunțuri" color={primaryColor}>
          {announcements.length === 0 ? (
            <EmptyState text="Nu sunt anunțuri recente" />
          ) : (
            announcements.map(ann => (
              <Card key={ann.id} className={`mb-3 ${ann.prioritate === 'urgent' ? 'border-destructive/50 bg-destructive/5' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-foreground">{ann.titlu}</h3>
                        {ann.prioritate === 'urgent' && (
                          <Badge variant="destructive" className="text-xs">⚠️ Urgent</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{ann.continut}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(ann.created_at), 'd MMMM yyyy, HH:mm', { locale: ro })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </Section>

        {/* ── PUBLIC: Schedule today ── */}
        {scheduleToday.length > 0 && (
          <Section icon={<Calendar className="h-5 w-5" />} title="Orar azi" color={primaryColor}>
            <Card>
              <CardContent className="p-4 space-y-2">
                {scheduleToday.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-muted-foreground w-12 text-xs">{s.ora}</span>
                    <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: s.culoare || primaryColor }} />
                    <span className="text-foreground font-medium">{s.materie}</span>
                    {s.profesor && <span className="text-muted-foreground text-xs ml-auto">{s.profesor}</span>}
                  </div>
                ))}
              </CardContent>
            </Card>
          </Section>
        )}

        {/* ── PUBLIC: Schools Timetable ── */}
        {timetableToday.length > 0 && (
          <Section icon={<Calendar className="h-5 w-5" />} title="Orar azi" color={primaryColor}>
            {(() => {
              const classes = [...new Set(timetableToday.map(e => e.class_id))];
              return classes.slice(0, 3).map(cls => (
                <Card key={cls} className="mb-3">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{cls}</p>
                    <div className="space-y-1.5">
                      {timetableToday.filter(e => e.class_id === cls).map(e => (
                        <div key={e.period_number} className="flex items-center gap-3 text-sm">
                          <span className="font-mono text-muted-foreground w-12 text-xs">Ora {e.period_number}</span>
                          <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: primaryColor }} />
                          <span className="text-foreground font-medium">{e.subject}</span>
                          {e.teacher_name && <span className="text-muted-foreground text-xs ml-auto">{e.teacher_name}</span>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ));
            })()}
          </Section>
        )}

        {/* ── PUBLIC: Magazine articles ── */}
        {magazineArticles.length > 0 && (
          <Section icon={<Newspaper className="h-5 w-5" />} title="Revista Școlii" color={primaryColor}>
            {magazineArticles.map(a => (
              <Card key={a.id} className="mb-3">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm text-foreground">{a.titlu}</h3>
                  <p className="text-xs text-muted-foreground mt-1">de {a.autor_nume} · {a.categorie}</p>
                </CardContent>
              </Card>
            ))}
          </Section>
        )}

        {/* ── Medicine: Queue link + Services + Doctors ── */}
        {org?.vertical_type === 'medicine' && (
          <>
            <Section icon={<TicketIcon className="h-5 w-5" />} title="Coadă" color={primaryColor}>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Ia un număr de ordine fără a te autentifica</p>
                  <Button asChild className="gap-2">
                    <a href={`/queue/${orgSlug}`}>
                      <TicketIcon className="h-4 w-4" /> Ia un număr
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </Section>

            {medicineDoctors.length > 0 && (
              <Section icon={<Stethoscope className="h-5 w-5" />} title="Echipa medicală" color={primaryColor}>
                {medicineDoctors.map((doc, i) => (
                  <Card key={i} className="mb-3">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm text-foreground">{doc.name}</h3>
                      <p className="text-xs text-primary">{doc.specialization}</p>
                      {doc.credentials && <p className="text-xs text-muted-foreground mt-0.5">{doc.credentials}</p>}
                    </CardContent>
                  </Card>
                ))}
              </Section>
            )}

            {medicineServices.length > 0 && (
              <Section icon={<FileText className="h-5 w-5" />} title="Servicii" color={primaryColor}>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {medicineServices.map((svc, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{svc.name}</span>
                        {(svc.price_from > 0 || svc.price_to > 0) && (
                          <span className="text-muted-foreground text-xs">
                            {svc.price_from === svc.price_to ? `${svc.price_from} lei` : `${svc.price_from}–${svc.price_to} lei`}
                          </span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </Section>
            )}
          </>
        )}

        {/* ── AUTHENTICATED SECTION ── */}
        {isAuthenticated ? (
          <AuthenticatedSection userId={user?.id || ''} orgId={org?.id || ''} primaryColor={primaryColor} />
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <Shield className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Conectează-te pentru a vedea mesaje, documente și informații personale.
            </p>
            <Button asChild className="gap-2">
              <Link to={`/login/${orgSlug}`}>
                <LogIn className="h-4 w-4" /> Autentifică-te
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Authenticated Section — personal data
   ═══════════════════════════════════════════════════ */

function AuthenticatedSection({ userId, orgId, primaryColor }: { userId: string; orgId: string; primaryColor: string }) {
  const { user } = useAuth();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const roles = user?.status?.split(',').map(r => r.trim()) || [];
  const isAdmin = roles.includes('administrator') || roles.includes('director') || roles.includes('inky');
  const isReceptionist = roles.includes('secretara') || isAdmin;
  const isMedicine = user?.vertical_type === 'medicine';

  return (
    <div className="space-y-4">
      {/* Medicine: Receptionist quick link to admin panel */}
      {isMedicine && isReceptionist && (
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">Panou Recepție</h3>
              <p className="text-xs text-muted-foreground">Gestionare coadă pacienți</p>
            </div>
            <Button asChild size="sm" className="gap-1.5">
              <Link to="/coada">
                <TicketIcon className="h-4 w-4" /> Deschide
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-display font-semibold text-foreground">Informații personale</h2>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Mesaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UnreadMessages userId={userId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Documente recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentDocuments />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Prezență luna aceasta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceSummary userId={userId} orgId={orgId} isAdmin={isAdmin} />
        </CardContent>
      </Card>

      {/* Admin-level details */}
      {isAdmin && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Admin — Statistici
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AdminStats orgId={orgId} />
          </CardContent>
        </Card>
      )}

      <div className="text-center pt-2">
        <Button variant="outline" asChild className="gap-2">
          <Link to="/">
            Deschide aplicația <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-components for authenticated view
   ═══════════════════════════════════════════════════ */

function UnreadMessages({ userId }: { userId: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('citit', false)
      .neq('sender_id', userId)
      .then(({ count }) => setCount(count || 0));
  }, [userId]);

  if (count === null) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;
  return (
    <p className="text-sm">
      {count > 0 ? (
        <span className="font-semibold text-destructive">{count} mesaje necitite</span>
      ) : (
        <span className="text-muted-foreground">✓ Niciun mesaj necitit</span>
      )}
    </p>
  );
}

function RecentDocuments() {
  const [docs, setDocs] = useState<{ nume_fisier: string; created_at: string }[]>([]);

  useEffect(() => {
    supabase
      .from('documents')
      .select('nume_fisier, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setDocs(data || []));
  }, []);

  if (docs.length === 0) return <p className="text-sm text-muted-foreground">Niciun document recent</p>;
  return (
    <ul className="space-y-2">
      {docs.map((d, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span className="truncate text-foreground">{d.nume_fisier}</span>
          <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">
            {format(new Date(d.created_at), 'd MMM', { locale: ro })}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AttendanceSummary({ userId, orgId, isAdmin }: { userId: string; orgId: string; isAdmin: boolean }) {
  const [stats, setStats] = useState<{ prezent: number; absent: number } | null>(null);

  useEffect(() => {
    async function load() {
      const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

      if (isAdmin) {
        // Admin sees overall stats
        const { count: totalPresent } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('prezent', true)
          .gte('data', monthStart)
          .lte('data', monthEnd);
        const { count: totalAbsent } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .eq('prezent', false)
          .gte('data', monthStart)
          .lte('data', monthEnd);
        setStats({ prezent: totalPresent || 0, absent: totalAbsent || 0 });
      } else {
        // Parent sees own children's stats
        const { data: children } = await supabase
          .from('children')
          .select('id')
          .eq('parinte_id', userId);
        if (!children || children.length === 0) {
          setStats({ prezent: 0, absent: 0 });
          return;
        }
        const childIds = children.map(c => c.id);
        const { count: present } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .in('child_id', childIds)
          .eq('prezent', true)
          .gte('data', monthStart)
          .lte('data', monthEnd);
        const { count: absent } = await supabase
          .from('attendance')
          .select('id', { count: 'exact', head: true })
          .in('child_id', childIds)
          .eq('prezent', false)
          .gte('data', monthStart)
          .lte('data', monthEnd);
        setStats({ prezent: present || 0, absent: absent || 0 });
      }
    }
    load();
  }, [userId, orgId, isAdmin]);

  if (!stats) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;
  const total = stats.prezent + stats.absent;
  const pct = total > 0 ? Math.round((stats.prezent / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{isAdmin ? 'Total prezențe' : 'Prezențe'}</span>
        <span className="font-semibold text-success">{stats.prezent} zile ({pct}%)</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Absențe</span>
        <span className="font-semibold text-destructive">{stats.absent} zile</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-success rounded-full" style={{ width: `${pct}%`, transition: 'width 0.5s' }} />
      </div>
    </div>
  );
}

function AdminStats({ orgId }: { orgId: string }) {
  const [stats, setStats] = useState<{ users: number; children: number; groups: number } | null>(null);

  useEffect(() => {
    async function load() {
      const [{ count: users }, { count: children }, { count: groups }] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('children').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
        supabase.from('groups').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      ]);
      setStats({ users: users || 0, children: children || 0, groups: groups || 0 });
    }
    load();
  }, [orgId]);

  if (!stats) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;
  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div>
        <div className="text-2xl font-bold text-foreground">{stats.users}</div>
        <div className="text-xs text-muted-foreground">Utilizatori</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{stats.children}</div>
        <div className="text-xs text-muted-foreground">Copii</div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{stats.groups}</div>
        <div className="text-xs text-muted-foreground">Grupe</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════ */

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ color }}>{icon}</div>
        <h2 className="text-lg font-display font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center text-muted-foreground text-sm">{text}</CardContent>
    </Card>
  );
}
