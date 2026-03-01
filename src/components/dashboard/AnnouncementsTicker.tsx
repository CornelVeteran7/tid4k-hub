import { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone, Award } from 'lucide-react';
import { getAnnouncements } from '@/api/announcements';
import { useSponsorRotation } from '@/hooks/useSponsorRotation';
import type { SponsorPromo } from '@/types/sponsor';
import { useAuth } from '@/contexts/AuthContext';

interface TickerItem {
  id: string;
  text: React.ReactNode;
  isSponsor: boolean;
  link_url?: string;
}

/* Organic wave SVG that sits on top of the ticker bar */
function WaveDecoration() {
  return (
    <div className="absolute -top-[20px] left-0 right-0 h-[22px] pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 1440 22"
        preserveAspectRatio="none"
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Back wave — matches bar at lower opacity for depth */}
        <path
          d="M0,16 C120,6 240,2 360,8 C480,14 540,18 720,12 C900,6 1020,2 1140,6 C1260,10 1380,16 1440,12 L1440,22 L0,22 Z"
          className="fill-accent opacity-50"
        />
        {/* Middle wave */}
        <path
          d="M0,18 C160,10 280,6 420,12 C560,18 640,20 800,14 C960,8 1080,6 1200,10 C1320,14 1400,18 1440,16 L1440,22 L0,22 Z"
          className="fill-accent opacity-70"
        />
        {/* Front wave — same opacity as bar for seamless blend */}
        <path
          d="M0,20 C200,14 320,10 480,16 C640,20 720,22 880,18 C1040,14 1160,10 1280,14 C1360,16 1420,20 1440,18 L1440,22 L0,22 Z"
          className="fill-accent opacity-90"
        />
      </svg>
    </div>
  );
}

/* Vertical separator between ticker items */
const Separator = () => (
  <span className="inline-block w-px h-3.5 bg-primary-foreground/30 mx-5 align-middle" />
);

export default memo(function AnnouncementsTicker() {
  const navigate = useNavigate();
  const [announcementItems, setAnnouncementItems] = useState<TickerItem[]>([]);
  const { user } = useAuth();

  const schoolId = user?.grupe_disponibile?.[user.index_grupa_clasa_curenta]?.id
    ? Number(user.grupe_disponibile[user.index_grupa_clasa_curenta].id.split('_')[0])
    : undefined;

  const { currentPromo } = useSponsorRotation('ticker', schoolId);

  useEffect(() => {
    getAnnouncements().then(announcements => {
      const visible = announcements
        .filter(a => !a.ascuns_banda)
        .sort((a, b) => (a.pozitie_banda ?? 99) - (b.pozitie_banda ?? 99));

      setAnnouncementItems(visible.map(a => ({
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
      })));
    });
  }, [user]);

  // Build sponsor ticker item from current rotation promo
  const sponsorItem: TickerItem | null = currentPromo ? (() => {
    const stil = currentPromo.stil_ticker;
    const badgeBg = stil?.badge_bg || currentPromo.sponsor_culoare || 'rgba(255,215,0,0.3)';
    const badgeText = stil?.badge_text || 'Sponsor';
    const glowEffect = stil?.glow_effect;

    return {
      id: `sponsor-${currentPromo.id_promo}`,
      text: (
        <span className="inline-flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full text-white ${glowEffect ? 'animate-pulse' : ''}`}
            style={{ backgroundColor: badgeBg }}
          >
            <Award className="h-2.5 w-2.5" />
            {badgeText}
          </span>
          <span className="font-bold" style={{ color: stil?.text_color }}>
            {currentPromo.titlu}
          </span>
        </span>
      ),
      isSponsor: true,
      link_url: currentPromo.link_url,
    };
  })() : null;

  // Merge: insert single sponsor after 3rd announcement
  const merged: TickerItem[] = [];
  announcementItems.forEach((item, i) => {
    merged.push(item);
    if (i === 2 && sponsorItem) {
      merged.push(sponsorItem);
    }
  });
  if (sponsorItem && announcementItems.length <= 2) {
    merged.push(sponsorItem);
  }

  if (merged.length === 0) return null;

  // Build ticker content with separators between items
  const tickerContent = merged.flatMap((item, i) => {
    const elements = [
      <span key={item.id} className="inline-flex items-center gap-2">
        {item.text}
      </span>,
    ];
    if (i < merged.length - 1) {
      elements.push(<Separator key={`sep-${item.id}`} />);
    }
    return elements;
  });

  // Duplicate with a separator in between for seamless loop
  const fullContent = (
    <>
      {tickerContent}
      <Separator key="sep-loop" />
      {tickerContent}
      <Separator key="sep-loop-2" />
    </>
  );

  return (
    <div
      data-tutorial="announcements"
      onClick={() => navigate('/anunturi')}
      className="fixed bottom-0 right-0 left-0 lg:left-64 z-50 cursor-pointer card-tappable safe-bottom"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Wave decoration above the bar */}
      <WaveDecoration />

      {/* Main ticker bar */}
      <div className="relative h-10 flex items-center">
        <div className="absolute inset-0 bg-accent/90 backdrop-blur-md" />

        {/* Megaphone icon */}
        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 h-10 border-r border-primary-foreground/15">
          <Megaphone className="h-4 w-4 text-primary-foreground" />
        </div>

        {/* Scrolling content */}
        <div className="relative z-10 flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap text-primary-foreground text-[13px]">
            {fullContent}
          </div>
        </div>
      </div>
    </div>
  );
});
