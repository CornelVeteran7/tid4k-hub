import { useEffect, useState } from 'react';
import { getChildrenByGroup } from '@/api/children';
import { useGroup } from '@/contexts/GroupContext';
import type { Child } from '@/types';
import { Phone, Mail } from 'lucide-react';

const PASTEL_COLORS = [
  'hsl(340 80% 85%)',
  'hsl(200 80% 85%)',
  'hsl(145 60% 82%)',
  'hsl(270 70% 85%)',
  'hsl(37 90% 85%)',
  'hsl(180 60% 82%)',
  'hsl(15 80% 85%)',
];

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function ChildrenScroller() {
  const { currentGroup } = useGroup();
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (currentGroup) {
      getChildrenByGroup(currentGroup.id).then(setChildren);
    }
  }, [currentGroup]);

  if (!children.length) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-muted-foreground px-1">Copiii grupei</h2>
      {/* Mobile: horizontal scroll, Desktop: wrap grid */}
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 lg:grid lg:grid-cols-3 xl:grid-cols-4 lg:overflow-x-visible lg:snap-none">
        {children.map((child, i) => (
          <div
            key={child.id_copil}
            className="snap-start shrink-0 w-[110px] lg:w-auto rounded-2xl border border-border/60 shadow-sm p-3 flex flex-col items-center gap-2 bg-card card-tappable active:scale-95 transition-transform"
          >
            {/* Avatar */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-foreground/80"
              style={{ backgroundColor: PASTEL_COLORS[i % PASTEL_COLORS.length] }}
            >
              {getInitials(child.nume_prenume_copil)}
            </div>

            {/* Name */}
            <p className="text-xs font-bold text-foreground text-center leading-tight truncate w-full">
              {child.nume_prenume_copil.split(' ')[0]}
            </p>

            {/* Parent info */}
            {child.parinte_nume && (
              <div className="w-full space-y-0.5">
                <p className="text-[10px] text-muted-foreground text-center truncate">{child.parinte_nume}</p>
                {child.parinte_telefon && (
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-muted-foreground/70">
                    <Phone className="h-2.5 w-2.5" />
                    <span className="truncate">{child.parinte_telefon}</span>
                  </div>
                )}
                {child.parinte_email && (
                  <div className="flex items-center justify-center gap-0.5 text-[9px] text-muted-foreground/70">
                    <Mail className="h-2.5 w-2.5" />
                    <span className="truncate">{child.parinte_email.split('@')[0]}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
