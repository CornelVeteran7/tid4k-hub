import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, type LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  count?: number;
  route: string;
}

export default function ModuleCard({ icon: Icon, title, subtitle, color, count, route }: ModuleCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(route)}
      className="card-tappable rounded-3xl p-4 flex items-center gap-4 cursor-pointer shadow-sm border border-border/40"
      style={{
        backgroundColor: `${color}18`,
        borderLeftWidth: 4,
        borderLeftColor: color,
      }}
    >
      {/* Icon circle */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}30` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-foreground tracking-wide">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>

      {/* Count badge */}
      {count !== undefined && (
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {count}
        </span>
      )}

      {/* Chevron */}
      <ChevronRight className="h-5 w-5 text-muted-foreground/50 shrink-0" />
    </motion.div>
  );
}
