import type { SponsorStyleTicker } from '@/types/sponsor';
import { Award, Megaphone } from 'lucide-react';

interface Props {
  titlu: string;
  sponsor_culoare?: string;
  stil?: SponsorStyleTicker;
}

export default function TickerPreview({ titlu, sponsor_culoare = '#e1001a', stil }: Props) {
  const badgeBg = stil?.badge_bg || sponsor_culoare;
  const badgeText = stil?.badge_text || 'Sponsor';
  const textColor = stil?.text_color || '#ffffff';

  return (
    <div className="rounded-lg overflow-hidden border">
      <div className="h-10 flex items-center bg-primary/90">
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 border-r border-primary-foreground/20">
          <Megaphone className="h-4 w-4 text-primary-foreground" />
        </div>
        <div className="flex-1 px-3 overflow-hidden">
          <div className="whitespace-nowrap text-[13px] flex items-center gap-2" style={{ color: textColor }}>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white ${stil?.glow_effect ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: badgeBg }}
            >
              <Award className="h-2.5 w-2.5" />
              {badgeText}
            </span>
            <span className="font-bold truncate">{titlu}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
