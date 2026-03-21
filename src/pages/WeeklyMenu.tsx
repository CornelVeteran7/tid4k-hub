import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { areRol } from '@/utils/roles';
import { USE_TID4K_BACKEND } from '@/api/config';
import { getMeniuStructurat, getListaMeniuri, getMeniuriTID4K, salvareMeniuStructurat, stergeMeniu, salveazaPreferintaCantitate, invataAlimentNou, getLimiteOMS, getPrintMeniuURL, getToateAlimentele, genereazaMeniuAleator, type MeniuStructurat, type MeniuDisponibil, type TID4KMenuEntry, type LimiteOMS, type AlimentNormator } from '@/api/menu';
import { isInky } from '@/utils/roles';
import {
  getMenuWeek, ensureMenuWeek, getNutritionalReference, addDish, addIngredient,
  updateIngredient, deleteIngredient, deleteDish, updateDishName, publishMenu,
  unpublishMenu, updateAgeGroup, computeDayNutrition, getCalorieStatus,
  checkBannedIngredients, AGE_GROUP_TARGETS, computeMacroBalance,
  getWeeklyOmsClassification, getRefCategories, CATEGORY_LABELS,
  type MenuWeek, type NutritionalRef, type Meal, type Dish, type DishIngredient,
} from '@/api/menuOms';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ro } from 'date-fns/locale';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Save, Printer, ChevronLeft, ChevronRight, CalendarIcon, Plus, Trash2, AlertTriangle,
  Check, Eye, EyeOff, Send, Undo2, ChefHat, Scale, ShieldAlert, FileText, Award, X, Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addWeeks } from 'date-fns';
import { ro } from 'date-fns/locale';

const DAYS = [
  { num: 1, label: 'Luni' },
  { num: 2, label: 'Marți' },
  { num: 3, label: 'Miercuri' },
  { num: 4, label: 'Joi' },
  { num: 5, label: 'Vineri' },
];

const MEAL_TYPES = [
  { key: 'mic_dejun' as const, label: 'Mic dejun', emoji: '🌅' },
  { key: 'gustare_1' as const, label: 'Gustare', emoji: '🍎' },
  { key: 'pranz' as const, label: 'Prânz', emoji: '🍽️' },
  { key: 'gustare_2' as const, label: 'Gustare', emoji: '🍪' },
];

function getMondayOfWeek(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

function formatWeekLabel(monday: Date): string {
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return `${format(monday, 'd MMMM', { locale: ro })} – ${format(friday, 'd MMMM yyyy', { locale: ro })}`;
}

const STATUS_COLORS = {
  green: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  yellow: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30',
  red: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  gray: 'bg-muted text-muted-foreground border-border',
};

// ============================================================================
// VIEWER TID4K - afiseaza meniul structurat (parsat din HTML pe server)
// Replica interfata Lovable: tabel mese x zile, alergeni, semnaturi
// ============================================================================

const ZILE_LABEL: Record<string, string> = {
  luni: 'Luni', marti: 'Marți', miercuri: 'Miercuri', joi: 'Joi', vineri: 'Vineri',
};
const ZILE_ORDINE = ['luni', 'marti', 'miercuri', 'joi', 'vineri'];

// Culorile zilelor din editorul vechi (identice cu tabel_meniu_afisat.php)
const ZILE_CULORI: Record<string, string> = {
  luni: '#FF00FF', marti: '#32CD32', miercuri: '#FFA500', joi: '#1E90FF', vineri: '#FF69B4',
};

// Lunile în română pentru date calendaristice
const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie',
  'iulie','august','septembrie','octombrie','noiembrie','decembrie'];

/**
 * Calculează datele calendaristice Luni-Vineri din data_expirare (care e vineri)
 * Returnează: { luni: "09 martie", marti: "10 martie", ... }
 */
function calculeazaDateZile(dataExpirare: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!dataExpirare) return result;
  // data_expirare poate fi "2026-03-13" sau "2026-03-13 23:59:59"
  const vineri = new Date(dataExpirare.split(' ')[0] + 'T12:00:00');
  if (isNaN(vineri.getTime())) return result;
  // Luni = Vineri - 4 zile, Marți = Vineri - 3, etc.
  const offset: Record<string, number> = { luni: -4, marti: -3, miercuri: -2, joi: -1, vineri: 0 };
  for (const [zi, diff] of Object.entries(offset)) {
    const d = new Date(vineri);
    d.setDate(vineri.getDate() + diff);
    result[zi] = `${d.getDate()} ${LUNI_RO[d.getMonth()]}`;
  }
  return result;
}

// Alergeni care se evidentiaza (prezenti in meniu)
const ALERGENI_TOTI = [
  'Gluten', 'Lapte', 'Ouă', 'Pește', 'Soia', 'Arahide',
  'Fructe cu coajă', 'Țelină', 'Muștar', 'Susan', 'Sulfați', 'Lupin', 'Moluște', 'Crustacee',
];

// Fallback OMS (folosit doar daca endpoint-ul BD nu raspunde)
const OMS_FALLBACK = { calorii_min: 1290, calorii_max: 1660, proteine_min: 45, lipide_min: 36 };

