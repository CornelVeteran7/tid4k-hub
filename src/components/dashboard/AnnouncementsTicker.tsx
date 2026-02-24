import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Megaphone } from 'lucide-react';
import { getAnnouncements } from '@/api/announcements';
import type { Announcement } from '@/types';

export default function AnnouncementsTicker() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    getAnnouncements().then(all => {
      const visible = all
        .filter(a => !a.ascuns_banda)
        .sort((a, b) => (a.pozitie_banda ?? 99) - (b.pozitie_banda ?? 99));
      setItems(visible);
    });
  }, []);

  if (items.length === 0) return null;

  const tickerText = items.map(a => (
    <span key={a.id_info} className="inline-flex items-center gap-2 mx-6">
      {a.prioritate === 'urgent' && (
        <span className="h-2 w-2 rounded-full bg-destructive animate-pulse inline-block" />
      )}
      <span className={a.prioritate === 'urgent' ? 'font-bold' : 'font-medium'}>
        {a.titlu}
      </span>
    </span>
  ));

  return (
    <div
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
          {tickerText}
          {/* Duplicate for seamless loop */}
          {tickerText}
        </div>
      </div>
    </div>
  );
}
