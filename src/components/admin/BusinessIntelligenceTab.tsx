import { useState, useReducer, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// INFODISPLAY BUSINESS INTELLIGENCE v5 — Tailwind + Design System
// ═══════════════════════════════════════════════════════════════════════════════

type VerticalKey = "kids" | "schools" | "medicine" | "living" | "culture" | "students" | "construction" | "workshops";
type TabId = "pricing" | "regulations" | "pestle" | "swot" | "moscow" | "timeline" | "pitch" | "features" | "whitelabel" | "modules";

interface Regulation {
  id: string; law: string; article: string; impact: string; color: string;
  obligation: string; howWeSolve: string;
}

// --- DATA (all data constants remain the same, just typed) ---
const REGULATIONS: Record<string, Regulation[]> = {
  kids: [
    { id:"r1", law:"ROFUIP 2024 (OME 5726/2024)", article:"Art.4(6)", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Regulamentul scolii TREBUIE afisat public prin orice forma de comunicare", howWeSolve:"Avizierul digital afiseaza automat regulamentul, CA, anunturi - vizibil 24/7, zero efort manual" },
    { id:"r2", law:"ROFUIP 2024", article:"Transparenta CA", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Deciziile CA TREBUIE afisate la avizier si/sau web", howWeSolve:"Director publica o data -> apare pe display, telefon, web. Un singur click." },
    { id:"r3", law:"ROFUIP 2024 + Contract Ed. 2025", article:"Obligatia k)", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Scoala TREBUIE sa informeze periodic parintii despre rezultate si comportament", howWeSolve:"Mesagerie profesor<->parinte, notificari push, rapoarte prezenta automate." },
    { id:"r4", law:"OMS 541/2025 + OMS 1582/2025", article:"Art.3-5", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Meniurile TREBUIE calculate nutritional pe grupe de varsta", howWeSolve:"Modulul Meniu calculeaza AUTOMAT calorii, proteine, lipide conform OMS." },
    { id:"r5", law:"OMS 541/2025", article:"Anexa 1", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Alimentele interzise NU au voie in meniuri", howWeSolve:"Sistemul valideaza automat ingredientele contra listei OMS interzise." },
    { id:"r6", law:"Legea 198/2023", article:"Contributie hrana", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Contributia se calculeaza pe zilele EFECTIVE de prezenta", howWeSolve:"Prezenta bifata -> contributie calculata automat. Secretara salveaza 4+ ore/luna." },
    { id:"r7", law:"GDPR Art.8 + ROFUIP", article:"Consimtamant", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Date copii = consimtamant parental EXPLICIT obligatoriu", howWeSolve:"Consimtamant digital din app. Audit trail complet, exportabil." },
    { id:"r8", law:"GDPR + ANSPDCP", article:"WhatsApp risc", impact:"RISC LEGAL", color:"#f59e0b", obligation:"WhatsApp pentru date copii = RISC GDPR. Amenzi de sute milioane EUR in UE.", howWeSolve:"Canal GDPR-compliant pe servere UE. WhatsApp = backup, nu canal principal." },
    { id:"r9", law:"ROFUIP 2024", article:"SIIIR", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Date elevilor TREBUIE raportate in SIIIR", howWeSolve:"Export prezenta direct din InfoDisplay spre SIIIR (viitor)." },
    { id:"r10", law:"ROFUIP 2024", article:"Art.75(10)", impact:"USURARE", color:"#3b82f6", obligation:"Secretariat accesibil parinti 8-9 si 16-18, min. 2 zile/sapt.", howWeSolve:"Parintele acceseaza ORICE 24/7 de pe telefon. Zero dependenta de program." },
  ],
  schools: [
    { id:"s1", law:"ROFUIP 2024 (OME 5726/2024)", article:"Art.4(6)", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Regulamentul scolii TREBUIE afisat public", howWeSolve:"Avizierul digital afiseaza regulamentul, CA, anunturi - vizibil 24/7." },
    { id:"s2", law:"ROFUIP 2024", article:"Transparenta CA", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Deciziile CA TREBUIE afisate la avizier si/sau web", howWeSolve:"Un click -> display + telefon + web. Transparenta totala." },
    { id:"s3", law:"ROFUIP 2024 + Contract Ed.", article:"Obligatia k)", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Informare periodica parinti despre rezultate si comportament", howWeSolve:"Mesagerie diriginte<->parinte, notificari push, rapoarte automate." },
    { id:"s4", law:"GDPR Art.8 + ROFUIP", article:"Consimtamant", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Date minori = consimtamant parental EXPLICIT", howWeSolve:"Consimtamant digital, audit trail, fara hartii pierdute." },
    { id:"s5", law:"GDPR + ANSPDCP", article:"WhatsApp risc", impact:"RISC LEGAL", color:"#f59e0b", obligation:"WhatsApp pentru date elevi = RISC GDPR", howWeSolve:"Canal GDPR-compliant. WhatsApp = backup automat, nu canal oficial." },
    { id:"s6", law:"ROFUIP 2024", article:"Art.75(10)", impact:"USURARE", color:"#3b82f6", obligation:"Secretariat accesibil parinti inclusiv 8-9 si 16-18", howWeSolve:"Parintele acceseaza totul 24/7 de pe telefon. Zero cozi la secretariat." },
    { id:"s7", law:"Legea Educatiei 198/2023", article:"Transparenta", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Transparenta in comunicarea cu comunitatea scolara", howWeSolve:"Avizier digital + revista scolara = transparenta dovedibila, auditabila." },
  ],
  medicine: [
    { id:"m1", law:"GDPR Art.9", article:"Categorii speciale", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Date medicale = categorie speciala GDPR. Protectie SPORITA obligatorie.", howWeSolve:"Display arata doar nr. anonime. Zero date medicale vizibile." },
    { id:"m2", law:"Legea 46/2003", article:"Drepturi pacient", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Pacientul TREBUIE informat despre servicii disponibile.", howWeSolve:"Display prezinta servicii, preturi, echipa, program - informare continua." },
    { id:"m3", law:"PIAS 2026", article:"Platforma nationala", impact:"OPORTUNITATE", color:"#22c55e", obligation:"Statul digitalizeaza programarile.", howWeSolve:"InfoDisplay complementeaza PIAS: ei fac programarea, noi experienta din sala." },
    { id:"m4", law:"Legea 95/2006", article:"Reforma sanatatii", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Unitati medicale trebuie sa afiseze drepturile pacientului.", howWeSolve:"Template-uri pe display: drepturi pacient, proceduri, numere urgenta." },
  ],
  living: [
    { id:"l1", law:"Legea 196/2018", article:"Avizier obligatoriu", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Lista cheltuieli TREBUIE afisata la avizierul blocului.", howWeSolve:"Avizier digital inlocuieste hartia. Lista se actualizeaza in timp real." },
    { id:"l2", law:"Legea 196/2018", article:"Transparenta financiara", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Administrator TREBUIE sa prezinte lunar situatia financiara.", howWeSolve:"Dashboard financiar pe display + mobil. Fiecare vede in timp real." },
    { id:"l3", law:"GDPR", article:"Date locatari", impact:"RISC LEGAL", color:"#f59e0b", obligation:"Lista cu NUME + SUME pe avizier public POATE INCALCA GDPR.", howWeSolve:"Display: totaluri anonime. NFC tap -> vezi DOAR datele TALE." },
  ],
  culture: [
    { id:"c1", law:"OG 51/1998", article:"Informare publica", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Institutii spectacol: obligatie informare public despre program.", howWeSolve:"Display lobby + program QR pe mobil. Actualizare instant." },
  ],
  students: [
    { id:"st1", law:"Legea 199/2023", article:"Transparenta", impact:"PRINCIPIU", color:"#3b82f6", obligation:"Universitati: comunicare deschisa si transparenta.", howWeSolve:"Avizier digital campus + management cozi secretariat." },
  ],
  construction: [
    { id:"co1", law:"Legea 50/1991 + Ord. 63/1998", article:"Panou obligatoriu", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Santierele TREBUIE sa afiseze panou de identificare. Neafisare = amenda.", howWeSolve:"Display digital pe santier INLOCUIESTE panoul static." },
    { id:"co2", law:"Legea 10/1995", article:"Calitate constructii", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Documentatie calitate obligatorie pe toata durata executiei.", howWeSolve:"Template-uri digitale: procese verbale, receptii, situatii lucrari." },
    { id:"co3", law:"HG 300/2006", article:"SSM pe santier", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Afisare obligatorie regulament SSM, semnalizare zone periculoase.", howWeSolve:"Checklist-uri SSM digitale, semnatura electronica, alerte zilnice." },
    { id:"co4", law:"Ordinul 1943/2002", article:"Diriginte de santier", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Dirigintele supervizeaza executia si documentatia.", howWeSolve:"Dirigintele acceseaza totul din app: fotografii, situatii, PV-uri." },
  ],
  workshops: [
    { id:"w1", law:"OUG 195/2002", article:"Evidenta vehicule", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Dezmembrari auto: evidenta vehicule intrate + piese rezultate.", howWeSolve:"Fisa vehicul digitala: nr. inmatriculare -> piese catalogate." },
    { id:"w2", law:"GDPR", article:"Date clienti", impact:"OBLIGATORIU", color:"#ef4444", obligation:"Date clienti (CNP, nr. masina) trebuie protejate.", howWeSolve:"Acces pe baza de rol. Mecanicul vede doar fisa lucrarii." },
  ],
};

const PESTLE_DATA: Record<string, Record<string, string[]>> = {
  kids: {
    P:["ROFUIP 2024 impune comunicare digitala","PNRR aloca fonduri digitalizare","ISJ-uri pot recomanda/bloca adoptia"],
    E:["Buget stat minim - trebuie gratuit/ieftin","Parintii platesc contributie hrana","Fonduri EU pentru echipamente"],
    S:["Parinti millennials asteapta digital","Bunicii ridica copii - UI simpla","WhatsApp = standard de facto"],
    T:["Raspberry Pi ieftin si disponibil","Internet instabil rural - trebuie mod offline","QR codes mainstream post-COVID"],
    L:["ROFUIP avizier obligatoriu","OMS calcul nutritional","GDPR protectie sporita copii","Legea 198 contributie prezenta"],
    E2:["Zero hartie avizier","LED 30W consum minim","Reciclare e-waste"],
  },
  schools: {
    P:["ROFUIP 2024 impune comunicare digitala","PNRR digitalizare educatie","ISJ-uri pot recomanda adoptia"],
    E:["Scoli stat buget limitat","Economii 3.700 lei/luna per scoala","Kinderpedia 3.000-5.000 lei/luna - noi 10x mai ieftini"],
    S:["40% parinti rateaza anunturile pe hartie","92% parinti prefera comunicare digitala","Cadre didactice pierd 2-3h/zi pe comunicare manuala"],
    T:["Acelasi hardware Pi+ecran","QR codes + PWA = fara app de instalat","AI corecturi pentru revista scolara"],
    L:["ROFUIP avizier obligatoriu","GDPR protectie date minori","Contract educational transparenta"],
    E2:["Economie 1.000 lei/luna tiparire per scoala","Zero hartie avizier","Display LED consum minim"],
  },
  medicine: {
    P:["PIAS 2026 digitalizare","Colegiul Medicilor influenta","Fonduri EU sanatate"],
    E:["Clinici private = venituri reale","Dentare cele mai profitabile","Recesiune = mai putini pacienti"],
    S:["Pacienti tineri = experienta moderna","Timp asteptare = plangere #1","Medici varstnici rezistenti"],
    T:["Acelasi hardware Pi+ecran","QR check-in normal post-COVID","Integrare HIS = complex"],
    L:["GDPR Art.9 date medicale","Legea 46/2003 drepturi pacient","ANMDM publicitate servicii"],
    E2:["Fara reviste vechi = mai putin gunoi","Display inlocuieste hartie sala asteptare"],
  },
  living: {
    P:["Legea 196/2018 cadru legal","Primarii parteneri distributie","Admin profesionist vs voluntar"],
    E:["100.000 blocuri = piata mare fragmentata","Buget asociatie strans","Dezvoltatori noi = ecrane fara soft"],
    S:["Tineri doresc digital","Varstnici prefera hartia","Conflicte cheltuieli - transparenta ajuta"],
    T:["WiFi slab in holuri","NFC simplu pentru oricine","Vandalism risc - plexiglas"],
    L:["Legea 196 avizier obligatoriu","GDPR risc liste publice","Vot digital nereglementat"],
    E2:["Zero hartie intretinere","Estetica moderna lobby - valoare cladire"],
  },
  construction: {
    P:["Instabilitate sector - 40% firme mici in dificultate","ISC control obligatoriu","PNRR infrastructura = cerere crescuta"],
    E:["69% proiecte depasesc buget, 25% la termen","Lipsa muncitori calificati","Materiale fluctuatie preturi 20-30%/an"],
    S:["Muncitori prefera instructiuni clare vizuale","Bariera limba cu muncitori non-RO","Generatia tanara asteapta app nu hartie"],
    T:["Tablete rezistente la santier accesibile","4G acoperire buna pe santiere urbane","Foto geotagging standard pe telefoane"],
    L:["Legea 50/1991 panou obligatoriu","Legea 10/1995 calitate","HG 300/2006 SSM","Ordinul 1943/2002 diriginte"],
    E2:["Documentatie digitala = zero hartie","Fotografii progres = dovada mediu","Reducere deseuri prin planificare mai buna"],
  },
  workshops: {
    P:["RAR reglementeaza atelierele","ANPC protectie consumator","Digitalizare administratie - trend general"],
    E:["Atelier 3-5 mecanici: 25.000+ lei/luna venituri","Piese second-hand marja mare","Concurenta pe pret"],
    S:["Proprietari ateliere = hands-on, non-tehnici","Clienti vor transparenta","Recenzii Google = tot mai importante"],
    T:["QR pe raft = inventar simplu","Mediu dur: praf, ulei","SMS/WhatsApp pentru confirmare programari"],
    L:["OUG 195/2002 evidenta vehicule","GDPR date clienti","Protectie consumator - deviz obligatoriu"],
    E2:["Inventar digital = mai putin waste piese","Programare = mai putin timp masini in curte"],
  },
};

const SWOT_DATA: Record<string, Record<string, string[]>> = {
  kids: {
    S:["12 scoli live - PMF dovedit","Hardware fizic instalat = switching costs","QR+PIN fara email - bunici OK","Calcul OMS automat = unic","Contributii din prezenta = unic RO","TTS povesti AI romana","Video pipeline display+social","Sync WhatsApp bidirectional","Gratuit stat vs Kinderpedia 300+ lei"],
    W:["Cod legacy PHP - rebuild necesar","Bus factor 1 (un singur dev)","Fara app nativa (doar PWA)","Onboarding manual = nu scaleaza","Model venituri neclar pentru stat","Zero buget marketing"],
    O:["ROFUIP 2024 = tailwind regulatory","7.000+ gradinite, majoritatea fara digital","Kinderpedia vizeaza private - stat liber","Fonduri PNRR digitalizare","Parteneriat ISJ recomandare","Display fizic = switching costs imposibil de replicat"],
    T:["Kinderpedia coboara spre stat","ClassDojo localizeaza RO","Guvern construieste platforma gratuita","Shortage Raspberry Pi","Rezistenta cadrelor didactice"],
  },
  schools: {
    S:["Totul din Kids dovedit + orar avansat existent","Display fizic = unicitate vs Adservio/Kinderpedia","NU concuram pe catalog - complementari","QR cancelarie deja construit","Pret 5-10x sub Kinderpedia"],
    W:["Orar complex = mai multa logica de construit","Revista scolara avansata = feature nou","Print-on-demand = parteneriat necesitat","Scoli mari = onboarding mai complex"],
    O:["7.000+ scoli primare/gimnazii in RO","Studiul de piata arata economii 3.700 lei/luna","Primarii finanteaza din buget local","Adservio/EDUS dezamagesc - piata deschisa","Revista scolara = diferentiator emotional puternic"],
    T:["Kinderpedia coboara pret","Guvern construieste platforma gratuita","Birocratie SEAP = ciclu achizitie lung","Schimbari politice la primarie = buget taiat"],
  },
  medicine: {
    S:["Acelasi hardware = zero R&D extra","ARPU mare: 150-250 lei","Nicio concurenta clinici mici RO","Display = impact vizual imediat"],
    W:["Zero expertiza medicala","Zero relatii cabinete","Queue management neconstruit","Fara studii caz healthcare"],
    O:["15.000+ cabinete dentare RO","PIAS 2026 = awareness digital","Dentare investesc in marketing","Reducere timp asteptare perceput 35%"],
    T:["Healthcare IT enterprise coboara","Signage generic adauga template medicale","Breach date = catastrofa"],
  },
  construction: {
    S:["Nimeni nu serveste firme mici RO","Pret 10x mai mic ca Procore","Display pe santier = vizibilitate unica","Foto progres geotagged = dovedire"],
    W:["Zero experienta sector constructii","Produs complet de construit","Mediu dur = hw se fura/strica","Muncitori non-tehnici = UI ultra-simpla"],
    O:["69% proiecte depasesc buget - durere reala","40% firme mici in dificultate - necesitate","PNRR infrastructura = cerere","Niciun competitor low-cost localizat RO"],
    T:["PlanRadar coboara pret","Procore face versiune lite","Constructori rezistenti la schimbare","Furt/deteriorare hardware santier"],
  },
  workshops: {
    S:["Hardware simplu (Pi+ecran protejat)","Cost mic: max 500 lei/luna","Avizier atelier = vizibilitate","Inventar QR = simplu"],
    W:["Zero cunostinte domeniu","Produs de la zero","Proprietari non-tehnici","Piata necunoscuta"],
    O:["Atelier pilot pro bono = discovery","Dezmembrari = marja mare, inventar haotic","Nicio solutie localizata RO sub 100 EUR"],
    T:["Proprietari nu vad valoarea","Mediu dur = echipament se strica","Piata prea mica pentru ROI"],
  },
};

const MOSCOW_DATA: Record<string, Record<string, string[]>> = {
  kids: {
    must:["Rebuild complet pe Supabase/Next.js","Avizier digital functional","Meniu OMS cu calcul nutritional","Prezenta + contributii automate","QR auth fara email","Sync WhatsApp"],
    should:["PWA cu mod offline","Notificari push web","Consimtamant GDPR digital","Export SIIIR","App nativa minima"],
    could:["AI analitice pentru director","Integrare catalog electronic","Multi-limba","Video personalizat per grupa"],
    wont:["ERP scolar complet","Catalog note (Adservio)","Contabilitate avansata","LMS (Google Classroom)"],
  },
  schools: {
    must:["Avizier digital hol cu anunturi+orar","Orar avansat multi-clasa","Cancelarie QR per profesor","QR auth parinti","Mesagerie diriginte<->parinte","Sync WhatsApp"],
    should:["Revista scolara digitala","AI corecturi revista","Video-reportaje elevi","Notificari push","PWA offline","Galerie foto + documente"],
    could:["Print-on-demand revista","Integrare Adservio (API)","Multi-limba","Sondaje parinti digital","Export SIIIR"],
    wont:["Catalog note (Adservio)","LMS (Google Classroom)","Teme/portofoliu","Contabilitate scoala","ERP scolar complet"],
  },
  medicine: {
    must:["Queue management (coada digitala)","Display servicii + echipa","QR check-in mobil","GDPR-compliant"],
    should:["Notificare urmeaza randul","Analytics flux","Profil medici pe display","Template sfaturi sanatate"],
    could:["Integrare PIAS 2026","Booking online","Feedback satisfactie","Multi-locatie"],
    wont:["EHR/EMR","Facturare medicala","Integrare CNAS","Telemedicina"],
  },
  construction: {
    must:["Dashboard patron multi-santier","Taskuri zilnice per echipa/muncitor","Echipe: programare pe santiere","Costuri: tracking vs buget","Galerie foto progres geotagged","SSM: checklist zilnic","Template-uri ISC"],
    should:["Display pe santier","Notificari push muncitori","Raport saptamanal auto","Export PDF situatii","Pontaj digital"],
    could:["Integrare contabilitate","Gantt chart simplificat","Comparatie buget vs real","Weather alerts","Comunicare subcontractori"],
    wont:["BIM integration","CAD/proiectare","ERP enterprise","Planificare resurse avansata"],
  },
  workshops: {
    must:["Avizier atelier: masini azi","Inventar piese simplu (QR)","Programari clienti","Fisa vehicul"],
    should:["Facturare simpla","SMS/WhatsApp confirmare","Catalog piese online","Deviz estimativ"],
    could:["Comanda piese la furnizori","Analytics piese","Portal client","Integrare RAR"],
    wont:["ERP auto complet","Diagnoza OBD","Management flota","Asigurari auto"],
  },
};

const TIMELINE_DATA: Record<string, { q: string; desc: string; s: string }[]> = {
  kids: [
    { q:"Q1 2026", desc:"Rebuild core pe Supabase. Migrare 12 scoli.", s:"now" },
    { q:"Q2 2026", desc:"PWA offline. Notificari push. GDPR consent digital.", s:"next" },
    { q:"Q3 2026", desc:"Onboarding self-service. Scalare la 50 institutii.", s:"plan" },
    { q:"Q4 2026", desc:"SIIIR export. Multi-limba. Analytics director.", s:"plan" },
  ],
  schools: [
    { q:"Q2 2026", desc:"Toggle Schools din Kids. Orar avansat multi-clasa.", s:"next" },
    { q:"Q3 2026", desc:"Revista scolara MVP. Pilot 3 scoli.", s:"plan" },
    { q:"Q4 2026", desc:"AI corecturi. Video-reportaje. Studiu piata primarii.", s:"plan" },
    { q:"Q1 2027", desc:"Print-on-demand. SEAP achizitie. 20 scoli.", s:"plan" },
  ],
  medicine: [
    { q:"Q2 2026", desc:"Queue management MVP. Display servicii.", s:"next" },
    { q:"Q3 2026", desc:"QR check-in. Pilot 3-5 cabinete dentare.", s:"plan" },
    { q:"Q4 2026", desc:"Analytics. Notificari. Scalare 30 clinici.", s:"plan" },
  ],
  construction: [
    { q:"Q1 2026", desc:"Research cu firma pilot (20-50 ang, 3-5 santiere).", s:"now" },
    { q:"Q2 2026", desc:"MVP: dashboard patron + taskuri + foto progres.", s:"next" },
    { q:"Q3 2026", desc:"Costuri vs buget. SSM checklist. Pilot live.", s:"plan" },
    { q:"Q4 2026", desc:"Display santier. Template ISC. Pontaj digital.", s:"plan" },
  ],
  workshops: [
    { q:"Q2 2026", desc:"Discovery pro bono cu atelier pilot.", s:"next" },
    { q:"Q3 2026", desc:"MVP: avizier + inventar QR + programari.", s:"plan" },
    { q:"Q4 2026", desc:"Fisa vehicul. Facturare simpla. 5 ateliere.", s:"plan" },
  ],
};

const PITCH_DATA: Record<string, { title: string; slogan: string; pains: string[]; solutions: string[]; objections: [string, string][] }> = {
  kids: {
    title:"Holul gradinitei devine un hub de informare viu",
    slogan:"Doamna directoare, aveti 5 obligatii legale noi de comunicare. Noi le rezolvam pe toate cu un singur ecran.",
    pains:["Avizierul de pluta e ignorat - hartiile cad","Grup WhatsApp: 200 mesaje/zi - nimic nu se mai gaseste","Educatoarea pierde 2h/sapt tiparind meniuri si anunturi","Parintii NU STIU ce a mancat copilul","Secretara calculeaza contributii manual - 4+ ore/luna","Poze copii pe WhatsApp = RISC GDPR real","Directorul nu poate dovedi ca a afisat deciziile CA"],
    solutions:["Ecran in hol -> info la fiecare lasare/ridicare de copil","QR -> meniu, prezenta, mesaje - FARA APP de instalat","Educatoarea posteaza O DATA -> display, WhatsApp, Facebook","Meniu OMS automat (calorii, proteine pe grupe varsta)","Prezenta -> contributie calculata automat","Canal GDPR pe servere UE","Povesti AI la ora de somn -> engagement zilnic"],
    objections:[
      ["Folosim deja WhatsApp","WhatsApp e chat. Noi suntem informare OFICIALA - meniu, prezenta, documente, GDPR-compliant."],
      ["Nu ne permitem","GRATUIT pentru stat. Display hardware: 50-75 lei/luna chirie."],
      ["Educatoarele nu-s tehnice","Daca pot posta pe WhatsApp, pot folosi InfoDisplay. Un singur buton."],
      ["Avem Kinderpedia","Pune ecran in hol? Functioneaza fara email? Sync WhatsApp? Calculeaza contributii? Noi COMPLETAM."],
      ["Ne descurcam si fara","ROFUIP va obliga la comunicare publica. OMS la calcul nutritional. GDPR interzice WhatsApp."],
    ],
  },
  construction: {
    title:"Santierul organizat costa mai putin si termina mai repede",
    slogan:"69% din proiecte depasesc bugetul. Al dumneavoastra nu trebuie sa fie printre ele.",
    pains:["Nimeni nu stie exact cine lucreaza la ce","Costurile sunt intr-un Excel... sau in capul patronului","Subcontractorii vin cand vor","Fotografii de progres pe telefonul personal - se pierd","Situatiile de lucrari ISC se fac manual","SSM-ul e pe hartie intr-un dosar","Patronul suna 15 oameni dimineata"],
    solutions:["UN SINGUR ecran: toate santierele, echipele, costurile","Fiecare muncitor vede CE are de facut azi","Calendar drag-and-drop: echipe pe santiere","Materiale + manopera + subcontractori = cost REAL vs BUGET","Foto progres geotagged, organizate","Template-uri ISC + SSM + PV: completezi, semnezi digital","Display pe santier: taskuri zilei, echipe, alerte meteo"],
    objections:[
      ["Oamenii mei n-au telefoane bune","Functioneaza pe ORICE telefon cu internet - e un site web."],
      ["N-avem timp de softwareuri","Setup in 30 min. Apoi totul e drag-and-drop."],
      ["E scump","200-500 lei/luna per santier. O greseala de comanda = ROI instant."],
      ["Procore/PlanRadar exista deja","La 200-400 EUR/LUNA. Noi suntem 10x mai ieftin si 100% in romana."],
    ],
  },
};

const FEATURES_DATA: Record<string, [string, boolean][]> = {
  kids: [
    ["Avizier digital hol",true],["QR login fara email",true],["Meniu OMS nutritional",true],["Prezenta + contributii",true],
    ["Mesagerie prof<->parinte",true],["Anunturi banda stiri",true],["Galerie foto + documente",true],["Video MP4 gen",true],
    ["TTS povesti AI",true],["Sync WhatsApp",true],["Post Facebook auto",true],["Orar + cancelarie QR",true],
    ["GDPR consent digital",false],["PWA offline",false],["Notificari push",false],["Export SIIIR",false],
  ],
  schools: [
    ["Avizier digital hol",true],["QR auth + QR cancelarie",true],["Orar avansat multi-clasa",true],["Cancelarie QR per profesor",true],
    ["Mesagerie diriginte<->parinte",true],["Anunturi banda stiri",true],["Galerie foto + documente",true],["Video MP4 gen",true],
    ["WhatsApp + Facebook sync",true],["Prezenta",true],
    ["Revista scolara digitala",false],["AI corecturi revista",false],["Video-reportaje elevi",false],["Print-on-demand",false],
  ],
  construction: [
    ["Dashboard patron multi-santier",false],["Taskuri zilnice per echipa",false],["Echipe - calendar drag-drop",false],["Costuri tracking vs buget",false],
    ["Foto progres geotagged",false],["SSM checklist digital",false],["Template ISC situatii",false],["Display santier",false],
    ["Pontaj digital",false],["Raport saptamanal auto",false],["Inventar QR materiale",false],
  ],
  workshops: [
    ["Avizier atelier",false],["Inventar QR piese",false],["Calendar programari",false],["Fisa vehicul",false],
    ["Facturare simpla",false],["SMS confirmare",false],["Catalog piese online",false],
  ],
};

const CORE_MODULES = [
  "Display fizic (Pi + ecran + continut)",
  "QR auth (fara email, PIN/telefon)",
  "QR Cancelarie (redirectare la detalii avizier)",
  "Anunturi banda stiri",
  "Mesagerie (profesor<->parinte / receptie<->pacient)",
  "Galerie foto + documente",
  "NFC (extensie QR auth, activabila per client)",
  "Profil/Fisa (vehicul, pacient, elev etc.)",
];

const EXTRA_MODULES = [
  { id:"meniu", name:"M1: Meniu OMS", verts:["kids"] },
  { id:"prezenta", name:"M2: Prezenta + Contributii", verts:["kids","schools"] },
  { id:"queue", name:"M3: Queue / Coada digitala", verts:["medicine","students"] },
  { id:"orar", name:"M4: Orar avansat", verts:["schools"] },
  { id:"tts", name:"M5: TTS Povesti AI", verts:["kids"] },
  { id:"videogen", name:"M6: Video gen", verts:["kids","schools","medicine","culture"] },
  { id:"social", name:"M7: WhatsApp + Facebook sync", verts:["kids","schools"] },
  { id:"inventar", name:"M8: Inventar QR", verts:["workshops","construction","kids","schools","living"] },
  { id:"ssm", name:"M9: SSM / Documente legale", verts:["construction"] },
  { id:"revista", name:"M10: Revista scolara", verts:["schools"] },
  { id:"supratitrare", name:"M11: Supratitrare telefon", verts:["culture"] },
  { id:"taskuri", name:"M12: Taskuri", verts:["construction"] },
  { id:"echipe", name:"M13: Echipe", verts:["construction"] },
  { id:"costuri", name:"M14: Costuri", verts:["construction"] },
];

const VERTICAL_INFO: Record<VerticalKey, { name: string; icon: string; status: string; color: string }> = {
  kids: { name:"Kids (Grădinițe)", icon:"🏫", status:"LIVE", color:"hsl(217 91% 60%)" },
  schools: { name:"Schools (Școli)", icon:"📚", status:"EXTENSIE", color:"hsl(239 84% 67%)" },
  medicine: { name:"Medicine (Cabinete)", icon:"🏥", status:"CONCEPT", color:"hsl(0 84% 60%)" },
  living: { name:"Living (Blocuri)", icon:"🏢", status:"CONCEPT", color:"hsl(37 90% 51%)" },
  culture: { name:"Culture (Teatre)", icon:"🎭", status:"CONCEPT", color:"hsl(271 81% 56%)" },
  students: { name:"Students (Uni)", icon:"🎓", status:"CONCEPT", color:"hsl(189 94% 43%)" },
  construction: { name:"Construction", icon:"🏗️", status:"PRIORITAR", color:"hsl(142 71% 45%)" },
  workshops: { name:"Workshops (Ateliere)", icon:"🔧", status:"DISCOVERY", color:"hsl(25 5% 45%)" },
};

// --- STATE ---
interface BIState {
  activeTab: TabId;
  activeVertical: VerticalKey;
}

type BIAction =
  | { type: "SET_TAB"; payload: TabId }
  | { type: "SET_VERTICAL"; payload: VerticalKey };

function reducer(state: BIState, action: BIAction): BIState {
  switch (action.type) {
    case "SET_TAB": return { ...state, activeTab: action.payload };
    case "SET_VERTICAL": return { ...state, activeVertical: action.payload };
    default: return state;
  }
}

const TABS: { id: TabId; label: string }[] = [
  { id:"regulations", label:"Reglementări" },
  { id:"pestle", label:"PESTLE" },
  { id:"swot", label:"SWOT" },
  { id:"moscow", label:"MoSCoW" },
  { id:"timeline", label:"Timeline" },
  { id:"pitch", label:"Pitch Vânzări" },
  { id:"features", label:"Features" },
  { id:"modules", label:"Module" },
];

const VERTICAL_KEYS: VerticalKey[] = ["kids","schools","medicine","living","culture","students","construction","workshops"];

// Impact color mapping
const impactColorMap: Record<string, string> = {
  OBLIGATORIU: "text-destructive bg-destructive/10 border-destructive/30",
  "RISC LEGAL": "text-warning bg-warning/10 border-warning/30",
  OPORTUNITATE: "text-success bg-success/10 border-success/30",
  USURARE: "text-primary bg-primary/10 border-primary/30",
  PRINCIPIU: "text-accent bg-accent/10 border-accent/30",
};

// --- MAIN COMPONENT ---
export default function BusinessIntelligenceTab() {
  const [state, dispatch] = useReducer(reducer, { activeTab: "regulations", activeVertical: "kids" });
  const vk = state.activeVertical;
  const vi = VERTICAL_INFO[vk];

  const pestleLabels: Record<string, string> = { P:"Politic", E:"Economic", S:"Social", T:"Tehnologic", L:"Legislativ", E2:"Mediu" };
  const swotLabels = ["Puncte forte","Puncte slabe","Oportunități","Amenințări"];
  const swotKeys = ["S","W","O","T"];
  const moscowLabels = ["MUST HAVE","SHOULD HAVE","COULD HAVE","WON'T HAVE (acum)"];
  const moscowKeys = ["must","should","could","wont"];

  return (
    <div className="space-y-4 overflow-hidden">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">
          InfoDisplay <span className="text-primary">Business Intelligence</span>
          <span className="text-[10px] text-muted-foreground ml-1">v5</span>
        </h2>
        <p className="text-xs text-muted-foreground">8 verticale · PESTLE · SWOT · MoSCoW · Timeline · Pitch · Module</p>
      </div>

      {/* Vertical selector */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {VERTICAL_KEYS.map((key) => {
          const v = VERTICAL_INFO[key];
          const active = vk === key;
          return (
            <button
              key={key}
              onClick={() => dispatch({ type: "SET_VERTICAL", payload: key })}
              className={cn(
                "shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all whitespace-nowrap border",
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {v.icon} {key.charAt(0).toUpperCase() + key.slice(1)}
              <span className="ml-1 text-[7px] opacity-70">{v.status}</span>
            </button>
          );
        })}
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
            className={cn(
              "shrink-0 px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap",
              state.activeTab === tab.id
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-w-0">
        {/* REGULATIONS */}
        {state.activeTab === "regulations" && (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold">{vi.icon} Reglementări - {vi.name}</h3>
              <p className="text-[10px] text-muted-foreground">Fiecare reglementare = un argument de vânzare.</p>
            </div>
            {(REGULATIONS[vk] || []).length > 0 ? (
              (REGULATIONS[vk] || []).map((reg) => (
                <Card key={reg.id} className="border-l-4" style={{ borderLeftColor: reg.color }}>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-muted-foreground">{reg.law} - {reg.article}</span>
                      <Badge variant="outline" className={cn("text-[8px]", impactColorMap[reg.impact] || "")}>
                        {reg.impact}
                      </Badge>
                    </div>
                    <p className="text-[10px] font-semibold text-warning">{reg.obligation}</p>
                    <div className="text-[10px] text-success bg-success/5 p-2 rounded-md">
                      {reg.howWeSolve}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-muted-foreground text-xs py-8">Reglementări în curs de documentare.</p>
            )}
          </div>
        )}

        {/* PESTLE */}
        {state.activeTab === "pestle" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">{vi.icon} PESTLE - {vi.name}</h3>
            {PESTLE_DATA[vk] ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(PESTLE_DATA[vk]).map(([cat, items]) => (
                  <Card key={cat} className="bg-muted/30">
                    <CardContent className="p-3">
                      <p className="text-[9px] font-bold text-primary uppercase mb-2">{pestleLabels[cat] || cat}</p>
                      <div className="space-y-1">
                        {items.map((it, i) => (
                          <p key={i} className="text-[9px] text-foreground/80 bg-background/60 rounded px-2 py-1">{it}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : <p className="text-muted-foreground text-xs">PESTLE se construiește.</p>}
          </div>
        )}

        {/* SWOT */}
        {state.activeTab === "swot" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">{vi.icon} SWOT - {vi.name}</h3>
            {SWOT_DATA[vk] ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {swotKeys.map((sk, idx) => {
                  const items = SWOT_DATA[vk]?.[sk] || [];
                  const colorClasses = [
                    "border-success/30 bg-success/5",
                    "border-destructive/30 bg-destructive/5",
                    "border-primary/30 bg-primary/5",
                    "border-warning/30 bg-warning/5"
                  ];
                  const textClasses = ["text-success","text-destructive","text-primary","text-warning"];
                  return (
                    <Card key={sk} className={cn("border", colorClasses[idx])}>
                      <CardContent className="p-3">
                        <p className={cn("text-[9px] font-bold uppercase mb-2", textClasses[idx])}>{swotLabels[idx]}</p>
                        <div className="space-y-1">
                          {items.map((it, i) => (
                            <p key={i} className="text-[9px] text-foreground/80 bg-background/60 rounded px-2 py-1">{it}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-xs">SWOT se construiește.</p>}
          </div>
        )}

        {/* MoSCoW */}
        {state.activeTab === "moscow" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">{vi.icon} MoSCoW - {vi.name}</h3>
            {MOSCOW_DATA[vk] ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {moscowKeys.map((mk, idx) => {
                  const items = MOSCOW_DATA[vk]?.[mk] || [];
                  const dots = ["🔴","🟡","🔵","⚫"];
                  const colorClasses = [
                    "border-destructive/30 bg-destructive/5",
                    "border-warning/30 bg-warning/5",
                    "border-primary/30 bg-primary/5",
                    "border-border bg-muted/30"
                  ];
                  const textClasses = ["text-destructive","text-warning","text-primary","text-muted-foreground"];
                  return (
                    <Card key={mk} className={cn("border", colorClasses[idx])}>
                      <CardContent className="p-3">
                        <p className={cn("text-[9px] font-bold mb-2", textClasses[idx])}>{moscowLabels[idx]}</p>
                        <div className="space-y-1">
                          {items.map((it, i) => (
                            <p key={i} className="text-[8px] text-foreground/80 bg-background/60 rounded px-2 py-1">{dots[idx]} {it}</p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-xs">MoSCoW se construiește.</p>}
          </div>
        )}

        {/* TIMELINE */}
        {state.activeTab === "timeline" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">{vi.icon} Timeline - {vi.name}</h3>
            {TIMELINE_DATA[vk] ? (
              <div className="relative pl-6">
                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
                {TIMELINE_DATA[vk].map((t, i) => {
                  const dotClass = t.s === "now" ? "bg-success" : t.s === "next" ? "bg-primary" : "bg-muted-foreground";
                  const textClass = t.s === "now" ? "text-success" : t.s === "next" ? "text-primary" : "text-muted-foreground";
                  return (
                    <div key={i} className="relative mb-4">
                      <div className={cn("absolute -left-[14px] top-1 w-2.5 h-2.5 rounded-full border-2 border-background", dotClass)} />
                      <p className={cn("text-xs font-bold", textClass)}>
                        {t.q} {t.s === "now" && " ← ACUM"}{t.s === "next" && " ← URMĂTORUL"}
                      </p>
                      <p className="text-[10px] text-foreground/80">{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            ) : <p className="text-muted-foreground text-xs">Timeline se construiește.</p>}
          </div>
        )}

        {/* PITCH */}
        {state.activeTab === "pitch" && (
          <div className="space-y-4">
            {PITCH_DATA[vk] ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-primary italic">{PITCH_DATA[vk].title}</h3>
                  <Card className="mt-2 border-primary/30 bg-primary/5">
                    <CardContent className="p-3">
                      <p className="text-xs text-primary font-semibold italic">{PITCH_DATA[vk].slogan}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-destructive uppercase mb-2">Dureri actuale</p>
                  <div className="space-y-1">
                    {PITCH_DATA[vk].pains.map((p, i) => (
                      <p key={i} className="text-[9px] text-destructive/80 bg-destructive/5 border-l-2 border-destructive px-2 py-1 rounded-r">{p}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-success uppercase mb-2">Soluțiile noastre</p>
                  <div className="space-y-1">
                    {PITCH_DATA[vk].solutions.map((s, i) => (
                      <p key={i} className="text-[9px] text-success/80 bg-success/5 border-l-2 border-success px-2 py-1 rounded-r">{s}</p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-warning uppercase mb-2">Obiecții și Răspunsuri</p>
                  <div className="space-y-2">
                    {PITCH_DATA[vk].objections.map((ob, i) => (
                      <Card key={i} className="border-warning/20 bg-warning/5">
                        <CardContent className="p-2">
                          <p className="text-[9px] font-bold text-warning">{ob[0]}</p>
                          <p className="text-[9px] text-foreground/80 mt-1">{ob[1]}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            ) : <p className="text-muted-foreground text-xs">Pitch se construiește.</p>}
          </div>
        )}

        {/* FEATURES */}
        {state.activeTab === "features" && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">{vi.icon} Features - {vi.name}</h3>
            {FEATURES_DATA[vk] ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {FEATURES_DATA[vk].map((f, i) => (
                    <div
                      key={i}
                      className={cn(
                        "text-[9px] px-2 py-1.5 rounded border-l-2",
                        f[1] ? "border-success bg-success/5 text-foreground" : "border-warning bg-warning/5 text-foreground"
                      )}
                    >
                      <span className="font-bold">{f[1] ? "✅" : "🔨"}</span> {f[0]}
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-muted-foreground">✅ = construit | 🔨 = de construit</p>
              </>
            ) : <p className="text-muted-foreground text-xs">Features se construiește.</p>}
          </div>
        )}

        {/* MODULES */}
        {state.activeTab === "modules" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold">Arhitectura Modulară InfoDisplay</h3>
              <p className="text-[10px] text-muted-foreground">CORE = baza comună toate verticalele (8 componente). Module extra = 14 layers activabile per client/verticală.</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-primary uppercase mb-2">CORE (inclus în toate verticalele)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {CORE_MODULES.map((m, i) => (
                  <div key={i} className="text-[9px] text-primary bg-primary/5 border border-primary/15 rounded px-2 py-1.5">✅ {m}</div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-warning uppercase mb-2">14 Module activabile per verticală</p>
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-[9px] border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="p-1.5 text-left text-muted-foreground font-semibold">Modul</th>
                      {VERTICAL_KEYS.map((k) => (
                        <th key={k} className="p-1 text-center text-[8px] text-muted-foreground">{VERTICAL_INFO[k].icon}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {EXTRA_MODULES.map((mod) => (
                      <tr key={mod.id} className="border-b border-border/50">
                        <td className="p-1.5 text-foreground/80">{mod.name}</td>
                        {VERTICAL_KEYS.map((k) => {
                          const active = mod.verts.includes(k);
                          return <td key={k} className={cn("p-1 text-center", active && "bg-success/5")}>{active ? "✅" : ""}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase mb-2" style={{ color: vi.color }}>Module active: {vi.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {EXTRA_MODULES.filter((m) => m.verts.includes(vk)).map((mod) => (
                  <div key={mod.id} className="text-[9px] text-foreground/80 bg-primary/5 border border-primary/15 rounded px-2 py-1.5">✅ {mod.name}</div>
                ))}
                {EXTRA_MODULES.filter((m) => m.verts.includes(vk)).length === 0 && (
                  <p className="text-[9px] text-muted-foreground col-span-2">Doar CORE - niciun modul extra activat.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
