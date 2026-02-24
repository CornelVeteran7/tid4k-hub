import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface ModulePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color: string;
  layoutId?: string;
  children: ReactNode;
}

export default function ModulePanel({ isOpen, onClose, title, color, layoutId, children }: ModulePanelProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Scrim — only below header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 bottom-0 z-20"
        style={{ top: 'var(--header-height, 56px)' }}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </motion.div>

      {/* Panel — flush against header, no gap */}
      <motion.div
        layoutId={layoutId}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed inset-x-0 bottom-0 z-30 flex flex-col overflow-hidden shadow-2xl"
        style={{ top: 0, paddingTop: 'var(--header-height, 56px)', backgroundColor: color }}
      >
        {/* Colored header bar */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0">
          <h2 className="text-white font-display font-bold text-base uppercase tracking-wide">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable content with white background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.2 }}
          className="flex-1 overflow-y-auto bg-background p-4 pb-24"
        >
          {children}
        </motion.div>
      </motion.div>
    </>
  );
}
