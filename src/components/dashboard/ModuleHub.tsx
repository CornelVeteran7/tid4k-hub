import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModulePanel from './ModulePanel';

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
  meniu: boolean;
  mesaje: boolean;
}

export const DEFAULT_VISIBILITY: ModuleVisibility = {
  prezenta: true,
  imagini: true,
  documente: true,
  povesti: true,
  meniu: true,
  mesaje: true,
};

const MODULES = [
  { key: 'prezenta', title: 'PREZENȚA', subtitle: 'Înregistrează prezența', color: '#FFC107', icon: ClipboardList },
  { key: 'imagini', title: 'IMAGINI', subtitle: 'Fotografii și activități', color: '#2ECC71', icon: Image },
  { key: 'documente', title: 'DOCUMENTE', subtitle: 'Fișiere și materiale', color: '#3498DB', icon: FileText },
  { key: 'povesti', title: 'POVEȘTI / ATELIERE', subtitle: 'Povești interactive', color: '#9B59B6', icon: BookOpen },
  { key: 'meniu', title: 'MENIU', subtitle: 'Meniul săptămânii', color: '#F39C12', icon: UtensilsCrossed },
  { key: 'mesaje', title: 'MESAJE', subtitle: 'Conversații cu părinții', color: '#E91E63', icon: MessageSquare },
] as const;

const MODULE_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<{ embedded?: boolean }>>> = {
  prezenta: Attendance,
  imagini: Documents,
  documente: Documents,
  povesti: Stories,
  meniu: WeeklyMenu,
  mesaje: Messages,
};

interface ModuleHubProps {
  visibility: ModuleVisibility;
}

export default function ModuleHub({ visibility }: ModuleHubProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const visibleModules = MODULES.filter(m => visibility[m.key as keyof ModuleVisibility]);

  const openMod = MODULES.find(m => m.key === openModule);
  const ModuleComponent = openModule ? MODULE_COMPONENTS[openModule] : null;

  return (
    <>
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
              <ModuleCard
                icon={mod.icon}
                title={mod.title}
                subtitle={mod.subtitle}
                color={mod.color}
                onOpen={() => setOpenModule(mod.key)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Module Panel Overlay */}
      {openMod && ModuleComponent && (
        <ModulePanel
          isOpen={!!openModule}
          onClose={() => setOpenModule(null)}
          title={openMod.title}
          color={openMod.color}
        >
          <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
            <ModuleComponent embedded />
          </Suspense>
        </ModulePanel>
      )}
    </>
  );
}
