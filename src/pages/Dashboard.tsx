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
        <g stroke="#0B3F56" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {/* Layer 1 — top area */}
          <path d="M-20,80 C120,60 240,110 360,95 C480,80 560,40 720,65 C880,90 1000,50 1140,70 C1280,90 1380,55 1460,75" />
          <path d="M-20,120 C100,140 220,90 380,115 C540,140 640,100 800,125 C960,150 1080,105 1220,130 C1360,155 1420,120 1460,135" />
          <path d="M-20,170 C150,150 280,190 440,175 C600,160 700,200 860,180 C1020,160 1120,195 1280,178 C1380,165 1430,185 1460,175" />
          
          {/* Layer 2 — upper-mid */}
          <path d="M-20,240 C80,220 200,260 340,245 C480,230 620,270 760,250 C900,230 1040,265 1180,248 C1320,231 1400,255 1460,242" />
          <path d="M-20,290 C140,310 260,275 400,295 C540,315 680,280 820,300 C960,320 1100,285 1240,305 C1360,320 1420,295 1460,308" />
          <path d="M-20,340 C100,325 230,355 370,338 C510,321 650,360 790,342 C930,324 1060,358 1200,340 C1340,322 1410,350 1460,338" />
          
          {/* Layer 3 — center */}
          <path d="M-20,410 C160,430 300,395 440,415 C580,435 720,400 860,420 C1000,440 1140,405 1280,425 C1380,438 1430,415 1460,422" />
          <path d="M-20,460 C120,445 260,475 400,458 C540,441 680,478 820,460 C960,442 1100,476 1240,458 C1360,445 1420,468 1460,455" />
          <path d="M-20,510 C90,530 230,500 380,518 C530,536 670,505 810,520 C950,535 1090,502 1230,518 C1370,534 1430,510 1460,520" />
          <path d="M-20,555 C150,540 290,568 430,552 C570,536 710,565 850,548 C990,531 1130,562 1270,545 C1370,535 1430,555 1460,548" />
          
          {/* Layer 4 — lower-mid */}
          <path d="M-20,620 C130,640 270,610 410,628 C550,646 690,615 830,632 C970,649 1110,618 1250,635 C1370,648 1430,625 1460,635" />
          <path d="M-20,670 C100,655 240,685 380,668 C520,651 660,688 800,670 C940,652 1080,685 1220,668 C1340,655 1420,675 1460,665" />
          <path d="M-20,720 C160,738 300,708 440,725 C580,742 720,712 860,728 C1000,744 1140,715 1280,730 C1380,740 1430,720 1460,728" />
          
          {/* Layer 5 — bottom area */}
          <path d="M-20,790 C120,775 260,805 400,788 C540,771 680,808 820,790 C960,772 1100,805 1240,788 C1360,775 1420,798 1460,785" />
          <path d="M-20,840 C140,858 280,830 420,845 C560,860 700,832 840,848 C980,864 1120,835 1260,850 C1380,860 1430,840 1460,848" />
          <path d="M-20,900 C100,885 240,915 380,898 C520,881 660,918 800,900 C940,882 1080,915 1220,898 C1340,885 1420,905 1460,895" />
          <path d="M-20,950 C150,965 290,940 430,955 C570,970 710,942 850,958 C990,974 1130,945 1270,960 C1370,970 1430,948 1460,958" />
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
  { icon: Users, label: 'Prezența azi', value: '4/5', colorClass: 'bg-[#FFC107] text-[#1a1a1a]', moduleKey: 'prezenta' },
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
