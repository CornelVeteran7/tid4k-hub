import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

interface ModulePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color: string;
  children: ReactNode;
}

export default function ModulePanel({ isOpen, onClose, title, color, children }: ModulePanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="fixed inset-0 z-40 flex flex-col"
          style={{ top: 0 }}
        >
          {/* Scrim behind panel that lets header show through */}
          <div className="bg-background/80 backdrop-blur-sm absolute inset-0" onClick={onClose} />

          {/* Panel content */}
          <div className="relative flex flex-col flex-1 mt-14 rounded-t-2xl overflow-hidden bg-background shadow-2xl">
            {/* Colored header bar */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ backgroundColor: color }}
            >
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 pb-24">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
