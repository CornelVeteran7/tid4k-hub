import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Target, Search, Wrench } from 'lucide-react';

// Constants
const D = { eurRon: 4.97, usdEur: 0.92 };
const HW: Record<string, number> = {
  raspberryPi: 45, sdCard: 8, hdmiCable: 5, powerSupply: 12,
  screenTV: 150, plexiglasFrame: 35, mounting3DPrint: 15, installationLabor: 50,
};
const hwDisplayEUR = Object.values(HW).reduce((a, b) => a + b, 0);
const INKY_EUR = 100;
const HW_LIFE = 36;

const f = (n: number, d = 0) => n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const fe = (n: number) => n.toFixed(2);

const STORAGE_KEY = 'tid4k-cost-calculator';

function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

// Slider with +/- and click-to-edit
function ParamSlider({ label, value, onChange, min, max, step = 1, unit = '' }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
    setEditing(false);
  };

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-5 w-5 text-xs"
            onClick={() => onChange(Math.max(min, +(value - step).toFixed(6)))}>−</Button>
          {editing ? (
            <Input autoFocus value={draft} onChange={e => setDraft(e.target.value)}
              onBlur={commit} onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
              className="w-16 h-5 text-xs text-right font-mono px-1" />
          ) : (
            <span onClick={() => { setDraft(String(value)); setEditing(true); }}
              className="text-xs font-bold font-mono cursor-text px-1.5 py-0.5 rounded bg-primary/10 text-foreground min-w-[50px] text-right inline-block">
              {value.toLocaleString('ro-RO')}{unit}
            </span>
          )}
          <Button variant="outline" size="icon" className="h-5 w-5 text-xs"
            onClick={() => onChange(Math.min(max, +(value + step).toFixed(6)))}>+</Button>
        </div>
      </div>
      <Slider min={min} max={max} step={step} value={[value]} onValueChange={([v]) => onChange(v)} className="w-full" />
      <div className="flex justify-between mt-0.5">
        <span className="text-[8px] text-muted-foreground">{min}{unit}</span>
        <span className="text-[8px] text-muted-foreground">{max}{unit}</span>
      </div>
    </div>
  );
}

