import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare, Paintbrush } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModulePanel from './ModulePanel';
import ShareDialog from './ShareDialog';
import { useGroup } from '@/contexts/GroupContext';

const Attendance = lazy(() => import('@/pages/Attendance'));
const Documents = lazy(() => import('@/pages/Documents'));
const Messages = lazy(() => import('@/pages/Messages'));
const Stories = lazy(() => import('@/pages/Stories'));
const WeeklyMenu = lazy(() => import('@/pages/WeeklyMenu'));

export interface ModuleVisibility {
  prezenta: boolean;
  imagini: boolean;
  documente: boolean;
  povesti: boolean;
  ateliere: boolean;
  meniu: boolean;
  mesaje: boolean;
}

export const DEFAULT_VISIBILITY: ModuleVisibility = {
  prezenta: true,
  imagini: true,
  documente: true,
  povesti: true,
  ateliere: true,
  meniu: true,
  mesaje: true,
};

const MODULES = [
  { key: 'prezenta', title: 'PREZENTA', subtitle: 'Înregistrează prezența', color: '#FFC107', icon: ClipboardList, countLabel: '', showShare: false },
  { key: 'imagini', title: 'IMAGINI', subtitle: 'Fotografii activitati', color: '#2ECC71', icon: Image, countLabel: 'imagini', showShare: true },
  { key: 'documente', title: 'DOCUMENTE', subtitle: 'Fisiere PDF', color: '#3498DB', icon: FileText, countLabel: 'documente', showShare: true },
  { key: 'povesti', title: 'POVESTI', subtitle: 'Povesti pentru copii', color: '#9B59B6', icon: BookOpen, countLabel: 'povesti', showShare: false },
  { key: 'ateliere', title: 'ATELIERE', subtitle: 'Activitati creative pentru copii', color: '#8E44AD', icon: Paintbrush, countLabel: 'ateliere', showShare: false },
  { key: 'meniu', title: 'MENIUL SAPTAMANII', subtitle: 'Meniul zilnic pentru copii', color: '#F39C12', icon: UtensilsCrossed, countLabel: 'meniuri', showShare: false },
  { key: 'mesaje', title: 'MESAJE', subtitle: 'Comunicare cu parintii', color: '#E91E63', icon: MessageSquare, countLabel: 'mesaje', showShare: false },
] as const;

// Mock counts
const MOCK_COUNTS: Record<string, number> = {
  prezenta: 0,
  imagini: 1,
  documente: 0,
  povesti: 3,
  ateliere: 10,
  meniu: 18,
  mesaje: 0,
};

const MODULE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<{ embedded?: boolean }>>> = {
  prezenta: Attendance,
  imagini: Documents,
  documente: Documents,
  povesti: Stories,
  ateliere: Stories,
  meniu: WeeklyMenu,
  mesaje: Messages,
};

interface ModuleHubProps {
  visibility: ModuleVisibility;
  searchQuery?: string;
}

export default function ModuleHub({ visibility, searchQuery }: ModuleHubProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [shareModule, setShareModule] = useState<string | null>(null);
  const { currentGroup } = useGroup();
  const groupName = currentGroup?.nume || 'grupa mica A';

  let visibleModules = MODULES.filter(m => visibility[m.key as keyof ModuleVisibility]);

  // Filter by search
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    visibleModules = visibleModules.filter(m =>
      m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)
    );
  }

  const openMod = MODULES.find(m => m.key === openModule);
  const ModuleComponent = openModule ? MODULE_COMPONENTS[openModule] : null;
  const shareModData = MODULES.find(m => m.key === shareModule);

  return (
    <LayoutGroup>
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        <AnimatePresence mode="popLayout">
          {visibleModules.map(mod => (
            <motion.div
              key={mod.key}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {openModule !== mod.key && (
                <ModuleCard
                  icon={mod.icon}
                  title={mod.title}
                  subtitle={mod.subtitle}
                  color={mod.color}
                  count={MOCK_COUNTS[mod.key]}
                  countLabel={mod.countLabel}
                  showShare={mod.showShare}
                  onShare={() => setShareModule(mod.key)}
                  onOpen={() => setOpenModule(mod.key)}
                  layoutId={`module-${mod.key}`}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {openMod && ModuleComponent && (
          <ModulePanel
            isOpen={!!openModule}
            onClose={() => setOpenModule(null)}
            title={openMod.title}
            color={openMod.color}
            layoutId={`module-${openMod.key}`}
          >
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
              <ModuleComponent embedded />
            </Suspense>
          </ModulePanel>
        )}
      </AnimatePresence>

      {/* Share dialog */}
      <ShareDialog
        open={!!shareModule}
        onOpenChange={(open) => { if (!open) setShareModule(null); }}
        moduleTitle={shareModData?.title || ''}
      />
    </LayoutGroup>
  );
}
