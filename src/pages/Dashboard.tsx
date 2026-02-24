import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { getRoles, getRoleLabel } from '@/utils/roles';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
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

export default function Dashboard() {
  const { user } = useAuth();
  const { currentGroup } = useGroup();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visibility, setVisibility] = useState<ModuleVisibility>(loadVisibility);

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
    <div className="space-y-5 min-w-0 pb-32">
      {/* Compact welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl overflow-hidden shadow-md"
      >
        <div className="h-1 gradient-accent" />
        <div className="p-4 bg-primary text-primary-foreground">
          <h1 className="text-xl font-display font-bold truncate">
            Bun venit, {user.nume_prenume.split(' ')[0]}! 👋
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-0.5">
            {currentGroup ? `${currentGroup.nume} — ${currentGroup.tip === 'gradinita' ? 'Grădiniță' : 'Școală'}` : 'Selectează o grupă'}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {roles.map(r => (
              <Badge key={r} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
                {getRoleLabel(r)}
              </Badge>
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
      <ModuleHub visibility={visibility} />

      {/* Config sidebar */}
      <ConfigSidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        visibility={visibility}
        onToggle={handleToggle}
      />
    </div>
  );
}
