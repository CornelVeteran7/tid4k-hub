import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import type { SurtitleShow, SurtitleBlock } from '@/api/surtitles';
import { subscribeToShow } from '@/api/surtitles';

export default function SurtitleAudiencePage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [show, setShow] = useState<SurtitleShow | null>(null);
  const [blocks, setBlocks] = useState<SurtitleBlock[]>([]);
  const [lang, setLang] = useState<'ro' | 'en' | 'fr'>('ro');
  const [loading, setLoading] = useState(true);

  // Find the current live show for this org
  useEffect(() => {
    if (!orgSlug) return;

    const fetchLiveShow = async () => {
      // Get org by slug
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single();

      if (!org) {
        setLoading(false);
        return;
      }

      // Get live or most recent show
      const { data: shows } = await (supabase
        .from('surtitle_shows')
        .select('*')
        .eq('organization_id', org.id)
        .in('status', ['live', 'pregatire'])
        .order('data_spectacol', { ascending: false })
        .limit(1) as any);

      if (shows && shows.length > 0) {
        const s = shows[0] as SurtitleShow;
        setShow(s);

        // Get blocks
        const { data: b } = await supabase
          .from('surtitle_blocks')
          .select('*')
          .eq('show_id', s.id)
          .order('sequence_nr');

        setBlocks((b || []) as SurtitleBlock[]);
      }
      setLoading(false);
    };

    fetchLiveShow();
  }, [orgSlug]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!show) return;
    const channel = subscribeToShow(show.id, (updated) => {
      setShow(updated);
    });
    return () => { supabase.removeChannel(channel); };
  }, [show?.id]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!show) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white/50 text-xl">Niciun spectacol live</p>
      </div>
    );
  }

  const currentBlock = blocks.find(b => b.sequence_nr === show.current_block);
  const getText = (b: SurtitleBlock) =>
    lang === 'en' ? (b.text_en || b.text_ro) :
    lang === 'fr' ? (b.text_fr || b.text_ro) :
    b.text_ro;

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
      <div className="absolute top-4 right-4 flex gap-2">
        <Select value={lang} onValueChange={v => setLang(v as any)}>
          <SelectTrigger className="w-20 bg-white/10 text-white border-white/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ro">RO</SelectItem>
            <SelectItem value="en">EN</SelectItem>
            <SelectItem value="fr">FR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="text-center px-8 max-w-4xl">
        {currentBlock ? (
          <p className="text-4xl md:text-6xl font-bold text-white leading-tight">
            {getText(currentBlock)}
          </p>
        ) : (
          <p className="text-2xl text-white/50">Așteptare...</p>
        )}
      </div>
      <div className="absolute bottom-4 text-white/30 text-sm">
        {show.titlu} · Bloc {show.current_block}/{blocks.length} · {lang.toUpperCase()}
      </div>
    </div>
  );
}
