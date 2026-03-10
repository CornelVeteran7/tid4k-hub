import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChevronLeft, ChevronRight, Radio, Eye, EyeOff, LogOut, SkipForward
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getShowById, getSurtitleBlocks, getLiveState, setLiveState,
  type CultureShow, type CultureSurtitleBlock, type SurtitleLive
} from '@/api/culture';

export default function SurtitleOperator() {
  const { showId } = useParams<{ showId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState<CultureShow | null>(null);
  const [blocks, setBlocks] = useState<CultureSurtitleBlock[]>([]);
  const [live, setLive] = useState<SurtitleLive | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    Promise.all([getShowById(showId), getSurtitleBlocks(showId), getLiveState(showId)])
      .then(([s, b, l]) => { setShow(s); setBlocks(b); setLive(l); setLoading(false); })
      .catch(e => { toast.error(e.message); setLoading(false); });
  }, [showId]);

  const currentIdx = blocks.findIndex(b => b.id === live?.current_block_id);
  const currentBlock = currentIdx >= 0 ? blocks[currentIdx] : null;
  const prevBlock = currentIdx > 0 ? blocks[currentIdx - 1] : null;
  const nextBlock = currentIdx < blocks.length - 1 ? blocks[currentIdx + 1] : null;

  const goTo = useCallback(async (blockId: string | null) => {
    if (!showId) return;
    try {
      await setLiveState(showId, { current_block_id: blockId, is_live: true, is_blackout: false });
      setLive(prev => prev ? { ...prev, current_block_id: blockId, is_live: true, is_blackout: false } : null);
    } catch (e: any) { toast.error(e.message); }
  }, [showId]);

  const goNext = useCallback(() => {
    if (nextBlock) goTo(nextBlock.id);
    else if (blocks.length > 0 && !currentBlock) goTo(blocks[0].id);
  }, [nextBlock, currentBlock, blocks, goTo]);

  const goPrev = useCallback(() => {
    if (prevBlock) goTo(prevBlock.id);
  }, [prevBlock, goTo]);

  const toggleLive = useCallback(async () => {
    if (!showId) return;
    const newState = !live?.is_live;
    await setLiveState(showId, { is_live: newState, is_blackout: false });
    setLive(prev => prev ? { ...prev, is_live: newState, is_blackout: false } : null);
    toast.success(newState ? 'LIVE pornit' : 'LIVE oprit');
  }, [showId, live?.is_live]);

  const toggleBlackout = useCallback(async () => {
    if (!showId) return;
    const newState = !live?.is_blackout;
    await setLiveState(showId, { is_blackout: newState });
    setLive(prev => prev ? { ...prev, is_blackout: newState } : null);
  }, [showId, live?.is_blackout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      if (e.key === 'b' || e.key === 'B') toggleBlackout();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, toggleBlackout]);

  // Get unique acts for jump-to
  const acts = [...new Set(blocks.map(b => b.act_number))].sort((a, b) => a - b);
  const scenes = currentBlock ? [...new Set(blocks.filter(b => b.act_number === currentBlock.act_number).map(b => b.scene_number))].sort((a, b) => a - b) : [];

  if (loading) return <div className="fixed inset-0 bg-black flex items-center justify-center"><div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-white/50 text-xl gap-4">Autentificare necesară<Button variant="outline" className="text-white border-white/30" onClick={() => navigate('/login')}>Login</Button></div>;
  if (!show) return <div className="fixed inset-0 bg-black flex items-center justify-center text-white/50 text-xl">Spectacol negăsit</div>;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10" onClick={() => navigate(-1)}>
            <LogOut className="h-4 w-4 mr-1" /> Ieși
          </Button>
          <div>
            <h1 className="text-base font-semibold">{show.title}</h1>
            <p className="text-xs text-white/40">Operator · {blocks.length} blocuri</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {live?.is_live && <Badge className="bg-red-600 text-white animate-pulse gap-1"><Radio className="h-3 w-3" /> LIVE</Badge>}
          {live?.is_blackout && <Badge className="bg-black border border-white/30 text-white gap-1"><EyeOff className="h-3 w-3" /> BLACKOUT</Badge>}
          <Button
            onClick={toggleLive}
            className={`gap-1.5 ${live?.is_live ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'}`}
          >
            <Radio className="h-4 w-4" /> {live?.is_live ? 'OPREȘTE LIVE' : 'PORNEȘTE LIVE'}
          </Button>
          <Button onClick={toggleBlackout} variant="outline" className={`gap-1.5 border-white/20 text-white hover:bg-white/10 ${live?.is_blackout ? 'bg-white/20' : ''}`}>
            <EyeOff className="h-4 w-4" /> BLACKOUT
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6">
        {/* Previous block (subtle) */}
        {prevBlock && (
          <div className="w-full max-w-4xl rounded-xl bg-white/[0.03] border border-white/[0.06] px-6 py-3 opacity-40">
            <p className="text-xs text-white/40 mb-1">← Anterior #{prevBlock.sequence_number}</p>
            <p className="text-sm">{prevBlock.text_ro}</p>
          </div>
        )}

        {/* Current block — PROMINENT */}
        <div className="w-full max-w-4xl rounded-2xl border-2 border-primary/50 bg-white/[0.06] px-8 py-8 text-center">
          {currentBlock ? (
            <>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge className="bg-primary text-white">ACTIV #{currentBlock.sequence_number}</Badge>
                <Badge variant="secondary" className="text-xs bg-white/10 text-white/60">Act {currentBlock.act_number} · Scenă {currentBlock.scene_number}</Badge>
              </div>
              <p className="text-3xl font-bold leading-snug">{currentBlock.text_ro}</p>
              {currentBlock.text_en && <p className="text-lg text-white/50 mt-3">EN: {currentBlock.text_en}</p>}
              {currentBlock.stage_direction && (
                <p className="text-sm text-orange-400/70 mt-3 italic">🎭 {currentBlock.stage_direction}</p>
              )}
            </>
          ) : (
            <p className="text-xl text-white/30">Apasă NEXT pentru a începe</p>
          )}
        </div>

        {/* Next block (preview) */}
        {nextBlock && (
          <div className="w-full max-w-4xl rounded-xl bg-white/[0.03] border border-white/[0.06] px-6 py-3 opacity-40">
            <p className="text-xs text-white/40 mb-1">Următor → #{nextBlock.sequence_number}</p>
            <p className="text-sm">{nextBlock.text_ro}</p>
            {nextBlock.stage_direction && <p className="text-xs text-orange-400/40 mt-1 italic">🎭 {nextBlock.stage_direction}</p>}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-6 py-4 border-t border-white/10 space-y-3">
        {/* Navigation buttons — BIG */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            size="lg"
            variant="outline"
            className="h-20 text-xl font-bold gap-3 border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
            disabled={!prevBlock}
            onClick={goPrev}
          >
            <ChevronLeft className="h-8 w-8" /> ÎNAPOI
          </Button>
          <Button
            size="lg"
            className="h-20 text-xl font-bold gap-3 bg-green-700 hover:bg-green-600 text-white"
            onClick={goNext}
          >
            NEXT <ChevronRight className="h-8 w-8" />
          </Button>
        </div>

        {/* Jump-to controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">Salt la:</span>
          {acts.map(act => (
            <Button key={act} size="sm" variant="outline" className="text-white/60 border-white/20 hover:bg-white/10"
              onClick={() => { const first = blocks.find(b => b.act_number === act); if (first) goTo(first.id); }}>
              Act {act}
            </Button>
          ))}
          <div className="ml-auto flex gap-1 flex-wrap max-w-[50%]">
            {blocks.slice(0, 20).map(b => (
              <button
                key={b.id}
                className={`w-7 h-7 rounded text-[10px] font-mono transition-colors ${b.id === live?.current_block_id ? 'bg-primary text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}
                onClick={() => goTo(b.id)}
              >
                {b.sequence_number}
              </button>
            ))}
            {blocks.length > 20 && <span className="text-xs text-white/30 self-center ml-1">+{blocks.length - 20}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
