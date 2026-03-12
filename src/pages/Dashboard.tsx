import { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BackgroundDecorations } from '@/components/decorations/VerticalDecorations';
import { useGroup } from '@/contexts/GroupContext';
import { getRoles } from '@/utils/roles';
import { getVerticalRoleLabel } from '@/config/verticalConfig';
import { Badge } from '@/components/ui/badge';
import { VERTICAL_DEFINITIONS, type VerticalType } from '@/config/verticalConfig';
import { Users, Camera, FileText, Clock, CalendarDays, Utensils, BookOpen, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useModuleConfig, type ModuleConfig } from '@/config/moduleConfig';
import { getMenu } from '@/api/menu';
import { getAttendance } from '@/api/attendance';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import ChildrenScroller from '@/components/dashboard/ChildrenScroller';
import ModuleHub, { DEFAULT_VISIBILITY, type ModuleVisibility, loadModuleOrder, saveModuleOrder } from '@/components/dashboard/ModuleHub';
import AnnouncementsTicker from '@/components/dashboard/AnnouncementsTicker';
import AttendanceGrid from '@/components/dashboard/AttendanceGrid';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import type { MenuItem } from '@/types';

/* ── Meal time thresholds ── */
const MEAL_SLOTS = [
  { masa: 'mic_dejun', label: 'Mic dejun', startHour: 0, startMin: 0, endHour: 9, endMin: 0 },
  { masa: 'gustare_1', label: 'Gustare 1', startHour: 9, startMin: 1, endHour: 10, endMin: 30 },
  { masa: 'pranz', label: 'Prânz', startHour: 10, startMin: 31, endHour: 13, endMin: 0 },
  { masa: 'gustare_2', label: 'Gustare 2', startHour: 13, startMin: 1, endHour: 23, endMin: 59 },
];

const RO_DAYS = ['Duminică', 'Luni', 'Marți', 'Miercuri', 'Joi', 'Vineri', 'Sâmbătă'];

function getCurrentMealSlot() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  for (const slot of MEAL_SLOTS) {
    const start = slot.startHour * 60 + slot.startMin;
    const end = slot.endHour * 60 + slot.endMin;
    if (mins >= start && mins <= end) return slot;
  }
  return MEAL_SLOTS[MEAL_SLOTS.length - 1];
}

