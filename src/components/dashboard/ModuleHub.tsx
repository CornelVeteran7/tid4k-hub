import React from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare, Paintbrush } from 'lucide-react';
import SponsorCard from './SponsorCard';
import { lazy, Suspense, useState, useEffect, useMemo } from 'react';
import { useModuleConfig, type ModuleKey } from '@/config/moduleConfig';
import { Loader2 } from 'lucide-react';
import ModuleCard from './ModuleCard';
import ModulePanel from './ModulePanel';
import ShareDialog from './ShareDialog';
import { getCurrentMonthWorkshop, getCurrentMonthName } from '@/api/externalWorkshops';
import type { ExternalWorkshop } from '@/api/externalWorkshops';
import { useTouchReorder } from '@/hooks/useTouchReorder';

const Attendance = lazy(() => import('@/pages/Attendance'));
const Documents = lazy(() => import('@/pages/Documents'));
const Messages = lazy(() => import('@/pages/Messages'));
const Stories = lazy(() => import('@/pages/Stories'));
const WeeklyMenu = lazy(() => import('@/pages/WeeklyMenu'));
const AteliereEducative = lazy(() => import('@/pages/AteliereEducative'));

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

const MODULES_STRUCTURAL = [
  { key: 'prezenta' as ModuleKey, icon: ClipboardList, countLabel: '', showShare: false, wide: false },
  { key: 'imagini' as ModuleKey, icon: Image, countLabel: 'imagini', showShare: true, wide: false },
  { key: 'documente' as ModuleKey, icon: FileText, countLabel: 'documente', showShare: true, wide: false },
  { key: 'povesti' as ModuleKey, icon: BookOpen, countLabel: 'povești', showShare: false, wide: false },
  { key: 'ateliere' as ModuleKey, icon: Paintbrush, countLabel: 'ateliere', showShare: false, wide: true },
  { key: 'meniu' as ModuleKey, icon: UtensilsCrossed, countLabel: 'meniuri', showShare: false, wide: false },
  { key: 'mesaje' as ModuleKey, icon: MessageSquare, countLabel: 'mesaje', showShare: false, wide: false },
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
  ateliere: AteliereEducative,
  meniu: WeeklyMenu,
  mesaje: Messages,
};

const ORDER_STORAGE_KEY = 'tid4k_module_order';

export function loadModuleOrder(): string[] {
  try {
    const stored = localStorage.getItem(ORDER_STORAGE_KEY);
    if (stored) {
      const order = JSON.parse(stored) as string[];
      const allKeys: string[] = MODULES_STRUCTURAL.map(m => m.key);
      const validOrder = order.filter(k => allKeys.includes(k));
      const missing = allKeys.filter(k => !validOrder.includes(k));
      return [...validOrder, ...missing];
    }
  } catch {}
  return MODULES_STRUCTURAL.map(m => m.key);
}

export function saveModuleOrder(order: string[]) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
}

interface ModuleHubProps {
  visibility: ModuleVisibility;
  searchQuery?: string;
  editMode?: boolean;
  onToggle?: (key: keyof ModuleVisibility) => void;
  moduleOrder?: string[];
  onReorder?: (order: string[]) => void;
  verticalModules?: string[];
  cardVariant?: 'solid' | 'glass';
}

