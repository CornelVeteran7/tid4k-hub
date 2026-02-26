import { useState, useCallback, useEffect } from 'react';
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

/* Organic flowing background — blue contour lines, transparent between lines */
function BackgroundShapes() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute -left-[22%] -top-[14%] h-[74%] w-[160%] sm:-left-[10%] sm:w-[120%] lg:-top-[20%] lg:h-[95%] lg:w-[120%] opacity-[0.13] sm:opacity-[0.11] lg:opacity-[0.08]">
        <div
          className="h-full w-full animate-slow-rotate [animation-duration:160s]"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            WebkitMaskImage: 'url(/images/organic-bg-v1.svg)',
            maskImage: 'url(/images/organic-bg-v1.svg)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>

      <div className="absolute -right-[35%] -bottom-[24%] h-[58%] w-[140%] sm:-right-[18%] sm:h-[65%] sm:w-[110%] lg:-right-[8%] lg:-bottom-[24%] lg:h-[85%] lg:w-[82%] opacity-[0.08] lg:opacity-[0.05]">
        <div
          className="h-full w-full animate-slow-rotate-reverse [animation-duration:210s]"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            WebkitMaskImage: 'url(/images/organic-bg-v1.svg)',
            maskImage: 'url(/images/organic-bg-v1.svg)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            transform: 'scaleX(-1)',
          }}
        />
      </div>
    </div>
  );
}


// Mock data for charts
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
            <div className="p-5">
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

              {/* Desktop: Rezumatul zilei inline */}
              <div className="hidden lg:block mt-4 pt-3 border-t border-foreground/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-display font-bold text-muted-foreground flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Rezumatul zilei
                  </h3>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Clock className="h-2.5 w-2.5" />
                    Acum 5 min
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs">
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
