import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { getRoles, getRoleLabel } from '@/utils/roles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Users, Camera, FileText, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import ChildrenScroller from '@/components/dashboard/ChildrenScroller';
import ModuleHub, { DEFAULT_VISIBILITY, type ModuleVisibility } from '@/components/dashboard/ModuleHub';
import ConfigSidebar from '@/components/dashboard/ConfigSidebar';
import AnnouncementsTicker from '@/components/dashboard/AnnouncementsTicker';

const STORAGE_KEY = 'tid4k_visible_modules';

function loadVisibility(): ModuleVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_VISIBILITY, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_VISIBILITY };
}

const QUICK_STATS = [
  { icon: Users, label: 'Prezența azi', value: '4/5', colorClass: 'bg-[#FFC107] text-[#1a1a1a]', moduleKey: 'prezenta' },
  { icon: Camera, label: 'Fotografii', value: '12', colorClass: 'bg-[#2ECC71] text-white', moduleKey: 'imagini' },
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
    window.addEventListener('dashboard-search', handler);
    return () => window.removeEventListener('dashboard-search', handler);
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
    <div className="space-y-5 min-w-0 pb-32 max-w-4xl mx-auto">
      {/* Compact welcome banner with stats */}
      <motion.div
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
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_STATS.map(stat => (
              <button
                key={stat.label}
                onClick={() => window.dispatchEvent(new CustomEvent('open-module', { detail: stat.moduleKey }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-transform active:scale-95 ${stat.colorClass}`}
              >
                <stat.icon className="h-3.5 w-3.5" />
                <span>{stat.label}</span>
                <span className="opacity-80">·</span>
                <span>{stat.value}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Children horizontal scroller */}
      <ChildrenScroller />

      {/* Settings button */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="gap-1.5 text-muted-foreground">
          <Settings className="h-4 w-4" />
          Configurare
        </Button>
      </div>

      {/* Module card stack */}
      <ModuleHub visibility={visibility} searchQuery={searchQuery} />

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
