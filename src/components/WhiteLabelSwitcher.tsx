import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DEMO_ENVIRONMENTS, INKY_ACCOUNT, type DemoAccount, type DemoEnvironment } from '@/config/demoEnvironments';
import { applyBrandingColors, applyVerticalTheme } from '@/utils/branding';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhiteLabelSwitcher() {
  const { user, setDemoUser, isDemo } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState<DemoEnvironment | null>(null);
  const [transition, setTransition] = useState<{ color: string; icon: string; name: string } | null>(null);

  // Use demo session storage when user is null (login page)
  const getCurrentVertical = () => {
    if (user?.vertical_type) return user.vertical_type;
    try {
      const demoSession = sessionStorage.getItem('demo_session');
      if (demoSession) {
        const parsed = JSON.parse(demoSession);
        return parsed.vertical_type || 'kids';
      }
    } catch {}
    return 'kids';
  };

  const currentVertical = getCurrentVertical();
  const currentEnv = DEMO_ENVIRONMENTS.find(e => e.key === currentVertical);

  const switchTo = useCallback((account: DemoAccount) => {
    setOpen(false);
    setSelectedEnv(null);

    // Show transition overlay
    const env = DEMO_ENVIRONMENTS.find(e => e.key === account.vertical);
    setTransition({
      color: env?.color || '#3b82f6',
      icon: env?.icon || '🏫',
      name: account.orgName,
    });

    setTimeout(() => {
      // Apply vertical-specific branding colors + theme
      if (env) {
        applyBrandingColors(env.primaryColor, env.secondaryColor);
        applyVerticalTheme(account.vertical);
        try {
          sessionStorage.setItem('demo_branding', JSON.stringify({ primary: env.primaryColor, secondary: env.secondaryColor }));
        } catch {}
      }

      setDemoUser({
        vertical: account.vertical,
        status: account.status,
        orgName: account.orgName,
        groups: account.groups,
        userName: account.userName,
      });
      navigate(account.redirect, { replace: true });
    }, 300);

    setTimeout(() => setTransition(null), 800);
  }, [setDemoUser, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

      if (e.key === 'D' || e.key === 'd') {
        e.preventDefault();
        setOpen(prev => !prev);
        return;
      }

      if (e.key === '0') {
        e.preventDefault();
        switchTo(INKY_ACCOUNT);
        return;
      }

      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < DEMO_ENVIRONMENTS.length) {
        e.preventDefault();
        switchTo(DEMO_ENVIRONMENTS[idx].accounts[0]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [switchTo]);

  return (
    <>
      {/* Floating pill button */}
      <button
        onClick={() => { setOpen(true); setSelectedEnv(null); }}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full bg-foreground/90 text-background px-4 py-2.5 shadow-lg hover:bg-foreground transition-colors min-h-[48px]"
      >
        <span className="text-lg">{currentEnv?.icon || '🏫'}</span>
        <span className="text-sm font-medium max-w-[140px] truncate">{currentEnv?.name}: {user?.nume_prenume?.split(' ')[0]}</span>
        <Zap className="h-3.5 w-3.5 opacity-60" />
      </button>

      {/* Switcher sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[340px] sm:w-[400px] p-0 overflow-y-auto">
          {!selectedEnv ? (
            /* Level 1: Environment grid */
            <div className="p-5">
              <h2 className="text-lg font-bold mb-1">White-Label Switcher</h2>
              <p className="text-xs text-muted-foreground mb-4">Comută între cele 8 medii demo</p>

              {/* Inky superadmin */}
              <button
                onClick={() => switchTo(INKY_ACCOUNT)}
                className="w-full flex items-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-3 mb-4 hover:bg-accent transition-colors text-left"
              >
                <span className="text-2xl">🔮</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold">INKY Superadmin</p>
                  <p className="text-xs text-muted-foreground truncate">Acces la toate organizațiile</p>
                </div>
              </button>

              {/* Vertical grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {DEMO_ENVIRONMENTS.map(env => (
                  <button
                    key={env.key}
                    onClick={() => setSelectedEnv(env)}
                    className={`flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all hover:shadow-md ${
                      env.key === currentVertical ? 'ring-2 ring-primary border-primary' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-xl">{env.icon}</span>
                      <span className="text-xs font-bold">{env.name}</span>
                    </div>
                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: env.color }} />
                    <p className="text-[11px] text-muted-foreground leading-tight truncate w-full">{env.orgName}</p>
                    <span className="text-[10px] text-muted-foreground">{env.accounts.length} conturi</span>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-muted-foreground mt-4 text-center">
                Ctrl+Shift+D comutare • Ctrl+Shift+1-8 acces rapid
              </p>
            </div>
          ) : (
            /* Level 2: Account list */
            <div className="p-5">
              <button
                onClick={() => setSelectedEnv(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Înapoi
              </button>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{selectedEnv.icon}</span>
                <div>
                  <h3 className="text-base font-bold">{selectedEnv.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedEnv.orgName}</p>
                </div>
                <div className="ml-auto h-4 w-4 rounded-full" style={{ backgroundColor: selectedEnv.color }} />
              </div>

              <div className="space-y-2">
                {selectedEnv.accounts.map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => switchTo(acc)}
                    className="w-full flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-accent hover:border-primary/40 transition-all"
                  >
                    <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: selectedEnv.color }}>
                      {acc.label[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{acc.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{acc.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Transition overlay */}
      <AnimatePresence>
        {transition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3"
            style={{ backgroundColor: transition.color }}
          >
            <span className="text-6xl">{transition.icon}</span>
            <span className="text-white text-lg font-bold">{transition.name}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
