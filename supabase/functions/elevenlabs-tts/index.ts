import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Mapare personaje → voci ElevenLabs
// Inky (bufniță, calmă, gravă) → George (voce masculină matură)
// Vixie (vulpe, energică) → Lily (voce feminină vie)
// Nuko (arici, blând) → Daniel (voce caldă)
// Eli (fluture, visătoare) → Alice (voce delicată)
// Poki (pește, vesel) → Charlie (voce veselă)
const CHARACTER_VOICE_MAP: Record<string, string> = {
  inky: 'JBFqnCBsd6RMkjVDRZzb',   // George
  vixie: 'pFZP5JQG7iQjIQuC4Bku',   // Lily
  nuko: 'onwK4e9ZLuTAKqWW03F9',    // Daniel
  eli: 'Xb7hH8MSUJpSbSDYk0k2',     // Alice
  poki: 'IKne3meq5aSn9XLyUdCD',    // Charlie
};

const DEFAULT_VOICE = 'JBFqnCBsd6RMkjVDRZzb'; // George

// Voice settings per character for personality
const CHARACTER_SETTINGS: Record<string, { stability: number; similarity_boost: number; style: number; speed: number }> = {
  inky: { stability: 0.7, similarity_boost: 0.75, style: 0.3, speed: 0.85 },   // Slow, calm
  vixie: { stability: 0.3, similarity_boost: 0.7, style: 0.6, speed: 1.15 },   // Fast, energetic
  nuko: { stability: 0.6, similarity_boost: 0.8, style: 0.4, speed: 0.9 },     // Warm, gentle
  eli: { stability: 0.5, similarity_boost: 0.75, style: 0.5, speed: 0.9 },     // Dreamy, soft
  poki: { stability: 0.3, similarity_boost: 0.65, style: 0.7, speed: 1.1 },    // Bubbly, fun
};

const DEFAULT_SETTINGS = { stability: 0.5, similarity_boost: 0.75, style: 0.3, speed: 1.0 };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ELEVENLABS_API_KEY is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, characterId, speed } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Limit text to 5000 chars for safety
    const sanitizedText = text.slice(0, 5000);

    const voiceId = CHARACTER_VOICE_MAP[characterId || 'inky'] || DEFAULT_VOICE;
    const settings = CHARACTER_SETTINGS[characterId || 'inky'] || DEFAULT_SETTINGS;

    // Override speed if provided
    const finalSpeed = typeof speed === 'number' ? Math.max(0.7, Math.min(1.2, speed)) : settings.speed;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sanitizedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: settings.stability,
            similarity_boost: settings.similarity_boost,
            style: settings.style,
            use_speaker_boost: true,
            speed: finalSpeed,
          },
        }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`ElevenLabs API error [${response.status}]:`, errBody);
      return new Response(
        JSON.stringify({ error: `ElevenLabs API error: ${response.status}`, details: errBody }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const audioBuffer = await response.arrayBuffer();

    return new Response(audioBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('TTS edge function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