function TID4KMenuViewer({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [meniu, setMeniu] = useState<MeniuStructurat | null>(null);
  const [indexCurent, setIndexCurent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmoji, setShowEmoji] = useState(true);
  const [showNutrienti, setShowNutrienti] = useState(true);
  const [showKcal, setShowKcal] = useState(true);
  const [cautare, setCautare] = useState('');
  const [listaMeniuri, setListaMeniuri] = useState<MeniuDisponibil[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Editare
  const [editing, setEditing] = useState(false);
  const [continutCelule, setContinutCelule] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  // Limite OMS din BD (Strat 2: endpoint PHP existent)
  const [limiteOMS, setLimiteOMS] = useState<LimiteOMS | null>(null);

  // Normator alimente pentru autocompletare (Strat 2: endpoint PHP existent)
  const [alimenteNormator, setAlimenteNormator] = useState<AlimentNormator[]>([]);

  // Calorii per zi — calculat client-side din normator (identic cu mecanismul vechi PHP)
  const [caloriiPerZi, setCaloriiPerZi] = useState<Record<string, number>>({});

  // Print PDF — dialog cu iframe (userul ramane in /app/)
  const [printURL, setPrintURL] = useState<string | null>(null);

  // Audit trail — dialog motivare pentru salvare meniu din trecut (identic cu PHP)
  const [showMotivare, setShowMotivare] = useState(false);
  const [motivareText, setMotivareText] = useState('');

  // Semnaturi editabile — state local cu override-uri
  const [semnaturiLocale, setSemnaturiLocale] = useState<Record<string, string>>({});
  const [editSemnatura, setEditSemnatura] = useState<string | null>(null);
  const [inputSemnatura, setInputSemnatura] = useState('');

  // Autogenerare meniu — bubble + regenerare (identic cu PHP vechi)
  const [showBulaAutogenerat, setShowBulaAutogenerat] = useState(false);
  const [dataVineriAutogen, setDataVineriAutogen] = useState<string | null>(null); // vineri-ul saptamanii selectate pentru autogenerare
  const [generareMeniu, setGenerareMeniu] = useState(false);
  const [incercariGenerare, setIncercariGenerare] = useState(0);
  const MAX_INCERCARI_GENERARE = 3;
  // Avertizari OMS din autogenerare (distincte de cele statice)
  const [avertizariAutogen, setAvertizariAutogen] = useState<string[]>([]);
  const [showModalOmsAutogen, setShowModalOmsAutogen] = useState(false);
  // Editor nutrient din pie chart
  const [editNutrient, setEditNutrient] = useState<{ label: string; valoare: number } | null>(null);
  const [inputNutrientVal, setInputNutrientVal] = useState('');
  // Ștergere meniu — dialog confirmare
  const [showConfirmSterge, setShowConfirmSterge] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Dialog informativ — mecanismul de autogenerare încă învață (nu sunt suficiente meniuri în BD)
  const [showBulaInvatare, setShowBulaInvatare] = useState(false);
  // Motivare creare meniu în trecut (extrapolare din mecanismul de editare trecut)
  const [motivareCreareTrecut, setMotivareCreareTrecut] = useState(false);
  const [motivareCreareTrecutText, setMotivareCreareTrecutText] = useState('');
  // Flag: motivarea a fost deja asumata la creare → nu mai cerem la salvare
  const [motivareAsumata, setMotivareAsumata] = useState(false);

  // Cautare globala — toate meniurile din BD (Strat 2: endpoint PHP existent fetch_meniuri)
  const [meniuriGlobale, setMeniuriGlobale] = useState<TID4KMenuEntry[]>([]);
  const [rezultateCautare, setRezultateCautare] = useState<Array<{ saptamana: string; dataExpirare: string; index: number }>>([]);

  // Acces editare: administrator, director, secretara, Inky
  const canEdit = user && (
    areRol(user.status, 'administrator') ||
    areRol(user.status, 'director') ||
    areRol(user.status, 'secretara') ||
    isInky(user.status, user.nume_prenume)
  );

  const loadMeniu = useCallback(async (idx: number) => {
    setLoading(true);
    const data = await getMeniuStructurat(idx);
    setMeniu(data);
    setIndexCurent(idx);
    setEditing(false);
    setDirty(false);
    setMotivareAsumata(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMeniu(0);
    getListaMeniuri().then(setListaMeniuri);
    // Incarca limite OMS din BD (endpoint PHP existent)
    getLimiteOMS().then(l => { if (l) setLimiteOMS(l); });
    // Incarca normator alimente pentru autocompletare (endpoint PHP existent)
    getToateAlimentele().then(setAlimenteNormator);
    // Incarca toate meniurile din BD pentru cautare globala (endpoint PHP existent)
    getMeniuriTID4K().then(setMeniuriGlobale);
  }, [loadMeniu]);

  // Populeaza continutCelule din meniu cand intra in mod editare
  const startEditing = () => {
    if (!meniu) return;
    const celule: Record<string, string> = {};
    for (const masa of meniu.mese || []) {
      for (const zi of ZILE_ORDINE) {
        celule[`${masa.masa}_${zi}`] = masa.zile[zi] || '';
      }
    }
    setContinutCelule(celule);
    setEditing(true);
    setDirty(false);
  };

  // Autocompletare INLINE din normator — completare directa in textarea pe masura ce userul tasteaza
  // Pattern identic cu mecanismul vechi: "kiw" → "🥝 kiwi (50gr)" direct in text
  const normalizezText = (t: string) => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Lista alergeni recunoscuti (identic cu mecanismul vechi PHP)
  const ALERGENI_RECUNOSCUTI = ['gluten', 'lapte', 'lactoza', 'ou', 'telina', 'arahide', 'peste'];

  // Construim map-ul de cuvinte cheie din normator (memoizat)
  const mapCuvinte = useMemo(() => {
    const result: Array<{ cuvantNorm: string; calorii: number; proteine: number; lipide: number; carbohidrati: number; glucide: number; alergeni: string; cantitateStandard: number; denumireNorm: string }> = [];
    for (const aliment of alimenteNormator) {
      if (!aliment.cuvinte_cheie) continue;
      const cal = Number(aliment.calorii) || 0;
      const prot = Number(aliment.proteine) || 0;
      const lip = Number(aliment.lipide) || 0;
      const carb = Number(aliment.carbohidrati) || 0;
      const gluc = Number(aliment.glucide) || 0;
      const cantStr = aliment.cantitate || '';
      const cantMatch = cantStr.match(/(\d+(?:[.,]\d+)?)/);
      const cantitateStandard = cantMatch ? parseFloat(cantMatch[1].replace(',', '.')) : 0;
      const denumireNorm = normalizezText(aliment.denumire || '');
      const keywords = aliment.cuvinte_cheie.split(',').map(k => normalizezText(k.trim())).filter(k => k.length > 0);
      for (const kw of keywords) {
        result.push({ cuvantNorm: kw, calorii: cal, proteine: prot, lipide: lip, carbohidrati: carb, glucide: gluc, alergeni: aliment.alergeni || '', cantitateStandard, denumireNorm });
      }
    }
    return result;
  }, [alimenteNormator]);

  // Numara aparitiile unui cuvant in text (identic cu PHP)
  const numaraAparitii = useCallback((textNorm: string, cuvantNorm: string): number => {
    let count = 0;
    let pos = 0;
    while (true) {
      const found = textNorm.indexOf(cuvantNorm, pos);
      if (found === -1) break;
      count++;
      pos = found + cuvantNorm.length;
    }
    return count;
  }, []);

  // Calcul alergeni per celula — identic cu mecanismul vechi PHP (overlay text gri in colt)
  const [alergeniPerCelula, setAlergeniPerCelula] = useState<Record<string, string[]>>({});

  // Nutrienti calculati client-side (medie/zi) — se actualizeaza la orice modificare
  const [nutrientiCalculati, setNutrientCalculati] = useState<Record<string, number> | null>(null);

  // Recalculeaza caloriile per zi SI alergenii per celula
  useEffect(() => {
    if (mapCuvinte.length === 0 || !meniu) return;
    const mese = meniu.mese || [];
    if (mese.length === 0) return;

    // In edit mode: calculeaza din continutCelule; in view mode: din meniu.mese
    const celule: Record<string, string> = {};
    if (editing) {
      Object.assign(celule, continutCelule);
    } else {
      for (const masa of mese) {
        for (const zi of ZILE_ORDINE) {
          celule[`${masa.masa}_${zi}`] = masa.zile[zi] || '';
        }
      }
    }

    const calPerZi: Record<string, number> = {};
    const alPerCelula: Record<string, string[]> = {};
    // Acumulare nutrienti total saptamana (identic cu PHP: nutrientiSiCaloriiGlobali)
    const nutrientiTotal: Record<string, number> = { calorii: 0, proteine: 0, lipide: 0, carbohidrati: 0, glucide: 0 };
    let zileCuContinut = 0;

    for (const zi of ZILE_ORDINE) {
      let totalZi = 0;
      let ziAreContinut = false;
      for (const masa of mese) {
        const celKey = `${masa.masa}_${zi}`;
        const text = celule[celKey] || '';
        if (!text.trim()) continue;
        ziAreContinut = true;
        const textNorm = normalizezText(text);
        const alergeniCelula = new Set<string>();

        for (const { cuvantNorm, calorii, proteine, lipide, carbohidrati, glucide, alergeni, cantitateStandard } of mapCuvinte) {
          const count = numaraAparitii(textNorm, cuvantNorm);
          if (count > 0) {
            // Factor de cantitate: daca textul are "(50gr)" si normatorul "(100gr)" → factor 0.5
            let factor = 1.0;
            if (cantitateStandard > 0) {
              const pozKw = textNorm.indexOf(cuvantNorm);
              if (pozKw >= 0) {
                const restDupa = text.substring(pozKw);
                const matchCant = restDupa.match(/\(\s*(\d+(?:[.,]\d+)?)\s*(?:-\s*\d+(?:[.,]\d+)?)?\s*(?:gr|g|ml)\s*\)/i);
                if (matchCant) {
                  const cantDinText = parseFloat(matchCant[1].replace(',', '.'));
                  if (cantDinText > 0) factor = cantDinText / cantitateStandard;
                }
              }
            }
            const fc = factor * count;
            totalZi += Math.round(calorii * fc);
            nutrientiTotal.calorii += Math.round(calorii * fc);
            nutrientiTotal.proteine += Math.round(proteine * fc);
            nutrientiTotal.lipide += Math.round(lipide * fc);
            nutrientiTotal.carbohidrati += Math.round(carbohidrati * fc);
            nutrientiTotal.glucide += Math.round(glucide * fc);
            if (alergeni) {
              for (const item of alergeni.split(', ')) {
                const [nume] = item.split(' (');
                if (nume && ALERGENI_RECUNOSCUTI.includes(nume.toLowerCase())) {
                  alergeniCelula.add(nume);
                }
              }
            }
          }
        }
        if (alergeniCelula.size > 0) {
          alPerCelula[celKey] = Array.from(alergeniCelula);
        }
      }
      if (ziAreContinut) zileCuContinut++;
      if (totalZi > 0) calPerZi[zi] = totalZi;
    }

    setCaloriiPerZi(calPerZi);
    setAlergeniPerCelula(alPerCelula);

    // Calculam media per zi (identic cu PHP: actualizeazaNutrientiSiCalorii)
    if (zileCuContinut > 0 && nutrientiTotal.calorii > 0) {
      const medie: Record<string, number> = {};
      for (const [k, v] of Object.entries(nutrientiTotal)) {
        medie[k] = Math.round(v / zileCuContinut);
      }
      setNutrientCalculati(medie);
    } else {
      setNutrientCalculati(null);
    }
  }, [meniu, editing, continutCelule, mapCuvinte, numaraAparitii]);

  const updateCelula = (key: string, value: string) => {
    const prevValue = continutCelule[key] || '';
    setContinutCelule(prev => ({ ...prev, [key]: value }));
    setDirty(true);

    // Blocam autocompletarea la stergere (textul s-a scurtat)
    if (value.length <= prevValue.length) return;

    // Autocompletare inline: verificam ultimul cuvant tastat
    if (alimenteNormator.length === 0) return;

    // Extragem ultimul cuvant (dupa virgula, spatiu, linie noua sau inceput text)
    const match = value.match(/(?:^|[,\n]\s*|\s)([a-zA-ZăâîșțĂÂÎȘȚ]{3,})$/);
    if (!match) return;

    const cuvant = match[1];
    const cuvantNorm = normalizezText(cuvant);

    // Match EXACT prin denumire SAU prin cuvânt cheie — înlocuiește cu emoji+cantitate
    // Caută mai întâi match exact pe denumire, apoi pe cuvinte cheie
    let alimentGasit = alimenteNormator.find(a =>
      normalizezText(a.denumire || '') === cuvantNorm
    );

    // Dacă nu a găsit prin denumire, caută prin cuvinte cheie (ex: "rasol" → "Rasol de vită")
    if (!alimentGasit) {
      alimentGasit = alimenteNormator.find(a => {
        if (!a.cuvinte_cheie) return false;
        const keywords = a.cuvinte_cheie.split(',').map(k => normalizezText(k.trim()));
        return keywords.includes(cuvantNorm);
      });
    }

    if (alimentGasit) {
      const pozitie = value.length - cuvant.length;
      const textNou = value.slice(0, pozitie) + alimentGasit.textComplet;
      setContinutCelule(prev => ({ ...prev, [key]: textNou }));
    }
  };

  // Verifica daca saptamana selectata e din trecut (identic cu PHP: esteSaptamanaDinTrecut)
  const esteSaptamanaDinTrecut = (): boolean => {
    if (!meniu) return false;
    const dataVineri = meniu.data_expirare.split(' ')[0];
    const azi = new Date();
    const aziStr = `${azi.getFullYear()}-${String(azi.getMonth() + 1).padStart(2, '0')}-${String(azi.getDate()).padStart(2, '0')}`;
    return dataVineri < aziStr;
  };

  // Detectare și salvare preferințe cantitate + alimente noi (AI Haiku)
  // La salvare, scanează fiecare celulă:
  // 1. Dacă userul a schimbat cantitatea unui aliment cunoscut → salvează preferința
  // 2. Dacă userul a introdus un aliment necunoscut cu cantitate → învață prin AI
  const detecteazaSiSalveazaPreferinte = () => {
    if (alimenteNormator.length === 0) return;
    const PRAG_DIFERENTA = 0.5; // gr — nu salvăm diferențe sub prag (evită zgomot)

    // Set cu denumiri normalizate din normator (pentru detectare alimente necunoscute)
    const denumiriCunoscute = new Set<string>();
    for (const aliment of alimenteNormator) {
      if (!aliment.denumire) continue;
      denumiriCunoscute.add(normalizezText(aliment.denumire));
      // Adaugăm și cuvintele cheie
      if (aliment.cuvinte_cheie) {
        for (const kw of aliment.cuvinte_cheie.split(',')) {
          const kwNorm = normalizezText(kw.trim());
          if (kwNorm.length >= 3) denumiriCunoscute.add(kwNorm);
        }
      }
    }

    // Alimente necunoscute deja trimise spre învățare (evită duplicate în aceeași salvare)
    const trimiseSpreInvatare = new Set<string>();

    for (const key of Object.keys(continutCelule)) {
      const text = continutCelule[key] || '';
      if (!text.trim()) continue;
      const textNorm = normalizezText(text);

      // 1. Preferințe cantitate pentru alimente CUNOSCUTE
      for (const aliment of alimenteNormator) {
        if (!aliment.denumire) continue;
        const denumireNorm = normalizezText(aliment.denumire);
        if (!textNorm.includes(denumireNorm)) continue;

        const cantStdMatch = (aliment.cantitate || '').match(/(\d+(?:[.,]\d+)?)/);
        if (!cantStdMatch) continue;
        const cantStandard = parseFloat(cantStdMatch[1].replace(',', '.'));
        if (cantStandard <= 0) continue;

        const pozitie = textNorm.indexOf(denumireNorm);
        const restDupa = text.substring(pozitie);
        const cantTextMatch = restDupa.match(/\(\s*(\d+(?:[.,]\d+)?)\s*(?:gr|g|ml)\s*\)/i);
        if (!cantTextMatch) continue;
        const cantDinText = parseFloat(cantTextMatch[1].replace(',', '.'));
        if (cantDinText <= 0) continue;

        // Compară cu cantitatea standard ȘI cu preferința existentă
        // Dacă diferă de standard → salvează preferință
        // Dacă e EGAL cu standard dar există preferință diferită → resetează la standard
        const cantPrefMatch = (aliment.cantitate_preferata || '').match(/(\d+(?:[.,]\d+)?)/);
        const cantPreferata = cantPrefMatch ? parseFloat(cantPrefMatch[1].replace(',', '.')) : null;

        if (Math.abs(cantDinText - cantStandard) > PRAG_DIFERENTA) {
          // Userul a pus altă cantitate decât standard → salvează preferință
          if (cantPreferata === null || Math.abs(cantDinText - cantPreferata) > PRAG_DIFERENTA) {
            salveazaPreferintaCantitate(aliment.id, aliment.cantitate, cantDinText + 'gr');
          }
        } else if (cantPreferata !== null && Math.abs(cantPreferata - cantStandard) > PRAG_DIFERENTA) {
          // Userul a pus cantitatea STANDARD dar există preferință diferită → resetează la standard
          salveazaPreferintaCantitate(aliment.id, aliment.cantitate, aliment.cantitate);
        }
      }

      // 2. Detectare alimente NECUNOSCUTE cu cantitate — învățare prin AI
      // Scanăm textul linie cu linie, apoi separăm pe virgulă/și — fiecare fragment e un potențial aliment
      const linii = text.split(/\n/);
      for (const linie of linii) {
        // Separăm pe virgulă, "și", "si", punct-virgulă — fiecare segment e un aliment potențial
        const segmente = linie.split(/[,;]\s*|\s+(?:și|si)\s+/i);
        for (const segment of segmente) {
          const segTrim = segment.trim();
          if (!segTrim) continue;
          // Căutăm pattern: "text (NNgr)" în segment individual (max un aliment)
          const matchSeg = segTrim.match(/^([a-zA-ZăâîșțĂÂÎȘȚüöäÜÖÄ][a-zA-ZăâîșțĂÂÎȘȚüöäÜÖÄ\s-]{2,}?)\s*\(\s*(\d+(?:[.,]\d+)?)\s*(?:gr|g|ml)\s*\)/i);
          if (!matchSeg) continue;
          // Eliminăm cuvintele de legătură de la începutul denumirii
          let denumireGasita = matchSeg[1].trim().replace(/^(?:si|și|cu|pe|la|de)\s+/i, '');
          const cantitateGasita = matchSeg[2] + 'gr';
          const denumireGasitaNorm = normalizezText(denumireGasita);

          // Ignoră dacă e deja în normator sau deja trimis
          if (denumiriCunoscute.has(denumireGasitaNorm)) continue;
          if (trimiseSpreInvatare.has(denumireGasitaNorm)) continue;
          // Ignoră cuvinte prea scurte sau doar cifre
          if (denumireGasitaNorm.length < 3) continue;

          trimiseSpreInvatare.add(denumireGasitaNorm);
          // Apel async (fire-and-forget) — nu blochează salvarea
          invataAlimentNou(denumireGasita, cantitateGasita);
        }
      }
    }
  };

  // Salveaza efectiv meniul (apelat direct sau dupa motivare)
  const executaSalvare = async (motivare?: string) => {
    if (!meniu) return;
    setSaving(true);
    try {
      const meseActualizate = (meniu.mese || []).map(masa => ({
        ...masa,
        zile: Object.fromEntries(
          ZILE_ORDINE.map(zi => [zi, continutCelule[`${masa.masa}_${zi}`] || ''])
        ),
      }));

      const dataVineri = meniu.data_expirare.split(' ')[0];

      const nm = meniu.nutrienti_medie || {};
      const nutrientiParts = [];
      if (nm.calorii?.valoare) nutrientiParts.push(`calorii (${nm.calorii.valoare}kcal)`);
      if (nm.proteine?.valoare) nutrientiParts.push(`proteine (${nm.proteine.valoare}gr)`);
      if (nm.lipide?.valoare) nutrientiParts.push(`lipide (${nm.lipide.valoare}gr)`);
      if (nm.carbohidrati?.valoare) nutrientiParts.push(`carbohidrati (${nm.carbohidrati.valoare}gr)`);
      if (nm.glucide?.valoare) nutrientiParts.push(`glucide (${nm.glucide.valoare}gr)`);
      const nutrientiText = nutrientiParts.length > 0 ? nutrientiParts.join(', ') : undefined;

      // Merge semnăturile locale cu cele din meniu
      const semnaturiFinale = { ...(meniu.semnaturi || {}), ...semnaturiLocale };

      await salvareMeniuStructurat(
        meseActualizate,
        dataVineri,
        meniu.denumire_meniu,
        nutrientiText,
        semnaturiFinale,
        caloriiPerZi,
      );

      // Detectare și salvare preferințe cantitate (identic cu PHP: detecteazaSiSalveazaPreferinte)
      // Scanează textul din celule, compară cantitățile cu cele din normator, salvează diferențele
      detecteazaSiSalveazaPreferinte();

      toast.success(motivare ? 'Meniu salvat cu motivare!' : 'Meniu salvat!');
      setDirty(false);
      setEditing(false);
      setSemnaturiLocale({});
      await loadMeniu(indexCurent);
    } catch (err: any) {
      toast.error(err.message || 'Eroare la salvare');
    } finally {
      setSaving(false);
    }
  };

  // handleSave — verifica daca e saptamana din trecut si cere motivare (doar daca nu a fost deja asumata la creare)
  const handleSave = async () => {
    if (esteSaptamanaDinTrecut() && !motivareAsumata) {
      setMotivareText('');
      setShowMotivare(true);
      return;
    }
    await executaSalvare();
  };

  // Autogenerare meniu — apeleaza genereaza_meniu_real.php (identic cu PHP vechi)
  const handleGenereazaMeniu = async (esteRegenerare = false) => {
    if (!meniu) return;
    if (esteRegenerare) {
      setIncercariGenerare(prev => prev + 1);
    } else {
      setIncercariGenerare(0);
    }

    setGenerareMeniu(true);
    setShowBulaAutogenerat(false);
    setShowModalOmsAutogen(false);

    // Daca e generare pe o saptamana noua (din calendar), actualizam data_expirare in meniu
    if (dataVineriAutogen && dataVineriAutogen !== meniu.data_expirare.split(' ')[0]) {
      // Calculam label-ul saptamanii din vineriStr
      const vineriDate = new Date(dataVineriAutogen + 'T12:00:00');
      const luniDate = new Date(vineriDate);
      luniDate.setDate(vineriDate.getDate() - 4);
      const LUNI_RO_ARR = ['ianuarie','februarie','martie','aprilie','mai','iunie',
        'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
      const saptLabel = `${luniDate.getDate()}-${vineriDate.getDate()} ${LUNI_RO_ARR[vineriDate.getMonth()]} ${vineriDate.getFullYear()}`;

      setMeniu(prev => prev ? {
        ...prev,
        data_expirare: dataVineriAutogen + ' 23:59:59',
        saptamana: saptLabel,
      } : prev);
    }

    // Construieste constrangeri din nutrienti curenti (±10, identic cu PHP)
    const constrangeri: Record<string, { min: number; max: number }> = {};
    const nm = meniu.nutrienti_medie || {};
    for (const cheie of ['calorii', 'proteine', 'lipide', 'carbohidrati', 'glucide']) {
      const val = nm[cheie]?.valoare || 0;
      if (val > 0) constrangeri[cheie] = { min: Math.max(0, val - 10), max: val + 10 };
    }

    const rezultat = await genereazaMeniuAleator(Object.keys(constrangeri).length > 0 ? constrangeri : undefined);
    setGenerareMeniu(false);

    if (!rezultat) {
      // Nu sunt suficiente meniuri în BD — afișăm mesaj informativ
      setShowBulaInvatare(true);
      return;
    }

    // Populeaza continutCelule cu meniul generat + adauga emoji (identic cu proceseazaToateTextarele din PHP)
    const celuleNoi: Record<string, string> = {};
    const meseExistente = meniu.mese || [];
    for (const masa of meseExistente) {
      for (const zi of ZILE_ORDINE) {
        const ziLabel = ZILE_LABEL[zi]; // "Luni", "Marți", ...
        let continut = rezultat.meniu?.[ziLabel]?.[masa.ora] || '';

        // Proceseaza textul prin normator: inlocuieste cuvintele cheie cu emoji+cantitate
        // O SINGURA trecere per aliment — marcam cu \u200B ce a fost deja procesat (identic cu PHP)
        if (continut && alimenteNormator.length > 0) {
          // Construim lista de inlocuiri: pozitie + lungime + textComplet
          const inlocuiri: Array<{ start: number; len: number; text: string }> = [];
          const textNorm = normalizezText(continut);

          for (const aliment of alimenteNormator) {
            if (!aliment.cuvinte_cheie || !aliment.textComplet) continue;
            const keywords = aliment.cuvinte_cheie.split(',').map(k => k.trim()).filter(k => k.length > 0);
            for (const kw of keywords) {
              const kwNorm = normalizezText(kw);
              if (kwNorm.length < 2) continue;
              const escaped = kwNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(escaped, 'gi');
              let match;
              while ((match = regex.exec(textNorm)) !== null) {
                const start = match.index;
                let len = match[0].length;
                // Extindem len pentru a include cantitatea care urmeaza dupa keyword: " (220ml)" sau " (50gr)"
                // Pattern: optional spatiu + paranteza cu numar + unitate
                const restDupa = continut.substring(start + len);
                const matchCantitate = restDupa.match(/^\s*\(\s*\d+(?:[.,]\d+)?(?:\s*-\s*\d+(?:[.,]\d+)?)?\s*(?:gr|g|ml)\s*\)/i);
                if (matchCantitate) {
                  len += matchCantitate[0].length;
                }
                // Verificam ca nu se suprapune cu o inlocuire existenta
                const seSuprapune = inlocuiri.some(r => start < r.start + r.len && start + len > r.start);
                if (!seSuprapune) {
                  inlocuiri.push({ start, len, text: aliment.textComplet + '\u200B' });
                  break; // doar prima aparitie per keyword
                }
              }
            }
          }

          // Aplicam inlocuirile de la sfarsit la inceput (sa nu stricam pozitiile)
          if (inlocuiri.length > 0) {
            inlocuiri.sort((a, b) => b.start - a.start);
            for (const { start, len, text } of inlocuiri) {
              continut = continut.substring(0, start) + text + continut.substring(start + len);
            }
          }
        }

        celuleNoi[`${masa.masa}_${zi}`] = continut;
      }
    }
    setContinutCelule(celuleNoi);
    setEditing(true);
    setDirty(true);

    // Avertizari OMS din autogenerare
    if (rezultat.avertizari_oms && rezultat.avertizari_oms.length > 0) {
      if ((esteRegenerare ? incercariGenerare + 1 : 0) < MAX_INCERCARI_GENERARE) {
        setAvertizariAutogen(rezultat.avertizari_oms);
        setShowModalOmsAutogen(true);
      } else {
        toast.info('Meniul generat este cea mai echilibrată variantă găsită. Poți ajusta manual.');
        setIncercariGenerare(0);
      }
    } else {
      toast.success('Meniu generat conform OMS!');
    }
  };

  // Datele disponibile in calendar
  // Evidențiere întreaga săptămână (luni-vineri) pentru meniurile disponibile
  const dateDisponibile = useMemo(() => {
    const result: Date[] = [];
    for (const m of listaMeniuri) {
      const vineri = new Date(m.data_expirare.split(' ')[0] + 'T12:00:00');
      if (isNaN(vineri.getTime())) continue;
      // Adaugă luni până vineri (vineri - 4 zile ... vineri)
      for (let i = 4; i >= 0; i--) {
        const zi = new Date(vineri);
        zi.setDate(vineri.getDate() - i);
        result.push(zi);
      }
    }
    return result;
  }, [listaMeniuri]);

  // Calendar: selecteaza saptamana — calculeaza vineri-ul din orice zi Luni-Vineri selectata
  // Identic cu logica din tabel_meniu_afisat.php: obtineDataVineriDinData()
  const handleSelectData = (date: Date | undefined) => {
    if (!date) return;
    const dayOfWeek = date.getDay(); // 0=Duminica, 1=Luni, ..., 5=Vineri, 6=Sambata
    const vineri = new Date(date);
    // Calculam vineri-ul saptamanii: Luni(1)->+4, Marti(2)->+3, ..., Vineri(5)->+0, Sambata(6)->+6, Duminica(0)->+5
    if (dayOfWeek === 0) {
      vineri.setDate(date.getDate() + 5); // Duminica -> vineri urmatoare
    } else if (dayOfWeek === 6) {
      vineri.setDate(date.getDate() + 6); // Sambata -> vineri urmatoare
    } else {
      vineri.setDate(date.getDate() + (5 - dayOfWeek));
    }
    // Format YYYY-MM-DD fara conversie UTC (evita schimbarea zilei din cauza timezone)
    const an = vineri.getFullYear();
    const luna = String(vineri.getMonth() + 1).padStart(2, '0');
    const zi = String(vineri.getDate()).padStart(2, '0');
    const vineriStr = `${an}-${luna}-${zi}`;

    const idx = listaMeniuri.findIndex(m => m.data_expirare.split(' ')[0] === vineriStr);
    if (idx >= 0) {
      // Incarca meniul si intra in editare daca are drepturi
      loadMeniu(idx).then(() => {
        if (canEdit) {
          // Asteapta ca meniul sa fie incarcat, apoi intra in editare
          setTimeout(() => startEditing(), 300);
        }
      });
    } else if (canEdit) {
      // Data goala (fara meniu)
      setShowCalendar(false);
      setDataVineriAutogen(vineriStr);
      // Daca e din trecut, cerem motivare inainte de a permite crearea
      const azi = new Date();
      const aziStr = `${azi.getFullYear()}-${String(azi.getMonth() + 1).padStart(2, '0')}-${String(azi.getDate()).padStart(2, '0')}`;
      if (vineriStr < aziStr) {
        setMotivareCreareTrecut(true);
        setMotivareCreareTrecutText('');
      } else {
        setShowBulaAutogenerat(true);
      }
    } else {
      toast.error('Nu există meniu pentru săptămâna selectată');
      setShowCalendar(false);
    }
  };

  const dataCurentaMeniu = useMemo(() => {
    if (!meniu?.data_expirare) return undefined;
    const d = new Date(meniu.data_expirare.split(' ')[0] + 'T12:00:00');
    return isNaN(d.getTime()) ? undefined : d;
  }, [meniu]);

  // Cautare globala — cauta in TOATE meniurile din BD (pattern identic cu mecanism_cautare_meniuri.js)
  useEffect(() => {
    if (!cautare.trim() || meniuriGlobale.length === 0) {
      setRezultateCautare([]);
      return;
    }
    const query = normalizezText(cautare.trim());
    const seen = new Set<string>();
    const rezultate: Array<{ saptamana: string; dataExpirare: string; index: number }> = [];

    meniuriGlobale.forEach((item, idx) => {
      if (!item.continut) return;
      // Strip HTML si normalizeaza textul (identic cu mecanismul vechi)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = item.continut;
      const textCurat = normalizezText(tempDiv.textContent || '');
      if (!textCurat.includes(query)) return;

      // Calculeaza intervalul saptamanii (deduplicare)
      const datePart = (item.data_expirare || '').split(' ')[0];
      const saptamana = calculeazaIntervalSaptamana(datePart);
      if (seen.has(saptamana)) return;
      seen.add(saptamana);

      // Gasim indexul in listaMeniuri pentru navigare
      const idxInLista = listaMeniuri.findIndex(m => m.data_expirare.split(' ')[0] === datePart);
      rezultate.push({ saptamana, dataExpirare: datePart, index: idxInLista });
    });

    setRezultateCautare(rezultate);
  }, [cautare, meniuriGlobale, listaMeniuri]);

  // Calculeaza "Meniul din 24 - 28 februarie 2025" din data_expirare (identic cu JS vechi)
  const calculeazaIntervalSaptamana = (dataExpirareStr: string): string => {
    const expDate = new Date(dataExpirareStr + 'T12:00:00');
    if (isNaN(expDate.getTime())) return dataExpirareStr;
    const monday = new Date(expDate);
    monday.setDate(expDate.getDate() - (expDate.getDay() - 1));
    const mondayDay = monday.getDate();
    const fridayDay = expDate.getDate();
    const monthName = new Intl.DateTimeFormat('ro-RO', { month: 'long' }).format(expDate);
    return `Meniul din ${mondayDay} - ${fridayDay} ${monthName} ${expDate.getFullYear()}`;
  };

  const cautareNormalizata = cautare.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const textMatchesCautare = (text: string) => {
    if (!cautareNormalizata) return true;
    const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return norm.includes(cautareNormalizata);
  };

  // Highlight pe text cu suport diacritice
  // Normalizam textul pentru cautare dar pastram textul original pentru afisare
  const highlightText = (text: string): React.ReactNode => {
    if (!cautareNormalizata || !text) return text;

    // Normalizam textul pentru cautare (fara diacritice)
    const textNorm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchIdx = textNorm.indexOf(cautareNormalizata);
    if (matchIdx === -1) return text;

    // Gasim lungimea match-ului in textul ORIGINAL (poate diferi din cauza diacriticelor)
    // Parcurgem char-by-char: fiecare caracter original poate genera 1+ caractere normalizate
    let origStart = 0, origEnd = 0, normPos = 0;
    for (let i = 0; i < text.length; i++) {
      const charNorm = text[i].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normPos === matchIdx) origStart = i;
      normPos += charNorm.length;
      if (normPos >= matchIdx + cautareNormalizata.length) { origEnd = i + 1; break; }
    }

    const before = text.slice(0, origStart);
    const match = text.slice(origStart, origEnd);
    const after = text.slice(origEnd);
    return <>{before}<mark className="bg-yellow-300 dark:bg-yellow-600 rounded px-0.5">{match}</mark>{after}</>;
  };

  // Avertizari OMS — limite din BD (Strat 2: endpoint PHP existent), fallback local
  const limite = limiteOMS || OMS_FALLBACK;
  const avertizariOMS = useMemo(() => {
    // Folosim nutrientii calculati client-side daca exista, altfel din BD
    const nc = nutrientiCalculati;
    const nm = meniu?.nutrienti_medie;
    if (!nc && !nm) return [];
    const warnings: Array<{ mesaj: string; nivel: 'warning' | 'danger'; descriere: string; remediere: string }> = [];
    const calorii = nc?.calorii || nm?.calorii?.valoare || 0;
    const proteine = nc?.proteine || nm?.proteine?.valoare || 0;
    const lipide = nc?.lipide || nm?.lipide?.valoare || 0;

    if (calorii > 0 && calorii < limite.calorii_min)
      warnings.push({ mesaj: `Calorii insuficiente ${calorii} kcal/zi (minim ${limite.calorii_min})`, nivel: 'danger',
        descriere: `Aportul caloric de ${calorii} kcal/zi este sub minimul recomandat de ${limite.calorii_min} kcal/zi conform Ordinului MS 1.582/2025.`,
        remediere: 'Adaugă alimente cu densitate calorică mai mare: cereale integrale, ulei de măsline, fructe uscate.' });
    if (calorii > limite.calorii_max)
      warnings.push({ mesaj: `Calorii excesive ${calorii} kcal/zi (maxim ${limite.calorii_max})`, nivel: 'warning',
        descriere: `Aportul caloric de ${calorii} kcal/zi depășește maximul recomandat de ${limite.calorii_max} kcal/zi.`,
        remediere: 'Reduce porțiile sau înlocuiește alimentele cu densitate calorică ridicată (prăjeli, dulciuri).' });
    if (proteine > 0 && proteine < limite.proteine_min)
      warnings.push({ mesaj: `Proteine insuficiente ${proteine}g/zi (minim ${limite.proteine_min}g)`, nivel: 'danger',
        descriere: `Aportul de proteine de ${proteine}g/zi este sub minimul de ${limite.proteine_min}g/zi necesar dezvoltării.`,
        remediere: 'Adaugă surse de proteine: carne slabă, pește, ouă, lactate, leguminoase.' });
    if (lipide > 0 && lipide < limite.lipide_min)
      warnings.push({ mesaj: `Lipide insuficiente ${lipide}g/zi (minim ${limite.lipide_min}g)`, nivel: 'warning',
        descriere: `Aportul de lipide de ${lipide}g/zi este sub minimul de ${limite.lipide_min}g/zi.`,
        remediere: 'Adaugă grăsimi sănătoase: ulei de măsline, avocado, nuci, semințe.' });
    return warnings;
  }, [meniu, limite, nutrientiCalculati]);

  // Grupare meniuri per saptamana (data_expirare) pentru navigare si tab-uri
  // IMPORTANT: toate useMemo trebuie sa fie inainte de orice return conditionat (regula hooks React)
  const saptamaniGrupate = useMemo(() => {
    if (listaMeniuri.length === 0) return [];
    const map = new Map<string, Array<{ index: number; denumire: string | null }>>();
    listaMeniuri.forEach((m, idx) => {
      const dataKey = m.data_expirare.split(' ')[0];
      if (!map.has(dataKey)) map.set(dataKey, []);
      map.get(dataKey)!.push({ index: idx, denumire: m.denumire_meniu });
    });
    return Array.from(map.entries()).map(([data, taburi]) => ({ data, taburi }));
  }, [listaMeniuri]);

  const saptamanaCurenta = useMemo(() => {
    if (saptamaniGrupate.length === 0 || !meniu) return null;
    const dataMenuCurent = meniu.data_expirare.split(' ')[0];
    return saptamaniGrupate.find(s => s.data === dataMenuCurent) || null;
  }, [saptamaniGrupate, meniu]);

  const indexSaptamana = useMemo(() => {
    if (!saptamanaCurenta) return 0;
    return saptamaniGrupate.indexOf(saptamanaCurenta);
  }, [saptamaniGrupate, saptamanaCurenta]);

  const navigheazaSaptamana = (directie: number) => {
    const newIdx = indexSaptamana + directie;
    if (newIdx < 0 || newIdx >= saptamaniGrupate.length) return;
    const primaIntrare = saptamaniGrupate[newIdx].taburi[0];
    loadMeniu(primaIntrare.index);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!meniu) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Nu sunt meniuri disponibile.
        </CardContent>
      </Card>
    );
  }

  const totalMeniuri = meniu.total_meniuri || 1;
  const dateZile = calculeazaDateZile(meniu.data_expirare);
  const alergeniActivi = new Set((meniu.alergeni_unici || []).map(a => a.toLowerCase().trim()));
  const areCaloriiPerZi = Object.values(caloriiPerZi).some(v => v > 0);

  // Filtreaza mesele daca cautarea e activa
  const meseAfisate = cautareNormalizata
    ? (meniu.mese || []).filter(masa =>
        ZILE_ORDINE.some(zi => textMatchesCautare(masa.zile[zi] || ''))
      )
    : (meniu.mese || []);

  return (
    <div className="space-y-4">
      {/* Header cu titlu */}
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold">Meniu Săptămânal</h1>
            <p className="text-muted-foreground text-sm">Săptămâna {meniu.saptamana}</p>
          </div>
        </div>
      )}

      {/* Câmp de căutare */}
      <div className="relative">
        <Input
          placeholder="Caută în meniu..."
          value={cautare}
          onChange={e => setCautare(e.target.value)}
          className="pr-8"
        />
        {cautare && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setCautare('')}
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Rezultate cautare globala — meniuri din alte saptamani din BD */}
        {rezultateCautare.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-30 bg-popover border rounded-md shadow-lg mt-1 max-h-[200px] overflow-y-auto">
            <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b font-semibold">
              {rezultateCautare.length} meniu(ri) găsite
            </div>
            {rezultateCautare.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors border-b last:border-b-0"
                onClick={() => {
                  if (r.index >= 0) {
                    loadMeniu(r.index);
                    setCautare('');
                  } else {
                    toast.error('Nu s-a putut naviga la acest meniu');
                  }
                }}
              >
                {r.saptamana}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigare + Calendar + Editare + Print */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          {saptamaniGrupate.length > 0 ? (
            <>
              <Button variant="outline" size="sm"
                disabled={indexSaptamana >= saptamaniGrupate.length - 1}
                onClick={() => navigheazaSaptamana(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" size="sm"
                disabled={indexSaptamana <= 0}
                onClick={() => navigheazaSaptamana(-1)}>
                Următor <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled={indexCurent >= totalMeniuri - 1}
                onClick={() => loadMeniu(indexCurent + 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" size="sm" disabled={indexCurent <= 0}
                onClick={() => loadMeniu(indexCurent - 1)}>
                Următor <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </>
          )}
        </div>

        {embedded && (
          <span className="text-sm font-display font-bold text-center flex-1 min-w-0">
            Săptămâna {meniu.saptamana}
          </span>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {/* Calendar */}
          <Popover open={showCalendar} onOpenChange={setShowCalendar}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                locale={ro}
                selected={dataCurentaMeniu}
                onSelect={handleSelectData}
                modifiers={{ disponibil: dateDisponibile }}
                modifiersClassNames={{ disponibil: 'bg-primary/20 font-bold' }}
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="px-3 pb-3 text-[10px] text-muted-foreground">
                Săptămânile colorate au meniu disponibil
              </div>
            </PopoverContent>
          </Popover>

          {/* Editare */}
          {canEdit && !editing && (
            <Button variant="outline" size="sm" className="gap-1" onClick={startEditing}>
              <Edit2 className="h-4 w-4" /> Editează
            </Button>
          )}
          {editing && (
            <>
              <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving || !dirty}>
                <Save className="h-4 w-4" /> {saving ? 'Salvez...' : 'Salvează'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setEditing(false); setDirty(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Print PDF — deschide mecanismul PHP existent in iframe (userul ramane in /app/) */}
          <Button variant="outline" size="sm" className="gap-1" onClick={() => {
            const dataVineri = meniu?.data_expirare?.split(' ')[0] || '';
            if (dataVineri) {
              setPrintURL(getPrintMeniuURL(dataVineri));
            }
          }}>
            <Printer className="h-4 w-4" /> Print
          </Button>

          {/* Ștergere meniu — doar pentru săptămâna curentă și viitor, nu trecut */}
          {canEdit && !editing && meniu && !esteSaptamanaDinTrecut() && (
            <Button variant="outline" size="sm" className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              onClick={() => setShowConfirmSterge(true)}>
              <Trash2 className="h-4 w-4" /> Șterge
            </Button>
          )}
        </div>
      </div>

      {/* Tab-uri meniuri multiple (identic cu mecanismul vechi PHP) */}
      {saptamanaCurenta && saptamanaCurenta.taburi.length > 1 && (
        <div className="flex items-center gap-1 flex-wrap">
          {saptamanaCurenta.taburi.map((tab) => {
            const esteActiv = tab.index === indexCurent;
            const label = tab.denumire === null ? 'Meniu' : `Meniu ${tab.denumire}`;
            return (
              <button
                key={tab.index}
                onClick={() => { if (!esteActiv) loadMeniu(tab.index); }}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-t-md border border-b-0 transition-colors',
                  esteActiv
                    ? 'bg-background text-foreground border-border'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border-transparent',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Tabel meniu */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-muted/60">
                  <th className="border p-2.5 text-left w-20 text-xs font-bold">Ora</th>
                  {ZILE_ORDINE.map(zi => (
                    <th key={zi} className="border p-2.5 text-center text-xs font-bold" style={{ color: ZILE_CULORI[zi] }}>
                      <div>{ZILE_LABEL[zi]}</div>
                      {dateZile[zi] && <div className="font-normal text-[10px] opacity-80">({dateZile[zi]})</div>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {meseAfisate.map(masa => (
                  <tr key={masa.masa}>
                    <td className="border p-2.5 font-medium bg-muted/50 text-xs align-top whitespace-nowrap text-center">
                      <div className="font-bold text-sm">{masa.ora}</div>
                      <div className="text-[10px] text-muted-foreground">{masa.label}</div>
                    </td>
                    {ZILE_ORDINE.map(zi => {
                      const celKey = `${masa.masa}_${zi}`;

                      if (editing) {
                        const alergeniEdit = alergeniPerCelula[celKey];
                        return (
                          <td key={zi} className="border p-1 align-top">
                            <textarea
                              className="w-full min-h-[60px] text-xs p-1.5 rounded border border-input bg-background resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                              value={continutCelule[celKey] || ''}
                              onChange={e => updateCelula(celKey, e.target.value)}
                              placeholder="..."
                            />
                            {alergeniEdit && alergeniEdit.length > 0 && (
                              <div className="text-[9px] text-muted-foreground/60 px-1 leading-tight">
                                {alergeniEdit.join(', ')}
                              </div>
                            )}
                          </td>
                        );
                      }

                      let text = masa.zile[zi] || '';
                      if (!showEmoji) {
                        text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}]/gu, '').trim();
                      }

                      const matches = cautareNormalizata ? textMatchesCautare(text) : true;

                      const alergeniCel = alergeniPerCelula[celKey];

                      return (
                        <td
                          key={zi}
                          className={cn(
                            'border p-2.5 text-xs align-top transition-colors relative',
                            canEdit && !editing && 'cursor-pointer hover:bg-primary/5',
                            cautareNormalizata && !matches && 'opacity-30',
                          )}
                          onClick={() => { if (canEdit && !editing) startEditing(); }}
                        >
                          {text ? highlightText(text) : <span className="text-muted-foreground">—</span>}
                          {alergeniCel && alergeniCel.length > 0 && (
                            <div className="absolute bottom-0.5 right-1 text-[9px] text-muted-foreground/60 pointer-events-none leading-tight">
                              {alergeniCel.join(', ')}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              {showKcal && areCaloriiPerZi && (
                <tfoot>
                  <tr className="bg-muted/30 font-semibold">
                    <td className="border p-2.5 text-xs font-bold text-center">
                      <Scale className="h-3.5 w-3.5 inline mr-1" />kcal
                    </td>
                    {ZILE_ORDINE.map(zi => {
                      const val = caloriiPerZi[zi];
                      return (
                        <td key={zi} className="border p-2.5 text-center text-xs">
                          {val ? <span className="font-bold">{val} kcal</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                      );
                    })}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Toggle-uri (sub tabel, identic cu pozitionarea din PHP) */}
      <div className="flex flex-wrap items-center gap-5 text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showEmoji} onCheckedChange={setShowEmoji} />
          <span className="font-medium">Emoji</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showNutrienti} onCheckedChange={setShowNutrienti} />
          <span className="font-medium">Nutrienți</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Switch checked={showKcal} onCheckedChange={setShowKcal} />
          <span className="font-medium">kcal/zi</span>
        </label>
      </div>

      {/* Nutrienți și Calorii + Grafic circular */}
      {showNutrienti && (() => {
        // Folosim nutrientii calculati client-side daca exista, altfel fallback la cei din BD
        const nmBD = meniu.nutrienti_medie || {};
        const nc = nutrientiCalculati;
        const items = [
          { label: 'calorii', cheie: 'calorii', unitate: 'kcal' },
          { label: 'proteine', cheie: 'proteine', unitate: 'gr' },
          { label: 'lipide', cheie: 'lipide', unitate: 'gr' },
          { label: 'carbohidrati', cheie: 'carbohidrati', unitate: 'gr' },
          { label: 'glucide', cheie: 'glucide', unitate: 'gr' },
        ];
        // Valoarea afisata: calculata client-side (nc) daca exista, altfel din BD (nmBD)
        const getVal = (cheie: string) => nc?.[cheie] || nmBD[cheie]?.valoare || 0;
        const areDate = items.some(item => getVal(item.cheie) > 0);
        if (!areDate) return null;

        // Date pentru graficul pie (exclude calorii — identic cu PHP)
        const pieCulori = ['#FF6384', '#36A2EB', '#FFCE56', '#8AFF81'];
        const pieDate = items
          .filter(item => item.cheie !== 'calorii')
          .map((item, idx) => ({ label: item.label, valoare: getVal(item.cheie), culoare: pieCulori[idx] }))
          .filter(d => d.valoare > 0);
        const pieTotal = pieDate.reduce((s, d) => s + d.valoare, 0);

        // Genereaza arcuri SVG cu pozitia textului (centrul fiecarui segment)
        const pieArce = (() => {
          if (pieTotal === 0) return [];
          const arce: Array<{ d: string; culoare: string; label: string; val: number; textX: number; textY: number; procent: number }> = [];
          let unghi = -Math.PI / 2; // start la 12 ore
          const cx = 50, cy = 50, r = 40;
          for (const seg of pieDate) {
            const fractie = seg.valoare / pieTotal;
            const unghiSfarsit = unghi + fractie * 2 * Math.PI;
            const largeArc = fractie > 0.5 ? 1 : 0;
            const x1 = cx + r * Math.cos(unghi);
            const y1 = cy + r * Math.sin(unghi);
            const x2 = cx + r * Math.cos(unghiSfarsit);
            const y2 = cy + r * Math.sin(unghiSfarsit);
            // Centrul segmentului — la 60% din raza pentru lizibilitate
            const unghiMijloc = unghi + fractie * Math.PI;
            const textR = r * 0.6;
            const textX = cx + textR * Math.cos(unghiMijloc);
            const textY = cy + textR * Math.sin(unghiMijloc);
            arce.push({
              d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`,
              culoare: seg.culoare,
              label: seg.label,
              val: seg.valoare,
              textX, textY,
              procent: Math.round(fractie * 100),
            });
            unghi = unghiSfarsit;
          }
          return arce;
        })();

        return (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-display font-bold mb-3">
                Nutrienți și Calorii (medie/zi):{' '}
                <span className="font-normal">
                  {items.map(item => {
                    const val = getVal(item.cheie);
                    return val > 0 ? `${item.label} (${val} ${item.unitate})` : null;
                  }).filter(Boolean).join(', ')}
                </span>
              </p>
              {pieArce.length > 0 && (
                <div className="flex items-center gap-4 mt-2">
                  <svg viewBox="0 0 100 100" className="w-28 h-28 shrink-0">
                    {pieArce.map((arc, i) => (
                      <path key={`p${i}`} d={arc.d} fill={arc.culoare} stroke="white" strokeWidth="0.5"
                        className={canEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                        onClick={() => {
                          if (!canEdit) return;
                          setEditNutrient({ label: arc.label, valoare: arc.val });
                          setInputNutrientVal(String(arc.val));
                        }}
                      >
                        <title>{arc.label}: {arc.val}gr{canEdit ? ' (click pentru editare)' : ''}</title>
                      </path>
                    ))}
                    {pieArce.map((arc, i) => (
                      arc.procent >= 8 && (
                        <text key={`t${i}`} x={arc.textX} y={arc.textY}
                          textAnchor="middle" dominantBaseline="central"
                          fill="white" fontSize="6" fontWeight="bold"
                          style={{ pointerEvents: 'none', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}
                        >
                          {arc.val}
                        </text>
                      )
                    ))}
                  </svg>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    {pieDate.map((seg, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: seg.culoare }} />
                        <span>{seg.label}: {seg.valoare}gr</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Avertizări OMS — cu tooltip descriere + remediere (identic cu mecanismul vechi PHP) */}
      {avertizariOMS.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="p-4">
            <h3 className="text-sm font-display font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" /> Avertizări OMS:
            </h3>
            <div className="space-y-1.5">
              {avertizariOMS.map((w, i) => (
                <Popover key={i}>
                  <PopoverTrigger asChild>
                    <button type="button" className={cn(
                      'text-sm flex items-center gap-2 text-left w-full rounded px-2 py-1 transition-colors hover:bg-muted/60 cursor-pointer',
                      w.nivel === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400',
                    )}>
                      <span className={cn('inline-block w-2 h-2 rounded-full shrink-0',
                        w.nivel === 'danger' ? 'bg-red-500' : 'bg-amber-500')} />
                      {w.mesaj}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 text-sm" side="bottom" align="start">
                    <p className="text-muted-foreground mb-2">{w.descriere}</p>
                    <p className="text-emerald-700 dark:text-emerald-400 font-medium border-t pt-2">
                      💡 {w.remediere}
                    </p>
                  </PopoverContent>
                </Popover>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alergeni */}
      {meniu.alergeni_unici && meniu.alergeni_unici.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-display font-bold mb-3">Alergeni prezenți</h3>
            <div className="flex flex-wrap gap-2">
              {ALERGENI_TOTI.map(alergen => {
                const esteActiv = alergeniActivi.has(alergen.toLowerCase());
                return (
                  <Badge key={alergen} variant={esteActiv ? 'default' : 'outline'}
                    className={cn('text-xs', esteActiv
                      ? 'bg-amber-500/20 text-amber-700 border-amber-500/40'
                      : 'text-muted-foreground/50 border-muted/50')}>
                    {alergen}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Semnaturi — editabile inline la click (dirty → butonul general Salvează devine activ) */}
      {meniu.semnaturi && Object.keys(meniu.semnaturi).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-6 text-sm">
              {Object.entries({ ...(meniu.semnaturi || {}), ...semnaturiLocale }).map(([functie, nume]) => (
                <div key={functie} className="text-center">
                  <span className="text-muted-foreground capitalize">{functie.replace(/_/g, ' ')}:</span>{' '}
                  {editSemnatura === functie ? (
                    <Input
                      autoFocus
                      value={inputSemnatura}
                      onChange={e => setInputSemnatura(e.target.value)}
                      onBlur={() => {
                        if (inputSemnatura.trim()) {
                          setSemnaturiLocale(prev => ({ ...prev, [functie]: inputSemnatura.trim() }));
                          setDirty(true);
                          if (!editing) startEditing();
                        }
                        setEditSemnatura(null);
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                        if (e.key === 'Escape') { setEditSemnatura(null); }
                      }}
                      className="inline-block w-40 h-7 text-sm font-semibold px-1.5"
                      placeholder="Nume și Prenume"
                    />
                  ) : (
                    <span
                      className={cn('font-semibold', canEdit && 'cursor-pointer hover:underline')}
                      title={canEdit ? 'Click pentru modificare' : undefined}
                      onClick={() => {
                        if (!canEdit) return;
                        setEditSemnatura(functie);
                        setInputSemnatura(String(semnaturiLocale[functie] || nume || ''));
                      }}
                    >
                      {String(semnaturiLocale[functie] || nume || 'Nume Prenume')}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Referință OMS */}
      <div className="text-[11px] text-muted-foreground text-left px-1">
        <a href="https://legislatie.just.ro/Public/DetaliiDocument/304795" target="_blank" rel="noopener noreferrer"
          className="hover:underline hover:text-primary transition-colors">
          Referință: Ordinul MS 1.582/2025 — 1290–1660 kcal/zi (copii 4-6 ani)
        </a>
      </div>

      {/* Dialog Print PDF — iframe cu mecanismul PHP existent, userul ramane in /app/ */}
      <Dialog open={!!printURL} onOpenChange={(open) => { if (!open) setPrintURL(null); }}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="p-4 pb-2 shrink-0">
            <DialogTitle className="text-base flex items-center gap-2">
              <Printer className="h-5 w-5" /> Print Meniu — Săptămâna {meniu?.saptamana}
            </DialogTitle>
            <DialogDescription>Previzualizare și imprimare meniu</DialogDescription>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            {printURL && (
              <iframe
                src={printURL}
                className="w-full h-full border-0"
                title="Print meniu"
              />
            )}
          </div>
          <div className="p-3 border-t flex justify-end shrink-0">
            <Button variant="outline" size="sm" onClick={() => setPrintURL(null)}>
              Închide
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog confirmare ștergere meniu */}
      <Dialog open={showConfirmSterge} onOpenChange={setShowConfirmSterge}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Ștergere Meniu
            </DialogTitle>
            <DialogDescription>Această acțiune nu poate fi anulată</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Sigur doriți să ștergeți meniul pentru săptămâna selectată?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowConfirmSterge(false)}>
              Anulează
            </Button>
            <Button variant="destructive" size="sm" disabled={deleting} onClick={async () => {
              if (!meniu) return;
              setDeleting(true);
              try {
                const dataVineri = meniu.data_expirare.split(' ')[0];
                await stergeMeniu(dataVineri, meniu.denumire_meniu);
                toast.success('Meniu șters cu succes!');
                setShowConfirmSterge(false);
                // Reincarca lista si navigheaza la meniul precedent sau curent
                await loadMeniu(Math.max(0, indexCurent - 1));
              } catch (err: any) {
                toast.error(err.message || 'Eroare la ștergere');
              } finally {
                setDeleting(false);
              }
            }}>
              <Trash2 className="h-4 w-4 mr-1" /> {deleting ? 'Șterg...' : 'Șterge definitiv'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog motivare — creare meniu NOU în trecut (asumare responsabilitate) */}
      <Dialog open={motivareCreareTrecut} onOpenChange={setMotivareCreareTrecut}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" /> Creare Meniu pentru Săptămână din Trecut
            </DialogTitle>
            <DialogDescription>Justificare obligatorie pentru introducere retroactivă</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Săptămâna selectată este din trecut și nu are meniu. Pentru a crea un meniu retroactiv,
              trebuie să introduceți o motivare (minim 10 caractere).
            </p>
            <textarea
              className="w-full min-h-[80px] text-sm p-2.5 rounded border border-input bg-background resize-y focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Introduceți motivarea creării meniului retroactiv..."
              value={motivareCreareTrecutText}
              onChange={e => setMotivareCreareTrecutText(e.target.value)}
              autoFocus
            />
            <p className={cn('text-xs', motivareCreareTrecutText.trim().length >= 10 ? 'text-muted-foreground' : 'text-amber-600')}>
              {motivareCreareTrecutText.trim().length} / 10 caractere minime
            </p>
            {user && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                <strong>Utilizator:</strong> {user.nume_prenume}<br />
                <strong>Data/ora:</strong> {new Date().toLocaleString('ro-RO')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setMotivareCreareTrecut(false)}>
              Anulează
            </Button>
            <Button size="sm" disabled={motivareCreareTrecutText.trim().length < 10} onClick={() => {
              setMotivareCreareTrecut(false);
              setMotivareAsumata(true);
              // Continuam cu propunerea de autogenerare
              setShowBulaAutogenerat(true);
            }}>
              <Save className="h-4 w-4 mr-1" /> Continuă cu asumarea responsabilității
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog motivare — salvare meniu din trecut (audit trail, identic cu PHP) */}
      <Dialog open={showMotivare} onOpenChange={setShowMotivare}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" /> Modificare Meniu din Trecut
            </DialogTitle>
            <DialogDescription>Justificare obligatorie pentru modificare retroactivă</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Săptămâna selectată este din trecut. Pentru a modifica acest meniu,
              trebuie să introduceți o motivare (minim 10 caractere).
            </p>
            <textarea
              className="w-full min-h-[80px] text-sm p-2.5 rounded border border-input bg-background resize-y focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Introduceți motivarea modificării..."
              value={motivareText}
              onChange={e => setMotivareText(e.target.value)}
              autoFocus
            />
            <p className={cn('text-xs', motivareText.trim().length >= 10 ? 'text-muted-foreground' : 'text-amber-600')}>
              {motivareText.trim().length} / 10 caractere minime
            </p>
            {user && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                <strong>Utilizator:</strong> {user.nume_prenume}<br />
                <strong>Data/ora:</strong> {new Date().toLocaleString('ro-RO')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowMotivare(false)}>
              Anulează
            </Button>
            <Button size="sm" disabled={motivareText.trim().length < 10 || saving}
              onClick={async () => {
                setShowMotivare(false);
                await executaSalvare(motivareText.trim());
              }}>
              <Save className="h-4 w-4 mr-1" /> Salvează cu motivare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bubble autogenerare meniu (identic cu PHP: "Vrei meniu echilibrat?") */}
      <Dialog open={showBulaAutogenerat} onOpenChange={setShowBulaAutogenerat}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" /> Generare Meniu
            </DialogTitle>
            <DialogDescription>Propunere meniu echilibrat conform normelor OMS</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Vrei să-ți propun un meniu echilibrat conform normelor OMS?
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => {
              setShowBulaAutogenerat(false);
              if (!dataVineriAutogen) return;
              // Creează meniu gol pe săptămâna selectată (identic cu PHP: tabel gol cu header)
              const vineriDate = new Date(dataVineriAutogen + 'T12:00:00');
              const luniDate = new Date(vineriDate);
              luniDate.setDate(vineriDate.getDate() - 4);
              const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
              const saptLabel = `${luniDate.getDate()}-${vineriDate.getDate()} ${LUNI_RO[vineriDate.getMonth()]} ${vineriDate.getFullYear()}`;
              const meniuGol: MeniuStructurat = {
                success: true,
                saptamana: saptLabel,
                data_expirare: dataVineriAutogen + ' 23:59:59',
                denumire_meniu: null,
                id_info: 0,
                total_meniuri: 0,
                index_curent: 0,
                mese: [
                  { masa: 'mic_dejun', label: 'Mic dejun', ora: '08:15', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'gustare_1', label: 'Gustare', ora: '10:00', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'pranz', label: 'Prânz', ora: '12:00', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'gustare_2', label: 'Gustare', ora: '15:30', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                ],
                alergeni: {},
                alergeni_unici: [],
                semnaturi: {},
                nutrienti_medie: {},
                calorii_per_zi: {},
              };
              setMeniu(meniuGol);
              // Intră direct în mod editare
              const celule: Record<string, string> = {};
              for (const masa of meniuGol.mese) {
                for (const zi of ZILE_ORDINE) {
                  celule[`${masa.masa}_${zi}`] = '';
                }
              }
              setContinutCelule(celule);
              setEditing(true);
              setDirty(false);
            }}>
              Nu, completez manual
            </Button>
            <Button size="sm" disabled={generareMeniu} onClick={() => handleGenereazaMeniu(false)}>
              {generareMeniu ? 'Generez...' : 'OK, te rog'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog informativ — mecanismul de autogenerare încă învață */}
      <Dialog open={showBulaInvatare} onOpenChange={setShowBulaInvatare}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" /> Mecanismul învață...
            </DialogTitle>
            <DialogDescription>Autogenerarea nu este încă disponibilă</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Mecanismul de autogenerare a meniurilor are nevoie de un istoric de meniuri
              introduse manual pentru a putea propune combinații echilibrate conform OMS.
            </p>
            <p>
              Cu fiecare meniu pe care îl completați, sistemul <strong>învață automat</strong> alimentele,
              cantitățile preferate și combinațiile nutriționale. În curând va putea să vă propună
              meniuri din ce în ce mai echilibrate.
            </p>
            <p className="text-xs border-t pt-2">
              Între timp, puteți completa meniul manual folosind autocompletarea inteligentă
              — tastați primele litere ale unui aliment și sistemul îl va recunoaște automat cu
              emoji, cantitate și valori nutriționale.
            </p>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => {
              setShowBulaInvatare(false);
              if (!dataVineriAutogen) return;
              // Creează meniu gol pe săptămâna selectată (la fel ca "Nu, completez manual")
              const vineriDate = new Date(dataVineriAutogen + 'T12:00:00');
              const luniDate = new Date(vineriDate);
              luniDate.setDate(vineriDate.getDate() - 4);
              const LUNI_RO = ['ianuarie','februarie','martie','aprilie','mai','iunie',
                'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
              const saptLabel = `${luniDate.getDate()}-${vineriDate.getDate()} ${LUNI_RO[vineriDate.getMonth()]} ${vineriDate.getFullYear()}`;
              const meniuGol: MeniuStructurat = {
                success: true, saptamana: saptLabel,
                data_expirare: dataVineriAutogen + ' 23:59:59',
                denumire_meniu: null, id_info: 0, total_meniuri: 0, index_curent: 0,
                mese: [
                  { masa: 'mic_dejun', label: 'Mic dejun', ora: '08:15', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'gustare_1', label: 'Gustare', ora: '10:00', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'pranz', label: 'Prânz', ora: '12:00', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                  { masa: 'gustare_2', label: 'Gustare', ora: '15:30', zile: { luni: '', marti: '', miercuri: '', joi: '', vineri: '' } },
                ],
                alergeni: {}, alergeni_unici: [], semnaturi: {},
                nutrienti_medie: {}, calorii_per_zi: {},
              };
              setMeniu(meniuGol);
              const celule: Record<string, string> = {};
              for (const masa of meniuGol.mese) {
                for (const zi of ZILE_ORDINE) { celule[`${masa.masa}_${zi}`] = ''; }
              }
              setContinutCelule(celule);
              setEditing(true);
              setDirty(false);
            }}>
              Am înțeles, completez manual
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal avertizari OMS din autogenerare — cu buton Regenereaza (max 3 incercari) */}
      <Dialog open={showModalOmsAutogen} onOpenChange={setShowModalOmsAutogen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" /> Avertizări Conformitate OMS
            </DialogTitle>
            <DialogDescription>Verificare conformitate cu normele OMS</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {avertizariAutogen.map((a, i) => (
              <div key={i} className={cn('text-sm p-2 rounded border-l-4',
                a.includes('sub') || a.includes('ROSU')
                  ? 'bg-red-50 dark:bg-red-950/30 border-red-500 text-red-700 dark:text-red-400'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-500 text-amber-700 dark:text-amber-400'
              )}>
                {a}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowModalOmsAutogen(false)}>
              Continuă oricum
            </Button>
            <Button size="sm" disabled={generareMeniu} onClick={() => handleGenereazaMeniu(true)}>
              {generareMeniu ? 'Regenerez...' : 'Regenerează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Editor nutrient din pie chart (click pe segment) */}
      <Dialog open={!!editNutrient} onOpenChange={(open) => { if (!open) setEditNutrient(null); }}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-sm capitalize">{editNutrient?.label}</DialogTitle>
            <DialogDescription>Editare valoare nutrient</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-xs">Valoare (gr)</Label>
            <Input
              type="number"
              value={inputNutrientVal}
              onChange={e => setInputNutrientVal(e.target.value)}
              min="0"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditNutrient(null)}>Anulează</Button>
            <Button size="sm" onClick={() => {
              setEditNutrient(null);
              setShowBulaAutogenerat(true);
            }}>
              Aplică
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================================
// COMPONENTA PRINCIPALA - alege intre viewer TID4K si editor OMS
// ============================================================================
export default function WeeklyMenu({ embedded }: { embedded?: boolean }) {
  // Daca backend-ul TID4K e activ, afiseaza viewer-ul cu date reale
  if (USE_TID4K_BACKEND) {
    return <TID4KMenuViewer embedded={embedded} />;
  }

  return <WeeklyMenuOMS embedded={embedded} />;
}

function WeeklyMenuOMS({ embedded }: { embedded?: boolean }) {
  const { user } = useAuth();
  const [monday, setMonday] = useState(() => getMondayOfWeek(new Date()));
  const [menuWeek, setMenuWeek] = useState<MenuWeek | null>(null);
  const [nutRef, setNutRef] = useState<NutritionalRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDishDialog, setAddDishDialog] = useState<{ day: number; mealType: string } | null>(null);
  const [addIngDialog, setAddIngDialog] = useState<{ dishId: string; dishName: string } | null>(null);
  const [newDishName, setNewDishName] = useState('');
  const [selectedIngRef, setSelectedIngRef] = useState<NutritionalRef | null>(null);
  const [ingGrams, setIngGrams] = useState('100');
  const [ingSearch, setIngSearch] = useState('');

  const canEdit = user && (areRol(user.status, 'profesor') || areRol(user.status, 'director') || areRol(user.status, 'administrator'));

  const weekKey = format(monday, 'yyyy-MM-dd');

  const refMap = useMemo(() => {
    const m = new Map<string, NutritionalRef>();
    nutRef.forEach(r => m.set(r.id, r));
    return m;
  }, [nutRef]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    const [mw, refs] = await Promise.all([getMenuWeek(weekKey), getNutritionalReference()]);
    setMenuWeek(mw);
    setNutRef(refs);
    setLoading(false);
  }, [weekKey]);

  useEffect(() => { loadData(); }, [loadData]);

  // Create menu week if doesn't exist
  const handleCreateWeek = async () => {
    const mw = await ensureMenuWeek(weekKey);
    setMenuWeek(mw);
    toast.success('Meniu creat pentru această săptămână');
  };

  // Add dish
  const handleAddDish = async () => {
    if (!menuWeek?.id || !addDishDialog || !newDishName.trim()) return;
    await addDish(menuWeek.id, addDishDialog.day, addDishDialog.mealType, newDishName.trim());
    setAddDishDialog(null);
    setNewDishName('');
    await loadData();
    toast.success('Fel adăugat');
  };

  // Add ingredient
  const handleAddIngredient = async () => {
    if (!addIngDialog || !selectedIngRef) return;
    const grams = Number(ingGrams) || 0;
    if (grams <= 0) { toast.error('Cantitatea trebuie să fie > 0'); return; }

    if (selectedIngRef.is_banned) {
      toast.error(`⚠️ ${selectedIngRef.ingredient_name} este INTERZIS: ${selectedIngRef.ban_reason}`);
      return;
    }

    await addIngredient(addIngDialog.dishId, selectedIngRef.id, selectedIngRef.ingredient_name, grams);
    setAddIngDialog(null);
    setSelectedIngRef(null);
    setIngGrams('100');
    setIngSearch('');
    await loadData();
    toast.success('Ingredient adăugat');
  };

  // Delete dish
  const handleDeleteDish = async (dishId: string) => {
    await deleteDish(dishId);
    await loadData();
    toast.success('Fel șters');
  };

  // Delete ingredient
  const handleDeleteIngredient = async (ingId: string) => {
    await deleteIngredient(ingId);
    await loadData();
  };

  // Publish
  const handlePublish = async () => {
    if (!menuWeek?.id) return;
    await publishMenu(menuWeek.id);
    await loadData();
    toast.success('Meniu publicat! Este vizibil pe display și QR.');
  };

  const handleUnpublish = async () => {
    if (!menuWeek?.id) return;
    await unpublishMenu(menuWeek.id);
    await loadData();
    toast.info('Meniu retras din publicare');
  };

  // Age group change
  const handleAgeGroupChange = async (ag: string) => {
    if (!menuWeek?.id) return;
    await updateAgeGroup(menuWeek.id, ag);
    await loadData();
  };

  // Navigate weeks
  const prevWeek = () => setMonday(addWeeks(monday, -1));
  const nextWeek = () => setMonday(addWeeks(monday, 1));

  // Computed
  const meals = menuWeek?.meals || [];
  const ageGroup = menuWeek?.age_group || '4-5';
  const target = AGE_GROUP_TARGETS[ageGroup];
  const bannedWarnings = checkBannedIngredients(meals, refMap);
  const omsClassification = menuWeek ? getWeeklyOmsClassification(meals, ageGroup, refMap) : null;

  const OMS_BADGE_STYLES: Record<string, string> = {
    verde: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
    galben: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
    rosu: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/40',
    gol: 'bg-muted text-muted-foreground border-border',
  };

  const OMS_BADGE_LABELS: Record<string, string> = {
    verde: '✅ Conform OMS',
    galben: '⚠️ Atenție OMS',
    rosu: '❌ Neconform OMS',
    gol: '📋 Incomplet',
  };

  // Get meals for a specific cell
  const getMealDishes = (day: number, mealType: string): Dish[] => {
    const meal = meals.find(m => m.day_of_week === day && m.meal_type === mealType);
    return meal?.dishes || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* Header */}
      {!embedded && (
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-2">
            <ChefHat className="h-6 w-6" /> Meniu OMS Săptămânal
          </h1>
          <p className="text-muted-foreground text-sm">{formatWeekLabel(monday)}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={prevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium min-w-[200px] text-center">{formatWeekLabel(monday)}</span>
        <Button variant="outline" size="icon" className="h-9 w-9" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              locale={ro}
              selected={monday}
              onSelect={(date) => { if (date) setMonday(getMondayOfWeek(date)); }}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        <div className="ml-auto flex items-center gap-2">
          {menuWeek && (
            <Select value={ageGroup} onValueChange={handleAgeGroupChange}>
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AGE_GROUP_TARGETS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {menuWeek && canEdit && (
            menuWeek.status === 'draft' ? (
              <Button size="sm" className="gap-2" onClick={handlePublish}>
                <Send className="h-4 w-4" /> Publică
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="gap-2" onClick={handleUnpublish}>
                <Undo2 className="h-4 w-4" /> Retrage
              </Button>
            )
          )}
          {menuWeek && (
            <Badge variant={menuWeek.status === 'published' ? 'default' : 'secondary'}>
              {menuWeek.status === 'published' ? '✅ Publicat' : '📝 Draft'}
            </Badge>
          )}
          {omsClassification && omsClassification.classification !== 'gol' && (
            <Badge variant="outline" className={cn('gap-1 text-xs', OMS_BADGE_STYLES[omsClassification.classification])}>
              <Award className="h-3 w-3" />
              {OMS_BADGE_LABELS[omsClassification.classification]}
            </Badge>
          )}
          {menuWeek && (
            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" /> Print
            </Button>
          )}
        </div>
      </div>

      {/* No menu yet */}
      {!menuWeek && canEdit && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nu există meniu pentru această săptămână.</p>
            <Button onClick={handleCreateWeek} className="gap-2">
              <Plus className="h-4 w-4" /> Creează Meniu
            </Button>
          </CardContent>
        </Card>
      )}

      {!menuWeek && !canEdit && (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Nu există meniu publicat pentru această săptămână.</p>
          </CardContent>
        </Card>
      )}

      {/* Banned warnings */}
      {bannedWarnings.length > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-destructive font-semibold mb-2">
              <ShieldAlert className="h-5 w-5" /> Ingrediente INTERZISE detectate!
            </div>
            {bannedWarnings.map((w, i) => (
              <p key={i} className="text-sm text-destructive/80 ml-7">
                • <strong>{w.ingredientName}</strong> în „{w.dishName}" — {w.reason}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Weekly Grid */}
      {menuWeek && (
        <Card className="glass-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-primary text-primary-foreground">
                    <th className="border border-primary/30 p-2.5 text-left w-24 text-xs">Masa</th>
                    {DAYS.map(d => {
                      const dayNut = computeDayNutrition(meals, d.num);
                      const status = getCalorieStatus(dayNut.kcal, ageGroup);
                      return (
                        <th key={d.num} className="border border-primary/30 p-2.5 text-center text-xs">
                          <div>{d.label}</div>
                          {dayNut.kcal > 0 && (
                            <Badge variant="outline" className={cn('mt-1 text-[10px] font-mono', STATUS_COLORS[status])}>
                              {dayNut.kcal} kcal
                            </Badge>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {MEAL_TYPES.map(meal => (
                    <tr key={meal.key}>
                      <td className="border p-2.5 font-medium bg-muted/50 text-xs align-top">
                        <div>{meal.emoji}</div>
                        <div>{meal.label}</div>
                      </td>
                      {DAYS.map(day => {
                        const dishes = getMealDishes(day.num, meal.key);
                        return (
                          <td key={day.num} className="border p-2 align-top text-xs">
                            {dishes.map(dish => (
                              <div key={dish.id} className="mb-2 last:mb-0">
                                <div className="flex items-center gap-1 mb-1">
                                  <span className="font-semibold text-foreground">{dish.dish_name}</span>
                                  {canEdit && (
                                    <button onClick={() => handleDeleteDish(dish.id!)} className="text-destructive/50 hover:text-destructive ml-auto">
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  )}
                                </div>
                                {dish.ingredients.length > 0 && (
                                  <div className="space-y-0.5 text-muted-foreground text-[11px]">
                                    {dish.ingredients.map(ing => (
                                      <div key={ing.id} className="flex items-center gap-1 group">
                                        <span>{ing.ingredient_name} ({ing.quantity_grams}g)</span>
                                        <span className="text-[10px] font-mono opacity-60 ml-auto">{Math.round(ing.kcal || 0)}kcal</span>
                                        {canEdit && (
                                          <button onClick={() => handleDeleteIngredient(ing.id!)} className="opacity-0 group-hover:opacity-100 text-destructive/50 hover:text-destructive">
                                            <Trash2 className="h-2.5 w-2.5" />
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {canEdit && (
                                  <button
                                    onClick={() => setAddIngDialog({ dishId: dish.id!, dishName: dish.dish_name })}
                                    className="text-[10px] text-primary/60 hover:text-primary mt-1 flex items-center gap-0.5"
                                  >
                                    <Plus className="h-2.5 w-2.5" /> ingredient
                                  </button>
                                )}
                              </div>
                            ))}
                            {canEdit && (
                              <button
                                onClick={() => setAddDishDialog({ day: day.num, mealType: meal.key })}
                                className="text-[11px] text-primary/50 hover:text-primary flex items-center gap-1 mt-1"
                              >
                                <Plus className="h-3 w-3" /> Adaugă fel
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-muted/30">
                    <td className="border p-2.5 font-bold text-xs">
                      <Scale className="h-4 w-4 inline mr-1" /> Total / zi
                    </td>
                    {DAYS.map(day => {
                      const nut = computeDayNutrition(meals, day.num);
                      const status = getCalorieStatus(nut.kcal, ageGroup);
                      return (
                        <td key={day.num} className={cn('border p-2.5 text-center text-xs')}>
                          {nut.kcal > 0 ? (() => {
                            const macro = computeMacroBalance(nut);
                            return (
                              <div className="space-y-1">
                                <div className={cn('font-bold font-mono text-sm rounded px-2 py-1 inline-block border', STATUS_COLORS[status])}>
                                  {nut.kcal} kcal
                                </div>
                                <div className="text-muted-foreground text-[10px] space-x-2">
                                  <span className={cn(macro.protein_status === 'red' && 'text-destructive font-bold')}>P:{nut.protein}g ({macro.protein_pct}%)</span>
                                  <span className={cn(macro.fat_status === 'red' && 'text-destructive font-bold')}>L:{nut.fat}g ({macro.fat_pct}%)</span>
                                  <span className={cn(macro.carbs_status === 'red' && 'text-destructive font-bold')}>G:{nut.carbs}g ({macro.carbs_pct}%)</span>
                                </div>
                                {status === 'red' && target && (
                                  <div className="text-destructive text-[10px] flex items-center justify-center gap-1">
                                    <AlertTriangle className="h-3 w-3" />
                                    {nut.kcal < target.min ? `Sub limita de ${target.min}` : `Peste limita de ${target.max}`}
                                  </div>
                                )}
                              </div>
                            );
                          })() : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OMS Classification & Target reference */}
      {menuWeek && target && (
        <Card className="glass-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>OK: {target.min}–{target.max} kcal/zi ({target.label})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Aproape de limită</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Depășire / sub limită</span>
              </div>
              <span className="text-muted-foreground ml-auto text-xs">Conform OMS 541/2025</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Macro OMS: </span>
              Proteine 10-15% · Lipide 25-35% · Glucide 50-60% din kcal total
            </div>
            {omsClassification && omsClassification.reasons.length > 0 && omsClassification.classification !== 'verde' && (
              <div className="text-xs space-y-0.5">
                {omsClassification.reasons.map((r, i) => (
                  <p key={i} className={cn(
                    omsClassification.classification === 'rosu' ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'
                  )}>• {r}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Add Dish Dialog ── */}
      <Dialog open={!!addDishDialog} onOpenChange={(o) => !o && setAddDishDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă fel de mâncare</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Numele felului</Label>
              <Input
                placeholder="ex: Supă de pui cu fidea"
                value={newDishName}
                onChange={e => setNewDishName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddDish()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDishDialog(null)}>Anulează</Button>
            <Button onClick={handleAddDish} disabled={!newDishName.trim()}>Adaugă</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Ingredient Dialog ── */}
      <Dialog open={!!addIngDialog} onOpenChange={(o) => !o && setAddIngDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă ingredient la „{addIngDialog?.dishName}"</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Ingredient search */}
            <div>
              <Label>Ingredient din baza de date</Label>
              <Command className="border rounded-lg mt-1">
                <CommandInput
                  placeholder="Caută ingredient..."
                  value={ingSearch}
                  onValueChange={setIngSearch}
                />
                <CommandList>
                  <CommandEmpty>Nu s-a găsit. Verifică ortografia.</CommandEmpty>
                  <ScrollArea className="h-[250px]">
                    {getRefCategories(nutRef).map(cat => {
                      const items = nutRef
                        .filter(r => r.category === cat && r.ingredient_name.toLowerCase().includes(ingSearch.toLowerCase()));
                      if (items.length === 0) return null;
                      return (
                        <CommandGroup key={cat} heading={CATEGORY_LABELS[cat] || cat}>
                          {items.slice(0, 15).map(r => (
                            <CommandItem
                              key={r.id}
                              value={r.ingredient_name}
                              onSelect={() => setSelectedIngRef(r)}
                              className={cn(
                                'cursor-pointer',
                                r.is_banned && 'text-destructive line-through opacity-60',
                                selectedIngRef?.id === r.id && 'bg-primary/10'
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span>
                                  {selectedIngRef?.id === r.id && <Check className="h-3 w-3 inline mr-1" />}
                                  {r.ingredient_name}
                                  {r.is_banned && ' ⛔'}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {r.calories_per_100g}kcal/100g
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      );
                    })}
                  </ScrollArea>
                </CommandList>
              </Command>
            </div>

            {selectedIngRef && (
              <>
                {selectedIngRef.is_banned && (
                  <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-sm text-destructive">
                    <ShieldAlert className="h-4 w-4 inline mr-1" />
                    INTERZIS: {selectedIngRef.ban_reason}
                  </div>
                )}
                <div>
                  <Label>Cantitate (grame)</Label>
                  <Input
                    type="number"
                    value={ingGrams}
                    onChange={e => setIngGrams(e.target.value)}
                    min={1}
                  />
                  {Number(ingGrams) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      = {Math.round((selectedIngRef.calories_per_100g * Number(ingGrams)) / 100)} kcal,{' '}
                      P: {((selectedIngRef.protein * Number(ingGrams)) / 100).toFixed(1)}g,{' '}
                      G: {((selectedIngRef.fat * Number(ingGrams)) / 100).toFixed(1)}g,{' '}
                      C: {((selectedIngRef.carbs * Number(ingGrams)) / 100).toFixed(1)}g
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAddIngDialog(null); setSelectedIngRef(null); setIngSearch(''); }}>
              Anulează
            </Button>
            <Button onClick={handleAddIngredient} disabled={!selectedIngRef || selectedIngRef.is_banned || Number(ingGrams) <= 0}>
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
