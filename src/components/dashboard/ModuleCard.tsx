import { memo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Send, GripVertical, type LucideIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ModuleCardProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  color: string;
  textColor?: string;
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
    onDragStartCapture: (e: React.DragEvent) => void;
    onDragOverCapture: (e: React.DragEvent) => void;
    onDropCapture: (e: React.DragEvent) => void;
    onDragEndCapture: (e: React.DragEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    ref: (el: HTMLElement | null) => void;
  };
}

const cardTransition = { type: 'spring', damping: 24, stiffness: 350, mass: 0.8 } as const;

const wiggleAnimation = {
  rotate: [0, -0.8, 0.8, -0.6, 0.6, 0],
  transition: {
    duration: 0.8,
    repeat: Infinity,
    repeatDelay: 0.2,
    ease: 'easeInOut' as const,
  },
};

export default memo(function ModuleCard({
  icon: Icon, title, subtitle, color, count, onOpen, onShare, showShare,
  layoutId, preview, editMode, visible = true, onToggleVisibility, dragHandleProps,
}: ModuleCardProps) {
  // Separate ref from other drag props so we can pass ref to motion.div
  const { ref: dragRef, ...dragEventProps } = dragHandleProps || {} as any;

  return (
    <motion.div
      ref={editMode && dragRef ? dragRef : undefined}
      layoutId={layoutId}
      layout="position"
      whileTap={editMode ? undefined : { scale: 0.97 }}
      animate={editMode ? wiggleAnimation : {}}
      transition={cardTransition}
      onClick={editMode ? undefined : onOpen}
      className={`card-tappable rounded-xl p-4 flex flex-col gap-3 shadow-md min-h-[72px] lg:min-h-[80px] relative transition-opacity duration-300 ${
        editMode ? 'cursor-default touch-none' : 'cursor-pointer'
      }`}
      style={{ backgroundColor: color, opacity: editMode && !visible ? 0.35 : 1 }}
      {...(editMode ? dragEventProps : {})}
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
          <p className="font-display font-bold text-sm text-white tracking-wide uppercase">{title}</p>
          <p className="font-display text-sm font-semibold text-white/90 hidden lg:block">{subtitle}</p>
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
