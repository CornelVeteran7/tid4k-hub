import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

/* ═══════════════════════════════════════════════════
   Types
   ═══════════════════════════════════════════════════ */

interface TimetableSlide {
  class_id: string;
  period_number: number;
  subject: string;
  teacher_name: string;
  room: string;
}

interface MagazineSlide {
  id: string;
  titlu: string;
  autor_nume: string;
  categorie: string;
  continut: string;
}

interface DisplayPanel {
  id: string;
  tip: string;
  continut: string;
  durata: number;
  ordine: number;
}

interface QueueEntry {
  id: string;
  numar_tichet: number;
  status: string;
  cabinet: string | null;
  created_at: string;
  called_at: string | null;
}

interface MenuSlide {
  masa: string;
  continut: string;
  emoji: string | null;
}

interface ScheduleSlide {
  ora: string;
  materie: string;
  profesor: string;
  culoare: string;
}

interface ConstructionTask {
  id: string;
  titlu: string;
  status: string;
  prioritate: string;
  locatie: string;
  assignee: string;
}

interface SSMChecklistStatus {
  id: string;
  status: string;
  data: string;
}

interface ConstructionSiteInfo {
  id: string;
  nume: string;
  beneficiar: string | null;
  contractor: string | null;
  numar_autorizatie: string | null;
  adresa: string | null;
  status: string;
}

interface DisplayConfig {
  panels: DisplayPanel[];
  ticker_messages: string[];
  qr_codes: { label: string; url: string }[];
  org_id: string;
  org_name: string;
  org_logo?: string;
  primary_color: string;
  secondary_color: string;
  vertical_type: string;
  menu_today: MenuSlide[];
  schedule_today: ScheduleSlide[];
  queue_serving: QueueEntry[];
  queue_waiting: QueueEntry[];
  queue_avg_wait: number;
  queue_service_points: string[];
  construction_tasks: ConstructionTask[];
  ssm_reminders: SSMReminder[];
  timetable_today: TimetableSlide[];
  timetable_current_period: number;
  magazine_articles: MagazineSlide[];
  google_reviews_url: string;
  medicine_doctors: { name: string; specialization: string }[];
  medicine_services: { name: string }[];
}

/* ═══════════════════════════════════════════════════
   Constants
   ═══════════════════════════════════════════════════ */

const DESIGN_W = 1920;
const DESIGN_H = 1080;
const REFRESH_INTERVAL = 60_000; // 60 seconds
const DAYS_RO = ['Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri'];
const MEAL_LABELS: Record<string, string> = {
  mic_dejun: '🌅 Mic dejun',
  gustare_1: '🍎 Gustare',
  pranz: '🍽️ Prânz',
  gustare_2: '🍪 Gustare',
};
const MEAL_ORDER = ['mic_dejun', 'gustare_1', 'pranz', 'gustare_2'];
const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', normal: '#3b82f6', low: '#6b7280',
};

/* ═══════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════ */

