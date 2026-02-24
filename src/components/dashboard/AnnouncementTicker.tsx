import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnnouncements } from '@/api/announcements';
import type { Announcement } from '@/types';
import { Megaphone } from 'lucide-react';

export default function AnnouncementTicker() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getAnnouncements().then((all) =>
      setAnnouncements(all.filter((a) => !a.ascuns_banda))
    );
  }, []);

  if (announcements.length === 0) return null;

  const duration = Math.max(12, announcements.length * 6);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-foreground/90 backdrop-blur-sm cursor-pointer safe-bottom"
      onClick={() => navigate('/anunturi')}
    >
      <div className="flex items-center h-10 overflow-hidden">
        {/* Static icon */}
        <div className="shrink-0 flex items-center justify-center w-10 h-10 bg-warning text-warning-foreground">
          <Megaphone className="h-4 w-4" />
        </div>

        {/* Scrolling content */}
        <div className="flex-1 overflow-hidden relative">
          <div
            className="ticker-band whitespace-nowrap inline-block"
            style={{ animationDuration: `${duration}s` }}
          >
            {announcements.map((a, i) => (
              <span key={a.id_info} className="mx-4">
                <span className={a.prioritate === 'urgent' ? 'text-destructive font-bold' : 'text-primary-foreground'}>
                  {a.titlu}
                </span>
                {i < announcements.length - 1 && (
                  <span className="text-primary-foreground/40 ml-4">★</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
