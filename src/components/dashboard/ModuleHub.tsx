import React from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare, Paintbrush } from 'lucide-react';
import SponsorCard from './SponsorCard';
import { lazy, Suspense, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModulePanel from './ModulePanel';
import ShareDialog from './ShareDialog';
import { getWorkshopOfMonth, getCategoryLabel } from '@/api/workshops';
import type { Workshop } from '@/api/workshops';

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
  { key: 'prezenta', title: 'PREZENȚA', subtitle: 'Cine a venit azi la grupă', color: '#FF69B4', icon: ClipboardList, countLabel: '', showShare: false, wide: false },
  { key: 'imagini', title: 'IMAGINI', subtitle: 'Fotografii din activități', color: '#2ECC71', icon: Image, countLabel: 'imagini', showShare: true, wide: false },
  { key: 'documente', title: 'DOCUMENTE', subtitle: 'Fișiere PDF partajate', color: '#3498DB', icon: FileText, countLabel: 'documente', showShare: true, wide: false },
  { key: 'povesti', title: 'POVEȘTI', subtitle: 'Povești pentru copii', color: '#9B59B6', icon: BookOpen, countLabel: 'povești', showShare: false, wide: false },
  { key: 'ateliere', title: 'ATELIERE', subtitle: 'Activități creative pentru copii', color: '#FFC107', icon: Paintbrush, countLabel: 'ateliere', showShare: false, wide: true },
  { key: 'meniu', title: 'MENIUL SĂPTĂMÂNII', subtitle: 'Meniul zilnic pentru copii', color: '#E67E22', icon: UtensilsCrossed, countLabel: 'meniuri', showShare: false, wide: false },
  { key: 'mesaje', title: 'MESAJE', subtitle: 'Comunicare cu părinții', color: '#E91E63', icon: MessageSquare, countLabel: 'mesaje', showShare: false, wide: false },
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
  const [workshopOfMonth, setWorkshopOfMonth] = useState<Workshop | null>(null);

  useEffect(() => {
    getWorkshopOfMonth().then(setWorkshopOfMonth).catch(() => {});
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      setOpenModule((e as CustomEvent).detail || null);
    };
    window.addEventListener('open-module', handler);
    return () => window.removeEventListener('open-module', handler);
  }, []);

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
          {visibleModules.map((mod, i) => (
            <React.Fragment key={mod.key}>
              <motion.div
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ type: 'spring', damping: 22, stiffness: 300, delay: i * 0.03 }}
                className={mod.wide ? 'lg:col-span-2' : ''}
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
                    preview={mod.key === 'ateliere' && workshopOfMonth ? (
                      <div className="bg-white/15 rounded-lg px-3 py-2 mt-1">
                        <p className="text-sm font-semibold text-white">{workshopOfMonth.titlu}</p>
                        <p className="text-xs text-white/80">{getCategoryLabel(workshopOfMonth.categorie)} · {new Date(workshopOfMonth.luna + '-01').toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}</p>
                      </div>
                    ) : undefined}
                  />
                )}
              </motion.div>
              {mod.key === 'documente' && (
                <motion.div
                  layout="position"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300, delay: 0.15 }}
                  className="lg:col-span-2"
                >
                  <SponsorCard />
                </motion.div>
              )}
            </React.Fragment>
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
