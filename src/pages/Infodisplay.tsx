import { useState, useEffect } from 'react';
import { getInfodisplayContent } from '@/api/infodisplay';
import { useSponsorRotation } from '@/hooks/useSponsorRotation';
import type { InfodisplayConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize, Monitor, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Infodisplay() {
  const [config, setConfig] = useState<InfodisplayConfig | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { currentPromo: sponsorPromo } = useSponsorRotation('infodisplay');

  useEffect(() => {
    getInfodisplayContent().then(setConfig);
  }, []);

  // Build combined panels: regular + sponsor
  const allPanels = config ? [
    ...config.panels,
    ...(sponsorPromo ? [{
      id: 9000 + sponsorPromo.id_promo,
      tip: 'sponsor' as const,
      continut: sponsorPromo.titlu,
      durata: 10,
      ordine: 99,
    }] : []),
  ] : [];

  useEffect(() => {
    if (allPanels.length === 0) return;
    const timer = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % allPanels.length);
    }, (allPanels[currentPanel]?.durata || 8) * 1000);
    return () => clearInterval(timer);
  }, [allPanels.length, currentPanel]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (!config) return null;

  const panel = allPanels[currentPanel];
  const isSponsorPanel = panel?.tip === 'sponsor' && sponsorPromo;

  return (
    <div className="space-y-6">
      {!isFullscreen && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Previzualizare Infodisplay</h1>
            <p className="text-muted-foreground">Așa cum apare pe ecranul TV / Raspberry Pi</p>
          </div>
          <Button className="gap-2" onClick={toggleFullscreen}>
            <Maximize className="h-4 w-4" /> Ecran complet
          </Button>
        </div>
      )}

      {/* Display Preview */}
      <div className={`relative bg-foreground text-background rounded-xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video'}`}>
        {/* Panel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPanel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-12"
          >
            {isSponsorPanel ? (
              /* Sponsor panel */
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" style={{ color: sponsorPromo.sponsor_culoare }} />
                  <Badge style={{ backgroundColor: sponsorPromo.sponsor_culoare, color: '#fff' }}>
                    SPONSOR
                  </Badge>
                </div>
                {sponsorPromo.sponsor_logo && (
                  <div className="h-24 w-24 rounded-2xl bg-white shadow-lg flex items-center justify-center p-3">
                    <img src={sponsorPromo.sponsor_logo} alt={sponsorPromo.sponsor_nume} className="h-full w-full object-contain" />
                  </div>
                )}
                <h2 className="text-3xl font-display font-bold text-center">{sponsorPromo.titlu}</h2>
                {sponsorPromo.descriere && (
                  <p className="text-lg opacity-80 text-center max-w-lg">{sponsorPromo.descriere}</p>
                )}
                {sponsorPromo.link_url && (
                  <div className="flex flex-col items-center gap-2 mt-4">
                    <div className="p-3 bg-background rounded-xl">
                      <QRCodeSVG value={sponsorPromo.link_url} size={100} />
                    </div>
                    <span className="text-xs opacity-60">Scanează pentru detalii</span>
                  </div>
                )}
              </div>
            ) : (
              /* Regular panel */
              <>
                <Badge className="mb-4 bg-primary text-primary-foreground">{panel?.tip?.toUpperCase()}</Badge>
                <h2 className="text-3xl font-display font-bold text-center mb-4">{panel?.continut}</h2>
                <div className="flex gap-6 mt-8">
                  {config.qr_codes.map((qr) => (
                    <div key={qr.label} className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-background rounded-xl">
                        <QRCodeSVG value={qr.url} size={80} />
                      </div>
                      <span className="text-xs opacity-80">{qr.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Panel Indicators */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {allPanels.map((p, i) => (
            <button
              key={i}
              onClick={() => setCurrentPanel(i)}
              className={`h-2 rounded-full transition-all ${i === currentPanel ? 'w-6' : 'w-2'}`}
              style={i === currentPanel
                ? { backgroundColor: p.tip === 'sponsor' && sponsorPromo ? sponsorPromo.sponsor_culoare : 'hsl(var(--primary))' }
                : { backgroundColor: 'hsl(var(--background) / 0.3)' }
              }
            />
          ))}
        </div>

        {/* News Ticker */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground py-2 overflow-hidden">
          <div className="animate-ticker-scroll whitespace-nowrap">
            {config.ticker_messages.map((msg, i) => (
              <span key={i} className="mx-12 text-sm">
                {msg} ●
              </span>
            ))}
          </div>
        </div>

        {/* Fullscreen exit */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 p-2 bg-background/20 rounded-lg hover:bg-background/30 transition-colors"
          >
            <Monitor className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