function useCurrentMeal() {
  const [meal, setMeal] = useState<{ label: string; content: string; emoji: string } | null>(null);
  const [isWeekend, setIsWeekend] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const update = async () => {
      const now = new Date();
      const dayIndex = now.getDay();
      if (dayIndex === 0 || dayIndex === 6) {
        setIsWeekend(true);
        setMeal(null);
        return;
      }
      setIsWeekend(false);

      const weekStr = format(now, "yyyy-'W'II");
      const dayName = RO_DAYS[dayIndex];
      const slot = getCurrentMealSlot();

      try {
        const menuData = await getMenu(weekStr);
        const item = menuData.items.find(
          (m: MenuItem) => m.masa === slot.masa && m.zi === dayName
        );
        if (!cancelled) {
          setMeal({
            label: slot.label,
            content: item?.continut || 'Nu este disponibil',
            emoji: item?.emoji || '🍽️',
          });
        }
      } catch {
        if (!cancelled) {
          setMeal({ label: slot.label, content: 'Meniu indisponibil', emoji: '🍽️' });
        }
      }
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  return { meal, isWeekend };
}

/* ── Quick Stats Row (extracted for meal integration) ── */
function QuickStatsRow({ config, onPrezentaClick, attendanceLabel }: { config: ModuleConfig; onPrezentaClick: () => void; attendanceLabel: string }) {
  const { meal, isWeekend } = useCurrentMeal();

  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {QUICK_STATS_BASE.map(stat => (
        <button
          key={stat.moduleKey}
          onClick={() => {
            if (stat.moduleKey === 'prezenta') {
              onPrezentaClick();
            } else {
              window.dispatchEvent(new CustomEvent('open-module', { detail: stat.moduleKey }));
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform active:scale-95 hover:scale-105 text-white"
          style={{ backgroundColor: config[stat.moduleKey].color }}
        >
          <stat.icon className="h-3.5 w-3.5" />
          <span>{config[stat.moduleKey].title}</span>
          <span className="opacity-80">·</span>
          <span>{stat.moduleKey === 'prezenta' ? attendanceLabel : stat.value}</span>
        </button>
      ))}
      {/* 4th button: current meal */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-module', { detail: 'meniu' }))}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform active:scale-95 hover:scale-105 text-white"
        style={{ backgroundColor: config.meniu.color }}
      >
        <Utensils className="h-3.5 w-3.5" />
        {isWeekend ? (
          <span>Weekend 😴</span>
        ) : meal ? (
          <span className="truncate">{meal.emoji} {meal.content.length > 20 ? meal.content.slice(0, 20) + '…' : meal.content}</span>
        ) : (
          <span>Se încarcă…</span>
        )}
      </button>
    </div>
  );
}

/* ── Desktop Summary Row (dynamic meal, vertical-aware) ── */
function DesktopSummary({ config, verticalType }: { config: ModuleConfig; verticalType: VerticalType }) {
  const { meal, isWeekend } = useCurrentMeal();
  const verticalDef = VERTICAL_DEFINITIONS[verticalType];
  const mealText = isWeekend ? 'Weekend — fără program' : (meal?.content || 'Se încarcă…');
  const showMeal = ['kids', 'schools', 'students'].includes(verticalType);

  return (
    <div className="hidden lg:block mt-4 pt-3 border-t border-foreground/10">
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
        {showMeal && (
          <>
            <div className="flex items-center gap-1.5"><Utensils className="h-3 w-3 text-[hsl(28,80%,52%)]" /><span className="text-muted-foreground">{verticalDef.summaryLabels.mealLabel}:</span></div>
            <span className="col-span-2 font-semibold text-foreground truncate">{mealText}</span>
          </>
        )}
        <div className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-[hsl(271,47%,53%)]" /><span className="text-muted-foreground">{verticalDef.summaryLabels.activityLabel}:</span></div>
        <span className="col-span-2 font-semibold text-foreground truncate">—</span>
      </div>
    </div>
  );
}

/* Topographic contour lines background + vertical-specific decorations */
function BackgroundShapes() {
  const { user } = useAuth();
  const verticalType = (user?.vertical_type || 'kids') as VerticalType;

  // Dark verticals need light strokes and higher opacity
  const isDarkVertical = verticalType === 'culture';
  const contourStroke = isDarkVertical ? 'hsl(40 30% 65%)' : 'hsl(200 42% 21%)';
  const svgOpacity = isDarkVertical ? 'opacity-[0.14]' : 'opacity-[0.09]';

  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <svg
        className={`w-full h-full ${svgOpacity}`}
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke={contourStroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Layer 1 — top */}
          <path d="M-40,70 C60,20 180,140 320,80 C460,20 540,150 720,60 C900,−30 1020,160 1180,70 C1340,−20 1400,100 1480,50" />
          <path d="M-40,130 C80,180 200,50 370,130 C540,210 620,40 800,140 C980,240 1060,60 1230,140 C1400,220 1440,80 1480,130" />
          <path d="M-40,190 C120,130 260,260 420,170 C580,80 680,270 860,180 C1040,90 1140,250 1300,170 C1400,110 1450,220 1480,180" />

          {/* Layer 2 — upper-mid */}
          <path d="M-40,260 C50,210 180,330 340,250 C500,170 600,340 770,260 C940,180 1060,330 1200,260 C1340,190 1420,310 1480,260" />
          <path d="M-40,320 C100,380 240,240 400,320 C560,400 660,230 830,320 C1000,410 1100,250 1260,330 C1380,390 1440,270 1480,320" />
          <path d="M-40,370 C140,310 270,440 430,360 C590,280 700,450 870,370 C1040,290 1150,430 1310,360 C1400,310 1450,420 1480,370" />

          {/* Layer 3 — center */}
          <path d="M-40,440 C80,500 220,370 380,450 C540,530 680,360 840,450 C1000,540 1120,380 1280,450 C1380,500 1440,390 1480,440" />
          <path d="M-40,500 C120,440 260,570 420,490 C580,410 720,580 880,500 C1040,420 1160,560 1300,490 C1400,440 1450,550 1480,500" />
          <path d="M-40,555 C60,610 200,490 370,560 C540,630 660,470 830,555 C1000,640 1120,480 1280,555 C1380,610 1440,500 1480,555" />

          {/* Layer 4 — lower-mid */}
          <path d="M-40,630 C100,570 240,700 400,620 C560,540 700,710 860,630 C1020,550 1140,700 1300,630 C1400,580 1450,690 1480,630" />
          <path d="M-40,690 C80,750 220,620 380,700 C540,780 680,610 840,700 C1000,790 1120,630 1280,700 C1380,760 1440,640 1480,690" />
          <path d="M-40,750 C130,690 270,820 430,740 C590,660 720,830 880,750 C1040,670 1160,810 1300,740 C1400,690 1450,800 1480,750" />

          {/* Layer 5 — bottom */}
          <path d="M-40,820 C70,880 210,750 380,830 C550,910 670,740 840,830 C1010,920 1120,760 1280,830 C1380,880 1440,770 1480,820" />
          <path d="M-40,880 C110,820 260,950 420,870 C580,790 720,960 880,880 C1040,800 1160,940 1300,870 C1400,820 1450,930 1480,880" />
          <path d="M-40,940 C80,1000 220,870 380,950 C540,1030 680,860 840,950 C1000,1040 1120,880 1280,950 C1380,1000 1440,890 1480,940" />
        </g>

        {/* Vertical-specific themed decorations */}
        <BackgroundDecorations vertical={verticalType} />
      </svg>
    </div>
  );
}


// Stable mock data — created once outside component to avoid re-renders
const STORAGE_KEY = 'tid4k_visible_modules';

const attendanceData = Array.from({ length: 28 }, (_, i) => ({
  day: String(i + 1).padStart(2, '0'),
  prezenti: Math.floor(Math.random() * 8) + 14,
  absenti: Math.floor(Math.random() * 4) + 1,
}));

const userActivityData = [
  { name: 'Maria Popescu', actions: 142 },
  { name: 'Ion Ionescu', actions: 89 },
  { name: 'Ana Dumitrescu', actions: 105 },
  { name: 'Andrei Părinte', actions: 67 },
  { name: 'Elena Stănescu', actions: 34 },
];

const docCategoryData = [
  { name: 'Activități', value: 45, color: 'hsl(210,30%,40%)' },
  { name: 'Administrativ', value: 23, color: 'hsl(145,63%,42%)' },
  { name: 'Teme', value: 31, color: 'hsl(40,90%,55%)' },
  { name: 'Fotografii', value: 67, color: 'hsl(0,72%,50%)' },
];

function DashboardCharts({ chartLabel }: { chartLabel: string }) {
  return (
    <div className="hidden lg:flex flex-col gap-5">
      {/* Attendance trends */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-2xl overflow-hidden border border-white/30 shadow-lg p-5"
        style={{
          background: 'rgba(255,255,255,0.45)',
          backdropFilter: 'blur(24px) saturate(1.8)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
          boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-2 mb-4">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          {chartLabel}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={attendanceData}>
            <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Line type="monotone" dataKey="prezenti" stroke="hsl(145,63%,42%)" strokeWidth={2} dot={{ r: 3 }} name="Prezenți" />
            <Line type="monotone" dataKey="absenti" stroke="hsl(0,72%,50%)" strokeWidth={2} dot={{ r: 3 }} name="Absenți" />
            <Legend iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom row: User activity + Document categories */}
      <div className="grid grid-cols-2 gap-5">
        {/* User activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="rounded-2xl overflow-hidden border border-white/30 shadow-lg p-5"
          style={{
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <h3 className="text-sm font-display font-bold text-foreground mb-4">Activitate utilizatori</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={userActivityData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="actions" fill="hsl(210,30%,35%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Document categories */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-2xl overflow-hidden border border-white/30 shadow-lg p-5"
          style={{
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <h3 className="text-sm font-display font-bold text-foreground mb-4">Documente pe categorii</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={docCategoryData}
                cx="50%"
                cy="50%"
                outerRadius={65}
                dataKey="value"
                label={({ value }) => value}
                labelLine={false}
                fontSize={11}
                fontWeight={700}
              >
                {docCategoryData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

function loadVisibility(): ModuleVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_VISIBILITY };
}

const QUICK_STATS_BASE = [
  { icon: Users, value: '4/5', moduleKey: 'prezenta' as const },
  { icon: Camera, value: '12', moduleKey: 'imagini' as const },
  { icon: FileText, value: '3', moduleKey: 'documente' as const },
];

export default function Dashboard() {
  const { config } = useModuleConfig();
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [visibility, setVisibility] = useState<ModuleVisibility>(loadVisibility);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [moduleOrder, setModuleOrder] = useState<string[]>(loadModuleOrder);
  const [showAttendanceGrid, setShowAttendanceGrid] = useState(false);
  const [attendanceCount, setAttendanceCount] = useState({ present: 0, total: 0 });

  useEffect(() => {
    const handler = (e: Event) => {
      setSearchQuery((e as CustomEvent).detail || '');
    };
    const configHandler = () => setEditMode(true);
    window.addEventListener('dashboard-search', handler);
    window.addEventListener('open-config-sidebar', configHandler);
    return () => {
      window.removeEventListener('dashboard-search', handler);
      window.removeEventListener('open-config-sidebar', configHandler);
    };
  }, []);

  const handleToggle = useCallback((key: keyof ModuleVisibility) => {
    setVisibility(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Load today's attendance count
  useEffect(() => {
    if (!currentGroup) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    getAttendance(currentGroup.id, today).then(day => {
      const p = day.records.filter(r => r.prezent).length;
      setAttendanceCount({ present: p, total: day.records.length });
    }).catch(() => {});
  }, [currentGroup]);

  if (!user) return null;

  const roles = getRoles(user.status);
  const verticalType = (user.vertical_type || 'kids') as VerticalType;
  const verticalDef = VERTICAL_DEFINITIONS[verticalType];
  const attendanceLabel = `${attendanceCount.present}/${attendanceCount.total}`;

  return (
    <div className="relative isolate min-w-0 pb-32">
      <BackgroundShapes />

      {/* Mobile: stacked layout */}
      <div className="relative z-10 space-y-5 lg:hidden">
        {/* Welcome banner */}
        <motion.div
          data-tutorial="welcome-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden border border-white/30 shadow-lg"
          style={{
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div className="p-5">
            <h1 className="text-xl font-display font-bold text-foreground truncate">
              Bun venit, {user.nume_prenume.split(' ')[0]}! 👋
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rezumatul zilei{currentGroup ? ` · ${currentGroup.nume}` : ''}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map(r => (
                <Badge key={r} variant="secondary" className="bg-foreground/10 text-foreground/80 border-0 text-xs backdrop-blur-sm">
                  {getVerticalRoleLabel(r, verticalType)}
                </Badge>
              ))}
            </div>
            <QuickStatsRow config={config} onPrezentaClick={() => setShowAttendanceGrid(true)} attendanceLabel={attendanceLabel} />
          </div>
        </motion.div>

        {/* Module cards */}
        <div data-tutorial="module-hub">
          <ModuleHub
            visibility={visibility}
            searchQuery={searchQuery}
            editMode={editMode}
            onToggle={handleToggle}
            moduleOrder={moduleOrder}
            onReorder={(order) => { setModuleOrder(order); saveModuleOrder(order); }}
            verticalModules={verticalDef.defaultModules}
            cardVariant={verticalDef.cardVariant}
          />
        </div>
      </div>

      {/* Desktop: 3-column grid layout */}
      <div className="relative z-10 hidden lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start">
        {/* Welcome card — spans 2 columns */}
        <motion.div
          data-tutorial="welcome-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/30 shadow-lg"
          style={{
            background: 'rgba(255,255,255,0.45)',
            backdropFilter: 'blur(24px) saturate(1.8)',
            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              Rezumatul zilei
            </h3>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <Clock className="h-2.5 w-2.5" />
              Acum 5 min
            </span>
          </div>
          <div className="p-5 pt-0">
            <h1 className="text-lg font-display font-bold text-foreground truncate">
              {currentGroup?.nume || 'Dashboard'}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {currentGroup ? `${verticalDef.entityLabel}` : `Selectează ${verticalDef.entityLabel.toLowerCase()}`}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {roles.map(r => (
                <Badge key={r} variant="secondary" className="bg-foreground/10 text-foreground/80 border-0 text-xs backdrop-blur-sm">
                  {getVerticalRoleLabel(r, verticalType)}
                </Badge>
              ))}
            </div>
            <QuickStatsRow config={config} onPrezentaClick={() => setShowAttendanceGrid(true)} attendanceLabel={attendanceLabel} />
            <DesktopSummary config={config} verticalType={verticalType} />
          </div>
        </motion.div>

        {/* Module cards — single column on the right, all rows */}
        <div className="lg:row-span-3 space-y-3" data-tutorial="module-hub">
          <ModuleHub
            visibility={visibility}
            searchQuery={searchQuery}
            editMode={editMode}
            onToggle={handleToggle}
            moduleOrder={moduleOrder}
            onReorder={(order) => { setModuleOrder(order); saveModuleOrder(order); }}
            verticalModules={verticalDef.defaultModules}
            cardVariant={verticalDef.cardVariant}
            desktopSingleColumn
          />
        </div>

        {/* Charts — span 2 columns below welcome */}
        <div className="lg:col-span-2">
          <DashboardCharts chartLabel={verticalDef.summaryLabels.attendanceLabel} />
        </div>
      </div>

      {/* Edit mode floating "Done" button */}
      {editMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
        >
          <Button
            onClick={() => setEditMode(false)}
            className="rounded-full px-6 py-3 text-sm font-bold shadow-xl bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Gata
          </Button>
        </motion.div>
      )}

      {/* Sticky announcements ticker */}
      <AnnouncementsTicker />

      {/* Full-screen attendance grid overlay */}
      {currentGroup && (
        <AttendanceGrid
          open={showAttendanceGrid}
          onClose={() => {
            setShowAttendanceGrid(false);
            // Refresh count after closing
            const today = format(new Date(), 'yyyy-MM-dd');
            getAttendance(currentGroup.id, today).then(day => {
              const p = day.records.filter(r => r.prezent).length;
              setAttendanceCount({ present: p, total: day.records.length });
            }).catch(() => {});
          }}
          groupId={currentGroup.id}
          groupName={currentGroup.nume}
        />
      )}
    </div>
  );
}
