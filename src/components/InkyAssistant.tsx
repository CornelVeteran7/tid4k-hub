import { useState, useCallback, useMemo } from 'react';
import { useExternalLink } from '@/contexts/ExternalLinkContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { useSponsorRotation } from '@/hooks/useSponsorRotation';
import { logClick } from '@/api/sponsors';
import type { SponsorPromo } from '@/types/sponsor';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Send, Upload, MessageSquare, Megaphone, Search,
  BookOpen, UtensilsCrossed, FileText, CheckSquare, BarChart3, Shuffle, X,
  Award, ExternalLink
} from 'lucide-react';
import inkyImg from '@/assets/inky-button.png';
import inkyDoctor from '@/assets/inky-doctor.png';
import inkyConstruction from '@/assets/inky-construction.png';
import inkyMechanic from '@/assets/inky-mechanic.png';
import inkyOpera from '@/assets/inky-opera.png';

const VERTICAL_COSTUMES: Record<string, string> = {
  kids: inkyImg,
  schools: inkyImg,
  medicine: inkyDoctor,
  construction: inkyConstruction,
  workshops: inkyMechanic,
  culture: inkyOpera,
  living: inkyImg,
  students: inkyImg,
};

interface QuickAction {
  label: string;
  icon: React.ElementType;
  path?: string;
  onClick?: () => void;
  isSponsor?: boolean;
  sponsorColor?: string;
  sponsorLogo?: string;
  linkUrl?: string;
  stilInky?: SponsorPromo['stil_inky'];
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

  if (isTeacher) return [
    { label: 'Înregistrează prezența', icon: ClipboardList, path: '/prezenta' },
    { label: 'Trimite mesaj', icon: Send, path: '/mesaje' },
  ];
  return [
    { label: 'Vezi mesaje', icon: MessageSquare, path: '/mesaje' },
    { label: 'Vezi anunțuri', icon: Megaphone, path: '/anunturi' },
  ];
}

/* Smooth spring presets */
const overlayTransition = { duration: 0.2, ease: [0.4, 0, 0.2, 1] } as const;
const menuSpring = { type: 'spring', damping: 26, stiffness: 400, mass: 0.8 } as const;
const buttonSpring = { type: 'spring', damping: 18, stiffness: 350 } as const;
const itemStagger = { type: 'spring', damping: 20, stiffness: 300 } as const;

export default function InkyAssistant() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { openLink } = useExternalLink();

  const { currentPromo } = useSponsorRotation('inky_popup');

  const sponsorAction: QuickAction | null = useMemo(() => currentPromo ? {
    label: currentPromo.titlu,
    icon: Award,
    isSponsor: true,
    sponsorColor: currentPromo.sponsor_culoare,
    sponsorLogo: currentPromo.sponsor_logo,
    linkUrl: currentPromo.link_url,
    stilInky: currentPromo.stil_inky,
  } : null, [currentPromo]);

  const toggle = useCallback(() => setOpen(o => !o), []);
  const close = useCallback(() => setOpen(false), []);

  if (!user) return null;

  const isTeacher = areRol(user.status, 'profesor');
  const isParent = areRol(user.status, 'parinte');
  const actions = getActions(location.pathname, isTeacher, isParent);
  const allActions = sponsorAction ? [...actions, sponsorAction] : actions;

  const handleAction = (action: QuickAction) => {
    if (action.isSponsor && action.linkUrl) {
      if (currentPromo) {
        logClick({ id_promo: currentPromo.id, tip: 'inky_popup' });
      }
      openLink(action.linkUrl);
      setOpen(false);
      return;
    }
    if (action.path) navigate(action.path);
    action.onClick?.();
    setOpen(false);
  };

  const stilInky = sponsorAction?.stilInky;
  const sponsorBg = stilInky?.bg_color || sponsorAction?.sponsorColor || '#e1001a';
  const costumeUrl = stilInky?.costume_url;
  const verticalCostume = VERTICAL_COSTUMES[user.vertical_type || 'kids'] || inkyImg;

  return (
    <>
      {/* Scrim overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={overlayTransition}
            className="fixed inset-0 z-[60] bg-foreground/10 backdrop-blur-[6px]"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-14 right-4 sm:bottom-16 sm:right-6 z-[70]" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {/* Action menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={menuSpring}
              className="absolute bottom-[72px] right-0 w-60 sm:w-64 glass-card rounded-xl shadow-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Ce vrei să faci?</span>
                <button onClick={close} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 space-y-0.5">
                {allActions.map((action, i) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...itemStagger, delay: i * 0.04 }}
                    onClick={() => handleAction(action)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                      action.isSponsor ? 'mt-1 border' : 'text-foreground hover:bg-primary/10'
                    }`}
                    style={action.isSponsor ? {
                      background: `linear-gradient(135deg, ${sponsorBg}12 0%, ${sponsorBg}22 100%)`,
                      borderColor: `${sponsorBg}35`,
                    } : undefined}
                  >
                    {action.isSponsor ? (
                      action.sponsorLogo ? (
                        <img src={action.sponsorLogo} alt="" className="h-4 w-4 object-contain shrink-0" />
                      ) : (
                        <Award className="h-4 w-4 shrink-0" style={{ color: sponsorBg }} />
                      )
                    ) : (
                      <action.icon className="h-4 w-4 text-primary shrink-0" />
                    )}
                    <span
                      className={action.isSponsor ? 'font-semibold flex-1' : 'flex-1'}
                      style={action.isSponsor ? { color: sponsorBg } : undefined}
                    >
                      {action.label}
                    </span>
                    {action.isSponsor && (
                      <ExternalLink className="h-3 w-3 shrink-0" style={{ color: sponsorBg }} />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Inky button */}
        <motion.button
          onClick={toggle}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          animate={open
            ? { rotate: 0, scale: 1 }
            : { rotate: [0, -4, 4, 0], scale: 1 }
          }
          transition={open
            ? buttonSpring
            : { repeat: Infinity, repeatDelay: 5, duration: 0.6, ease: 'easeInOut' }
          }
          className="h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-lg border border-primary/20 flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 glass-card p-0"
        >
          <img src={costumeUrl || verticalCostume} alt="Inky Assistant" className="h-[90%] w-[90%] object-contain" />
        </motion.button>
      </div>
    </>
  );
}