export default function PublicDisplay() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isPortrait, setIsPortrait] = useState(false);
  const [clockTime, setClockTime] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Scaling logic (fixed 1920×1080 or 1080×1920) ──
  const updateScale = useCallback(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const portrait = vh > vw * 1.2;
    setIsPortrait(portrait);
    const dw = portrait ? DESIGN_H : DESIGN_W; // In portrait, design is rotated
    const dh = portrait ? DESIGN_W : DESIGN_H;
    setScale(Math.min(vw / dw, vh / dh));
  }, []);

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [updateScale]);

  // ── Clock (update every 10s to reduce repaints) ──
  useEffect(() => {
    const t = setInterval(() => setClockTime(new Date()), 10_000);
    return () => clearInterval(t);
  }, []);

  // ── Data loading ──
  const loadContent = useCallback(async () => {
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', orgSlug || '')
      .maybeSingle();

    const orgId = org?.id || '';
    const now = new Date();
    const todayISO = now.toISOString();
    const todayDate = format(now, 'yyyy-MM-dd');
    const dayOfWeek = now.getDay();
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const dayNum = dayIndex + 1; // 1=Mon..5=Fri
    const mondayDate = (() => {
      const d = new Date(now);
      d.setDate(d.getDate() - dayIndex);
      return format(d, 'yyyy-MM-dd');
    })();
    const todayRO = ['duminica', 'luni', 'marti', 'miercuri', 'joi', 'vineri', 'sambata'][dayOfWeek] || '';

    // Parallel fetch all data
    const [
      { data: panels },
      { data: ticker },
      { data: qr },
      { data: announcements },
      menuWeekResult,
      { data: scheduleItems },
      { data: queueData },
      { data: tasksData },
      { data: ssmData },
    ] = await Promise.all([
      supabase.from('infodisplay_panels').select('*').eq('organization_id', orgId).order('ordine'),
      supabase.from('infodisplay_ticker').select('*').eq('organization_id', orgId).order('ordine'),
      supabase.from('infodisplay_qr').select('*').eq('organization_id', orgId),
      supabase.from('announcements').select('titlu')
        .eq('organization_id', orgId).eq('ascuns_banda', false)
        .or('data_expirare.is.null,data_expirare.gt.' + todayISO)
        .order('created_at', { ascending: false }).limit(15),
      // Menu for today — from new OMS schema
      (async () => {
        if (dayNum > 5) return [] as MenuSlide[];
        const { data: mw } = await supabase.from('menu_weeks').select('id')
          .eq('organization_id', orgId).eq('week_start_date', mondayDate).eq('status', 'published').maybeSingle();
        if (!mw) return [] as MenuSlide[];
        const { data: meals } = await supabase.from('menu_meals').select('id, meal_type')
          .eq('menu_week_id', mw.id).eq('day_of_week', dayNum);
        if (!meals || meals.length === 0) return [] as MenuSlide[];
        const mealIds = meals.map(m => m.id);
        const { data: dishes } = await supabase.from('menu_dishes').select('menu_meal_id, dish_name').in('menu_meal_id', mealIds).order('ordine');
        // Group dish names by meal_type
        const mealMap = new Map(meals.map(m => [m.id, m.meal_type]));
        const grouped = new Map<string, string[]>();
        (dishes || []).forEach(d => {
          const mt = mealMap.get(d.menu_meal_id) || '';
          if (!grouped.has(mt)) grouped.set(mt, []);
          grouped.get(mt)!.push(d.dish_name);
        });
        return Array.from(grouped.entries()).map(([masa, names]) => ({
          masa, continut: names.join(', '), emoji: null,
        })) as MenuSlide[];
      })(),
      // Schedule for today
      supabase.from('schedule').select('ora, materie, profesor, culoare')
        .eq('organization_id', orgId).eq('zi', todayRO).order('ora'),
      // Queue (medicine/students)
      org?.vertical_type === 'medicine' || org?.vertical_type === 'students'
        ? supabase.from('queue_entries').select('id, numar_tichet, status, cabinet, created_at, called_at')
            .eq('organization_id', orgId)
            .gte('created_at', todayDate + 'T00:00:00')
            .order('numar_tichet')
        : Promise.resolve({ data: [] as any[] }),
      // Construction tasks
      org?.vertical_type === 'construction'
        ? supabase.from('construction_tasks').select('*')
            .eq('organization_id', orgId)
            .in('status', ['todo', 'in_progress', 'blocked'])
            .order('created_at', { ascending: false }).limit(8)
        : Promise.resolve({ data: [] as any[] }),
      // SSM — get today's checklist status for construction
      org?.vertical_type === 'construction'
        ? supabase.from('ssm_checklists').select('id, status, data')
            .eq('organization_id', orgId).eq('data', todayDate).limit(5)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    // Schools: load timetable + magazine
    let timetableToday: TimetableSlide[] = [];
    let timetableCurrentPeriod = 0;
    let magazineArticles: MagazineSlide[] = [];
    if (org?.vertical_type === 'schools') {
      const [{ data: ttEntries }, { data: magData }] = await Promise.all([
        dayNum <= 5
          ? supabase.from('timetable_entries').select('class_id, period_number, subject, teacher_name, room')
              .eq('organization_id', orgId).eq('day_of_week', dayNum).order('period_number')
          : Promise.resolve({ data: [] as any[] }),
        supabase.from('magazine_articles').select('id, titlu, autor_nume, categorie, continut')
          .eq('organization_id', orgId).eq('status', 'published')
          .order('published_at', { ascending: false }).limit(5),
      ]);
      timetableToday = (ttEntries || []) as TimetableSlide[];
      magazineArticles = (magData || []) as MagazineSlide[];
      // Determine current period from timetable_config
      const { data: ttConfig } = await supabase.from('timetable_config').select('*')
        .eq('organization_id', orgId).maybeSingle();
      if (ttConfig) {
        const [sH, sM] = (ttConfig.start_time || '08:00').split(':').map(Number);
        let cur = sH * 60 + sM;
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const breaks = (ttConfig.break_durations as number[]) || [];
        for (let p = 0; p < ttConfig.periods_per_day; p++) {
          const end = cur + ttConfig.period_duration_minutes;
          if (nowMin >= cur && nowMin < end) { timetableCurrentPeriod = p + 1; break; }
          cur = end + (breaks[p] || 10);
        }
      }
    }

    const tickerMsgs = [
      ...(ticker || []).map((t: any) => t.mesaj),
      ...(announcements || []).map((a: any) => a.titlu),
    ];

    const queueEntries = (queueData || []) as QueueEntry[];

    // Load queue config for avg wait time
    let queueAvgWait = 10;
    let queueServicePoints: string[] = [];
    let googleReviewsUrl = '';
    let medicineDoctors: { name: string; specialization: string }[] = [];
    let medicineServices: { name: string }[] = [];

    if (org?.vertical_type === 'medicine' || org?.vertical_type === 'students') {
      const { data: qc } = await supabase.from('queue_config')
        .select('avg_service_minutes, service_points')
        .eq('organization_id', orgId).maybeSingle();
      if (qc) {
        queueAvgWait = qc.avg_service_minutes;
        queueServicePoints = Array.isArray(qc.service_points) ? qc.service_points as string[] : [];
      }
    }

    if (org?.vertical_type === 'medicine') {
      const [{ data: gConfig }, { data: docData }, { data: svcData }] = await Promise.all([
        supabase.from('org_config').select('config_value')
          .eq('organization_id', orgId).eq('config_key', 'google_business_url').maybeSingle(),
        supabase.from('doctor_profiles').select('name, specialization')
          .eq('organization_id', orgId).eq('activ', true).order('ordine').limit(6),
        supabase.from('medicine_services').select('name')
          .eq('organization_id', orgId).eq('activ', true).order('ordine').limit(8),
      ]);
      if (gConfig?.config_value) {
        const val = gConfig.config_value as any;
        googleReviewsUrl = typeof val === 'string' ? val : val?.url || '';
      }
      medicineDoctors = (docData || []) as { name: string; specialization: string }[];
      medicineServices = (svcData || []) as { name: string }[];
    }

    setConfig({
      panels: (panels || []).map((p: any) => ({
        id: p.id, tip: p.tip, continut: p.continut,
        durata: p.durata || 8, ordine: p.ordine || 1,
      })),
      ticker_messages: tickerMsgs,
      qr_codes: (qr || []).map((q: any) => ({ label: q.label, url: q.url })),
      org_id: orgId,
      org_name: org?.name || orgSlug || 'InfoDisplay',
      org_logo: org?.logo_url || undefined,
      primary_color: org?.primary_color || '#4F46E5',
      secondary_color: org?.secondary_color || '#7C3AED',
      vertical_type: org?.vertical_type || 'kids',
      menu_today: ((menuWeekResult || []) as MenuSlide[]).sort(
        (a, b) => MEAL_ORDER.indexOf(a.masa) - MEAL_ORDER.indexOf(b.masa)
      ),
      schedule_today: (scheduleItems || []) as ScheduleSlide[],
      queue_serving: queueEntries.filter(e => e.status === 'called' || e.status === 'serving'),
      queue_waiting: queueEntries.filter(e => e.status === 'waiting'),
      queue_avg_wait: queueAvgWait,
      queue_service_points: queueServicePoints,
      construction_tasks: (tasksData || []) as ConstructionTask[],
      ssm_reminders: (ssmData || []) as SSMReminder[],
      timetable_today: timetableToday,
      timetable_current_period: timetableCurrentPeriod,
      magazine_articles: magazineArticles,
      google_reviews_url: googleReviewsUrl,
      medicine_doctors: medicineDoctors,
      medicine_services: medicineServices,
    });
    setLoading(false);
  }, [orgSlug]);

  useEffect(() => {
    loadContent();
    const interval = setInterval(loadContent, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadContent]);

  // ── Realtime for queue (medicine/students) ──
  useEffect(() => {
    if (!config || (config.vertical_type !== 'medicine' && config.vertical_type !== 'students')) return;
    const channel = supabase
      .channel('queue-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries',
        filter: `organization_id=eq.${config.org_id}` }, () => loadContent())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [config?.org_id, config?.vertical_type, loadContent]);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-16 w-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
        <p className="text-2xl">Organizație negăsită</p>
      </div>
    );
  }

  const designW = isPortrait ? DESIGN_H : DESIGN_W;
  const designH = isPortrait ? DESIGN_W : DESIGN_H;
  const qrUrl = `${window.location.origin}/qr/${orgSlug}`;

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black overflow-hidden select-none cursor-none">
      {/* Scaled slide wrapper */}
      <div
        className="display-slide-wrapper"
        style={{
          width: designW,
          height: designH,
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -(designW / 2),
          marginTop: -(designH / 2),
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          background: `linear-gradient(135deg, ${config.primary_color}22, ${config.secondary_color}11, #000)`,
          color: '#fff',
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* ── HEADER BAR ── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between"
          style={{ padding: '28px 48px' }}>
          <div className="flex items-center" style={{ gap: 20 }}>
            {config.org_logo && (
              <img src={config.org_logo} alt="" className="object-contain rounded-xl"
                style={{ height: 56, width: 56, background: 'rgba(255,255,255,0.1)', padding: 6 }} />
            )}
            <span className="font-bold" style={{ fontSize: 28, opacity: 0.85 }}>{config.org_name}</span>
          </div>
          <div className="flex items-center" style={{ gap: 24 }}>
            <div className="text-right" style={{ opacity: 0.6 }}>
              <div style={{ fontSize: 32, fontFamily: "'Space Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {format(clockTime, 'HH:mm')}
              </div>
              <div style={{ fontSize: 14, textTransform: 'capitalize' }}>
                {format(clockTime, 'EEEE, d MMMM yyyy', { locale: ro })}
              </div>
            </div>
            <div className="rounded-xl" style={{ background: '#fff', padding: 8 }}>
              <QRCodeSVG value={qrUrl} size={56} />
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT — vertical-specific ── */}
        <VerticalContent config={config} isPortrait={isPortrait} />

        {/* ── TICKER BAR ── */}
        {config.ticker_messages.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden"
            style={{ backgroundColor: config.primary_color, height: 48, display: 'flex', alignItems: 'center' }}>
            <div className="display-ticker-track whitespace-nowrap" style={{ fontSize: 20, fontWeight: 500 }}>
              {Array.from({ length: 3 }).map((_, rep) => (
                <span key={rep}>
                  {config.ticker_messages.map((msg, i) => (
                    <span key={`${rep}-${i}`} style={{ margin: '0 64px' }}>
                      {msg} ●
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── PANEL INDICATORS ── */}
        {config.panels.length > 1 && config.vertical_type !== 'medicine' && config.vertical_type !== 'construction' && (
          <PanelIndicators config={config} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Panel Indicators
   ═══════════════════════════════════════════════════ */

function PanelIndicators({ config }: { config: DisplayConfig }) {
  return null; // Indicators are rendered inside the slider
}

/* ═══════════════════════════════════════════════════
   Vertical Content Router
   ═══════════════════════════════════════════════════ */

function VerticalContent({ config, isPortrait }: { config: DisplayConfig; isPortrait: boolean }) {
  switch (config.vertical_type) {
    case 'medicine':
    case 'students':
      return <QueueContent config={config} />;
    case 'construction':
      return <ConstructionContent config={config} />;
    case 'kids':
      return <KidsContent config={config} isPortrait={isPortrait} />;
    case 'schools':
      return <SchoolsContent config={config} isPortrait={isPortrait} />;
    default:
      return <DefaultContent config={config} isPortrait={isPortrait} />;
  }
}

/* ═══════════════════════════════════════════════════
   SCHOOLS Content: timetable + magazine + slideshow
   ═══════════════════════════════════════════════════ */

function SchoolsContent({ config, isPortrait }: { config: DisplayConfig; isPortrait: boolean }) {
  const DAYS_SHORT = ['Luni', 'Marți', 'Mier.', 'Joi', 'Vineri'];
  // Group timetable entries by class (show first class found)
  const classes = [...new Set(config.timetable_today.map(e => e.class_id))];

  return (
    <>
      <PanelSlideshow panels={config.panels} primaryColor={config.primary_color} />

      <div className="absolute left-0 right-0 z-10 flex" style={{
        bottom: config.ticker_messages.length > 0 ? 60 : 12,
        padding: '0 48px',
        gap: 24,
      }}>
        {/* Timetable — current period highlighted */}
        {config.timetable_today.length > 0 && (
          <div className="rounded-2xl" style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            padding: 20,
            flex: isPortrait ? '1' : '0 0 420px',
            maxHeight: 320,
            overflowY: 'auto',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>
              📅 Orar azi {classes.length > 0 && <span style={{ fontSize: 12, opacity: 0.6 }}>({classes[0]})</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {config.timetable_today
                .filter(e => e.class_id === classes[0])
                .sort((a, b) => a.period_number - b.period_number)
                .map(e => {
                  const isCurrent = e.period_number === config.timetable_current_period;
                  return (
                    <div key={e.period_number} className="flex items-center" style={{
                      gap: 10,
                      background: isCurrent ? 'rgba(34,197,94,0.2)' : 'transparent',
                      borderRadius: 8,
                      padding: isCurrent ? '6px 10px' : '2px 10px',
                      border: isCurrent ? '1px solid rgba(34,197,94,0.4)' : 'none',
                    }}>
                      <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", opacity: 0.6, width: 42 }}>
                        Ora {e.period_number}
                      </span>
                      <div style={{ height: 8, width: 8, borderRadius: '50%', background: isCurrent ? '#22c55e' : config.primary_color, flexShrink: 0 }} />
                      <span style={{ fontSize: 14, fontWeight: isCurrent ? 600 : 400 }}>{e.subject}</span>
                      {e.teacher_name && <span style={{ fontSize: 12, opacity: 0.4, marginLeft: 'auto' }}>{e.teacher_name}</span>}
                      {e.room && <span style={{ fontSize: 11, opacity: 0.3 }}>· {e.room}</span>}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Magazine highlights */}
        {config.magazine_articles.length > 0 && (
          <div className="rounded-2xl" style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            padding: 20,
            flex: isPortrait ? '1' : '0 0 380px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>
              📰 Revista Școlii
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {config.magazine_articles.slice(0, 3).map(a => (
                <div key={a.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.titlu}</div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>de {a.autor_nume} · {a.categorie}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }} className="line-clamp-2">{a.continut}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR codes */}
        {config.qr_codes.length > 0 && (
          <div className="flex items-end" style={{ gap: 16, marginLeft: 'auto' }}>
            {config.qr_codes.map(qr => (
              <div key={qr.label} className="flex flex-col items-center" style={{ gap: 4 }}>
                <div className="rounded-xl" style={{ background: '#fff', padding: 8 }}>
                  <QRCodeSVG value={qr.url} size={72} />
                </div>
                <span style={{ fontSize: 11, opacity: 0.5 }}>{qr.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   KIDS Content: slideshow + menu + schedule
   ═══════════════════════════════════════════════════ */

function KidsContent({ config, isPortrait }: { config: DisplayConfig; isPortrait: boolean }) {
  return (
    <>
      <PanelSlideshow panels={config.panels} primaryColor={config.primary_color} />

      {/* Bottom info strip — above ticker */}
      <div className="absolute left-0 right-0 z-10 flex" style={{
        bottom: config.ticker_messages.length > 0 ? 60 : 12,
        padding: '0 48px',
        gap: 24,
      }}>
        {/* Menu of the day */}
        {config.menu_today.length > 0 && (
          <div className="rounded-2xl" style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            padding: 20,
            flex: isPortrait ? '1' : '0 0 480px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>
              🍽️ Meniul zilei
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {config.menu_today.map(m => (
                <div key={m.masa} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '8px 12px' }}>
                  <div style={{ fontSize: 11, opacity: 0.5 }}>{MEAL_LABELS[m.masa] || m.masa}</div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{m.emoji} {m.continut}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule for today */}
        {config.schedule_today.length > 0 && (
          <div className="rounded-2xl" style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(20px)',
            padding: 20,
            flex: isPortrait ? '1' : '0 0 360px',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>
              📅 Orar azi
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {config.schedule_today.slice(0, 6).map((s, i) => (
                <div key={i} className="flex items-center" style={{ gap: 10 }}>
                  <span style={{ fontSize: 13, fontFamily: "'Space Mono', monospace", opacity: 0.6, width: 48 }}>{s.ora}</span>
                  <div style={{ height: 8, width: 8, borderRadius: '50%', background: s.culoare || '#4F46E5', flexShrink: 0 }} />
                  <span style={{ fontSize: 14 }}>{s.materie}</span>
                  {s.profesor && <span style={{ fontSize: 12, opacity: 0.4, marginLeft: 'auto' }}>{s.profesor}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QR codes */}
        {config.qr_codes.length > 0 && (
          <div className="flex items-end" style={{ gap: 16, marginLeft: 'auto' }}>
            {config.qr_codes.map(qr => (
              <div key={qr.label} className="flex flex-col items-center" style={{ gap: 4 }}>
                <div className="rounded-xl" style={{ background: '#fff', padding: 8 }}>
                  <QRCodeSVG value={qr.url} size={72} />
                </div>
                <span style={{ fontSize: 11, opacity: 0.5 }}>{qr.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   DEFAULT Content: slideshow + QR codes
   ═══════════════════════════════════════════════════ */

function DefaultContent({ config, isPortrait }: { config: DisplayConfig; isPortrait: boolean }) {
  if (config.panels.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ padding: '120px 80px' }}>
        <div style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>{config.org_name}</div>
        <div style={{ fontSize: 24, opacity: 0.4, textTransform: 'capitalize' }}>
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ro })}
        </div>
        {config.qr_codes.length > 0 && (
          <div className="flex" style={{ gap: 32, marginTop: 48 }}>
            {config.qr_codes.map(qr => (
              <div key={qr.label} className="flex flex-col items-center" style={{ gap: 8 }}>
                <div className="rounded-2xl" style={{ background: '#fff', padding: 12 }}>
                  <QRCodeSVG value={qr.url} size={120} />
                </div>
                <span style={{ fontSize: 14, opacity: 0.5 }}>{qr.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <PanelSlideshow panels={config.panels} primaryColor={config.primary_color} />
      {config.qr_codes.length > 0 && (
        <div className="absolute z-10 flex" style={{
          bottom: config.ticker_messages.length > 0 ? 60 : 24,
          right: 48,
          gap: 16,
        }}>
          {config.qr_codes.map(qr => (
            <div key={qr.label} className="flex flex-col items-center" style={{ gap: 4 }}>
              <div className="rounded-xl" style={{ background: '#fff', padding: 8 }}>
                <QRCodeSVG value={qr.url} size={72} />
              </div>
              <span style={{ fontSize: 11, opacity: 0.5 }}>{qr.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   QUEUE Content (Medicine / Students)
   — Multi-cabinet layout with large numbers
   — Average wait time display
   — Next 3 in queue highlighted
   — NO patient names or medical data (GDPR)
   ═══════════════════════════════════════════════════ */

function QueueContent({ config }: { config: DisplayConfig }) {
  const isMedicine = config.vertical_type === 'medicine';
  const emptyIcon = isMedicine ? '🏥' : '🎓';
  const emptyText = isMedicine ? 'Niciun pacient în așteptare' : 'Niciun student în așteptare';
  const queueUrl = `${window.location.origin}/queue/${window.location.pathname.split('/').pop()}`;
  const estimatedWaitNew = config.queue_waiting.length * config.queue_avg_wait;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: '100px 60px 60px' }}>
      {config.queue_serving.length > 0 ? (
        <>
          {/* Multi-cabinet serving — split layout */}
          {config.queue_serving.length === 1 ? (
            // Single serving — giant number
            <div className="flex-1 flex flex-col items-center justify-center">
              <div style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: 8, opacity: 0.4, marginBottom: 12 }}>
                Acum servim
              </div>
              <div style={{ fontSize: 240, fontWeight: 800, lineHeight: 1, color: config.primary_color, fontVariantNumeric: 'tabular-nums' }}>
                #{config.queue_serving[0].numar_tichet}
              </div>
              {config.queue_serving[0].cabinet && (
                <div style={{ fontSize: 52, fontWeight: 600, opacity: 0.7, marginTop: 16 }}>
                  {config.queue_serving[0].cabinet}
                </div>
              )}
            </div>
          ) : (
            // Multiple cabinets serving — grid layout
            <div className="flex-1 flex items-center justify-center" style={{ gap: 40 }}>
              {config.queue_serving.map(entry => (
                <div key={entry.id} className="text-center rounded-3xl" style={{
                  background: 'rgba(255,255,255,0.06)', padding: '40px 60px', minWidth: 300,
                }}>
                  <div style={{ fontSize: 16, textTransform: 'uppercase', letterSpacing: 4, opacity: 0.4, marginBottom: 8 }}>
                    {entry.cabinet || 'Cabinet'}
                  </div>
                  <div style={{ fontSize: 140, fontWeight: 800, lineHeight: 1, color: config.primary_color, fontVariantNumeric: 'tabular-nums' }}>
                    #{entry.numar_tichet}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ opacity: 0.3 }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>{emptyIcon}</div>
            <div style={{ fontSize: 32 }}>{emptyText}</div>
          </div>
        </div>
      )}

      {/* Bottom strip: next 3 + wait time + QR */}
      <div className="flex items-end" style={{
        position: 'absolute', left: 60, right: 60,
        bottom: config.ticker_messages.length > 0 ? 60 : 16,
        gap: 24,
      }}>
        {/* Next in queue */}
        {config.queue_waiting.length > 0 && (
          <div className="rounded-2xl flex-1" style={{ background: 'rgba(255,255,255,0.06)', padding: '16px 24px' }}>
            <div style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 4, opacity: 0.4, marginBottom: 10 }}>
              Următorii
            </div>
            <div className="flex" style={{ gap: 12 }}>
              {config.queue_waiting.slice(0, 5).map((entry, idx) => (
                <div key={entry.id} className="rounded-xl" style={{
                  background: idx < 3 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                  padding: '10px 20px',
                  fontSize: idx < 3 ? 36 : 28,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  opacity: idx < 3 ? 1 : 0.5,
                }}>
                  #{entry.numar_tichet}
                </div>
              ))}
              {config.queue_waiting.length > 5 && (
                <div style={{ padding: '10px 20px', fontSize: 28, opacity: 0.3, fontWeight: 600 }}>
                  +{config.queue_waiting.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wait time + scan QR */}
        <div className="flex flex-col items-center" style={{ gap: 10 }}>
          {estimatedWaitNew > 0 && (
            <div className="rounded-xl text-center" style={{
              background: 'rgba(255,255,255,0.08)', padding: '12px 20px',
            }}>
              <div style={{ fontSize: 13, opacity: 0.4, textTransform: 'uppercase', letterSpacing: 2 }}>Așteptare</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: config.primary_color }}>~{estimatedWaitNew} min</div>
            </div>
          )}
          <div className="rounded-xl flex flex-col items-center" style={{
            background: 'rgba(255,255,255,0.08)', padding: '10px 14px',
          }}>
            <div className="rounded-lg" style={{ background: '#fff', padding: 6 }}>
              <QRCodeSVG value={queueUrl} size={52} />
            </div>
            <div style={{ fontSize: 10, opacity: 0.4, marginTop: 4 }}>Ia un tichet</div>
          </div>
        </div>
      </div>

      {/* Medicine: rotating info strip (doctors + services + Google Reviews) */}
      {config.vertical_type === 'medicine' && (config.medicine_doctors.length > 0 || config.medicine_services.length > 0 || config.google_reviews_url) && (
        <MedicineInfoStrip config={config} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Medicine Info Strip — rotating doctors, services, Google Reviews
   ═══════════════════════════════════════════════════ */

function MedicineInfoStrip({ config }: { config: DisplayConfig }) {
  const slides: React.ReactNode[] = [];

  // Doctor profiles slide
  if (config.medicine_doctors.length > 0) {
    slides.push(
      <div key="doctors" className="flex items-center" style={{ gap: 32 }}>
        <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.7, minWidth: 140 }}>🩺 Echipa medicală</div>
        <div className="flex" style={{ gap: 16 }}>
          {config.medicine_doctors.map((d, i) => (
            <div key={i} className="rounded-xl" style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</div>
              <div style={{ fontSize: 11, opacity: 0.5 }}>{d.specialization}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Services slide
  if (config.medicine_services.length > 0) {
    slides.push(
      <div key="services" className="flex items-center" style={{ gap: 32 }}>
        <div style={{ fontSize: 18, fontWeight: 700, opacity: 0.7, minWidth: 140 }}>📋 Servicii</div>
        <div className="flex flex-wrap" style={{ gap: 10 }}>
          {config.medicine_services.map((s, i) => (
            <div key={i} className="rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', padding: '6px 14px', fontSize: 14 }}>
              {s.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Google Reviews CTA slide
  if (config.google_reviews_url) {
    slides.push(
      <div key="reviews" className="flex items-center justify-center" style={{ gap: 24 }}>
        <div className="text-center">
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>⭐ Vă mulțumim pentru vizită!</div>
          <div style={{ fontSize: 16, opacity: 0.6 }}>Lăsați o recenzie pe Google</div>
        </div>
        <div className="rounded-xl" style={{ background: '#fff', padding: 10 }}>
          <QRCodeSVG value={config.google_reviews_url} size={72} />
        </div>
      </div>
    );
  }

  const [slideIdx, setSlideIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (slides.length <= 1) return;
    const duration = 6000;
    const fadeTimer = setTimeout(() => setVisible(false), duration - 600);
    const switchTimer = setTimeout(() => {
      setSlideIdx(prev => (prev + 1) % slides.length);
      setVisible(true);
    }, duration);
    return () => { clearTimeout(fadeTimer); clearTimeout(switchTimer); };
  }, [slideIdx, slides.length]);

  if (slides.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 z-10 rounded-2xl" style={{
      bottom: config.ticker_messages.length > 0 ? 60 : 12,
      margin: '0 60px',
      background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(20px)',
      padding: '16px 28px',
      transition: 'opacity 0.5s ease',
      opacity: visible ? 1 : 0,
    }}>
      {slides[slideIdx % slides.length]}
    </div>
  );
}



function ConstructionContent({ config }: { config: DisplayConfig }) {
  return (
    <div className="absolute inset-0 flex" style={{ padding: '100px 48px 60px', gap: 32 }}>
      {/* Left: Tasks */}
      <div className="flex-1 flex flex-col">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>🏗️ Sarcini active</div>
        {config.construction_tasks.length > 0 ? (
          <div className="flex-1 flex flex-col" style={{ gap: 12 }}>
            {config.construction_tasks.map(task => (
              <div key={task.id} className="flex items-center rounded-xl"
                style={{ background: 'rgba(255,255,255,0.06)', padding: '14px 20px', gap: 16 }}>
                <div style={{
                  width: 6, alignSelf: 'stretch', borderRadius: 3,
                  background: PRIORITY_COLORS[task.prioritate] || PRIORITY_COLORS.normal,
                }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 20, fontWeight: 600 }} className="truncate">{task.titlu}</div>
                  <div className="flex" style={{ gap: 16, fontSize: 14, opacity: 0.5, marginTop: 4 }}>
                    {task.locatie && <span>📍 {task.locatie}</span>}
                    {task.assignee && <span>👷 {task.assignee}</span>}
                    <span>{task.status === 'in_progress' ? '🔨 În lucru' : task.status === 'blocked' ? '🚫 Blocat' : '📋 De făcut'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ opacity: 0.3 }}>
            <div className="text-center">
              <div style={{ fontSize: 64, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 22 }}>Toate sarcinile sunt finalizate</div>
            </div>
          </div>
        )}
      </div>

      {/* Right: SSM + Date */}
      <div className="flex flex-col" style={{ width: 420 }}>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 20 }}>⚠️ SSM</div>
        {config.ssm_reminders.length > 0 ? (
          <div className="flex flex-col" style={{ gap: 10 }}>
            {config.ssm_reminders.map(r => (
              <div key={r.id} className="rounded-xl" style={{
                padding: '14px 18px',
                background: r.tip === 'danger' ? 'rgba(239,68,68,0.15)' :
                  r.tip === 'warning' ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)',
                borderLeft: `4px solid ${r.tip === 'danger' ? '#ef4444' : r.tip === 'warning' ? '#f97316' : 'rgba(255,255,255,0.2)'}`,
              }}>
                <div style={{ fontSize: 18 }}>{r.mesaj}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', padding: 20, textAlign: 'center', opacity: 0.3 }}>
            <div style={{ fontSize: 18 }}>Niciun avertisment activ</div>
          </div>
        )}

        <div className="mt-auto rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', padding: 20 }}>
          <div style={{ fontSize: 18, opacity: 0.5, textTransform: 'capitalize' }}>
            {format(new Date(), 'EEEE, d MMMM yyyy', { locale: ro })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Panel Slideshow — CSS-only transitions (Puppeteer 5fps safe)
   ═══════════════════════════════════════════════════ */

function PanelSlideshow({ panels, primaryColor }: { panels: DisplayPanel[]; primaryColor: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (panels.length <= 1) return;
    const duration = (panels[currentIndex]?.durata || 8) * 1000;

    // Start fade-out 800ms before switch
    const fadeTimer = setTimeout(() => setVisible(false), duration - 800);
    const switchTimer = setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % panels.length);
      setVisible(true);
    }, duration);

    return () => { clearTimeout(fadeTimer); clearTimeout(switchTimer); };
  }, [currentIndex, panels]);

  if (panels.length === 0) return null;
  const panel = panels[currentIndex];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ padding: '120px 100px 180px', transition: 'opacity 0.8s ease', opacity: visible ? 1 : 0 }}>
      <span className="rounded-full" style={{
        display: 'inline-block', padding: '6px 24px', marginBottom: 24,
        fontSize: 16, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 3,
        background: primaryColor,
      }}>
        {panel.tip}
      </span>
      <h2 style={{ fontSize: 56, fontWeight: 700, lineHeight: 1.2, textAlign: 'center', maxWidth: 1400 }}>
        {panel.continut}
      </h2>

      {/* Indicators */}
      {panels.length > 1 && (
        <div className="flex" style={{ gap: 8, position: 'absolute', bottom: 120 }}>
          {panels.map((_, i) => (
            <div key={i} className="rounded-full" style={{
              height: 10,
              width: i === currentIndex ? 36 : 10,
              background: i === currentIndex ? primaryColor : 'rgba(255,255,255,0.25)',
              transition: 'all 0.5s ease',
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
