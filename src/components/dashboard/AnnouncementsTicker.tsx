import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Award } from 'lucide-react';
import { getAnnouncements } from '@/api/announcements';
import { getActivePromos } from '@/api/sponsors';
import type { Announcement } from '@/types';
import type { SponsorPromo } from '@/types/sponsor';

interface TickerItem {
  id: string;
  text: React.ReactNode;
  isSponsor: boolean;
  link_url?: string;
}

export default function AnnouncementsTicker() {
  const navigate = useNavigate();
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    Promise.all([
      getAnnouncements(),
      getActivePromos('ticker'),
    ]).then(([announcements, sponsorPromos]) => {
      const visible = announcements
        .filter(a => !a.ascuns_banda)
        .sort((a, b) => (a.pozitie_banda ?? 99) - (b.pozitie_banda ?? 99));

      // Build ticker items: regular announcements
      const announcementItems: TickerItem[] = visible.map(a => ({
        id: `ann-${a.id_info}`,
        text: (
          <span className="inline-flex items-center gap-2">
            {a.prioritate === 'urgent' && (
              <span className="h-2 w-2 rounded-full bg-destructive animate-pulse inline-block" />
            )}
            <span className={a.prioritate === 'urgent' ? 'font-bold' : 'font-medium'}>
              {a.titlu}
            </span>
          </span>
        ),
        isSponsor: false,
      }));

      // Build sponsor ticker items
      const sponsorItems: TickerItem[] = sponsorPromos.map(p => ({
        id: `sponsor-${p.id_promo}`,
        text: (
          <span className="inline-flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(255,215,0,0.3)', color: '#fff' }}
            >
              <Award className="h-2.5 w-2.5" />
              Sponsor
            </span>
            <span className="font-bold">{p.titlu}</span>
          </span>
        ),
        isSponsor: true,
        link_url: p.link_url,
      }));

      // Interleave: insert sponsor every 3 announcements
      const merged: TickerItem[] = [];
      let sponsorIdx = 0;
      announcementItems.forEach((item, i) => {
        merged.push(item);
        if ((i + 1) % 3 === 0 && sponsorIdx < sponsorItems.length) {
          merged.push(sponsorItems[sponsorIdx]);
          sponsorIdx++;
        }
      });
      // Append remaining sponsors
      while (sponsorIdx < sponsorItems.length) {
        merged.push(sponsorItems[sponsorIdx]);
        sponsorIdx++;
      }

      setItems(merged);
    });
  }, []);

  if (items.length === 0) return null;

  const tickerContent = items.map(item => (
    <span key={item.id} className="inline-flex items-center gap-2 mx-6">
      {item.text}
    </span>
  ));

  return (
    <div
      data-tutorial="announcements"
      onClick={() => navigate('/anunturi')}
      className="fixed bottom-0 right-0 left-0 lg:left-64 z-50 h-10 flex items-center cursor-pointer card-tappable safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 bg-primary/90 backdrop-blur-md" />

      {/* Static icon label */}
      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 border-r border-primary-foreground/20">
        <Megaphone className="h-4 w-4 text-primary-foreground" />
      </div>

      {/* Scrolling content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap text-primary-foreground text-[13px]">
          {tickerContent}
          {/* Duplicate for seamless loop */}
          {tickerContent}
        </div>
      </div>
    </div>
  );
}
