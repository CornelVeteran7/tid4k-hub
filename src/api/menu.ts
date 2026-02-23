import { USE_MOCK, apiFetch } from './config';
import type { WeeklyMenu, NutritionalData } from '@/types';

const mockMenu: WeeklyMenu = {
  saptamana: '2026-W09',
  items: [
    { masa: 'mic_dejun', zi: 'Luni', continut: 'Lapte cu cereale 🥣, pâine cu unt 🧈', emoji: '🥣🧈' },
    { masa: 'gustare_1', zi: 'Luni', continut: 'Măr 🍎', emoji: '🍎' },
    { masa: 'pranz', zi: 'Luni', continut: 'Supă de legume 🥕, piept de pui cu piure 🍗', emoji: '🥕🍗' },
    { masa: 'gustare_2', zi: 'Luni', continut: 'Biscuiți cu lapte 🍪', emoji: '🍪' },
    { masa: 'mic_dejun', zi: 'Marți', continut: 'Omletă cu brânză 🧀, pâine 🍞', emoji: '🧀🍞' },
    { masa: 'gustare_1', zi: 'Marți', continut: 'Banană 🍌', emoji: '🍌' },
    { masa: 'pranz', zi: 'Marți', continut: 'Ciorbă de perișoare, paste cu sos 🍝', emoji: '🍝' },
    { masa: 'gustare_2', zi: 'Marți', continut: 'Iaurt cu fructe 🫐', emoji: '🫐' },
    { masa: 'mic_dejun', zi: 'Miercuri', continut: 'Sandviș cu șuncă 🥪', emoji: '🥪' },
    { masa: 'gustare_1', zi: 'Miercuri', continut: 'Portocală 🍊', emoji: '🍊' },
    { masa: 'pranz', zi: 'Miercuri', continut: 'Supă cremă de dovlecel, chiftele cu orez 🍚', emoji: '🍚' },
    { masa: 'gustare_2', zi: 'Miercuri', continut: 'Compot de mere 🍏', emoji: '🍏' },
    { masa: 'mic_dejun', zi: 'Joi', continut: 'Clătite cu gem 🫓', emoji: '🫓' },
    { masa: 'gustare_1', zi: 'Joi', continut: 'Pere 🍐', emoji: '🍐' },
    { masa: 'pranz', zi: 'Joi', continut: 'Ciorbă de legume, ficăței cu piure 🥔', emoji: '🥔' },
    { masa: 'gustare_2', zi: 'Joi', continut: 'Covrigei 🥨', emoji: '🥨' },
    { masa: 'mic_dejun', zi: 'Vineri', continut: 'Muesli cu lapte 🥛', emoji: '🥛' },
    { masa: 'gustare_1', zi: 'Vineri', continut: 'Struguri 🍇', emoji: '🍇' },
    { masa: 'pranz', zi: 'Vineri', continut: 'Supă de pui, pește cu legume 🐟', emoji: '🐟' },
    { masa: 'gustare_2', zi: 'Vineri', continut: 'Prăjitură cu mere 🍰', emoji: '🍰' },
  ],
  nutritional: [
    { zi: 'Luni', kcal: 1450, carbohidrati: 180, proteine: 55, grasimi: 52, fibre: 18 },
    { zi: 'Marți', kcal: 1520, carbohidrati: 195, proteine: 58, grasimi: 48, fibre: 20 },
    { zi: 'Miercuri', kcal: 1380, carbohidrati: 170, proteine: 52, grasimi: 50, fibre: 22 },
    { zi: 'Joi', kcal: 1600, carbohidrati: 200, proteine: 60, grasimi: 55, fibre: 16 },
    { zi: 'Vineri', kcal: 1490, carbohidrati: 185, proteine: 62, grasimi: 45, fibre: 24 },
  ],
  alergeni: ['Gluten', 'Lapte', 'Ouă', 'Pește', 'Soia'],
  semnaturi: { director: 'Dir. Popescu', asistent_medical: 'Dr. Ionescu', administrator: 'Admin. Georgescu' },
};

export async function getMenu(saptamana: string): Promise<WeeklyMenu> {
  if (USE_MOCK) return { ...mockMenu, saptamana };
  return apiFetch<WeeklyMenu>(`/meniu.php?action=get&saptamana=${saptamana}`);
}

export async function saveMenu(menu: WeeklyMenu): Promise<void> {
  if (USE_MOCK) return;
  await apiFetch('/meniu.php?action=save', { method: 'POST', body: JSON.stringify(menu) });
}

export async function getNutritionalData(saptamana: string): Promise<NutritionalData[]> {
  if (USE_MOCK) return mockMenu.nutritional;
  return apiFetch<NutritionalData[]>(`/meniu.php?action=nutritional&saptamana=${saptamana}`);
}