function MetricCard({ label, value, color = 'text-primary', sub }: {
  label: string; value: string; color?: string; sub?: string;
}) {
  return (
    <div className="p-2 rounded-md border text-center flex-1 min-w-[80px] bg-card">
      <div className="text-[7px] text-muted-foreground uppercase">{label}</div>
      <div className={`text-xs font-bold font-mono ${color}`}>{value}</div>
      {sub && <div className="text-[8px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function DetailRow({ label, value, color = 'text-foreground', bold = false }: {
  label: string; value: string; color?: string; bold?: boolean;
}) {
  return (
    <div className="flex justify-between py-0.5 border-b border-border">
      <span className="text-[9px] text-muted-foreground">{label}</span>
      <span className={`text-[10px] font-mono ${bold ? 'font-bold' : 'font-medium'} ${color}`}>{value}</span>
    </div>
  );
}

export default function SuperAdminCostCalculator() {
  const saved = loadState();

  // Fleet
  const [eur, setEur] = useState(saved?.eur ?? D.eurRon);
  const [cl, setCl] = useState(saved?.cl ?? 30);
  const [grp, setGrp] = useState(saved?.grp ?? 5);
  const [kidG, setKidG] = useState(saved?.kidG ?? 25);
  const [dsp, setDsp] = useState(saved?.dsp ?? 1);
  const [ink, setInk] = useState(saved?.ink ?? 5);
  const [tts, setTts] = useState(saved?.tts ?? 60);
  const [tax, setTax] = useState(saved?.tax ?? 35);
  const [margin, setMargin] = useState(saved?.margin ?? 25);

  // Salaries
  const [sDev, setSDev] = useState(saved?.sDev ?? 3500);
  const [nDev, setNDev] = useState(saved?.nDev ?? 1);
  const [sTech, setSTech] = useState(saved?.sTech ?? 1200);
  const [nTech, setNTech] = useState(saved?.nTech ?? 1);
  const [sSales, setSSales] = useState(saved?.sSales ?? 1500);
  const [nSales, setNSales] = useState(saved?.nSales ?? 0.5);
  const [sAdmin, setSAdmin] = useState(saved?.sAdmin ?? 800);
  const [nAdmin, setNAdmin] = useState(saved?.nAdmin ?? 0.5);

  // Server
  const [sup, setSup] = useState(saved?.sup ?? 25);
  const [ver, setVer] = useState(saved?.ver ?? 20);
  const [con, setCon] = useState(saved?.con ?? 5);
  const [dom, setDom] = useState(saved?.dom ?? 2);
  const [bak, setBak] = useState(saved?.bak ?? 3);

  // Single client
  const [scGrp, setScGrp] = useState(saved?.scGrp ?? 5);
  const [scKid, setScKid] = useState(saved?.scKid ?? 25);
  const [scDsp, setScDsp] = useState(saved?.scDsp ?? 1);
  const [scInk, setScInk] = useState(saved?.scInk ?? 5);
  const [scContrib, setScContrib] = useState(saved?.scContrib ?? 300);
  const [scStripeOur, setScStripeOur] = useState(saved?.scStripeOur ?? 1.0);
  const [scSponsors, setScSponsors] = useState(saved?.scSponsors ?? 0);
  const [scSponsorPrice, setScSponsorPrice] = useState(saved?.scSponsorPrice ?? 150);
  const [scVisitCost, setScVisitCost] = useState(saved?.scVisitCost ?? 75);
  const [scVisitsYear, setScVisitsYear] = useState(saved?.scVisitsYear ?? 2);
  const [scInstallCost, setScInstallCost] = useState(saved?.scInstallCost ?? 100);
  const [scHwOwned, setScHwOwned] = useState(saved?.scHwOwned ?? true);
  const [scMinPrice, setScMinPrice] = useState(saved?.scMinPrice ?? 1000);

  // Target
  const [targetNet, setTargetNet] = useState(saved?.targetNet ?? 5000);

  // Persist to localStorage
  useEffect(() => {
    const state = {
      eur, cl, grp, kidG, dsp, ink, tts, tax, margin,
      sDev, nDev, sTech, nTech, sSales, nSales, sAdmin, nAdmin,
      sup, ver, con, dom, bak,
      scGrp, scKid, scDsp, scInk, scContrib, scStripeOur, scSponsors, scSponsorPrice,
      scVisitCost, scVisitsYear, scInstallCost, scHwOwned, scMinPrice, targetNet,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [eur, cl, grp, kidG, dsp, ink, tts, tax, margin, sDev, nDev, sTech, nTech, sSales, nSales, sAdmin, nAdmin, sup, ver, con, dom, bak, scGrp, scKid, scDsp, scInk, scContrib, scStripeOur, scSponsors, scSponsorPrice, scVisitCost, scVisitsYear, scInstallCost, scHwOwned, scMinPrice, targetNet]);

  const calc = useMemo(() => {
    const srvEUR = (sup + ver + bak + dom) * D.usdEur + con;
    const teamEUR = sDev * nDev + sTech * nTech + sSales * nSales + sAdmin * nAdmin;
    const ttsEUR = (tts > 30 ? 22 : tts > 0 ? 5 : 0) * D.usdEur;
    const fixEUR = srvEUR + teamEUR + ttsEUR;

    // Single client
    const scKids = scGrp * scKid;
    const scParents = scKids * 2;
    const scStaff = scGrp + 2;
    const scUsers = scParents + scStaff;

    const scShareFixed = fixEUR / Math.max(cl, 1);
    const scHwDspMonth = scHwOwned ? (hwDisplayEUR * scDsp) / HW_LIFE : 0;
    const scHwInkMonth = scHwOwned ? (INKY_EUR * scInk) / HW_LIFE : 0;
    const scVisitMonth = (scVisitCost * scVisitsYear) / 12;
    const scInstallMonth = scInstallCost / 12;
    const scTotalCostEUR = scShareFixed + scHwDspMonth + scHwInkMonth + scVisitMonth + scInstallMonth;
    const scTotalCostRON = scTotalCostEUR * eur;

    const scSubRON = Math.max(scMinPrice, scTotalCostEUR * (1 + tax / 100) * (1 + margin / 100) * eur);
    const scStripeVolume = scKids * scContrib;
    const scStripeRevRON = scStripeVolume * (scStripeOur / 100);
    const scSponsorRevRON = scSponsors * scSponsorPrice;
    const scTotalRevRON = scSubRON + scStripeRevRON + scSponsorRevRON;
    const scProfitRON = scTotalRevRON - scTotalCostRON;
    const scHwUpfrontEUR = scHwOwned ? (hwDisplayEUR * scDsp + INKY_EUR * scInk + scInstallCost) : scInstallCost;
    const scSubPerKid = scSubRON / Math.max(scKids, 1);
    const scBaseSubRON = scMinPrice;
    const scExtraDisplayRON = Math.max(0, scDsp - 1) * (hwDisplayEUR / HW_LIFE) * (1 + tax / 100) * (1 + margin / 100) * eur;
    const scInkyAddonRON = scInk * (INKY_EUR / HW_LIFE) * (1 + tax / 100) * (1 + margin / 100) * eur;

    // Fleet
    const flKids = grp * kidG;
    const flTaxMul = (1 + tax / 100) * (1 + margin / 100);
    const flPerC = fixEUR / Math.max(cl, 1);
    const flHwD = (hwDisplayEUR * dsp) / HW_LIFE;
    const flHwI = (INKY_EUR * ink) / HW_LIFE;

    const flBaza = Math.max(flPerC * flTaxMul * eur, scMinPrice);
    const flAviz = Math.max((flPerC + flHwD) * flTaxMul * eur, scMinPrice);
    const flComp = Math.max((flPerC + flHwD + flHwI) * flTaxMul * eur, scMinPrice);

    const flRevComp = flComp * cl;
    const flCostComp = fixEUR * eur + (flHwD + flHwI) * eur * cl;
    const flProfComp = flRevComp - flCostComp;
    const flStripe = cl * flKids * scContrib * (scStripeOur / 100);

    const beBaza = flBaza > 0 ? Math.ceil(fixEUR * eur / flBaza) : 999;

    return {
      srvEUR, teamEUR, ttsEUR, fixEUR,
      scKids, scParents, scStaff, scUsers,
      scShareFixed, scHwDspMonth, scHwInkMonth, scVisitMonth, scInstallMonth,
      scTotalCostEUR, scTotalCostRON,
      scSubRON, scStripeVolume, scStripeRevRON, scSponsorRevRON,
      scTotalRevRON, scProfitRON, scHwUpfrontEUR, scSubPerKid,
      scBaseSubRON, scExtraDisplayRON, scInkyAddonRON,
      flKids, flBaza, flAviz, flComp,
      flRevComp, flCostComp, flProfComp, flStripe,
      beBaza, flPerC, flHwD, flHwI, flTaxMul,
    };
  }, [eur, cl, grp, kidG, dsp, ink, tts, tax, margin, sDev, nDev, sTech, nTech, sSales, nSales, sAdmin, nAdmin, sup, ver, con, dom, bak, scGrp, scKid, scDsp, scInk, scContrib, scStripeOur, scSponsors, scSponsorPrice, scVisitCost, scVisitsYear, scInstallCost, scHwOwned, scMinPrice]);

  const tabs = [
    { id: 'client', label: 'Un Client Nou', icon: User },
    { id: 'fleet', label: 'Flotă', icon: Building2 },
    { id: 'target', label: 'Venit Țintă', icon: Target },
    { id: 'sponsors', label: 'Research Sponsori', icon: Search },
    { id: 'hw', label: 'Hardware', icon: Wrench },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Badge variant="destructive" className="text-[9px] mb-1">STRICT INTERN v3</Badge>
        <h2 className="text-lg font-bold text-foreground">InfoDisplay for Kids — Calculator Costuri</h2>
        <p className="text-xs text-muted-foreground">Contract 12 luni | Minim {f(scMinPrice)} RON/luna (incl. 1 display) | 1€ = {eur} RON</p>
      </div>

      <Tabs defaultValue="client" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          {tabs.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="gap-1 text-xs">
              <t.icon className="h-3 w-3" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ═══ SINGLE CLIENT ═══ */}
        <TabsContent value="client" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-primary uppercase tracking-wider">Configurare Client</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <ParamSlider label="Grupe/clase" value={scGrp} onChange={setScGrp} min={1} max={30} />
                <ParamSlider label="Copii/grupă" value={scKid} onChange={setScKid} min={5} max={35} />
                <ParamSlider label="Displayuri" value={scDsp} onChange={setScDsp} min={0} max={5} />
                <ParamSlider label="Inky fizici" value={scInk} onChange={setScInk} min={0} max={30} />
                <ParamSlider label="Preț minim RON/lună" value={scMinPrice} onChange={setScMinPrice} min={500} max={3000} unit=" lei" />
                <div className="flex gap-2 mt-2">
                  <Button variant={scHwOwned ? 'default' : 'outline'} size="sm" className="flex-1 text-[9px]" onClick={() => setScHwOwned(true)}>HW al nostru</Button>
                  <Button variant={!scHwOwned ? 'default' : 'outline'} size="sm" className="flex-1 text-[9px]" onClick={() => setScHwOwned(false)}>HW al clientului</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-green-500 uppercase tracking-wider">Venituri Pasive</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <ParamSlider label="Contribuție medie hrană lei/copil/lună" value={scContrib} onChange={setScContrib} min={0} max={600} unit=" lei" />
                <ParamSlider label="Comision nostru Stripe (%)" value={scStripeOur} onChange={setScStripeOur} min={0} max={5} step={0.1} unit="%" />
                <div className="p-2 rounded bg-green-500/5 border border-green-500/20 mb-3">
                  <div className="text-[8px] text-muted-foreground">Volum lunar Stripe</div>
                  <div className="text-sm font-bold font-mono text-green-500">{f(calc.scStripeVolume)} lei</div>
                  <div className="text-[9px] text-muted-foreground">Comision nostru {scStripeOur}%: <strong className="text-green-500">{f(calc.scStripeRevRON)} lei/lună</strong></div>
                </div>
                <ParamSlider label="Nr. sponsori locali" value={scSponsors} onChange={setScSponsors} min={0} max={10} />
                <ParamSlider label="Preț/sponsor/lună" value={scSponsorPrice} onChange={setScSponsorPrice} min={50} max={500} unit=" lei" />
                <div className="text-[9px] text-muted-foreground">Sponsor rev: <strong className="text-amber-500">{f(calc.scSponsorRevRON)} lei/lună</strong></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-amber-500 uppercase tracking-wider">Costuri Fizice</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <ParamSlider label="Cost vizită (EUR)" value={scVisitCost} onChange={setScVisitCost} min={0} max={300} unit=" EUR" />
                <ParamSlider label="Vizite/an" value={scVisitsYear} onChange={setScVisitsYear} min={0} max={12} />
                <ParamSlider label="Cost instalare (EUR)" value={scInstallCost} onChange={setScInstallCost} min={0} max={500} unit=" EUR" />
                <ParamSlider label="Flotă totală (pt share costuri fixe)" value={cl} onChange={setCl} min={1} max={500} />
                <ParamSlider label="Taxe %" value={tax} onChange={setTax} min={10} max={50} unit="%" />
                <ParamSlider label="Marjă %" value={margin} onChange={setMargin} min={0} max={60} unit="%" />
                <ParamSlider label="EUR/RON" value={eur} onChange={setEur} min={4.5} max={5.5} step={0.01} />
              </CardContent>
            </Card>
          </div>

          {/* Summary metrics */}
          <div className="flex gap-2 flex-wrap">
            <MetricCard label="Copii" value={String(calc.scKids)} color="text-primary" />
            <MetricCard label="Conturi" value={String(calc.scUsers)} color="text-violet-500" />
            <MetricCard label="Cost intern" value={`${f(calc.scTotalCostRON)} lei`} color="text-destructive" sub={`${fe(calc.scTotalCostEUR)} EUR`} />
            <MetricCard label="Abonament" value={`${f(calc.scSubRON)} lei`} color="text-primary" sub={`${fe(calc.scSubPerKid)} lei/copil`} />
            <MetricCard label="+ Stripe" value={`${f(calc.scStripeRevRON)} lei`} color="text-green-500" />
            <MetricCard label="+ Sponsori" value={`${f(calc.scSponsorRevRON)} lei`} color="text-amber-500" />
            <MetricCard label="TOTAL REV" value={`${f(calc.scTotalRevRON)} lei`} color="text-cyan-500" />
            <MetricCard label="PROFIT" value={`${f(calc.scProfitRON)} lei`} color={calc.scProfitRON > 0 ? 'text-green-500' : 'text-destructive'} />
          </div>

          {/* Detailed P&L */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-destructive uppercase tracking-wider">Costuri lunare acest client</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <DetailRow label="Share costuri fixe (server+echipă+TTS)" value={`${fe(calc.scShareFixed)} EUR = ${f(calc.scShareFixed * eur)} lei`} />
                <DetailRow label={`Hardware display amortizat (${scDsp}x/${HW_LIFE}luni)`} value={`${fe(calc.scHwDspMonth)} EUR = ${f(calc.scHwDspMonth * eur)} lei`} />
                <DetailRow label={`Inky amortizat (${scInk}x/${HW_LIFE}luni)`} value={`${fe(calc.scHwInkMonth)} EUR = ${f(calc.scHwInkMonth * eur)} lei`} />
                <DetailRow label={`Mentenanță (${scVisitsYear} vizite x ${scVisitCost}€/12)`} value={`${fe(calc.scVisitMonth)} EUR = ${f(calc.scVisitMonth * eur)} lei`} />
                <DetailRow label="Instalare amortizată (12 luni)" value={`${fe(calc.scInstallMonth)} EUR = ${f(calc.scInstallMonth * eur)} lei`} />
                <DetailRow label="TOTAL COST LUNAR" value={`${f(calc.scTotalCostRON)} lei (${fe(calc.scTotalCostEUR)} EUR)`} color="text-destructive" bold />
                <div className="mt-2 text-[9px] text-amber-500">
                  HW upfront la instalare: <strong>{fe(calc.scHwUpfrontEUR)} EUR = {f(calc.scHwUpfrontEUR * eur)} lei</strong>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-green-500 uppercase tracking-wider">Venituri lunare de la acest client</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <DetailRow label={`Abonament (minim ${f(scMinPrice)} lei incl. 1 display)`} value={`${f(calc.scSubRON)} lei`} color="text-primary" />
                <DetailRow label="Compunere abonament:" value="" />
                <DetailRow label={`  Bază software (${f(scMinPrice)} lei incl. 1 display)`} value={`${f(calc.scBaseSubRON)} lei`} color="text-primary" />
                <DetailRow label={`  + ${Math.max(0, scDsp - 1)} display(uri) extra`} value={`+${f(calc.scExtraDisplayRON)} lei`} color={calc.scExtraDisplayRON > 0 ? 'text-amber-500' : 'text-muted-foreground'} />
                <DetailRow label={`  + ${scInk} Inky add-on`} value={`+${f(calc.scInkyAddonRON)} lei`} color={calc.scInkyAddonRON > 0 ? 'text-violet-500' : 'text-muted-foreground'} />
                <div className="h-2" />
                <DetailRow label={`Comision Stripe ${scStripeOur}% din ${f(calc.scStripeVolume)} lei`} value={`+${f(calc.scStripeRevRON)} lei`} color="text-green-500" />
                <DetailRow label={`Sponsori (${scSponsors} x ${scSponsorPrice} lei)`} value={`+${f(calc.scSponsorRevRON)} lei`} color="text-amber-500" />
                <DetailRow label="TOTAL VENITURI LUNARE" value={`${f(calc.scTotalRevRON)} lei`} color="text-green-500" bold />
                <div className={`mt-2 p-2 rounded ${calc.scProfitRON > 0 ? 'bg-green-500/10' : 'bg-destructive/10'}`}>
                  <DetailRow label="PROFIT NET lunar" value={`${f(calc.scProfitRON)} lei (${fe(calc.scProfitRON / eur)} EUR)`} color={calc.scProfitRON > 0 ? 'text-green-500' : 'text-destructive'} bold />
                  <div className="text-[8px] text-muted-foreground mt-1">
                    x12 luni contract = {f(calc.scProfitRON * 12)} lei/an | ROI la {calc.scHwUpfrontEUR > 0 ? f((calc.scHwUpfrontEUR * eur) / (calc.scProfitRON > 0 ? calc.scProfitRON : 1), 1) + ' luni' : 'instant (fără HW)'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ═══ FLEET ═══ */}
        <TabsContent value="fleet" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-amber-500 uppercase tracking-wider">Salarii (EUR)</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <ParamSlider label="Programator" value={sDev} onChange={setSDev} min={0} max={8000} unit=" EUR" />
                <ParamSlider label="x" value={nDev} onChange={setNDev} min={0} max={5} step={0.5} unit="x" />
                <ParamSlider label="Tehnician" value={sTech} onChange={setSTech} min={0} max={3000} unit=" EUR" />
                <ParamSlider label="x" value={nTech} onChange={setNTech} min={0} max={5} step={0.5} unit="x" />
                <ParamSlider label="Vânzări" value={sSales} onChange={setSSales} min={0} max={4000} unit=" EUR" />
                <ParamSlider label="x" value={nSales} onChange={setNSales} min={0} max={3} step={0.5} unit="x" />
                <ParamSlider label="Admin" value={sAdmin} onChange={setSAdmin} min={0} max={2000} unit=" EUR" />
                <ParamSlider label="x" value={nAdmin} onChange={setNAdmin} min={0} max={2} step={0.5} unit="x" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-cyan-500 uppercase tracking-wider">Server + Fleet</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <ParamSlider label="Supabase $" value={sup} onChange={setSup} min={0} max={50} />
                <ParamSlider label="Vercel $" value={ver} onChange={setVer} min={0} max={50} />
                <ParamSlider label="Contabo EUR" value={con} onChange={setCon} min={0} max={30} />
                <ParamSlider label="Domain+SSL $" value={dom} onChange={setDom} min={0} max={10} />
                <ParamSlider label="Backup $" value={bak} onChange={setBak} min={0} max={20} />
                <ParamSlider label="Grupe/client" value={grp} onChange={setGrp} min={1} max={30} />
                <ParamSlider label="Copii/grupă" value={kidG} onChange={setKidG} min={5} max={35} />
                <ParamSlider label="Display/client" value={dsp} onChange={setDsp} min={0} max={5} />
                <ParamSlider label="Inky/client" value={ink} onChange={setInk} min={0} max={30} />
                <ParamSlider label="TTS min/lună" value={tts} onChange={setTts} min={0} max={200} unit="min" />
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 flex-wrap">
            <MetricCard label="Fix/lună" value={`${f(calc.fixEUR * eur)} lei`} color="text-destructive" sub={`${fe(calc.fixEUR)} EUR`} />
            <MetricCard label="Echipă" value={`${f(calc.teamEUR)} EUR`} color="text-amber-500" />
            <MetricCard label="Server" value={`${fe(calc.srvEUR)} EUR`} color="text-cyan-500" />
            <MetricCard label="Break-even" value={`${calc.beBaza} cl.`} color="text-green-500" />
            <MetricCard label="Stripe flotă" value={`${f(calc.flStripe)} lei`} color="text-green-500" sub="comision/lună" />
          </div>

          <Card>
            <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-primary uppercase tracking-wider">Scenarii preț minim (cost + taxe + marjă)</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {['Cl.', 'Cost/cl', 'BAZĂ', 'AVIZIER', 'COMPLET', '/copil C', 'Profit C/lună', '+Stripe/lună'].map(h => (
                      <TableHead key={h} className="text-right text-[8px] px-1">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 3, 5, 10, 20, 30, 50, 75, 100, 200, 300].map(n => {
                    const pc = calc.fixEUR / n;
                    const b = Math.max(pc * calc.flTaxMul * eur, scMinPrice);
                    const a = Math.max((pc + calc.flHwD) * calc.flTaxMul * eur, scMinPrice);
                    const c = Math.max((pc + calc.flHwD + calc.flHwI) * calc.flTaxMul * eur, scMinPrice);
                    const kids = grp * kidG;
                    const prof = c * n - calc.fixEUR * eur - (calc.flHwD + calc.flHwI) * eur * n;
                    const stripe = n * kids * scContrib * (scStripeOur / 100);
                    const isCurrent = n === cl;
                    return (
                      <TableRow key={n} className={isCurrent ? 'bg-primary/5' : ''}>
                        <TableCell className={`text-right font-mono text-[9px] px-1 ${isCurrent ? 'font-bold text-primary' : ''}`}>{n}</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-muted-foreground">{fe(pc)} EUR</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-primary">{f(b)}</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-green-500">{f(a)}</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-violet-500">{f(c)}</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-muted-foreground">{fe(c / kids)}</TableCell>
                        <TableCell className={`text-right font-mono text-[9px] px-1 ${prof > 0 ? 'text-green-500' : 'text-destructive'}`}>{f(prof)}</TableCell>
                        <TableCell className="text-right font-mono text-[9px] px-1 text-green-500">{f(stripe)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ TARGET ═══ */}
        <TabsContent value="target" className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-cyan-500 uppercase tracking-wider">Venit Net Țintă</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4">
              <ParamSlider label="Venit NET dorit EUR/lună" value={targetNet} onChange={setTargetNet} min={0} max={30000} step={100} unit=" EUR" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <div className="text-[8px] text-muted-foreground">NET</div>
                  <div className="text-xl font-extrabold text-cyan-500 font-mono">{f(targetNet)} EUR</div>
                  <div className="text-xs text-muted-foreground font-mono">{f(targetNet * eur)} lei/lună</div>
                </div>
                <div className="md:col-span-2 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {['Cl.', 'BAZĂ lei', 'COMPLET lei', '/copil', 'x12'].map(h => (
                          <TableHead key={h} className="text-right text-[8px] px-1">{h}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[5, 10, 20, 30, 50, 75, 100, 200].map(n => {
                        const gross = targetNet / (1 - tax / 100);
                        const needed = (calc.fixEUR + gross) * eur;
                        const hwD = (hwDisplayEUR * dsp) / HW_LIFE * eur * n;
                        const hwI = (INKY_EUR * ink) / HW_LIFE * eur * n;
                        const b = needed / n;
                        const c = (needed + hwD + hwI) / n;
                        const kids = grp * kidG;
                        const isCurrent = n === cl;
                        return (
                          <TableRow key={n} className={isCurrent ? 'bg-primary/5' : ''}>
                            <TableCell className={`text-right font-mono text-[9px] px-1 ${isCurrent ? 'font-bold text-cyan-500' : ''}`}>{n}</TableCell>
                            <TableCell className="text-right font-mono text-[9px] px-1 text-primary">{f(b)}</TableCell>
                            <TableCell className="text-right font-mono text-[9px] px-1 text-violet-500">{f(c)}</TableCell>
                            <TableCell className="text-right font-mono text-[9px] px-1 text-muted-foreground">{fe(c / kids)}</TableCell>
                            <TableCell className="text-right font-mono text-[9px] px-1 text-muted-foreground">{f(c * 12)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ SPONSORS RESEARCH ═══ */}
        <TabsContent value="sponsors" className="space-y-4">
          <Card>
            <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-pink-500 uppercase tracking-wider">Research: Ce câștigă alții din sponsori/reclame pe display</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <p className="text-[10px] text-muted-foreground mb-3">Date reale din industrie (verificate martie 2026):</p>
              {[
                { cat: 'Digital Signage Global', data: 'Software: $8-20/ecran/lună. Piață totală: $29 mld (2025). 44% din bugetul OOH va fi digital până în 2029.', src: 'Market.us, OAAA, Posterbooking' },
                { cat: 'Școli cu Scoreboard Digital (SUA)', data: '95% din școli recuperează investiția în 12 luni din sponsorizări. Venituri: $10.000-25.000/an per ecran. Sponsori locali plătesc ~$1.500/an.', src: 'Next LED Signs, customer reports' },
                { cat: 'Reclame pe ecran 32-55 inch', data: '$100-500/săptămână în retail. $50-1.000/lună în locații mici. Prețul crește cu traficul: lobby hotel > hol școală > coridor.', src: 'Rise Vision, Nento, doPublicity' },
                { cat: 'Model Tiered Sponsorship', data: 'Bronze: £50/lună x7 sloturi = £350. Silver: £100/lună x2 = £200. Gold: £200/lună x1 = £200. Total: £750/lună/ecran.', src: 'TrouDigital case study' },
                { cat: 'ClassDojo (ed-tech comparabil)', data: '0 reclame. Monetizare: freemium $7.99/lună/părinte (ClassDojo Plus). Evaluat la $1.3B. 95% școli US. NU vând advertising.', src: 'TechCrunch, Contrary Research' },
                { cat: 'Școli - Digital Sponsorship', data: "'Digital slats': firme locale cumpără spațiu pe ecranul școlii. Acoperă costul HW + venituri recurente. Limbaj: 'Community Partner' nu 'Ad'.", src: 'Look Digital Signage, Next LED' },
              ].map((r, i) => (
                <div key={i} className={`p-3 rounded-md border-l-[3px] border-l-pink-500 ${i % 2 ? 'bg-pink-500/5' : 'bg-card'}`}>
                  <div className="text-[10px] font-bold text-pink-500">{r.cat}</div>
                  <div className="text-[9px] text-foreground mt-1">{r.data}</div>
                  <div className="text-[8px] text-muted-foreground mt-1">Sursa: {r.src}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-amber-500 uppercase tracking-wider">Ce înseamnă realist pentru InfoDisplay România</CardTitle></CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { sc: 'Pesimist', sp: 1, pr: 100, note: '1 sponsor local (farmacie/patiserie lângă școală), prezență minimă pe display' },
                  { sc: 'Realist', sp: 2, pr: 200, note: '2 sponsori (farmacie + librărie/after-school), rotația în bandă știri + avizier' },
                  { sc: 'Optimist', sp: 4, pr: 250, note: '4 sponsori activi, slot-uri pe avizier + in-app, rapoarte vizualizare' },
                ].map(s => {
                  const rev = s.sp * s.pr;
                  return (
                    <Card key={s.sc}>
                      <CardContent className="p-4">
                        <div className="text-sm font-bold text-amber-500">{s.sc}</div>
                        <div className="text-[9px] text-muted-foreground">{s.sp} sponsori x {s.pr} lei</div>
                        <div className="text-lg font-extrabold text-green-500 font-mono">{f(rev)} lei/lună</div>
                        <div className="text-[9px] text-muted-foreground">{f(rev * 12)} lei/an</div>
                        <div className="text-[8px] text-muted-foreground mt-2">{s.note}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <div className="text-[10px] text-destructive font-bold">ATENȚIE LEGALĂ (Legea 32/1994 Art. 5)</div>
                <div className="text-[9px] text-muted-foreground">Sponsorul poate promova numele, marca sau imaginea. Este INTERZISĂ reclama comercială mascată. Folosește "Partener Comunitar" sau "Susținut de", NU "Cumpără acum" sau prețuri.</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ HARDWARE ═══ */}
        <TabsContent value="hw" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-amber-500 uppercase tracking-wider">Display (1 buc)</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                {Object.entries(HW).map(([k, v]) => (
                  <DetailRow key={k} label={k.replace(/([A-Z])/g, ' $1')} value={`${v} EUR = ${f(v * eur)} lei`} />
                ))}
                <DetailRow label="TOTAL" value={`${hwDisplayEUR} EUR = ${f(hwDisplayEUR * eur)} lei`} color="text-amber-500" bold />
                <div className="text-[8px] text-muted-foreground mt-2">Amortizat {HW_LIFE} luni = {fe(hwDisplayEUR / HW_LIFE)} EUR/lună</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="py-3 px-4"><CardTitle className="text-xs text-violet-500 uppercase tracking-wider">Inky + TTS</CardTitle></CardHeader>
              <CardContent className="px-4 pb-4">
                <DetailRow label="Inky (robot+speaker)" value={`${INKY_EUR} EUR = ${f(INKY_EUR * eur)} lei`} />
                <DetailRow label="ElevenLabs Starter" value="$5/lună (30 min)" />
                <DetailRow label="ElevenLabs Pro" value="$22/lună (100 min)" />
                <div className="text-[9px] text-muted-foreground mt-3">5 mascote: Inky (bufniță) + 4 animale noi. Cost shared între toți clienții.</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
