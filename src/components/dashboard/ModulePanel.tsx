import { memo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface ModulePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color: string;
  textColor?: string;
  layoutId?: string;
  children: ReactNode;
}

const panelSpring = { type: 'spring', damping: 30, stiffness: 280, mass: 0.9 } as const;
const scrimTransition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;

export default memo(function ModulePanel({ isOpen, onClose, title, color, textColor, layoutId, children }: ModulePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Scrim — only below header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={scrimTransition}
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ top: 'var(--header-height, 56px)' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </motion.div>

      {/* Panel — mobile: fullscreen below header, desktop: right-side panel */}
      <motion.div
        layoutId={layoutId}
        layout="position"
        transition={panelSpring}
        className="fixed bottom-0 z-30 flex flex-col overflow-hidden shadow-2xl
          inset-x-0 lg:left-auto lg:right-0 lg:w-[min(640px,50vw)]"
        style={{ top: 'var(--header-height, 56px)', backgroundColor: color }}
      >
        {/* Colored header bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <h2 className="font-display font-bold text-base uppercase tracking-wide" style={{ color: textColor || '#ffffff' }}>{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            style={{ color: textColor || '#ffffff', backgroundColor: textColor ? `${textColor}20` : 'rgba(255,255,255,0.2)' }}
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </Button>
        </div>

        {/* Scrollable content with white background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.15 }}
          className="flex-1 overflow-y-auto bg-background p-4 lg:p-6 pb-24"
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
});
