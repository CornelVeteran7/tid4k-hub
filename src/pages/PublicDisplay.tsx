import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

interface DisplayPanel {
  id: string;
  tip: string;
  continut: string;
  durata: number;
  ordine: number;
  activ?: boolean;
}

interface DisplayConfig {
  panels: DisplayPanel[];
  ticker_messages: string[];
  qr_codes: { label: string; url: string }[];
  transition: 'fade' | 'slide';
  org_name?: string;
  org_logo?: string;
  primary_color?: string;
}

export default function PublicDisplay() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [currentPanel, setCurrentPanel] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    // Load org info
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', orgSlug || '')
      .maybeSingle();

    // Load display panels (only active ones)
    const { data: panels } = await supabase
      .from('infodisplay_panels')
      .select('*')
      .order('ordine');

    const { data: ticker } = await supabase
      .from('infodisplay_ticker')
      .select('*')
      .order('ordine');

    const { data: qr } = await supabase
      .from('infodisplay_qr')
      .select('*');

    const { data: settings } = await supabase
      .from('infodisplay_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    // Also load non-expired, non-hidden announcements as ticker messages
    const { data: announcements } = await supabase
      .from('announcements')
      .select('titlu')
      .eq('ascuns_banda', false)
      .or('data_expirare.is.null,data_expirare.gt.' + new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    const tickerMsgs = [
      ...(ticker || []).map(t => t.mesaj),
      ...(announcements || []).map(a => a.titlu),
    ];

    setConfig({
      panels: (panels || []).map(p => ({
        id: p.id,
        tip: p.tip,
        continut: p.continut,
        durata: p.durata || 8,
        ordine: p.ordine || 1,
      })),
      ticker_messages: tickerMsgs,
      qr_codes: (qr || []).map(q => ({ label: q.label, url: q.url })),
      transition: (settings?.transition as 'fade' | 'slide') || 'fade',
      org_name: org?.name || orgSlug || 'InfoDisplay',
      org_logo: org?.logo_url || undefined,
      primary_color: org?.primary_color || '#4F46E5',
    });
    setLoading(false);
  }, [orgSlug]);

  useEffect(() => {
    loadContent();
    // Refresh every 5 minutes
    const interval = setInterval(loadContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadContent]);

  // Auto-rotate panels
  useEffect(() => {
    if (!config || config.panels.length === 0) return;
    const duration = (config.panels[currentPanel]?.durata || 8) * 1000;
    const timer = setTimeout(() => {
      setCurrentPanel(prev => (prev + 1) % config.panels.length);
    }, duration);
    return () => clearTimeout(timer);
  }, [config, currentPanel]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!config || config.panels.length === 0) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold mb-4">{config?.org_name || 'InfoDisplay'}</h1>
        <p className="text-white/60 text-lg">Nu sunt panouri configurate</p>
      </div>
    );
  }

  const panel = config.panels[currentPanel];
  const isSlide = config.transition === 'slide';

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none cursor-none">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-4">
          {config.org_logo && (
            <img src={config.org_logo} alt="" className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1" />
          )}
          <span className="text-xl font-bold opacity-80">{config.org_name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm opacity-50 font-mono">
            {new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {/* Panel indicators */}
          <div className="flex gap-1.5">
            {config.panels.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${i === currentPanel ? 'w-6' : 'w-2'}`}
                style={{ backgroundColor: i === currentPanel ? (config.primary_color || '#4F46E5') : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPanel}
          initial={isSlide ? { x: '100%' } : { opacity: 0 }}
          animate={isSlide ? { x: 0 } : { opacity: 1 }}
          exit={isSlide ? { x: '-100%' } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 flex flex-col items-center justify-center px-16 py-24"
        >
          <div className="text-center max-w-4xl">
            <span
              className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-6 uppercase tracking-wider"
              style={{ backgroundColor: config.primary_color || '#4F46E5' }}
            >
              {panel.tip}
            </span>
            <h2 className="text-5xl font-bold leading-tight mb-8">{panel.continut}</h2>

            {/* QR codes */}
            {config.qr_codes.length > 0 && (
              <div className="flex items-center justify-center gap-8 mt-12">
                {config.qr_codes.map(qr => (
                  <div key={qr.label} className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-white rounded-2xl">
                      <QRCodeSVG value={qr.url} size={100} />
                    </div>
                    <span className="text-sm opacity-60">{qr.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* News Ticker */}
      {config.ticker_messages.length > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 py-3 overflow-hidden"
          style={{ backgroundColor: config.primary_color || '#4F46E5' }}
        >
          <div className="animate-ticker-scroll whitespace-nowrap">
            {/* Duplicate messages for seamless loop */}
            {[...config.ticker_messages, ...config.ticker_messages].map((msg, i) => (
              <span key={i} className="mx-12 text-base font-medium">
                {msg} ●
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
