import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Romanian name pools ──
const FIRST_NAMES_M = ["Andrei","Mihai","Alexandru","Ion","Matei","David","Luca","Stefan","Gabriel","Daniel","Radu","Vlad","Cristian","Florin","Adrian","Marian","Cosmin","Bogdan","Razvan","Dragos"];
const FIRST_NAMES_F = ["Maria","Ana","Elena","Ioana","Andreea","Alexandra","Daria","Sofia","Gabriela","Laura","Alina","Diana","Raluca","Simona","Mihaela","Denisa","Bianca","Irina","Teodora","Roxana"];
const LAST_NAMES = ["Popescu","Ionescu","Dumitrescu","Stan","Popa","Radu","Nicolae","Stoica","Marin","Gheorghe","Dobre","Moldovan","Lungu","Neagu","Barbu","Enache","Voicu","Toma","Nistor","Florea","Matei","Petrescu","Lazar","Mocanu","Ciobanu","Ene","Costea","Tudor","Rusu","Preda"];

function pickRandom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomChild(i: number): string {
  const first = i % 2 === 0 ? pickRandom(FIRST_NAMES_F) : pickRandom(FIRST_NAMES_M);
  return `${first} ${pickRandom(LAST_NAMES)}`;
}
function randomDate(startYear: number, endYear: number): string {
  const y = startYear + Math.floor(Math.random() * (endYear - startYear + 1));
  const m = 1 + Math.floor(Math.random() * 12);
  const d = 1 + Math.floor(Math.random() * 28);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function todayStr(): string { return new Date().toISOString().split("T")[0]; }
function weekDates(): string[] {
  const now = new Date();
  const day = now.getDay();
  const mon = new Date(now);
  mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, serviceRoleKey);
  const results: string[] = [];

  // Get all orgs with their groups
  const { data: orgs } = await sb.from("organizations").select("id, name, slug, vertical_type");
  const { data: allGroups } = await sb.from("groups").select("id, slug, nume, organization_id, tip");

  if (!orgs || !allGroups) {
    return new Response(JSON.stringify({ error: "No orgs/groups found" }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  const today = todayStr();
  const week = weekDates();
  const RO_DAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];

  for (const org of orgs) {
    const groups = allGroups.filter((g: any) => g.organization_id === org.id);
    if (groups.length === 0) { results.push(`⏭️ ${org.name}: no groups`); continue; }

    try {
      // ═══════════════════════════════════════
      // KIDS vertical
      // ═══════════════════════════════════════
      if (org.vertical_type === "kids") {
        // Children — 15 per group
        for (const group of groups) {
          const { data: existing } = await sb.from("children").select("id").eq("group_id", group.id).limit(1);
          if (existing && existing.length > 0) continue;
          const children = Array.from({ length: 15 }, (_, i) => ({
            nume_prenume: randomChild(i),
            group_id: group.id,
            organization_id: org.id,
            data_nasterii: randomDate(2019, 2022),
            alergii: i % 5 === 0 ? ["lactoza"] : i % 7 === 0 ? ["gluten", "oua"] : null,
          }));
          await sb.from("children").insert(children);
        }

        // Get all children for attendance
        const { data: allChildren } = await sb.from("children").select("id").eq("organization_id", org.id);
        if (allChildren && allChildren.length > 0) {
          const { data: existingAtt } = await sb.from("attendance").select("id").eq("data", today).in("child_id", allChildren.map((c: any) => c.id)).limit(1);
          if (!existingAtt || existingAtt.length === 0) {
            const attRows = [];
            for (const date of week) {
              for (const child of allChildren) {
                attRows.push({
                  child_id: child.id,
                  data: date,
                  prezent: Math.random() > 0.15,
                  marked_at: new Date().toISOString(),
                });
              }
            }
            // Insert in batches
            for (let i = 0; i < attRows.length; i += 500) {
              await sb.from("attendance").insert(attRows.slice(i, i + 500));
            }
          }
        }

        // Menu items for current week
        const weekStr = (() => {
          const d = new Date();
          const jan1 = new Date(d.getFullYear(), 0, 1);
          const wn = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
          return `${d.getFullYear()}-W${String(wn).padStart(2, "0")}`;
        })();
        const { data: existingMenu } = await sb.from("menu_items").select("id").eq("organization_id", org.id).eq("saptamana", weekStr).limit(1);
        if (!existingMenu || existingMenu.length === 0) {
          const meals = [
            { masa: "mic_dejun", items: ["Lapte cu cereale 🥣", "Pâine cu unt și miere 🍞🍯", "Omletă cu legume 🍳", "Iaurt cu fructe 🫐", "Brânză cu roșii 🧀"] },
            { masa: "gustare_1", items: ["Măr 🍎", "Banană 🍌", "Biscuiți integrali 🍪", "Suc natural de portocale 🍊", "Pere și struguri 🍐🍇"] },
            { masa: "pranz", items: ["Supă de pui cu tăiței, Piure cu pui la cuptor 🍗", "Ciorbă de legume, Paste cu sos bolognese 🍝", "Supă cremă de dovlecel, Pește pané cu orez 🐟", "Ciorbă de perișoare, Tocăniță cu mămăliguță 🥘", "Supă de rosii, Șnițel de curcan cu cartofi natur 🥔"] },
            { masa: "gustare_2", items: ["Plăcintă cu mere 🥧", "Prăjitură cu morcovi 🥕", "Clătite cu gem 🫓", "Budincă de vanilie 🍮", "Cozonac cu nucă 🥐"] },
          ];
          const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];
          const menuRows = [];
          for (const meal of meals) {
            for (let d = 0; d < days.length; d++) {
              menuRows.push({
                organization_id: org.id,
                saptamana: weekStr,
                zi: days[d],
                masa: meal.masa,
                continut: meal.items[d],
                emoji: meal.items[d].match(/[\p{Emoji_Presentation}]/u)?.[0] || "🍽️",
              });
            }
          }
          await sb.from("menu_items").insert(menuRows);
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          const docRows = [
            { nume_fisier: "Planificare_săptămânală.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/planificare.pdf", marime: 245000 },
            { nume_fisier: "Regulament_intern.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/regulament.pdf", marime: 180000 },
            { nume_fisier: "Activitate_pictură_1.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400", marime: 320000 },
            { nume_fisier: "Activitate_pictură_2.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400", marime: 280000 },
            { nume_fisier: "Excursie_parc.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400", marime: 410000 },
            { nume_fisier: "Ziua_copilului.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400", marime: 350000 },
            { nume_fisier: "Grafic_activități_martie.pdf", tip_fisier: "pdf", categorie: "activitati", url: "https://example.com/grafic.pdf", marime: 156000 },
            { nume_fisier: "Felicitare_8_martie.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=400", marime: 290000 },
            { nume_fisier: "Meniu_luna_martie.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/meniu.pdf", marime: 98000 },
            { nume_fisier: "Spectacol_primăvară.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=400", marime: 375000 },
            { nume_fisier: "Jocuri_curte.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400", marime: 420000 },
            { nume_fisier: "Tema_săptămânii.pdf", tip_fisier: "pdf", categorie: "teme", url: "https://example.com/tema.pdf", marime: 67000 },
          ];
          await sb.from("documents").insert(docRows.map(d => ({
            ...d,
            organization_id: org.id,
            group_id: groups[0].id,
            uploadat_de_nume: "Educatoare Elena",
          })));
        }

        // Cancelarie teachers
        const { data: existingTeachers } = await sb.from("cancelarie_teachers").select("id").eq("organization_id", org.id).limit(1);
        if (!existingTeachers || existingTeachers.length === 0) {
          await sb.from("cancelarie_teachers").insert([
            { nume: "Elena Popescu", organization_id: org.id, qr_data: `teacher-1-${org.id}` },
            { nume: "Mihaela Ionescu", organization_id: org.id, qr_data: `teacher-2-${org.id}` },
            { nume: "Andreea Stan", organization_id: org.id, qr_data: `teacher-3-${org.id}` },
            { nume: "Gabriela Radu", organization_id: org.id, qr_data: `teacher-4-${org.id}` },
          ]);
        }

        // Contributions config
        const { data: existingContrib } = await sb.from("contributions_config").select("id").eq("organization_id", org.id).limit(1);
        if (!existingContrib || existingContrib.length === 0) {
          await sb.from("contributions_config").insert({
            organization_id: org.id,
            daily_rate: 17,
            effective_from: "2026-01-01",
          });
        }

        results.push(`✅ ${org.name}: children, attendance, menu, docs, teachers seeded`);
      }

      // ═══════════════════════════════════════
      // SCHOOLS vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "schools") {
        for (const group of groups) {
          const { data: existing } = await sb.from("children").select("id").eq("group_id", group.id).limit(1);
          if (existing && existing.length > 0) continue;
          const children = Array.from({ length: 25 }, (_, i) => ({
            nume_prenume: randomChild(i),
            group_id: group.id,
            organization_id: org.id,
            data_nasterii: randomDate(2012, 2018),
          }));
          await sb.from("children").insert(children);
        }

        // Attendance
        const { data: allChildren } = await sb.from("children").select("id").eq("organization_id", org.id);
        if (allChildren && allChildren.length > 0) {
          const { data: existingAtt } = await sb.from("attendance").select("id").eq("data", today).in("child_id", allChildren.map((c: any) => c.id)).limit(1);
          if (!existingAtt || existingAtt.length === 0) {
            const attRows = [];
            for (const date of week) {
              for (const child of allChildren) {
                attRows.push({ child_id: child.id, data: date, prezent: Math.random() > 0.1, marked_at: new Date().toISOString() });
              }
            }
            for (let i = 0; i < attRows.length; i += 500) {
              await sb.from("attendance").insert(attRows.slice(i, i + 500));
            }
          }
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Orar_semestrul_2.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/orar.pdf", marime: 134000, uploadat_de_nume: "Secretariat" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Concurs_matematica.pdf", tip_fisier: "pdf", categorie: "activitati", url: "https://example.com/concurs.pdf", marime: 89000, uploadat_de_nume: "Prof. Andrei" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Excursie_muzeu.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=400", marime: 380000, uploadat_de_nume: "Prof. Maria" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Regulament_elevi.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/regulament-elevi.pdf", marime: 210000, uploadat_de_nume: "Director" },
          ]);
        }

        // Menu
        const weekStr2 = (() => {
          const d = new Date();
          const jan1 = new Date(d.getFullYear(), 0, 1);
          const wn = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
          return `${d.getFullYear()}-W${String(wn).padStart(2, "0")}`;
        })();
        const { data: existingMenu } = await sb.from("menu_items").select("id").eq("organization_id", org.id).eq("saptamana", weekStr2).limit(1);
        if (!existingMenu || existingMenu.length === 0) {
          const days = ["Luni", "Marți", "Miercuri", "Joi", "Vineri"];
          const pranzItems = ["Ciorbă de fasole, Șnițel cu piure 🥘", "Supă de pui, Paste carbonara 🍝", "Ciorbă de legume, Tocăniță de vită 🥩", "Borș de sfeclă, Pui la grătar cu orez 🍗", "Supă cremă de ciuperci, Pește cu garnitură 🐟"];
          const rows = days.map((zi, i) => ({
            organization_id: org.id,
            saptamana: weekStr2,
            zi,
            masa: "pranz",
            continut: pranzItems[i],
            emoji: "🍽️",
          }));
          await sb.from("menu_items").insert(rows);
        }

        // Cancelarie teachers
        const { data: et } = await sb.from("cancelarie_teachers").select("id").eq("organization_id", org.id).limit(1);
        if (!et || et.length === 0) {
          await sb.from("cancelarie_teachers").insert([
            { nume: "Prof. Andrei Popa", organization_id: org.id, qr_data: `teacher-s1-${org.id}` },
            { nume: "Prof. Maria Gheorghe", organization_id: org.id, qr_data: `teacher-s2-${org.id}` },
            { nume: "Prof. Ion Vasilescu", organization_id: org.id, qr_data: `teacher-s3-${org.id}` },
            { nume: "Prof. Dana Preda", organization_id: org.id, qr_data: `teacher-s4-${org.id}` },
            { nume: "Prof. Cristian Lungu", organization_id: org.id, qr_data: `teacher-s5-${org.id}` },
            { nume: "Prof. Alina Marin", organization_id: org.id, qr_data: `teacher-s6-${org.id}` },
          ]);
        }

        results.push(`✅ ${org.name}: children, attendance, menu, docs, teachers seeded`);
      }

      // ═══════════════════════════════════════
      // MEDICINE vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "medicine") {
        const { data: ed } = await sb.from("doctor_profiles").select("id").eq("organization_id", org.id).limit(1);
        if (!ed || ed.length === 0) {
          await sb.from("doctor_profiles").insert([
            { name: "Dr. Alexandru Marin", specialization: "Ortodonție", bio: "Specialist cu 15 ani experiență în ortodonție și estetică dentară.", credentials: "UMF București, 2011", organization_id: org.id, activ: true, ordine: 1 },
            { name: "Dr. Cristina Radu", specialization: "Implantologie", bio: "Expert în implantologie avansată și chirurgie orală.", credentials: "UMF Iași, 2013", organization_id: org.id, activ: true, ordine: 2 },
            { name: "Dr. Florin Stoica", specialization: "Stomatologie generală", bio: "Medic stomatolog cu abordare modernă și grijă pentru confort.", credentials: "UMF Cluj, 2015", organization_id: org.id, activ: true, ordine: 3 },
          ]);
        }

        const { data: es } = await sb.from("medicine_services").select("id").eq("organization_id", org.id).limit(1);
        if (!es || es.length === 0) {
          await sb.from("medicine_services").insert([
            { name: "Consultație generală", description: "Examinare completă și plan de tratament", price_from: 150, price_to: 200, duration_minutes: 30, organization_id: org.id, activ: true, ordine: 1 },
            { name: "Detartraj profesional", description: "Curățare profesională cu ultrasunete", price_from: 200, price_to: 350, duration_minutes: 45, organization_id: org.id, activ: true, ordine: 2 },
            { name: "Albire dentară", description: "Albire cu gel profesional și lampă LED", price_from: 800, price_to: 1200, duration_minutes: 60, organization_id: org.id, activ: true, ordine: 3 },
            { name: "Plombare estetică", description: "Obturație compozit fotopolimerizabil", price_from: 250, price_to: 500, duration_minutes: 40, organization_id: org.id, activ: true, ordine: 4 },
            { name: "Extracție dentară", description: "Extracție simplă sau chirurgicală", price_from: 200, price_to: 600, duration_minutes: 30, organization_id: org.id, activ: true, ordine: 5 },
            { name: "Implant dentar", description: "Implant din titan cu coroană ceramică", price_from: 2500, price_to: 4000, duration_minutes: 90, organization_id: org.id, activ: true, ordine: 6 },
          ]);
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Lista_prețuri_2026.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/preturi.pdf", marime: 95000, uploadat_de_nume: "Recepție" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Cabinet_nou.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400", marime: 340000, uploadat_de_nume: "Admin" },
          ]);
        }

        results.push(`✅ ${org.name}: doctors, services, docs seeded`);
      }

      // ═══════════════════════════════════════
      // CONSTRUCTION vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "construction") {
        // Sites
        const { data: existingSites } = await sb.from("construction_sites").select("id").eq("organization_id", org.id);
        if (!existingSites || existingSites.length === 0) {
          await sb.from("construction_sites").insert([
            { organization_id: org.id, nume: "Bloc Rezidențial Mihai Viteazu", adresa: "Str. Mihai Viteazu Nr. 12", buget: 750000, status: "activ", progress_pct: 42, data_start: "2026-01-10", data_estimare_finalizare: "2027-03-01" },
            { organization_id: org.id, nume: "Vila Familia Enescu", adresa: "Str. Trandafirilor Nr. 8", buget: 280000, status: "activ", progress_pct: 68, data_start: "2025-08-15", data_estimare_finalizare: "2026-07-01" },
          ]);
        }

        // Teams
        const { data: existingTeams } = await sb.from("construction_teams").select("id").eq("organization_id", org.id);
        if (!existingTeams || existingTeams.length === 0) {
          await sb.from("construction_teams").insert([
            { nume: "Echipa Structuri", specialitate: "structuri", nr_membri: 6, leader_name: "Vasile Niță", organization_id: org.id },
            { nume: "Echipa Finisaje", specialitate: "finisaje", nr_membri: 4, leader_name: "Ion Barbu", organization_id: org.id },
            { nume: "Echipa Instalații", specialitate: "instalatii", nr_membri: 3, leader_name: "Marian Dobre", organization_id: org.id },
          ]);
        }

        // Tasks
        const { data: sites } = await sb.from("construction_sites").select("id").eq("organization_id", org.id).limit(1);
        if (sites && sites.length > 0) {
          const { data: existingTasks } = await sb.from("construction_tasks").select("id").eq("organization_id", org.id).limit(1);
          if (!existingTasks || existingTasks.length === 0) {
            await sb.from("construction_tasks").insert([
              { organization_id: org.id, site_id: sites[0].id, titlu: "Turnare fundație etaj 3", status: "in_progress", prioritate: "ridicata", locatie: "Corp A" },
              { organization_id: org.id, site_id: sites[0].id, titlu: "Montaj cofraj pereți", status: "todo", prioritate: "ridicata", locatie: "Corp A" },
              { organization_id: org.id, site_id: sites[0].id, titlu: "Verificare armătură", status: "done", prioritate: "normala", locatie: "Corp B" },
              { organization_id: org.id, site_id: sites[0].id, titlu: "Instalații sanitare parter", status: "todo", prioritate: "normala", locatie: "Corp A" },
              { organization_id: org.id, site_id: sites[0].id, titlu: "Trasare rețea electrică", status: "in_progress", prioritate: "normala", locatie: "Corp B" },
            ]);
          }
        }

        // Inventory
        const { data: existingInv } = await sb.from("inventory_items").select("id").eq("organization_id", org.id).limit(1);
        if (!existingInv || existingInv.length === 0) {
          await sb.from("inventory_items").insert([
            { organization_id: org.id, nume: "Ciment Portland", categorie: "materiale", cantitate: 200, unitate: "saci", pret_unitar: 32, locatie: "Depozit Central" },
            { organization_id: org.id, nume: "Oțel beton Ø12", categorie: "materiale", cantitate: 500, unitate: "bare", pret_unitar: 45, locatie: "Depozit Central" },
            { organization_id: org.id, nume: "Cărămidă BCA", categorie: "materiale", cantitate: 3000, unitate: "buc", pret_unitar: 8, locatie: "Șantier" },
            { organization_id: org.id, nume: "Betoniera 350L", categorie: "utilaje", cantitate: 2, unitate: "buc", pret_unitar: 4500, locatie: "Șantier" },
            { organization_id: org.id, nume: "Schelă metalică", categorie: "utilaje", cantitate: 15, unitate: "module", pret_unitar: 350, locatie: "Șantier" },
          ]);
        }

        results.push(`✅ ${org.name}: sites, teams, tasks, inventory seeded`);
      }

      // ═══════════════════════════════════════
      // LIVING vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "living") {
        const { data: existingApt } = await sb.from("living_apartments").select("id").eq("organization_id", org.id).limit(1);
        if (!existingApt || existingApt.length === 0) {
          const apts = [];
          for (let floor = 0; floor <= 8; floor++) {
            for (let apt = 1; apt <= 4; apt++) {
              apts.push({
                organization_id: org.id,
                apartment_number: `${floor}${apt}`,
                floor,
                owner_name: `${pickRandom(FIRST_NAMES_M)} ${pickRandom(LAST_NAMES)}`,
                balance: Math.random() > 0.3 ? 0 : -(Math.floor(Math.random() * 500) + 100),
              });
            }
          }
          await sb.from("living_apartments").insert(apts);
        }

        // Expenses
        const { data: existingExp } = await sb.from("living_expenses").select("id").eq("organization_id", org.id).limit(1);
        if (!existingExp || existingExp.length === 0) {
          const now = new Date();
          const expenses = [
            { category: "intretinere", amount: 12500, description: "Întreținere încălzire centrală", month: now.getMonth() + 1, year: now.getFullYear() },
            { category: "intretinere", amount: 3200, description: "Apă rece + caldă", month: now.getMonth() + 1, year: now.getFullYear() },
            { category: "reparatii", amount: 4800, description: "Reparație liftul Scara A", month: now.getMonth() + 1, year: now.getFullYear() },
            { category: "fond_rulment", amount: 2000, description: "Fond rulment lunar", month: now.getMonth() + 1, year: now.getFullYear() },
            { category: "intretinere", amount: 1500, description: "Gunoi + salubritate", month: now.getMonth() + 1, year: now.getFullYear() },
          ];
          await sb.from("living_expenses").insert(expenses.map(e => ({ ...e, organization_id: org.id })));
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Lista_întreținere_martie.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/intretinere.pdf", marime: 178000, uploadat_de_nume: "Administrator" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "PV_ședință_asociație.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/pv.pdf", marime: 125000, uploadat_de_nume: "Administrator" },
          ]);
        }

        results.push(`✅ ${org.name}: apartments, expenses, docs seeded`);
      }

      // ═══════════════════════════════════════
      // CULTURE vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "culture") {
        const { data: existingShows } = await sb.from("culture_shows").select("id").eq("organization_id", org.id).limit(1);
        if (!existingShows || existingShows.length === 0) {
          const shows = [
            { title: "La Traviata", synopsis: "Opera în 3 acte de Giuseppe Verdi. Povestea tragică de dragoste a Violettei Valéry.", show_date: "2026-03-15", show_time: "19:00", duration_minutes: 150, acts: 3, language: "it", has_surtitles: true, status: "scheduled" },
            { title: "Lacul Lebedelor", synopsis: "Baletul clasic de Ceaikovski în 4 acte.", show_date: "2026-03-20", show_time: "19:00", duration_minutes: 140, acts: 4, language: "ro", has_surtitles: false, status: "scheduled" },
            { title: "Carmen", synopsis: "Opera în 4 acte de Georges Bizet.", show_date: "2026-03-25", show_time: "19:00", duration_minutes: 165, acts: 4, language: "fr", has_surtitles: true, status: "scheduled" },
            { title: "Rigoletto", synopsis: "Opera în 3 acte de Giuseppe Verdi.", show_date: "2026-04-01", show_time: "19:00", duration_minutes: 135, acts: 3, language: "it", has_surtitles: true, status: "scheduled" },
          ];
          const { data: inserted } = await sb.from("culture_shows").insert(shows.map(s => ({ ...s, organization_id: org.id }))).select("id");

          // Surtitle blocks for first show
          if (inserted && inserted.length > 0) {
            const blocks = Array.from({ length: 20 }, (_, i) => ({
              show_id: inserted[0].id,
              sequence_number: i + 1,
              act_number: Math.floor(i / 7) + 1,
              scene_number: (i % 7) + 1,
              text_ro: `Bloc supra ${i + 1}: Text tradus în română pentru scena ${(i % 7) + 1}.`,
              text_en: `Block ${i + 1}: English translation for scene ${(i % 7) + 1}.`,
              text_fr: `Bloc ${i + 1}: Traduction française pour la scène ${(i % 7) + 1}.`,
            }));
            await sb.from("culture_surtitle_blocks").insert(blocks);
          }
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Program_luna_martie.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/program.pdf", marime: 256000, uploadat_de_nume: "Secretariat" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Afis_La_Traviata.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=400", marime: 450000, uploadat_de_nume: "Marketing" },
          ]);
        }

        results.push(`✅ ${org.name}: shows, surtitles, docs seeded`);
      }

      // ═══════════════════════════════════════
      // WORKSHOPS vertical (auto service)
      // ═══════════════════════════════════════
      else if (org.vertical_type === "workshops") {
        const { data: existingInv } = await sb.from("inventory_items").select("id").eq("organization_id", org.id).limit(1);
        if (!existingInv || existingInv.length === 0) {
          await sb.from("inventory_items").insert([
            { organization_id: org.id, nume: "Ulei motor 5W-30", categorie: "consumabile", cantitate: 48, unitate: "litri", pret_unitar: 65, locatie: "Raft A1" },
            { organization_id: org.id, nume: "Filtru ulei universal", categorie: "piese", cantitate: 30, unitate: "buc", pret_unitar: 35, locatie: "Raft A2" },
            { organization_id: org.id, nume: "Plăcuțe frână față", categorie: "piese", cantitate: 12, unitate: "set", pret_unitar: 180, locatie: "Raft B1" },
            { organization_id: org.id, nume: "Bujii NGK", categorie: "piese", cantitate: 40, unitate: "buc", pret_unitar: 25, locatie: "Raft B2" },
            { organization_id: org.id, nume: "Antigel G12", categorie: "consumabile", cantitate: 20, unitate: "litri", pret_unitar: 45, locatie: "Raft A3" },
            { organization_id: org.id, nume: "Curea distribuție", categorie: "piese", cantitate: 8, unitate: "buc", pret_unitar: 220, locatie: "Raft C1" },
            { organization_id: org.id, nume: "Disc frână spate", categorie: "piese", cantitate: 6, unitate: "buc", pret_unitar: 150, locatie: "Raft B3" },
          ]);
        }

        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Prețuri_manoperă_2026.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/preturi-service.pdf", marime: 88000, uploadat_de_nume: "Marian Popescu" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Atelier_foto.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400", marime: 380000, uploadat_de_nume: "Marian Popescu" },
          ]);
        }

        results.push(`✅ ${org.name}: inventory, docs seeded`);
      }

      // ═══════════════════════════════════════
      // STUDENTS vertical
      // ═══════════════════════════════════════
      else if (org.vertical_type === "students") {
        // Documents
        const { data: existingDocs } = await sb.from("documents").select("id").eq("organization_id", org.id).limit(1);
        if (!existingDocs || existingDocs.length === 0) {
          await sb.from("documents").insert([
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Calendar_sesiune_vara.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/sesiune.pdf", marime: 156000, uploadat_de_nume: "Secretariat" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Catalog_cursuri_opționale.pdf", tip_fisier: "pdf", categorie: "administrativ", url: "https://example.com/optionale.pdf", marime: 210000, uploadat_de_nume: "Decanat" },
            { organization_id: org.id, group_id: groups[0].id, nume_fisier: "Campus_foto.jpg", tip_fisier: "jpg", categorie: "fotografii", url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400", marime: 420000, uploadat_de_nume: "Comunicare" },
          ]);
        }

        results.push(`✅ ${org.name}: docs seeded`);
      }

      else {
        results.push(`⏭️ ${org.name}: vertical ${org.vertical_type} — no specific seed`);
      }

      // ═══════════════════════════════════════
      // Common: Announcements (ensure at least 2 per org)
      // ═══════════════════════════════════════
      const { data: existingAnn } = await sb.from("announcements").select("id").eq("organization_id", org.id);
      if (!existingAnn || existingAnn.length < 2) {
        const announcements = [
          { titlu: "Bine ați venit!", continut: `Bine ați venit la ${org.name}! Aceasta este platforma digitală pentru comunicare și management.`, prioritate: "normal", target: "scoala", autor_nume: "Sistem" },
          { titlu: "Program actualizat", continut: "Programul de funcționare a fost actualizat. Verificați secțiunea dedicată pentru detalii.", prioritate: "normal", target: "scoala", autor_nume: "Administrație" },
        ];
        for (const ann of announcements) {
          await sb.from("announcements").upsert({ ...ann, organization_id: org.id }, { onConflict: "id" });
        }
      }

      // Infodisplay panels
      const { data: existingPanels } = await sb.from("infodisplay_panels").select("id").eq("organization_id", org.id).limit(1);
      if (!existingPanels || existingPanels.length === 0) {
        await sb.from("infodisplay_panels").insert([
          { organization_id: org.id, tip: "text", continut: `Bine ați venit la ${org.name}!`, ordine: 1, durata: 8 },
          { organization_id: org.id, tip: "text", continut: "Program: Luni-Vineri 08:00-17:00", ordine: 2, durata: 6 },
        ]);
      }

    } catch (err) {
      results.push(`❌ ${org.name}: ${err.message}`);
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
