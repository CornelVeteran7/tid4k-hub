import { motion } from 'framer-motion';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  count?: number;
  onOpen?: () => void;
  layoutId?: string;
}

export default function ModuleCard({ icon: Icon, title, subtitle, color, count, onOpen, layoutId }: ModuleCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      whileTap={{ scale: 0.97 }}
      onClick={onOpen}
      className="card-tappable rounded-3xl p-4 flex items-center gap-4 cursor-pointer shadow-md"
      style={{ backgroundColor: color }}
    >
      {/* Icon circle */}
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-white/20">
        <Icon className="h-6 w-6 text-white" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-white tracking-wide">{title}</p>
        <p className="text-xs text-white/70 truncate">{subtitle}</p>
      </div>

      {/* Count badge */}
      {count !== undefined && (
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/25 text-white shrink-0">
          {count}
        </span>
      )}

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />
    </motion.div>
  );
}
