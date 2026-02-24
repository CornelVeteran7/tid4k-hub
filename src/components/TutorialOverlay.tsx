import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const STORAGE_KEY = 'tid4k_tutorial_done';

interface TutorialStep {
  target: string; // data-tutorial value
  title: string;
  description: string;
}

const STEPS: TutorialStep[] = [
  {
    target: 'welcome-card',
    title: 'Sumar rapid',
    description: 'Aici vezi un sumar rapid al zilei: prezența, fotografii, documente și mesaje. Apasă pe orice buton pentru a deschide modulul.',
  },
  {
    target: 'children-scroller',
    title: 'Copiii grupei',
    description: 'Aici sunt copiii din grupa ta. Apasă pe un copil pentru a vedea prezența, costul hranei și pentru a trimite un mesaj părinților.',
  },
  {
    target: 'module-hub',
    title: 'Module de lucru',
    description: 'Acestea sunt modulele tale de lucru. Apasă pe oricare card pentru a deschide funcția respectivă.',
  },
  {
    target: 'config-button',
    title: 'Configurare',
    description: 'De aici poți alege ce module să fie vizibile pe ecranul tău.',
  },
  {
    target: 'group-selector',
    title: 'Selectare grupă',
    description: 'Selectează grupa cu care lucrezi. Toate datele se schimbă automat.',
  },
  {
    target: 'notifications',
    title: 'Notificări',
    description: 'Aici primești notificări pentru mesaje noi și anunțuri importante.',
  },
  {
    target: 'menu-button',
    title: 'Meniu',
    description: 'Din meniu accesezi Orar, Anunțuri și setările de administrare.',
  },
  {
    target: 'announcements',
    title: 'Anunțuri',
    description: 'Aici apar anunțurile importante care rulează automat.',
  },
];

function getSpotlightRect(target: string): DOMRect | null {
  const el = document.querySelector(`[data-tutorial="${target}"]`);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export default function TutorialOverlay() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const isMobile = useIsMobile();
  const rafRef = useRef<number>();

  // Auto-start on first visit
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Delay slightly so DOM elements are rendered
      const timer = setTimeout(() => setIsActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for restart event
  useEffect(() => {
    const handler = () => {
      setCurrentStep(0);
      setIsActive(true);
    };
    window.addEventListener('restart-tutorial', handler);
    return () => window.removeEventListener('restart-tutorial', handler);
  }, []);

  // Update spotlight position
  const updateSpotlight = useCallback(() => {
    if (!isActive) return;
    const step = STEPS[currentStep];
    if (!step) return;
    const rect = getSpotlightRect(step.target);
    setSpotlightRect(rect);
  }, [isActive, currentStep]);

  useEffect(() => {
    updateSpotlight();
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateSpotlight);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateSpotlight]);

  const finish = useCallback(() => {
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  const next = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      finish();
    }
  }, [currentStep, finish]);

  const prev = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  if (!isActive) return null;

  const step = STEPS[currentStep];
  const pad = 8;

  // Compute tooltip position
  let tooltipStyle: React.CSSProperties = {};
  if (spotlightRect) {
    const centerX = spotlightRect.left + spotlightRect.width / 2;
    const below = spotlightRect.bottom + pad + 12;
    const above = spotlightRect.top - pad - 12;
    const spaceBelow = window.innerHeight - spotlightRect.bottom;
    const showBelow = spaceBelow > 220 || spotlightRect.top < 200;

    tooltipStyle = {
      position: 'fixed',
      top: showBelow ? below : undefined,
      bottom: showBelow ? undefined : window.innerHeight - above,
      left: Math.max(16, Math.min(centerX - 160, window.innerWidth - 336)),
      width: 320,
      zIndex: 60,
    };
  } else {
    // Center fallback
    tooltipStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 320,
      zIndex: 60,
    };
  }

  // Clip path to cut out the spotlight
  const clipPath = spotlightRect
    ? `polygon(
        0% 0%, 0% 100%, 
        ${spotlightRect.left - pad}px 100%, 
        ${spotlightRect.left - pad}px ${spotlightRect.top - pad}px, 
        ${spotlightRect.right + pad}px ${spotlightRect.top - pad}px, 
        ${spotlightRect.right + pad}px ${spotlightRect.bottom + pad}px, 
        ${spotlightRect.left - pad}px ${spotlightRect.bottom + pad}px, 
        ${spotlightRect.left - pad}px 100%, 
        100% 100%, 100% 0%
      )`
    : undefined;

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Dark overlay with spotlight cutout */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[55] bg-black/60"
            style={{ clipPath }}
            onClick={finish}
          />

          {/* Spotlight border ring */}
          {spotlightRect && (
            <motion.div
              key="ring"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[56] rounded-xl pointer-events-none"
              style={{
                top: spotlightRect.top - pad,
                left: spotlightRect.left - pad,
                width: spotlightRect.width + pad * 2,
                height: spotlightRect.height + pad * 2,
                boxShadow: '0 0 0 3px hsl(var(--primary) / 0.6), 0 0 20px 4px hsl(var(--primary) / 0.2)',
              }}
              layoutId="spotlight-ring"
            />
          )}

          {/* Tooltip card */}
          <motion.div
            key={`tooltip-${currentStep}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            style={tooltipStyle}
            className="rounded-2xl border border-border bg-card shadow-2xl p-5"
          >
            {/* Close button */}
            <button
              onClick={finish}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground">
                {currentStep + 1} din {STEPS.length}
              </span>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            <h3 className="text-base font-bold text-foreground mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={finish}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Sari peste tutorial
              </button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={prev} className="gap-1">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Înapoi
                  </Button>
                )}
                <Button size="sm" onClick={next} className="gap-1">
                  {currentStep < STEPS.length - 1 ? (
                    <>
                      Următorul
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    'Gata!'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
