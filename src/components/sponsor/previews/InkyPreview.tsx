import type { SponsorStyleInky } from '@/types/sponsor';
import { Award, ExternalLink, X } from 'lucide-react';
import inkyImg from '@/assets/inky-button.png';

interface Props {
  titlu: string;
  descriere: string;
  cta_text?: string;
  sponsor_nume?: string;
  sponsor_logo?: string;
  sponsor_culoare?: string;
  stil?: SponsorStyleInky;
}

export default function InkyPreview({ titlu, descriere, cta_text, sponsor_nume, sponsor_logo, sponsor_culoare = '#e1001a', stil }: Props) {
  const bgColor = stil?.bg_color || sponsor_culoare;
  const textColor = stil?.text_color || '#ffffff';
  const ctaBg = stil?.cta_bg || '#ffffff';
  const ctaTextColor = stil?.cta_text || bgColor;
  const costumeUrl = stil?.costume_url;

  return (
    <div className="relative">
      {/* Mock popup */}
      <div className="w-60 rounded-xl shadow-xl overflow-hidden border border-border/50 bg-card">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Ce vrei să faci?</span>
          <X className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-2 space-y-0.5">
          {/* Regular action mock */}
          <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded bg-muted" />
            <span className="text-xs">Acțiune normală...</span>
          </div>
          {/* Sponsor action */}
          <div
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm mt-1 border"
            style={{
              background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}25 100%)`,
              borderColor: `${bgColor}40`,
            }}
          >
            {sponsor_logo ? (
              <img src={sponsor_logo} alt="" className="h-4 w-4 object-contain shrink-0" />
            ) : (
              <Award className="h-4 w-4 shrink-0" style={{ color: bgColor }} />
            )}
            <span className="font-semibold flex-1 text-xs" style={{ color: bgColor }}>
              {titlu}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0" style={{ color: bgColor }} />
          </div>
        </div>
      </div>

      {/* Inky button preview */}
      <div className="flex justify-end mt-2">
        <div className="h-14 w-14 rounded-full shadow-lg border border-primary/20 flex items-center justify-center overflow-hidden bg-card">
          <img
            src={costumeUrl || inkyImg}
            alt="Inky"
            className="h-12 w-12 object-contain"
          />
        </div>
      </div>
    </div>
  );
}
