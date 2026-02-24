import { useEffect, useState } from 'react';
import { getActivePromos } from '@/api/sponsors';
import type { SponsorPromo } from '@/types/sponsor';
import { motion } from 'framer-motion';
import { ExternalLink, Award } from 'lucide-react';

export default function SponsorCard() {
  const [promo, setPromo] = useState<SponsorPromo | null>(null);

  useEffect(() => {
    getActivePromos('card_dashboard').then(promos => {
      if (promos.length > 0) setPromo(promos[0]);
    });
  }, []);

  if (!promo) return null;

  const stil = promo.stil_card;
  const bg = stil?.background || `linear-gradient(135deg, ${promo.sponsor_culoare}08 0%, ${promo.sponsor_culoare}15 100%)`;
  const borderColor = stil?.border_color || `${promo.sponsor_culoare}30`;
  const borderRadius = stil?.border_radius || '16px';
  const shadow = stil?.shadow_style || undefined;
  const textColor = stil?.text_color || undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="overflow-hidden border cursor-pointer card-tappable"
      style={{
        borderColor,
        background: bg,
        borderRadius,
        boxShadow: shadow,
      }}
      onClick={() => promo.link_url && window.open(promo.link_url, '_blank')}
    >
      {stil?.banner_url && (
        <div className="h-24 w-full overflow-hidden">
          <img src={stil.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex items-start gap-3">
        {promo.sponsor_logo && (
          <div className="shrink-0 h-12 w-12 rounded-xl bg-white shadow-sm flex items-center justify-center p-1.5">
            <img src={promo.sponsor_logo} alt={promo.sponsor_nume} className="h-full w-full object-contain" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: promo.sponsor_culoare }}
            >
              <Award className="h-2.5 w-2.5" />
              Sponsor
            </span>
            <span className="text-xs text-muted-foreground">{promo.sponsor_nume}</span>
          </div>
          <h3 className="text-sm font-bold leading-tight" style={{ color: textColor }}>{promo.titlu}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{promo.descriere}</p>
          {promo.cta_text && (
            <button
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full text-white transition-transform hover:scale-105"
              style={{ backgroundColor: promo.sponsor_culoare }}
            >
              {promo.cta_text}
              <ExternalLink className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
