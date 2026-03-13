import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { storyCharacters as fallbackCharacters, type StoryCharacter } from '@/data/storyCharacters';

export function useStoryCharacters() {
  const [characters, setCharacters] = useState<StoryCharacter[]>(fallbackCharacters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('story_characters')
      .select('id, name, animal, emoji, description, color, bg_color, voice_description')
      .order('sort_order')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setCharacters(
            (data as unknown as Array<{
              id: string; name: string; animal: string; emoji: string;
              description: string; color: string; bg_color: string; voice_description: string | null;
            }>).map(row => ({
              id: row.id,
              name: row.name,
              animal: row.animal,
              emoji: row.emoji,
              description: row.description,
              color: row.color,
              bgColor: row.bg_color,
              voiceDescription: row.voice_description || '',
            }))
          );
        }
        setLoading(false);
      });
  }, []);

  return { characters, loading };
}
