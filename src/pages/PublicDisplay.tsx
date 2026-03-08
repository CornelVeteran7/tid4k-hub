import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { DisplayHeader } from '@/components/display/DisplayHeader';
import { DisplayTicker } from '@/components/display/DisplayTicker';
import { DisplayPanelSlider } from '@/components/display/DisplayPanelSlider';
import { QueueDisplay } from '@/components/display/QueueDisplay';
import { ConstructionDisplay } from '@/components/display/ConstructionDisplay';
import { MenuDisplay } from '@/components/display/MenuDisplay';

interface DisplayPanel {
  id: string;
  tip: string;
  continut: string;
  durata: number;
  ordine: number;
}

interface DisplayConfig {
  panels: DisplayPanel[];
  ticker_messages: string[];
  qr_codes: { label: string; url: string }[];
  transition: 'fade' | 'slide';
  org_id: string;
  org_name: string;
  org_logo?: string;
  primary_color: string;
  vertical_type: string;
}

export default function PublicDisplay() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [config, setConfig] = useState<DisplayConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContent = useCallback(async () => {
    // Load org info
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('name', orgSlug || '')
      .maybeSingle();

    const orgId = org?.id || '';

    // Load display data in parallel
    const [{ data: panels }, { data: ticker }, { data: qr }, { data: settings }, { data: announcements }] =
      await Promise.all([
        supabase.from('infodisplay_panels').select('*').eq('organization_id', orgId).order('ordine'),
        supabase.from('infodisplay_ticker').select('*').eq('organization_id', orgId).order('ordine'),
        supabase.from('infodisplay_qr').select('*').eq('organization_id', orgId),
        supabase.from('infodisplay_settings').select('*').eq('organization_id', orgId).limit(1).maybeSingle(),
        supabase
          .from('announcements')
          .select('titlu')
          .eq('organization_id', orgId)
          .eq('ascuns_banda', false)
          .or('data_expirare.is.null,data_expirare.gt.' + new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10),
      ]);

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
      org_id: orgId,
      org_name: org?.name || orgSlug || 'InfoDisplay',
      org_logo: org?.logo_url || undefined,
      primary_color: org?.primary_color || '#4F46E5',
      vertical_type: org?.vertical_type || 'kids',
    });
    setLoading(false);
  }, [orgSlug]);

  useEffect(() => {
    loadContent();
    const interval = setInterval(loadContent, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadContent]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center">
        <h1 className="text-[5vh] font-bold mb-4">Organizație negăsită</h1>
        <p className="text-white/60 text-[2vh]">Verifică URL-ul sau contactează administratorul</p>
      </div>
    );
  }

  const qrUrl = `${window.location.origin}/qr/${orgSlug}`;

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden select-none cursor-none">
      {/* Header — shared across all verticals */}
      <DisplayHeader
        orgName={config.org_name}
        orgLogo={config.org_logo}
        primaryColor={config.primary_color}
        qrUrl={qrUrl}
      />

      {/* Vertical-specific main content */}
      <VerticalContent config={config} />

      {/* Ticker — shared across all verticals */}
      <DisplayTicker messages={config.ticker_messages} color={config.primary_color} />
    </div>
  );
}

/** Routes display content based on vertical_type */
function VerticalContent({ config }: { config: DisplayConfig }) {
  switch (config.vertical_type) {
    case 'medicine':
      return (
        <QueueDisplay
          organizationId={config.org_id}
          primaryColor={config.primary_color}
        />
      );

    case 'construction':
      return (
        <ConstructionDisplay
          organizationId={config.org_id}
          primaryColor={config.primary_color}
        />
      );

    case 'kids':
      return (
        <KidsDisplay config={config} />
      );

    default:
      // Schools, living, culture, students, workshops — standard panel slideshow
      return (
        <DefaultDisplay config={config} />
      );
  }
}

/** Kids: panels + today's menu + QR codes */
function KidsDisplay({ config }: { config: DisplayConfig }) {
  const hasMenu = config.vertical_type === 'kids';

  return (
    <>
      {config.panels.length > 0 ? (
        <DisplayPanelSlider panels={config.panels} primaryColor={config.primary_color} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[8vh] mb-[2vh]">🧒</div>
          <div className="text-[3vh] opacity-60">{config.org_name}</div>
        </div>
      )}

      {/* Floating menu card — bottom left */}
      {hasMenu && (
        <div className="absolute bottom-[7vh] left-[2vw] z-[5]">
          <MenuDisplay organizationId={config.org_id} />
        </div>
      )}

      {/* QR codes — bottom right */}
      {config.qr_codes.length > 0 && (
        <div className="absolute bottom-[7vh] right-[2vw] z-[5] flex gap-[1.5vw]">
          {config.qr_codes.map(qr => (
            <div key={qr.label} className="flex flex-col items-center gap-[0.5vh]">
              <div className="p-[0.8vh] bg-white rounded-xl">
                <QRCodeSVG value={qr.url} size={80} />
              </div>
              <span className="text-[1.4vh] opacity-60">{qr.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/** Default slideshow for other verticals */
function DefaultDisplay({ config }: { config: DisplayConfig }) {
  if (config.panels.length === 0) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[5vh] font-bold mb-[2vh]">{config.org_name}</div>
        <div className="text-[2.5vh] opacity-40">
          {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        {config.qr_codes.length > 0 && (
          <div className="flex gap-[2vw] mt-[4vh]">
            {config.qr_codes.map(qr => (
              <div key={qr.label} className="flex flex-col items-center gap-[0.5vh]">
                <div className="p-[1vh] bg-white rounded-xl">
                  <QRCodeSVG value={qr.url} size={100} />
                </div>
                <span className="text-[1.4vh] opacity-60">{qr.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <DisplayPanelSlider panels={config.panels} primaryColor={config.primary_color} />
      {config.qr_codes.length > 0 && (
        <div className="absolute bottom-[7vh] right-[2vw] z-[5] flex gap-[1.5vw]">
          {config.qr_codes.map(qr => (
            <div key={qr.label} className="flex flex-col items-center gap-[0.5vh]">
              <div className="p-[0.8vh] bg-white rounded-xl">
                <QRCodeSVG value={qr.url} size={80} />
              </div>
              <span className="text-[1.4vh] opacity-60">{qr.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
