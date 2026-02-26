import { useState, useCallback, useEffect, memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { getRoles, getRoleLabel } from '@/utils/roles';
import { Badge } from '@/components/ui/badge';
import { Users, Camera, FileText, MessageSquare, Clock, CalendarDays, Utensils, BookOpen, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import ChildrenScroller from '@/components/dashboard/ChildrenScroller';
import ModuleHub, { DEFAULT_VISIBILITY, type ModuleVisibility } from '@/components/dashboard/ModuleHub';
import ConfigSidebar from '@/components/dashboard/ConfigSidebar';
import AnnouncementsTicker from '@/components/dashboard/AnnouncementsTicker';

/* Topographic contour lines background — inline SVG, no external files */
function BackgroundShapes() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
      <svg
        className="w-full h-full opacity-[0.09]"
        viewBox="0 0 1440 1024"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="hsl(200 42% 21%)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
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

        {/* Flower 1 — 5-petal daisy, top-right */}
        <g transform="translate(1080, 180)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="-12" rx="5" ry="10" />
          <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(72)" />
          <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(144)" />
          <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(216)" />
          <ellipse cx="0" cy="-12" rx="5" ry="10" transform="rotate(288)" />
          <circle cx="0" cy="0" r="4" />
          <path d="M0,10 C-2,30 2,50 -4,70" />
          <path d="M-2,40 C-14,35 -16,48 -4,50" />
          <path d="M0,55 C10,48 14,58 4,62" />
        </g>

        {/* Flower 2 — tulip, left-mid */}
        <g transform="translate(650, 480)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0,-20 C-8,-18 -14,-8 -12,0 C-10,6 -4,10 0,8" />
          <path d="M0,-20 C8,-18 14,-8 12,0 C10,6 4,10 0,8" />
          <path d="M0,-18 C-2,-12 -2,-4 0,8" />
          <path d="M0,8 C1,30 -1,50 2,72" />
          <path d="M0,35 C-12,28 -14,40 -4,44" />
          <path d="M1,52 C11,46 14,56 5,60" />
        </g>

        {/* Flower 3 — 6-petal, bottom-right */}
        <g transform="translate(1250, 750)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="-10" rx="4" ry="8" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(60)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(120)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(180)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(240)" />
          <ellipse cx="0" cy="-10" rx="4" ry="8" transform="rotate(300)" />
          <circle cx="0" cy="0" r="3" />
          <path d="M0,8 C-3,28 1,48 -2,65" />
          <path d="M-1,30 C-10,24 -12,34 -3,38" />
        </g>

        {/* Flower 4 — simple bell/bluebell, top-left */}
        <g transform="translate(350, 100)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0,0 C-10,-4 -12,-16 -6,-22 C-2,-26 4,-26 8,-22 C14,-16 12,-4 0,0" />
          <path d="M-4,-10 C-2,-6 2,-6 4,-10" />
          <path d="M0,0 C2,20 -1,40 3,60" />
          <path d="M1,25 C10,20 12,30 4,34" />
        </g>

        {/* Flower 5 — tiny 4-petal, center-right */}
        <g transform="translate(780, 350)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="-8" rx="4" ry="7" />
          <ellipse cx="0" cy="-8" rx="4" ry="7" transform="rotate(90)" />
          <ellipse cx="0" cy="-8" rx="4" ry="7" transform="rotate(180)" />
          <ellipse cx="0" cy="-8" rx="4" ry="7" transform="rotate(270)" />
          <circle cx="0" cy="0" r="2.5" />
          <path d="M0,7 C-1,22 1,38 -1,52" />
          <path d="M0,20 C-8,16 -10,24 -3,27" />
        </g>

        {/* Bee 1 — lower-left */}
        <g transform="translate(720, 750)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="0" rx="10" ry="6" />
          <line x1="-3" y1="-5.5" x2="-3" y2="5.5" />
          <line x1="2" y1="-6" x2="2" y2="6" />
          <circle cx="12" cy="0" r="4" />
          <path d="M14,-3 C16,-10 20,-12 22,-9" />
          <path d="M15,-2 C19,-8 23,-7 24,-4" />
          <ellipse cx="-2" cy="-9" rx="7" ry="4" transform="rotate(-15, -2, -9)" />
          <ellipse cx="3" cy="-10" rx="6" ry="3.5" transform="rotate(10, 3, -10)" />
          <line x1="-10" y1="0" x2="-14" y2="0" />
        </g>

        {/* Bee 2 — top-center, angled */}
        <g transform="translate(700, 130) rotate(-25)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="0" rx="8" ry="5" />
          <line x1="-2" y1="-4.5" x2="-2" y2="4.5" />
          <line x1="2" y1="-5" x2="2" y2="5" />
          <circle cx="10" cy="0" r="3.5" />
          <path d="M12,-2 C14,-8 17,-9 19,-6" />
          <path d="M12.5,-1 C16,-6 19,-5 20,-2" />
          <ellipse cx="-1" cy="-7" rx="6" ry="3.5" transform="rotate(-10, -1, -7)" />
          <ellipse cx="3" cy="-8" rx="5" ry="3" transform="rotate(15, 3, -8)" />
          <line x1="-8" y1="0" x2="-11" y2="1" />
        </g>

        {/* Bee 3 — right-mid, facing left */}
        <g transform="translate(820, 550) scale(-1,1)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="0" rx="9" ry="5.5" />
          <line x1="-2" y1="-5" x2="-2" y2="5" />
          <line x1="3" y1="-5.5" x2="3" y2="5.5" />
          <circle cx="11" cy="0" r="3.5" />
          <path d="M13,-2.5 C15,-9 18,-10 20,-7" />
          <path d="M13.5,-1.5 C17,-7 20,-6 21,-3" />
          <ellipse cx="-1" cy="-8" rx="6.5" ry="3.5" transform="rotate(-12, -1, -8)" />
          <ellipse cx="3" cy="-9" rx="5.5" ry="3" transform="rotate(8, 3, -9)" />
          <line x1="-9" y1="0" x2="-12" y2="0" />
        </g>

        {/* Bee 4 — bottom-center, small */}
        <g transform="translate(600, 880) rotate(15)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="0" rx="7" ry="4.5" />
          <line x1="-2" y1="-4" x2="-2" y2="4" />
          <line x1="2" y1="-4.5" x2="2" y2="4.5" />
          <circle cx="9" cy="0" r="3" />
          <path d="M11,-2 C13,-7 15,-8 17,-5" />
          <path d="M11.5,-1 C14,-6 16,-5 17,-2.5" />
          <ellipse cx="-1" cy="-6.5" rx="5.5" ry="3" transform="rotate(-10, -1, -6.5)" />
          <ellipse cx="2" cy="-7" rx="5" ry="2.5" transform="rotate(12, 2, -7)" />
          <line x1="-7" y1="0" x2="-10" y2="0.5" />
        </g>

        {/* Flower 6 — sunflower-style, bottom-center */}
        <g transform="translate(720, 920)" stroke="hsl(200 42% 21%)" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="0" cy="-14" rx="4" ry="9" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(45)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(90)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(135)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(180)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(225)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(270)" />
          <ellipse cx="0" cy="-14" rx="4" ry="9" transform="rotate(315)" />
          <circle cx="0" cy="0" r="5" />
          <circle cx="0" cy="0" r="2.5" />
        </g>
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

function DashboardCharts() {
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
          Tendințe prezență (ultimele 30 zile)
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

const QUICK_STATS = [
  { icon: Users, label: 'Prezența azi', value: '4/5', colorClass: 'bg-[#FF69B4] text-white', moduleKey: 'prezenta' },
  { icon: Camera, label: 'Fotografii azi', value: '12', colorClass: 'bg-[#2ECC71] text-white', moduleKey: 'imagini' },
  { icon: FileText, label: 'Documente noi', value: '3', colorClass: 'bg-[#3498DB] text-white', moduleKey: 'documente' },
  { icon: MessageSquare, label: 'Mesaje necitite', value: '2', colorClass: 'bg-[#E91E63] text-white', moduleKey: 'mesaje' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibility, setVisibility] = useState<ModuleVisibility>(loadVisibility);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      setSearchQuery((e as CustomEvent).detail || '');
    };
    const configHandler = () => setSidebarOpen(true);
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

  if (!user) return null;

  const roles = getRoles(user.status);

  return (
    <div className="relative isolate min-w-0 pb-32">
      <BackgroundShapes />
      {/* Desktop: 2-column layout — welcome + children on left, modules on right */}
      <div className="relative z-10 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-6 lg:items-start space-y-5 lg:space-y-0">
        {/* Left column: Welcome + Children */}
        <div className="space-y-5">
          {/* Compact welcome banner with stats */}
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
            {/* Card title: Rezumatul zilei */}
            <div className="hidden lg:flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-sm font-display font-bold text-foreground flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                Rezumatul zilei
              </h3>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                <Clock className="h-2.5 w-2.5" />
                Acum 5 min
              </span>
            </div>

            <div className="p-5 lg:pt-0">
              {/* Mobile only: show name (desktop shows in header) */}
              <h1 className="text-xl font-display font-bold text-foreground truncate lg:hidden">
                Bun venit, {user.nume_prenume.split(' ')[0]}! 👋
              </h1>
              {/* Desktop: show group info more prominently */}
              <h1 className="hidden lg:block text-lg font-display font-bold text-foreground truncate">
                {currentGroup?.nume || 'Dashboard'}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {currentGroup ? `${currentGroup.tip === 'gradinita' ? 'Grădiniță' : 'Școală'}` : 'Selectează o grupă'}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roles.map(r => (
                  <Badge key={r} variant="secondary" className="bg-foreground/10 text-foreground/80 border-0 text-xs backdrop-blur-sm">
                    {getRoleLabel(r)}
                  </Badge>
                ))}
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {QUICK_STATS.map(stat => (
                  <button
                    key={stat.label}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-module', { detail: stat.moduleKey }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform active:scale-95 hover:scale-105 ${stat.colorClass}`}
                  >
                    <stat.icon className="h-3.5 w-3.5" />
                    <span>{stat.label}</span>
                    <span className="opacity-80">·</span>
                    <span>{stat.value}</span>
                  </button>
                ))}
              </div>

              {/* Desktop: Rezumatul zilei details */}
              <div className="hidden lg:block mt-4 pt-3 border-t border-foreground/10">
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center gap-1.5"><Utensils className="h-3 w-3 text-[hsl(28,80%,52%)]" /><span className="text-muted-foreground">Meniu:</span></div>
                  <span className="col-span-2 font-semibold text-foreground truncate">Supă de legume, Pui</span>
                  <div className="flex items-center gap-1.5"><BookOpen className="h-3 w-3 text-[hsl(271,47%,53%)]" /><span className="text-muted-foreground">Activitate:</span></div>
                  <span className="col-span-2 font-semibold text-foreground truncate">Pictură pe sticlă</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Desktop-only: Charts */}
          <DashboardCharts />

        </div>

        {/* Right column: Module cards */}
        <div className="space-y-3">
          {/* Module card stack */}
          <div data-tutorial="module-hub">
            <ModuleHub visibility={visibility} searchQuery={searchQuery} />
          </div>

        </div>
      </div>

      {/* Config sidebar */}
      <ConfigSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        visibility={visibility}
        onToggle={handleToggle}
      />

      {/* Sticky announcements ticker */}
      <AnnouncementsTicker />
    </div>
  );
}
