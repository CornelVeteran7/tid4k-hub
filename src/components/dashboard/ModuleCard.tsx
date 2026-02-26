import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Send, type LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  count?: number;
  countLabel?: string;
  onOpen?: () => void;
  onShare?: () => void;
  showShare?: boolean;
  layoutId?: string;
  preview?: React.ReactNode;
}

const cardTransition = { type: 'spring', damping: 24, stiffness: 350, mass: 0.8 } as const;

export default memo(function ModuleCard({ icon: Icon, title, subtitle, color, count, onOpen, onShare, showShare, layoutId, preview }: ModuleCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      layout="position"
      whileTap={{ scale: 0.97 }}
      transition={cardTransition}
      onClick={onOpen}
      className="card-tappable rounded-xl p-4 flex flex-col gap-3 cursor-pointer shadow-md min-h-[72px] lg:min-h-[80px]"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-3">
        {/* Icon circle */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white tracking-widest uppercase">{title}</p>
          <p className="text-sm font-semibold text-white/90 hidden lg:block">{subtitle}</p>
        </div>

        {/* Actions — grouped to prevent overlap */}
        <div className="flex items-center gap-2 shrink-0">
          {showShare && (
            <button
              onClick={(e) => { e.stopPropagation(); onShare?.(); }}
              className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <Send className="h-4 w-4 text-white" />
            </button>
          )}

          {count !== undefined && (
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-white/25 text-white whitespace-nowrap">
              {count}
            </span>
          )}

          <ChevronDown className="h-5 w-5 text-white/60" />
        </div>
      </div>

      {/* Preview content */}
      {preview && (
        <div className="ml-16">
          {preview}
        </div>
      )}
    </motion.div>
  );
});
