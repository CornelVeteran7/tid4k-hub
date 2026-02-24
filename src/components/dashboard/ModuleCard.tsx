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

export default function ModuleCard({ icon: Icon, title, subtitle, color, count, countLabel, onOpen, onShare, showShare, layoutId, preview }: ModuleCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className="card-tappable rounded-xl p-4 flex flex-col gap-3 cursor-pointer shadow-md"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-4">
        {/* Icon circle */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white tracking-widest uppercase">{title}</p>
          <p className="text-sm font-semibold text-white/90 truncate">{subtitle}</p>
        </div>

        {/* Share button */}
        {showShare && (
          <button
            onClick={(e) => { e.stopPropagation(); onShare?.(); }}
            className="shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Send className="h-4 w-4 text-white" />
          </button>
        )}

        {/* Count badge */}
        {count !== undefined && (
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-white/25 text-white shrink-0">
            {count} {countLabel || ''}
          </span>
        )}

        {/* Chevron */}
        <ChevronDown className="h-5 w-5 text-white/60 shrink-0" />
      </div>

      {/* Preview content */}
      {preview && (
        <div className="ml-16">
          {preview}
        </div>
      )}
    </motion.div>
  );
}
