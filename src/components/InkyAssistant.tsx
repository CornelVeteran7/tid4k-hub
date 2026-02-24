import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { getActivePromos } from '@/api/sponsors';
import type { SponsorPromo } from '@/types/sponsor';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Send, Upload, MessageSquare, Megaphone, Search,
  BookOpen, UtensilsCrossed, FileText, CheckSquare, BarChart3, Shuffle, X,
  Award, ExternalLink
} from 'lucide-react';
import inkyImg from '@/assets/inky-button.png';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  isSponsor?: boolean;
  sponsorColor?: string;
  linkUrl?: string;
}

function getActions(pathname: string, isTeacher: boolean, isParent: boolean): QuickAction[] {
  if (pathname === '/' || pathname === '/dashboard') {
    if (isTeacher) return [
      { label: 'Înregistrează prezența', icon: ClipboardList, path: '/prezenta' },
      { label: 'Trimite mesaj', icon: Send, path: '/mesaje' },
      { label: 'Încarcă document', icon: Upload, path: '/documente' },
    ];
    if (isParent) return [
      { label: 'Vezi mesaje', icon: MessageSquare, path: '/mesaje' },
      { label: 'Vezi anunțuri', icon: Megaphone, path: '/anunturi' },
    ];
  }

  if (pathname === '/prezenta') {
    if (isTeacher) return [
      { label: 'Selectează toți copiii', icon: CheckSquare },
      { label: 'Vezi statistici', icon: BarChart3 },
    ];
  }

  if (pathname === '/mesaje') {
    if (isTeacher) return [
      { label: 'Mesaj nou', icon: Send },
      { label: 'Mesaj către toți părinții', icon: MessageSquare },
    ];
    if (isParent) return [
      { label: 'Mesaj nou către profesor', icon: Send },
    ];
  }

  if (pathname === '/povesti') {
    if (isTeacher) return [
      { label: 'Adaugă poveste nouă', icon: BookOpen },
      { label: 'Citește o poveste aleatoare', icon: Shuffle },
    ];
    return [{ label: 'Citește o poveste aleatoare', icon: Shuffle }];
  }

  if (pathname === '/meniu') {
    return [{ label: 'Vezi meniul de săptămâna aceasta', icon: UtensilsCrossed }];
  }

  if (pathname === '/documente') {
    if (isTeacher) return [
      { label: 'Încarcă document', icon: Upload },
      { label: 'Caută document', icon: Search },
    ];
    return [{ label: 'Caută document', icon: Search }];
  }

  if (pathname === '/anunturi') {
    if (isTeacher) return [{ label: 'Creează anunț nou', icon: Megaphone }];
    return [{ label: 'Marchează toate ca citite', icon: CheckSquare }];
  }

  // Fallback
  if (isTeacher) return [
    { label: 'Înregistrează prezența', icon: ClipboardList, path: '/prezenta' },
    { label: 'Trimite mesaj', icon: Send, path: '/mesaje' },
  ];
  return [
    { label: 'Vezi mesaje', icon: MessageSquare, path: '/mesaje' },
    { label: 'Vezi anunțuri', icon: Megaphone, path: '/anunturi' },
  ];
}

export default function InkyAssistant() {
  const [open, setOpen] = useState(false);
  const [sponsorAction, setSponsorAction] = useState<QuickAction | null>(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getActivePromos('inky_popup').then(promos => {
      if (promos.length > 0) {
        const p = promos[0];
        setSponsorAction({
          label: p.titlu,
          icon: Award,
          isSponsor: true,
          sponsorColor: p.sponsor_culoare,
          linkUrl: p.link_url,
        });
      }
    });
  }, []);

  if (!user) return null;

  const isTeacher = areRol(user.status, 'profesor');
  const isParent = areRol(user.status, 'parinte');
  const actions = getActions(location.pathname, isTeacher, isParent);

  // Append sponsor action at the end
  const allActions = sponsorAction ? [...actions, sponsorAction] : actions;

  const handleAction = (action: QuickAction) => {
    if (action.isSponsor && action.linkUrl) {
      window.open(action.linkUrl, '_blank');
      setOpen(false);
      return;
    }
    if (action.path) navigate(action.path);
    action.onClick?.();
    setOpen(false);
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/10 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-14 right-4 sm:bottom-16 sm:right-6 z-[70]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Action sheet */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="absolute bottom-[72px] right-0 w-60 sm:w-64 glass-card rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Ce vrei să faci?</span>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 space-y-0.5">
                {allActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleAction(action)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                      action.isSponsor
                        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 hover:from-amber-100 hover:to-amber-200/50 dark:hover:from-amber-900/30 border border-amber-200/50 dark:border-amber-700/30 mt-1'
                        : 'text-foreground hover:bg-primary/10'
                    }`}
                  >
                    {action.isSponsor ? (
                      <Award className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    ) : (
                      <action.icon className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span className={action.isSponsor ? 'font-semibold text-amber-900 dark:text-amber-200 flex-1' : 'flex-1'}>
                      {action.label}
                    </span>
                    {action.isSponsor && (
                      <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Inky button */}
        <motion.button
          onClick={() => setOpen(!open)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          animate={open ? { rotate: 0 } : { rotate: [0, -5, 5, 0] }}
          transition={open ? {} : { repeat: Infinity, repeatDelay: 4, duration: 0.5 }}
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg border border-primary/20 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 glass-card"
        >
          <img src={inkyImg} alt="Inky Assistant" className="h-12 w-12 sm:h-14 sm:w-14 object-contain" />
        </motion.button>
      </div>
    </>
  );
}
