import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Hardcoded fallbacks in case DB is unreachable
const FALLBACK_VOICES: Record<string, { voice_id: string; settings: { stability: number; similarity_boost: number; style: number; speed: number } }> = {
  inky: { voice_id: 'JBFqnCBsd6RMkjVDRZzb', settings: { stability: 0.75, similarity_boost: 0.75, style: 0.3, speed: 1.0 } },
  vixie: { voice_id: 'pFZP5JQG7iQjIQuC4Bku', settings: { stability: 0.75, similarity_boost: 0.8, style: 0.6, speed: 1.1 } },
  nuko: { voice_id: 'onwK4e9ZLuTAKqWW03F9', settings: { stability: 0.85, similarity_boost: 0.8, style: 0.4, speed: 0.9 } },
  eli: { voice_id: 'Xb7hH8MSUJpSbSDYk0k2', settings: { stability: 0.8, similarity_boost: 0.75, style: 0.5, speed: 0.85 } },
  poki: { voice_id: 'IKne3meq5aSn9XLyUdCD', settings: { stability: 0.7, similarity_boost: 0.7, style: 0.7, speed: 1.3 } },
};

async function getCharacterConfig(characterId: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceKey);

    const { data, error } = await sb
      .from('story_characters')
      .select('voice_id, voice_settings')
      .eq('id', characterId)
      .single();

    if (!error && data?.voice_id) {
      return {
        voice_id: data.voice_id as string,
        settings: data.voice_settings as { stability: number; similarity_boost: number; style: number; speed: number },
      };
    }
  } catch (err) {
    console.error('Failed to fetch character from DB, using fallback:', err);
  }

  return FALLBACK_VOICES[characterId] || FALLBACK_VOICES['inky'];
}

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

    const sanitizedText = text.slice(0, 5000);
    const config = await getCharacterConfig(characterId || 'inky');
    const finalSpeed = typeof speed === 'number' ? Math.max(0.7, Math.min(1.3, speed)) : config.settings.speed;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${config.voice_id}?output_format=mp3_44100_128`,
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
            stability: config.settings.stability,
            similarity_boost: config.settings.similarity_boost,
            style: config.settings.style,
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
