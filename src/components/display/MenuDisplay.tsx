import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek } from 'date-fns';
import { ro } from 'date-fns/locale';

interface MenuItem {
  masa: string;
  continut: string;
  emoji: string | null;
}

interface MenuDisplayProps {
  organizationId: string;
}

const DAYS_RO = ['luni', 'marti', 'miercuri', 'joi', 'vineri'];
const MEAL_ORDER = ['mic_dejun', 'gustare_1', 'pranz', 'gustare_2'];
const MEAL_LABELS: Record<string, string> = {
  mic_dejun: '🌅 Mic dejun',
  gustare_1: '🍎 Gustare',
  pranz: '🍽️ Prânz',
  gustare_2: '🍪 Gustare',
};

export function MenuDisplay({ organizationId }: MenuDisplayProps) {
  const [meals, setMeals] = useState<MenuItem[]>([]);
  const [dayName, setDayName] = useState('');

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=sun, 1=mon
    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0=mon
    const todayKey = DAYS_RO[dayIndex] || '';
    setDayName(format(today, 'EEEE', { locale: ro }));

    if (!todayKey || dayIndex > 4) return; // Weekend

    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekKey = format(weekStart, 'yyyy-MM-dd');

    supabase
      .from('menu_items')
      .select('masa, continut, emoji')
      .eq('saptamana', weekKey)
      .eq('zi', todayKey)
      .eq('organization_id', organizationId)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMeals(data as MenuItem[]);
        }
      });
  }, [organizationId]);

  if (meals.length === 0) return null;

  // Sort by meal order
  const sorted = [...meals].sort((a, b) => MEAL_ORDER.indexOf(a.masa) - MEAL_ORDER.indexOf(b.masa));

  return (
    <div className="bg-white/10 rounded-2xl p-[2vh] max-w-[60vw]">
      <div className="text-[2vh] font-bold mb-[1.5vh] capitalize">
        🍽️ Meniul de {dayName}
      </div>
      <div className="grid grid-cols-2 gap-[1vh]">
        {sorted.map(meal => (
          <div key={meal.masa} className="bg-white/5 rounded-xl p-[1vh]">
            <div className="text-[1.4vh] opacity-60">{MEAL_LABELS[meal.masa] || meal.masa}</div>
            <div className="text-[1.8vh] font-medium">{meal.emoji} {meal.continut}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
