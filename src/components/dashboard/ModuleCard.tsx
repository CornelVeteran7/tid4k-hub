import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Send, GripVertical, type LucideIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

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
  editMode?: boolean;
  visible?: boolean;
  onToggleVisibility?: () => void;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
}

const cardTransition = { type: 'spring', damping: 24, stiffness: 350, mass: 0.8 } as const;

const wiggleAnimation = {
  rotate: [0, -0.8, 0.8, -0.6, 0.6, 0],
  transition: {
    duration: 0.4,
    repeat: Infinity,
    repeatDelay: 0.1,
    ease: 'easeInOut',
  },
};

export default memo(function ModuleCard({
  icon: Icon, title, subtitle, color, count, onOpen, onShare, showShare,
  layoutId, preview, editMode, visible = true, onToggleVisibility, dragHandleProps,
}: ModuleCardProps) {
  return (
    <motion.div
      layoutId={layoutId}
      layout="position"
      whileTap={editMode ? undefined : { scale: 0.97 }}
      animate={editMode ? wiggleAnimation : {}}
      transition={cardTransition}
      onClick={editMode ? undefined : onOpen}
      className={`card-tappable rounded-xl p-4 flex flex-col gap-3 shadow-md min-h-[72px] lg:min-h-[80px] relative ${
        editMode ? 'cursor-default' : 'cursor-pointer'
      } ${editMode && !visible ? 'opacity-40' : ''}`}
      style={{ backgroundColor: color }}
      {...(editMode ? dragHandleProps : {})}
    >
      <div className="flex items-center gap-3">
        {/* Drag handle in edit mode */}
        {editMode && (
          <div className="w-6 flex items-center justify-center shrink-0 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-white/60" />
          </div>
        )}

        {/* Icon circle */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
          <Icon className="h-6 w-6 text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-xs text-white tracking-widest uppercase">{title}</p>
          <p className="text-sm font-semibold text-white/90 hidden lg:block">{subtitle}</p>
        </div>

        {/* Edit mode: toggle switch */}
        {editMode ? (
          <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={visible}
              onCheckedChange={() => onToggleVisibility?.()}
              className="data-[state=checked]:bg-white/40 data-[state=unchecked]:bg-white/15"
            />
          </div>
        ) : (
          /* Normal mode actions */
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
        )}
      </div>

      {/* Preview content — hide in edit mode */}
      {preview && !editMode && (
        <div className="ml-16">
          {preview}
        </div>
      )}
    </motion.div>
  );
});
