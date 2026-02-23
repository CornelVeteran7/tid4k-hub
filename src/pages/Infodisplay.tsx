import { useState, useEffect } from 'react';
import { getInfodisplayContent } from '@/api/infodisplay';
import type { InfodisplayConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QRCodeSVG } from 'qrcode.react';
import { Maximize, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Infodisplay() {
  const [config, setConfig] = useState<InfodisplayConfig | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    getInfodisplayContent().then(setConfig);
  }, []);

  useEffect(() => {
    if (!config) return;
    const timer = setInterval(() => {
      setCurrentPanel((prev) => (prev + 1) % config.panels.length);
    }, (config.panels[currentPanel]?.durata || 8) * 1000);
    return () => clearInterval(timer);
  }, [config, currentPanel]);

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

  const panel = config.panels[currentPanel];

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
            <Badge className="mb-4 bg-primary text-primary-foreground">{panel?.tip?.toUpperCase()}</Badge>
            <h2 className="text-3xl font-display font-bold text-center mb-4">{panel?.continut}</h2>

            {/* QR Codes */}
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
          </motion.div>
        </AnimatePresence>

        {/* Panel Indicators */}
        <div className="absolute top-4 right-4 flex gap-1.5">
          {config.panels.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPanel(i)}
              className={`h-2 rounded-full transition-all ${i === currentPanel ? 'w-6 bg-primary' : 'w-2 bg-background/30'}`}
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
