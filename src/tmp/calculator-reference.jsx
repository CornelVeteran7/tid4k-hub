import { useState, useMemo } from "react";

const D = { eurRon: 4.97, usdEur: 0.92 };
const HW = { raspberryPi:45, sdCard:8, hdmiCable:5, powerSupply:12, screenTV:150, plexiglasFrame:35, mounting3DPrint:15, installationLabor:50 };
const hwDisplayEUR = Object.values(HW).reduce((a,b)=>a+b,0);
const INKY_EUR = 100;
const HW_LIFE = 36;

const f=(n,d=0)=>n.toFixed(d).replace(/\B(?=(\d{3})+(?!\d))/g,".");
const fe=n=>n.toFixed(2);

export default function App() {
  // Fleet
  const [eur, setEur] = useState(D.eurRon);
  const [cl, setCl] = useState(30);
  const [grp, setGrp] = useState(5);
  const [kidG, setKidG] = useState(25);
  const [dsp, setDsp] = useState(1);
  const [ink, setInk] = useState(5);
  const [tts, setTts] = useState(60);
  const [tax, setTax] = useState(35);
  const [margin, setMargin] = useState(25);

  // Salaries
  const [sDev, setSDev] = useState(3500); const [nDev, setNDev] = useState(1);
  const [sTech, setSTech] = useState(1200); const [nTech, setNTech] = useState(1);
  const [sSales, setSSales] = useState(1500); const [nSales, setNSales] = useState(0.5);
  const [sAdmin, setSAdmin] = useState(800); const [nAdmin, setNAdmin] = useState(0.5);

  // Server
  const [sup, setSup] = useState(25); const [ver, setVer] = useState(20);
  const [con, setCon] = useState(5); const [dom, setDom] = useState(2); const [bak, setBak] = useState(3);

  // Single client params
  const [scGrp, setScGrp] = useState(5);
  const [scKid, setScKid] = useState(25);
  const [scDsp, setScDsp] = useState(1);
  const [scInk, setScInk] = useState(5);
  const [scContrib, setScContrib] = useState(300); // avg lei/child/month food contribution
  const [scStripeOur, setScStripeOur] = useState(1.0); // our % on top
  const [scSponsors, setScSponsors] = useState(0);
  const [scSponsorPrice, setScSponsorPrice] = useState(150);
  const [scVisitCost, setScVisitCost] = useState(75); // EUR per visit
  const [scVisitsYear, setScVisitsYear] = useState(2);
  const [scInstallCost, setScInstallCost] = useState(100); // EUR one-time
  const [scHwOwned, setScHwOwned] = useState(true); // we own hardware
  const [scMinPrice, setScMinPrice] = useState(1000); // RON min, includes 1 display

  // Target
  const [targetNet, setTargetNet] = useState(5000);
  const [tab, setTab] = useState("client");

  const calc = useMemo(() => {
    const srvEUR = (sup+ver+bak+dom)*D.usdEur + con;
    const teamEUR = sDev*nDev + sTech*nTech + sSales*nSales + sAdmin*nAdmin;
    const ttsEUR = (tts>30?22:tts>0?5:0)*D.usdEur;
    const fixEUR = srvEUR + teamEUR + ttsEUR;

    // ═══ SINGLE CLIENT SIMULATOR ═══
    const scKids = scGrp * scKid;
    const scParents = scKids * 2;
    const scStaff = scGrp + 2;
    const scUsers = scParents + scStaff;

    // Costs for this one client
    const scShareFixed = fixEUR / Math.max(cl, 1); // their share of fixed costs
    const scHwDspMonth = scHwOwned ? (hwDisplayEUR * scDsp) / HW_LIFE : 0;
    const scHwInkMonth = scHwOwned ? (INKY_EUR * scInk) / HW_LIFE : 0;
    const scVisitMonth = (scVisitCost * scVisitsYear) / 12;
    const scInstallMonth = scInstallCost / 12; // amortized over first year
    const scTotalCostEUR = scShareFixed + scHwDspMonth + scHwInkMonth + scVisitMonth + scInstallMonth;
    const scTotalCostRON = scTotalCostEUR * eur;

    // Revenue from this client
    const scSubRON = Math.max(scMinPrice, scTotalCostEUR * (1+tax/100) * (1+margin/100) * eur);

    // Stripe revenue: parents pay contribution through Stripe, we take our %
    const scStripeVolume = scKids * scContrib; // total lei/month through Stripe
    const scStripeRevRON = scStripeVolume * (scStripeOur / 100);

    // Sponsor revenue
    const scSponsorRevRON = scSponsors * scSponsorPrice;

    // Total monthly revenue from this client
    const scTotalRevRON = scSubRON + scStripeRevRON + scSponsorRevRON;
    const scProfitRON = scTotalRevRON - scTotalCostRON;

    // HW upfront
    const scHwUpfrontEUR = scHwOwned ? (hwDisplayEUR * scDsp + INKY_EUR * scInk + scInstallCost) : scInstallCost;

    // Subscription breakdown per copil
    const scSubPerKid = scSubRON / Math.max(scKids, 1);

    // What subscription covers vs add-ons
    const scBaseSubRON = scMinPrice; // 1000 RON includes 1 display
    const scExtraDisplayRON = Math.max(0, scDsp - 1) * (hwDisplayEUR / HW_LIFE) * (1+tax/100) * (1+margin/100) * eur;
    const scInkyAddonRON = scInk * (INKY_EUR / HW_LIFE) * (1+tax/100) * (1+margin/100) * eur;

    // ═══ FLEET (simplified) ═══
    const flKids = grp * kidG;
    const flTaxMul = (1+tax/100) * (1+margin/100);
    const flPerC = fixEUR / Math.max(cl, 1);
    const flHwD = (hwDisplayEUR * dsp) / HW_LIFE;
    const flHwI = (INKY_EUR * ink) / HW_LIFE;

    const flBaza = flPerC * flTaxMul * eur;
    const flAviz = (flPerC + flHwD) * flTaxMul * eur;
    const flComp = (flPerC + flHwD + flHwI) * flTaxMul * eur;

    const flBazaEnf = Math.max(flBaza, scMinPrice);
    const flAvizEnf = Math.max(flAviz, scMinPrice);
    const flCompEnf = Math.max(flComp, scMinPrice);

    const flRevComp = flCompEnf * cl;
    const flCostComp = fixEUR * eur + (flHwD + flHwI) * eur * cl;
    const flProfComp = flRevComp - flCostComp;

    // Stripe fleet
    const flStripe = cl * flKids * scContrib * (scStripeOur / 100);

    // Target income
    const tGross = targetNet / (1 - tax / 100);
    const tNeeded = (fixEUR + tGross) * eur;
    const tBaza = tNeeded / Math.max(cl, 1);
    const tComp = (tNeeded + (flHwD + flHwI) * eur * cl) / Math.max(cl, 1);

    const beBaza = flBazaEnf > 0 ? Math.ceil(fixEUR * eur / flBazaEnf) : 999;

    return {
      srvEUR, teamEUR, ttsEUR, fixEUR,
      scKids, scParents, scStaff, scUsers,
      scShareFixed, scHwDspMonth, scHwInkMonth, scVisitMonth, scInstallMonth,
      scTotalCostEUR, scTotalCostRON,
      scSubRON, scStripeVolume, scStripeRevRON, scSponsorRevRON,
      scTotalRevRON, scProfitRON, scHwUpfrontEUR, scSubPerKid,
      scBaseSubRON, scExtraDisplayRON, scInkyAddonRON,
      flKids, flBaza: flBazaEnf, flAviz: flAvizEnf, flComp: flCompEnf,
      flRevComp, flCostComp, flProfComp, flStripe,
      tBaza, tComp, beBaza,
    };
  }, [eur,cl,grp,kidG,dsp,ink,tts,tax,margin,sDev,nDev,sTech,nTech,sSales,nSales,sAdmin,nAdmin,sup,ver,con,dom,bak,scGrp,scKid,scDsp,scInk,scContrib,scStripeOur,scSponsors,scSponsorPrice,scVisitCost,scVisitsYear,scInstallCost,scHwOwned,scMinPrice,targetNet]);

  const C = { bg:"#0a0f1a", card:"#131b2e", brd:"#1e2d4a", a:"#3b82f6", g:"#10b981", o:"#f59e0b", r:"#ef4444", p:"#8b5cf6", cy:"#06b6d4", pk:"#ec4899",
    t:"#e2e8f0", m:"#94a3b8", d:"#4a5568", mn:"'JetBrains Mono','Fira Code',monospace" };

  const Box = ({ch, title, color=C.a, s={}}) => (
    <div style={{background:C.card, borderRadius:10, border:`1px solid ${C.brd}`, padding:12, ...s}}>
      {title && <div style={{fontSize:11, fontWeight:700, color, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em"}}>{title}</div>}
      {ch}
    </div>
  );

  const Sl = ({l, v, fn, mn, mx, st=1, u=""}) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(String(v));
    const commit = () => {
      const n = parseFloat(draft);
      if (!isNaN(n)) fn(Math.min(mx, Math.max(mn, n)));
      setEditing(false);
    };
    const nudge = (dir) => {
      const next = Math.min(mx, Math.max(mn, +(v + dir * st).toFixed(6)));
      fn(next);
    };
    return (
      <div style={{marginBottom:10}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3}}>
          <span style={{fontSize:10, color:C.m, flex:1}}>{l}</span>
          <div style={{display:"flex", alignItems:"center", gap:3}}>
            <button onClick={()=>nudge(-1)} style={{width:20, height:20, borderRadius:4, border:`1px solid ${C.brd}`, background:C.card, color:C.m, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1}}>-</button>
            {editing ? (
              <input autoFocus value={draft} onChange={e=>setDraft(e.target.value)}
                onBlur={commit} onKeyDown={e=>{if(e.key==="Enter")commit(); if(e.key==="Escape")setEditing(false);}}
                style={{width:64, padding:"2px 4px", borderRadius:4, border:`1px solid ${C.a}`, background:C.bg, color:C.t, fontSize:12, fontWeight:700, fontFamily:C.mn, textAlign:"right", outline:"none"}} />
            ) : (
              <span onClick={()=>{setDraft(String(v)); setEditing(true);}}
                style={{fontSize:12, fontWeight:700, color:C.t, fontFamily:C.mn, cursor:"text", padding:"2px 6px", borderRadius:4, background:`${C.a}10`, minWidth:50, textAlign:"right", display:"inline-block"}}
                title="Click to type a value">{typeof v==="number"?v.toLocaleString("ro-RO"):v}{u}</span>
            )}
            <button onClick={()=>nudge(1)} style={{width:20, height:20, borderRadius:4, border:`1px solid ${C.brd}`, background:C.card, color:C.m, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", lineHeight:1}}>+</button>
          </div>
        </div>
        <input type="range" min={mn} max={mx} step={st} value={v} onChange={e=>fn(+e.target.value)}
          style={{width:"100%", accentColor:C.a, height:8, cursor:"pointer", borderRadius:4, WebkitAppearance:"none", appearance:"none", background:`linear-gradient(to right, ${C.a} ${((v-mn)/(mx-mn))*100}%, ${C.brd} ${((v-mn)/(mx-mn))*100}%)`}} />
        <div style={{display:"flex", justifyContent:"space-between", marginTop:1}}>
          <span style={{fontSize:8, color:C.d}}>{mn}{u}</span>
          <span style={{fontSize:8, color:C.d}}>{mx}{u}</span>
        </div>
      </div>
    );
  }
  );

  const Metric = ({l, v, c=C.a, sub}) => (
    <div style={{padding:"6px 8px", background:`${c}10`, borderRadius:6, border:`1px solid ${c}20`, textAlign:"center", flex:1, minWidth:80}}>
      <div style={{fontSize:7, color:C.d, textTransform:"uppercase"}}>{l}</div>
      <div style={{fontSize:12, fontWeight:700, color:c, fontFamily:C.mn}}>{v}</div>
      {sub && <div style={{fontSize:8, color:C.d}}>{sub}</div>}
    </div>
  );

  const Row = ({l, v, c=C.t, bold}) => (
    <div style={{display:"flex", justifyContent:"space-between", padding:"2px 0", borderBottom:`1px solid ${C.brd}`}}>
      <span style={{fontSize:9, color:C.m}}>{l}</span>
      <span style={{fontSize:10, fontWeight:bold?700:500, color:c, fontFamily:C.mn}}>{v}</span>
    </div>
  );

  const tabs = [{id:"client",l:"Un Client Nou",i:"👤"},{id:"fleet",l:"Flota",i:"🏢"},{id:"target",l:"Venit Tinta",i:"🎯"},{id:"sponsors",l:"Research Sponsori",i:"📊"},{id:"hw",l:"Hardware",i:"🔧"}];

  return (
    <div style={{background:C.bg, color:C.t, fontFamily:"'Inter','Segoe UI',sans-serif", minHeight:"100vh", padding:12}}>
      <style>{`
        input[type=range] { -webkit-appearance: none; appearance: none; height: 8px; border-radius: 4px; outline: none; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #1e293b; box-shadow: 0 0 4px rgba(59,130,246,0.4); }
        input[type=range]::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 2px solid #1e293b; box-shadow: 0 0 4px rgba(59,130,246,0.4); }
        input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); background: #60a5fa; }
        input[type=range]::-moz-range-thumb:hover { transform: scale(1.2); background: #60a5fa; }
        input[type=range]::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; }
        input[type=range]::-moz-range-track { height: 8px; border-radius: 4px; background: #1e2d4a; }
      `}</style>
      <div style={{maxWidth:980, margin:"0 auto"}}>
        <div style={{textAlign:"center", marginBottom:10}}>
          <div style={{fontSize:9, color:C.r, fontWeight:700, letterSpacing:"0.12em"}}>STRICT INTERN v3</div>
          <div style={{fontSize:18, fontWeight:800}}>InfoDisplay for Kids — Calculator Costuri</div>
          <div style={{fontSize:10, color:C.d}}>Contract 12 luni | Minim {f(scMinPrice)} RON/luna (incl. 1 display) | 1€ = {eur} RON</div>
        </div>

        <div style={{display:"flex", gap:3, marginBottom:10, flexWrap:"wrap"}}>
          {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"5px 12px", borderRadius:7, border:`1px solid ${tab===t.id?C.a:C.brd}`, background:tab===t.id?`${C.a}20`:"transparent", color:tab===t.id?C.a:C.m, fontSize:10, fontWeight:600, cursor:"pointer"}}>{t.i} {t.l}</button>)}
        </div>

        {/* ═══ SINGLE CLIENT ═══ */}
        {tab==="client" && (<div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:10}}>
            <Box title="Configurare Client" color={C.a} ch={<>
              <Sl l="Grupe/clase" v={scGrp} fn={setScGrp} mn={1} mx={30} />
              <Sl l="Copii/grupa" v={scKid} fn={setScKid} mn={5} mx={35} />
              <Sl l="Displayuri" v={scDsp} fn={setScDsp} mn={0} mx={5} />
              <Sl l="Inky fizici" v={scInk} fn={setScInk} mn={0} mx={30} />
              <Sl l="Pret minim RON/luna" v={scMinPrice} fn={setScMinPrice} mn={500} mx={3000} u=" lei" />
              <div style={{display:"flex", gap:6, marginTop:4}}>
                <button onClick={()=>setScHwOwned(true)} style={{flex:1, padding:"4px", borderRadius:5, border:`1px solid ${scHwOwned?C.g:C.brd}`, background:scHwOwned?`${C.g}15`:"transparent", color:scHwOwned?C.g:C.m, fontSize:9, cursor:"pointer"}}>HW al nostru</button>
                <button onClick={()=>setScHwOwned(false)} style={{flex:1, padding:"4px", borderRadius:5, border:`1px solid ${!scHwOwned?C.o:C.brd}`, background:!scHwOwned?`${C.o}15`:"transparent", color:!scHwOwned?C.o:C.m, fontSize:9, cursor:"pointer"}}>HW al clientului</button>
              </div>
            </>} />
            <Box title="Venituri Pasive" color={C.g} ch={<>
              <Sl l="Contributie medie hrana lei/copil/luna" v={scContrib} fn={setScContrib} mn={0} mx={600} u=" lei" />
              <Sl l="Comision nostru Stripe (%)" v={scStripeOur} fn={setScStripeOur} mn={0} mx={5} st={0.1} u="%" />
              <div style={{padding:6, background:`${C.g}08`, borderRadius:5, marginBottom:8}}>
                <div style={{fontSize:8, color:C.d}}>Volum lunar Stripe</div>
                <div style={{fontSize:13, fontWeight:700, color:C.g, fontFamily:C.mn}}>{f(calc.scStripeVolume)} lei</div>
                <div style={{fontSize:9, color:C.m}}>Comision nostru {scStripeOur}%: <strong style={{color:C.g}}>{f(calc.scStripeRevRON)} lei/luna</strong></div>
                <div style={{fontSize:8, color:C.d}}>Stripe ia 1.4%+0.25€ separat (platit de parinte)</div>
              </div>
              <Sl l="Nr. sponsori locali" v={scSponsors} fn={setScSponsors} mn={0} mx={10} />
              <Sl l="Pret/sponsor/luna" v={scSponsorPrice} fn={setScSponsorPrice} mn={50} mx={500} u=" lei" />
              <div style={{fontSize:9, color:C.m}}>Sponsor rev: <strong style={{color:C.o}}>{f(calc.scSponsorRevRON)} lei/luna</strong></div>
            </>} />
            <Box title="Costuri Fizice" color={C.o} ch={<>
              <Sl l="Cost vizita (EUR)" v={scVisitCost} fn={setScVisitCost} mn={0} mx={300} u=" EUR" />
              <Sl l="Vizite/an" v={scVisitsYear} fn={setScVisitsYear} mn={0} mx={12} />
              <Sl l="Cost instalare (EUR)" v={scInstallCost} fn={setScInstallCost} mn={0} mx={500} u=" EUR" />
              <Sl l="Flota totala (pt share costuri fixe)" v={cl} fn={setCl} mn={1} mx={500} />
              <Sl l="Taxe %" v={tax} fn={setTax} mn={10} mx={50} u="%" />
              <Sl l="Marja %" v={margin} fn={setMargin} mn={0} mx={60} u="%" />
              <Sl l="EUR/RON" v={eur} fn={setEur} mn={4.5} mx={5.5} st={0.01} />
            </>} />
          </div>

          {/* Summary metrics */}
          <div style={{display:"flex", gap:5, marginBottom:10, flexWrap:"wrap"}}>
            <Metric l="Copii" v={calc.scKids} c={C.a} />
            <Metric l="Conturi" v={calc.scUsers} c={C.p} />
            <Metric l="Cost intern" v={`${f(calc.scTotalCostRON)} lei`} c={C.r} sub={`${fe(calc.scTotalCostEUR)} EUR`} />
            <Metric l="Abonament" v={`${f(calc.scSubRON)} lei`} c={C.a} sub={`${fe(calc.scSubPerKid)} lei/copil`} />
            <Metric l="+ Stripe" v={`${f(calc.scStripeRevRON)} lei`} c={C.g} />
            <Metric l="+ Sponsori" v={`${f(calc.scSponsorRevRON)} lei`} c={C.o} />
            <Metric l="TOTAL REV" v={`${f(calc.scTotalRevRON)} lei`} c={C.cy} />
            <Metric l="PROFIT" v={`${f(calc.scProfitRON)} lei`} c={calc.scProfitRON>0?C.g:C.r} />
          </div>

          {/* Detailed P&L */}
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
            <Box title="Costuri lunare acest client" color={C.r} ch={<>
              <Row l="Share costuri fixe (server+echipa+TTS)" v={`${fe(calc.scShareFixed)} EUR = ${f(calc.scShareFixed*eur)} lei`} />
              <Row l={`Hardware display amortizat (${scDsp}x/${HW_LIFE}luni)`} v={`${fe(calc.scHwDspMonth)} EUR = ${f(calc.scHwDspMonth*eur)} lei`} />
              <Row l={`Inky amortizat (${scInk}x/${HW_LIFE}luni)`} v={`${fe(calc.scHwInkMonth)} EUR = ${f(calc.scHwInkMonth*eur)} lei`} />
              <Row l={`Mentenanta (${scVisitsYear} vizite x ${scVisitCost}€/12)`} v={`${fe(calc.scVisitMonth)} EUR = ${f(calc.scVisitMonth*eur)} lei`} />
              <Row l="Instalare amortizata (12 luni)" v={`${fe(calc.scInstallMonth)} EUR = ${f(calc.scInstallMonth*eur)} lei`} />
              <Row l="TOTAL COST LUNAR" v={`${f(calc.scTotalCostRON)} lei (${fe(calc.scTotalCostEUR)} EUR)`} c={C.r} bold />
              <div style={{marginTop:6, fontSize:9, color:C.o}}>
                HW upfront la instalare: <strong>{fe(calc.scHwUpfrontEUR)} EUR = {f(calc.scHwUpfrontEUR * eur)} lei</strong>
              </div>
            </>} />

            <Box title="Venituri lunare de la acest client" color={C.g} ch={<>
              <Row l={`Abonament (minim ${f(scMinPrice)} lei incl. 1 display)`} v={`${f(calc.scSubRON)} lei`} c={C.a} />
              <Row l="Compunere abonament:" v="" />
              <Row l={`  Baza software (${f(scMinPrice)} lei incl. 1 display)`} v={`${f(calc.scBaseSubRON)} lei`} c={C.a} />
              <Row l={`  + ${Math.max(0,scDsp-1)} display(uri) extra`} v={`+${f(calc.scExtraDisplayRON)} lei`} c={calc.scExtraDisplayRON>0?C.o:C.d} />
              <Row l={`  + ${scInk} Inky add-on`} v={`+${f(calc.scInkyAddonRON)} lei`} c={calc.scInkyAddonRON>0?C.p:C.d} />
              <div style={{height:6}} />
              <Row l={`Comision Stripe ${scStripeOur}% din ${f(calc.scStripeVolume)} lei`} v={`+${f(calc.scStripeRevRON)} lei`} c={C.g} />
              <Row l={`Sponsori (${scSponsors} x ${scSponsorPrice} lei)`} v={`+${f(calc.scSponsorRevRON)} lei`} c={C.o} />
              <Row l="TOTAL VENITURI LUNARE" v={`${f(calc.scTotalRevRON)} lei`} c={C.g} bold />
              <div style={{marginTop:4, padding:6, background:calc.scProfitRON>0?`${C.g}10`:`${C.r}10`, borderRadius:5}}>
                <Row l="PROFIT NET lunar" v={`${f(calc.scProfitRON)} lei (${fe(calc.scProfitRON/eur)} EUR)`} c={calc.scProfitRON>0?C.g:C.r} bold />
                <div style={{fontSize:8, color:C.d, marginTop:2}}>x12 luni contract = {f(calc.scProfitRON * 12)} lei/an | ROI la {calc.scHwUpfrontEUR>0? f((calc.scHwUpfrontEUR*eur)/(calc.scProfitRON>0?calc.scProfitRON:1),1) + " luni" : "instant (fara HW)"}</div>
              </div>
            </>} />
          </div>
        </div>)}

        {/* ═══ FLEET ═══ */}
        {tab==="fleet" && (<div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10}}>
            <Box title="Salarii (EUR)" color={C.o} ch={<>
              <Sl l="Programator" v={sDev} fn={setSDev} mn={0} mx={8000} u=" EUR" />
              <Sl l="x" v={nDev} fn={setNDev} mn={0} mx={5} st={0.5} u="x" />
              <Sl l="Tehnician" v={sTech} fn={setSTech} mn={0} mx={3000} u=" EUR" />
              <Sl l="x" v={nTech} fn={setNTech} mn={0} mx={5} st={0.5} u="x" />
              <Sl l="Vanzari" v={sSales} fn={setSSales} mn={0} mx={4000} u=" EUR" />
              <Sl l="x" v={nSales} fn={setNSales} mn={0} mx={3} st={0.5} u="x" />
              <Sl l="Admin" v={sAdmin} fn={setSAdmin} mn={0} mx={2000} u=" EUR" />
              <Sl l="x" v={nAdmin} fn={setNAdmin} mn={0} mx={2} st={0.5} u="x" />
            </>} />
            <Box title="Server + Fleet" color={C.cy} ch={<>
              <Sl l="Supabase $" v={sup} fn={setSup} mn={0} mx={50} />
              <Sl l="Vercel $" v={ver} fn={setVer} mn={0} mx={50} />
              <Sl l="Contabo EUR" v={con} fn={setCon} mn={0} mx={30} />
              <Sl l="Domain+SSL $" v={dom} fn={setDom} mn={0} mx={10} />
              <Sl l="Backup $" v={bak} fn={setBak} mn={0} mx={20} />
              <Sl l="Grupe/client" v={grp} fn={setGrp} mn={1} mx={30} />
              <Sl l="Copii/grupa" v={kidG} fn={setKidG} mn={5} mx={35} />
              <Sl l="Display/client" v={dsp} fn={setDsp} mn={0} mx={5} />
              <Sl l="Inky/client" v={ink} fn={setInk} mn={0} mx={30} />
              <Sl l="TTS min/luna" v={tts} fn={setTts} mn={0} mx={200} u="min" />
            </>} />
          </div>
          <div style={{display:"flex", gap:5, marginBottom:10}}>
            <Metric l="Fix/luna" v={`${f(calc.fixEUR*eur)} lei`} c={C.r} sub={`${fe(calc.fixEUR)} EUR`} />
            <Metric l="Echipa" v={`${f(calc.teamEUR)} EUR`} c={C.o} />
            <Metric l="Server" v={`${fe(calc.srvEUR)} EUR`} c={C.cy} />
            <Metric l="Break-even" v={`${calc.beBaza} cl.`} c={C.g} />
            <Metric l="Stripe flota" v={`${f(calc.flStripe)} lei`} c={C.g} sub="comision/luna" />
          </div>
          <Box title="Scenarii pret minim (cost + taxe + marja)" color={C.a} ch={
            <table style={{width:"100%", borderCollapse:"collapse", fontSize:9}}>
              <thead><tr style={{borderBottom:`2px solid ${C.brd}`}}>
                {["Cl.", "Cost/cl", "BAZA", "AVIZIER", "COMPLET", "/copil C", "Profit C/luna", "+Stripe/luna"].map(h=><th key={h} style={{padding:"3px 2px", textAlign:"right", color:C.m, fontSize:8}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {[1,3,5,10,20,30,50,75,100,200,300].map(n=>{
                  const fix=calc.fixEUR; const pc=fix/n;
                  const hwD=(hwDisplayEUR*dsp)/HW_LIFE; const hwI=(INKY_EUR*ink)/HW_LIFE;
                  const mul=(1+tax/100)*(1+margin/100);
                  const b=Math.max(pc*mul*eur,scMinPrice);
                  const a=Math.max((pc+hwD)*mul*eur,scMinPrice);
                  const c=Math.max((pc+hwD+hwI)*mul*eur,scMinPrice);
                  const kids=grp*kidG; const prof=c*n-fix*eur-(hwD+hwI)*eur*n;
                  const stripe=n*kids*scContrib*(scStripeOur/100);
                  return (<tr key={n} style={{borderBottom:`1px solid ${C.brd}`, background:n===cl?`${C.a}12`:undefined}}>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, fontWeight:n===cl?700:400, color:n===cl?C.a:C.t}}>{n}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.d}}>{fe(pc)} EUR</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.a}}>{f(b)}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.g}}>{f(a)}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.p}}>{f(c)}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.d}}>{fe(c/kids)}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:prof>0?C.g:C.r}}>{f(prof)}</td>
                    <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.g}}>{f(stripe)}</td>
                  </tr>);
                })}
              </tbody>
            </table>
          } />
        </div>)}

        {/* ═══ TARGET ═══ */}
        {tab==="target" && (<div>
          <Box title="Venit Net Tinta" color={C.cy} ch={<>
            <Sl l="Venit NET dorit EUR/luna" v={targetNet} fn={setTargetNet} mn={0} mx={30000} st={100} u=" EUR" />
            <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:10}}>
              <div style={{padding:8, background:`${C.cy}10`, borderRadius:6}}>
                <div style={{fontSize:8, color:C.d}}>NET</div>
                <div style={{fontSize:18, fontWeight:800, color:C.cy, fontFamily:C.mn}}>{f(targetNet)} EUR</div>
                <div style={{fontSize:11, color:C.m, fontFamily:C.mn}}>{f(targetNet*eur)} lei/luna</div>
              </div>
              <table style={{width:"100%", borderCollapse:"collapse", fontSize:9}}>
                <thead><tr style={{borderBottom:`2px solid ${C.brd}`}}>
                  {["Cl.", "BAZA lei", "COMPLET lei", "/copil", "x12"].map(h=><th key={h} style={{padding:"3px", textAlign:"right", color:C.m, fontSize:8}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {[5,10,20,30,50,75,100,200].map(n=>{
                    const gross=targetNet/(1-tax/100);
                    const needed=(calc.fixEUR+gross)*eur;
                    const hwD=(hwDisplayEUR*dsp)/HW_LIFE*eur*n;
                    const hwI=(INKY_EUR*ink)/HW_LIFE*eur*n;
                    const b=needed/n; const c=(needed+hwD+hwI)/n;
                    const kids=grp*kidG;
                    return (<tr key={n} style={{borderBottom:`1px solid ${C.brd}`, background:n===cl?`${C.a}12`:undefined}}>
                      <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, fontWeight:n===cl?700:400, color:n===cl?C.cy:C.t}}>{n}</td>
                      <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.a}}>{f(b)}</td>
                      <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.p}}>{f(c)}</td>
                      <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.d}}>{fe(c/kids)}</td>
                      <td style={{padding:"2px", textAlign:"right", fontFamily:C.mn, color:C.d}}>{f(c*12)}</td>
                    </tr>);
                  })}
                </tbody>
              </table>
            </div>
          </>} />
        </div>)}

        {/* ═══ SPONSORS RESEARCH ═══ */}
        {tab==="sponsors" && (<div>
          <Box title="Research: Ce castiga altii din sponsori/reclame pe display" color={C.pk} ch={<>
            <div style={{fontSize:10, color:C.m, marginBottom:10}}>Date reale din industrie (verificate martie 2026):</div>
            {[
              {cat:"Digital Signage Global", data:"Software: $8-20/ecran/luna. Piata totala: $29 mld (2025). 44% din bugetul OOH va fi digital pana in 2029.", src:"Market.us, OAAA, Posterbooking"},
              {cat:"Scoli cu Scoreboard Digital (SUA)", data:"95% din scoli recupereaza investitia in 12 luni din sponsorizari. Venituri: $10.000-25.000/an per ecran. Sponsori locali platesc ~$1.500/an.", src:"Next LED Signs, customer reports"},
              {cat:"Reclame pe ecran 32-55 inch", data:"$100-500/saptamana in retail. $50-1.000/luna in locatii mici. Pretul creste cu traficul: lobby hotel > hol scoala > coridor.", src:"Rise Vision, Nento, doPublicity"},
              {cat:"Model Tiered Sponsorship", data:"Bronze: £50/luna x7 sloturi = £350. Silver: £100/luna x2 = £200. Gold: £200/luna x1 = £200. Total: £750/luna/ecran.", src:"TrouDigital case study"},
              {cat:"ClassDojo (ed-tech comparabil)", data:"0 reclame. Monetizare: freemium $7.99/luna/parinte (ClassDojo Plus). Evaluat la $1.3B. 95% scoli US. NU vand advertising.", src:"TechCrunch, Contrary Research"},
              {cat:"Scoli - Digital Sponsorship", data:"'Digital slats': firme locale cumpara spatiu pe ecranul scolii. Acopera costul HW + venituri recurente. Limbaj: 'Community Partner' nu 'Ad'.", src:"Look Digital Signage, Next LED"},
            ].map((r,i)=>(
              <div key={i} style={{padding:8, background:i%2?`${C.pk}06`:"transparent", borderRadius:6, marginBottom:4, borderLeft:`3px solid ${C.pk}`}}>
                <div style={{fontSize:10, fontWeight:700, color:C.pk}}>{r.cat}</div>
                <div style={{fontSize:9, color:C.t, marginTop:2}}>{r.data}</div>
                <div style={{fontSize:8, color:C.d, marginTop:2}}>Sursa: {r.src}</div>
              </div>
            ))}
          </>} />
          <Box title="Ce inseamna realist pentru InfoDisplay Romania" color={C.o} s={{marginTop:8}} ch={<>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8}}>
              {[
                {sc:"Pesimist", sp:1, pr:100, note:"1 sponsor local (farmacie/patiserie langa scoala), prezenta minima pe display"},
                {sc:"Realist", sp:2, pr:200, note:"2 sponsori (farmacie + librarie/after-school), rotatia in banda stiri + avizier"},
                {sc:"Optimist", sp:4, pr:250, note:"4 sponsori activi, slot-uri pe avizier + in-app, rapoarte vizualizare"},
              ].map(s=>{
                const rev = s.sp * s.pr;
                return (
                  <div key={s.sc} style={{padding:10, background:C.card, borderRadius:8, border:`1px solid ${C.brd}`}}>
                    <div style={{fontSize:11, fontWeight:700, color:C.o}}>{s.sc}</div>
                    <div style={{fontSize:9, color:C.m}}>{s.sp} sponsori x {s.pr} lei</div>
                    <div style={{fontSize:16, fontWeight:800, color:C.g, fontFamily:C.mn}}>{f(rev)} lei/luna</div>
                    <div style={{fontSize:9, color:C.m}}>{f(rev*12)} lei/an</div>
                    <div style={{fontSize:8, color:C.d, marginTop:4}}>{s.note}</div>
                  </div>
                );
              })}
            </div>
            <div style={{marginTop:8, padding:8, background:`${C.r}08`, borderRadius:6, border:`1px solid ${C.r}20`}}>
              <div style={{fontSize:10, color:C.r, fontWeight:700}}>ATENTIE LEGALA (Legea 32/1994 Art. 5)</div>
              <div style={{fontSize:9, color:C.m}}>Sponsorul poate promova numele, marca sau imaginea. Este INTERZISA reclama comerciala mascata. Foloseste "Partener Comunitar" sau "Sustinut de", NU "Cumpara acum" sau preturi. Mesajul = recunoastere, nu oferta comerciala.</div>
            </div>
          </>} />
        </div>)}

        {/* ═══ HARDWARE ═══ */}
        {tab==="hw" && (<div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
          <Box title="Display (1 buc)" color={C.o} ch={<>
            {Object.entries(HW).map(([k,v])=><Row key={k} l={k.replace(/([A-Z])/g,' $1')} v={`${v} EUR = ${f(v*eur)} lei`} />)}
            <Row l="TOTAL" v={`${hwDisplayEUR} EUR = ${f(hwDisplayEUR*eur)} lei`} c={C.o} bold />
            <div style={{fontSize:8, color:C.d, marginTop:4}}>Amortizat {HW_LIFE} luni = {fe(hwDisplayEUR/HW_LIFE)} EUR/luna</div>
          </>} />
          <Box title="Inky + TTS" color={C.p} ch={<>
            <Row l="Inky (robot+speaker)" v={`${INKY_EUR} EUR = ${f(INKY_EUR*eur)} lei`} />
            <Row l="ElevenLabs Starter" v="$5/luna (30 min)" />
            <Row l="ElevenLabs Pro" v="$22/luna (100 min)" />
            <div style={{fontSize:9, color:C.d, marginTop:6}}>5 mascote: Inky (bufnita) + 4 animale noi. Cost shared intre toti clientii.</div>
          </>} />
        </div>)}

      </div>
    </div>
  );
}