export default function ModuleHub({ visibility, searchQuery, editMode, onToggle, moduleOrder, onReorder, verticalModules }: ModuleHubProps) {
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [shareModule, setShareModule] = useState<string | null>(null);
  const [workshopOfMonth, setWorkshopOfMonth] = useState<ExternalWorkshop | null>(null);
  // dragIdx state kept only for non-edit mode (not used but harmless)
  const { config } = useModuleConfig();

  // Merge structural data with config
  const MODULES = useMemo(() =>
    MODULES_STRUCTURAL.map(m => ({
      ...m,
      title: config[m.key].title,
      subtitle: config[m.key].subtitle,
      color: config[m.key].color,
      textColor: config[m.key].textColor,
    })),
    [config]
  );

  useEffect(() => {
    import('@/api/externalWorkshops').then(({ getExternalWorkshops, getCurrentMonthWorkshop }) => {
      getExternalWorkshops().then(workshops => {
        setWorkshopOfMonth(getCurrentMonthWorkshop(workshops));
      }).catch(() => {});
    });
  }, []);
  useEffect(() => {
    const handler = (e: Event) => {
      setOpenModule((e as CustomEvent).detail || null);
    };
    window.addEventListener('open-module', handler);
    return () => window.removeEventListener('open-module', handler);
  }, []);

  // Order modules according to saved order
  const orderedModules = useMemo(() => {
    if (!moduleOrder) return [...MODULES];
    return [...MODULES].sort((a, b) => {
      const ia = moduleOrder.indexOf(a.key);
      const ib = moduleOrder.indexOf(b.key);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    });
  }, [moduleOrder, MODULES]);

  // In edit mode show ALL modules (so user can toggle hidden ones on); in normal mode filter
  let displayModules = editMode
    ? orderedModules.filter(m => !verticalModules || verticalModules.includes(m.key))
    : orderedModules.filter(m => {
        const visible = visibility[m.key as keyof ModuleVisibility];
        const inVertical = !verticalModules || verticalModules.includes(m.key);
        return visible && inVertical;
      });

  // Filter by search (only in normal mode)
  if (!editMode && searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayModules = displayModules.filter(m =>
      m.title.toLowerCase().includes(q) || m.subtitle.toLowerCase().includes(q)
    );
  }

  const openMod = MODULES.find(m => m.key === openModule);
  const ModuleComponent = openModule ? MODULE_COMPONENTS[openModule] : null;
  const shareModData = MODULES.find(m => m.key === shareModule);

  // Touch + mouse drag reordering
  const currentOrder = useMemo(() => moduleOrder || MODULES.map(m => m.key), [moduleOrder, MODULES]);
  const { makeDragProps } = useTouchReorder({
    items: currentOrder,
    onReorder: (newOrder) => onReorder?.(newOrder),
  });

  return (
    <LayoutGroup>
      <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
        <AnimatePresence mode="popLayout">
          {displayModules.map((mod, i) => (
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
                    textColor={mod.textColor}
                    count={MOCK_COUNTS[mod.key]}
                    countLabel={mod.countLabel}
                    showShare={mod.showShare}
                    onShare={() => setShareModule(mod.key)}
                    onOpen={() => setOpenModule(mod.key)}
                    layoutId={`module-${mod.key}`}
                    editMode={editMode}
                    visible={visibility[mod.key as keyof ModuleVisibility]}
                    onToggleVisibility={() => onToggle?.(mod.key as keyof ModuleVisibility)}
                    dragHandleProps={editMode ? makeDragProps(i) : undefined}
                    preview={mod.key === 'ateliere' && workshopOfMonth ? (
                      <div className="rounded-lg px-3 py-2 mt-1" style={{ backgroundColor: mod.textColor ? `${mod.textColor}15` : 'rgba(255,255,255,0.15)' }}>
                        <p className="text-sm font-semibold" style={{ color: mod.textColor || '#ffffff' }}>{workshopOfMonth.titlu}</p>
                        <p className="text-xs" style={{ color: mod.textColor ? `${mod.textColor}cc` : 'rgba(255,255,255,0.8)' }}>{workshopOfMonth.luna} · cu {workshopOfMonth.personaj}</p>
                      </div>
                    ) : undefined}
                  />
                )}
              </motion.div>
              {mod.key === 'documente' && !editMode && (
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
            textColor={openMod.textColor}
            layoutId={`module-${openMod.key}`}
          >
            <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
              <ModuleComponent embedded />
            </Suspense>
          </ModulePanel>
        )}
      </AnimatePresence>

      <ShareDialog
        open={!!shareModule}
        onOpenChange={(open) => { if (!open) setShareModule(null); }}
        moduleTitle={shareModData?.title || ''}
      />
    </LayoutGroup>
  );
}
