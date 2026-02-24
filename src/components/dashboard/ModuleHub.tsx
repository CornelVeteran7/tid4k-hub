import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, Image, FileText, BookOpen, UtensilsCrossed, MessageSquare } from 'lucide-react';
import ModuleCard from './ModuleCard';

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
  { key: 'prezenta', title: 'PREZENȚA', subtitle: 'Înregistrează prezența', color: '#FFC107', icon: ClipboardList, route: '/prezenta' },
  { key: 'imagini', title: 'IMAGINI', subtitle: 'Fotografii și activități', color: '#2ECC71', icon: Image, route: '/documente' },
  { key: 'documente', title: 'DOCUMENTE', subtitle: 'Fișiere și materiale', color: '#3498DB', icon: FileText, route: '/documente' },
  { key: 'povesti', title: 'POVEȘTI / ATELIERE', subtitle: 'Povești interactive', color: '#9B59B6', icon: BookOpen, route: '/povesti' },
  { key: 'meniu', title: 'MENIU', subtitle: 'Meniul săptămânii', color: '#F39C12', icon: UtensilsCrossed, route: '/meniu' },
  { key: 'mesaje', title: 'MESAJE', subtitle: 'Conversații cu părinții', color: '#E91E63', icon: MessageSquare, route: '/mesaje' },
] as const;

interface ModuleHubProps {
  visibility: ModuleVisibility;
}

export default function ModuleHub({ visibility }: ModuleHubProps) {
  const visibleModules = MODULES.filter(m => visibility[m.key as keyof ModuleVisibility]);

  return (
    <div className="space-y-3">
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
              route={mod.route}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
