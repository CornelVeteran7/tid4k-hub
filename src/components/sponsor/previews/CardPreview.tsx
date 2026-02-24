import type { SponsorStyleCard } from '@/types/sponsor';
import { ExternalLink, Award } from 'lucide-react';

interface Props {
  titlu: string;
  descriere: string;
  cta_text?: string;
  sponsor_nume?: string;
  sponsor_logo?: string;
  sponsor_culoare?: string;
  stil?: SponsorStyleCard;
}

export default function CardPreview({ titlu, descriere, cta_text, sponsor_nume, sponsor_logo, sponsor_culoare = '#e1001a', stil }: Props) {
  const bg = stil?.background || `linear-gradient(135deg, ${sponsor_culoare}08 0%, ${sponsor_culoare}15 100%)`;
  const textColor = stil?.text_color || undefined;
  const borderColor = stil?.border_color || `${sponsor_culoare}30`;
  const borderRadius = stil?.border_radius || '16px';
  const shadow = stil?.shadow_style || undefined;

  return (
    <div
      className="overflow-hidden border cursor-pointer"
      style={{
        borderColor,
        background: bg,
        borderRadius,
        boxShadow: shadow,
      }}
    >
      {stil?.banner_url && (
        <div className="h-24 w-full overflow-hidden">
          <img src={stil.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex items-start gap-3">
        {sponsor_logo && (
          <div className="shrink-0 h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5">
            <img src={sponsor_logo} alt={sponsor_nume} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: sponsor_culoare }}
            >
              <Award className="h-2.5 w-2.5" />
              Sponsor
            </span>
            <span className="text-xs text-muted-foreground">{sponsor_nume}</span>
          </div>
          <h3 className="text-sm font-bold leading-tight" style={{ color: textColor }}>{titlu}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{descriere}</p>
          {cta_text && (
            <button
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: sponsor_culoare }}
            >
              {cta_text}
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
