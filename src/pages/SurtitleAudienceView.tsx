import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import {
  getSurtitleBlocks, subscribeToLive,
  type CultureSurtitleBlock, type SurtitleLive
} from '@/api/culture';

type Lang = 'ro' | 'en' | 'fr' | 'de';

const FLAG: Record<Lang, string> = { ro: '🇷🇴', en: '🇬🇧', fr: '🇫🇷', de: '🇩🇪' };
const LANG_LABEL: Record<Lang, string> = { ro: 'Română', en: 'English', fr: 'Français', de: 'Deutsch' };
const FONT_SIZES: Record<string, number> = { mic: 24, normal: 36, mare: 52 };

export default function SurtitleAudienceView() {
  const { showId } = useParams<{ showId: string }>();
  const [blocks, setBlocks] = useState<CultureSurtitleBlock[]>([]);
  const [live, setLive] = useState<SurtitleLive | null>(null);
  const [lang, setLang] = useState<Lang>('ro');
  const [fontSize, setFontSize] = useState<'mic' | 'normal' | 'mare'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    const loadData = async () => {
      const b = await getSurtitleBlocks(showId);
      setBlocks(b);
      // Get initial live state
      const { data: liveData } = await supabase
        .from('surtitle_live')
        .select('*')
        .eq('show_id', showId)
        .maybeSingle() as any;
      setLive(liveData as SurtitleLive | null);
      setLoading(false);
    };
    loadData();
  }, [showId]);

  // Subscribe to live updates
  useEffect(() => {
    if (!showId) return;
    const channel = subscribeToLive(showId, (updated) => {
      setLive(updated);
    });
    return () => { supabase.removeChannel(channel); };
  }, [showId]);

  const currentBlock = blocks.find(b => b.id === live?.current_block_id);

  const getText = useCallback((block: CultureSurtitleBlock): string => {
    const map: Record<Lang, string> = { ro: block.text_ro, en: block.text_en, fr: block.text_fr, de: block.text_de };
    return map[lang] || block.text_ro || '';
  }, [lang]);

  // Check if we should show onboarding
  useEffect(() => {
    const seen = sessionStorage.getItem(`surtitle-onboarding-${showId}`);
    if (seen) setShowOnboarding(false);
  }, [showId]);

  const dismissOnboarding = () => {
    sessionStorage.setItem(`surtitle-onboarding-${showId}`, '1');
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Onboarding screen
  if (showOnboarding) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center px-8 text-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="max-w-md space-y-6">
          <div className="text-5xl mb-4">🎭</div>
          <h1 className="text-2xl font-bold text-white">Supratitrare</h1>
          <div className="bg-white/[0.06] rounded-2xl p-6 text-left space-y-4">
            <p className="text-white/80 text-sm leading-relaxed">
              Pentru confortul celorlalți spectatori, vă rugăm să:
            </p>
            <ul className="space-y-3 text-white/70 text-sm">
              <li className="flex items-center gap-3">
                <span className="text-lg">🔅</span> Reduceți luminozitatea ecranului la minim
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">🔇</span> Activați modul silențios
              </li>
              <li className="flex items-center gap-3">
                <span className="text-lg">🔕</span> Dezactivați notificările
              </li>
            </ul>
          </div>
          <Button onClick={dismissOnboarding} className="w-full h-14 text-lg bg-white/10 hover:bg-white/20 text-white border border-white/20">
            Am înțeles — Continuă
          </Button>
        </div>
      </div>
    );
  }

  // Blackout or not live
  const isBlackout = live?.is_blackout || !live?.is_live;

  const textColor = highContrast ? '#FFD700' : '#ffffff';
  const bgColor = '#000000';

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: bgColor, fontFamily: "'Poppins', sans-serif", color: textColor }}>
      {/* Top bar — minimal */}
      <div className="flex items-center justify-between px-4 py-2" style={{ opacity: 0.4 }}>
        {/* Act/scene indicator */}
        <div className="text-xs">
          {currentBlock && !isBlackout && (
            <span>Act {currentBlock.act_number} · Scenă {currentBlock.scene_number}</span>
          )}
        </div>
        {/* Settings */}
        <div className="flex items-center gap-2">
          {/* Language */}
          {(['ro', 'en', 'fr', 'de'] as Lang[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2 py-1 rounded text-xs transition-colors ${lang === l ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {FLAG[l]} {l.toUpperCase()}
            </button>
          ))}
          <span className="text-white/20 mx-1">|</span>
          {/* Font size */}
          {(['mic', 'normal', 'mare'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFontSize(s)}
              className={`px-2 py-1 rounded text-xs transition-colors ${fontSize === s ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              {s === 'mic' ? 'A' : s === 'normal' ? 'A+' : 'A++'}
            </button>
          ))}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className={`px-2 py-1 rounded text-xs transition-colors ${highContrast ? 'bg-yellow-500/30 text-yellow-300' : 'text-white/40 hover:text-white/70'}`}
          >
            HC
          </button>
        </div>
      </div>

      {/* Main text area */}
      <div className="flex-1 flex items-center justify-center px-6">
        {isBlackout ? (
          <div /> // Intentionally blank during blackout
        ) : currentBlock ? (
          <p className="text-center leading-relaxed font-semibold max-w-4xl" style={{
            fontSize: FONT_SIZES[fontSize],
            color: textColor,
            textShadow: highContrast ? '0 0 20px rgba(255,215,0,0.3)' : 'none',
          }}>
            {getText(currentBlock)}
          </p>
        ) : (
          <p className="text-center text-white/20" style={{ fontSize: 20 }}>
            Așteptare...
          </p>
        )}
      </div>

      {/* Bottom — very subtle */}
      <div className="text-center pb-3" style={{ opacity: 0.15, fontSize: 11 }}>
        {LANG_LABEL[lang]}
      </div>
    </div>
  );
}
