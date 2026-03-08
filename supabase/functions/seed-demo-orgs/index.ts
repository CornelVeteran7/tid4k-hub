import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const VERTICALS = [
    {
      name: "Grădinița Fluturași Demo",
      slug: "fluturasi-demo",
      vertical_type: "kids",
      primary_color: "#1E3A4C",
      secondary_color: "#2D5F7A",
      groups: [
        { nume: "Grupa Mică", slug: "grupa-mica", tip: "gradinita" },
        { nume: "Grupa Mijlocie", slug: "grupa-mijlocie", tip: "gradinita" },
        { nume: "Grupa Mare", slug: "grupa-mare", tip: "gradinita" },
      ],
      vertical_config: { daily_contribution_rate: 17, meal_types: "mic_dejun,pranz,gustare", age_groups: "3-4,4-5,5-6" },
    },
    {
      name: "Școala Nr. 1 Demo",
      slug: "scoala-1-demo",
      vertical_type: "schools",
      primary_color: "#1B5E20",
      secondary_color: "#388E3C",
      groups: [
        { nume: "Clasa a V-a A", slug: "5a", tip: "scoala" },
        { nume: "Clasa a VI-a B", slug: "6b", tip: "scoala" },
      ],
      vertical_config: { timetable_periods: 7, grading_system: "1-10", magazine_enabled: true },
    },
    {
      name: "Cabinet Dr. Ionescu Demo",
      slug: "dr-ionescu-demo",
      vertical_type: "medicine",
      primary_color: "#0D47A1",
      secondary_color: "#1976D2",
      groups: [
        { nume: "Cabinet Stomatologie", slug: "stomatologie", tip: "scoala" },
        { nume: "Cabinet Dermatologie", slug: "dermatologie", tip: "scoala" },
      ],
      vertical_config: { specialties: "dental,derma,general", service_list_enabled: true, avg_consultation_minutes: 30 },
    },
    {
      name: "Asociația Proprietarilor Bloc A1 Demo",
      slug: "bloc-a1-demo",
      vertical_type: "living",
      primary_color: "#4E342E",
      secondary_color: "#795548",
      groups: [
        { nume: "Scara A", slug: "scara-a", tip: "scoala" },
        { nume: "Scara B", slug: "scara-b", tip: "scoala" },
      ],
      vertical_config: { apartments_count: 40, expense_categories: "intretinere,reparatii,fond_rulment", monthly_report_enabled: true },
    },
    {
      name: "Teatrul Național Demo",
      slug: "teatru-national-demo",
      vertical_type: "culture",
      primary_color: "#880E4F",
      secondary_color: "#AD1457",
      groups: [
        { nume: "Sala Mare", slug: "sala-mare", tip: "scoala" },
        { nume: "Sala Studio", slug: "sala-studio", tip: "scoala" },
      ],
      vertical_config: { shows_per_week: 5, surtitle_languages: "ro,en,fr", sponsors_on_display: true },
    },
    {
      name: "Universitatea Demo",
      slug: "universitate-demo",
      vertical_type: "students",
      primary_color: "#311B92",
      secondary_color: "#512DA8",
      groups: [
        { nume: "Facultatea de Informatică", slug: "info", tip: "scoala" },
        { nume: "Facultatea de Drept", slug: "drept", tip: "scoala" },
      ],
      vertical_config: { faculties: "Informatică,Drept,Medicină", secretariat_windows: 4, queue_enabled: true },
    },
    {
      name: "Construcții Popescu Demo",
      slug: "constructii-demo",
      vertical_type: "construction",
      primary_color: "#E65100",
      secondary_color: "#F57C00",
      groups: [
        { nume: "Șantier Central", slug: "santier-central", tip: "scoala" },
      ],
      vertical_config: { active_sites_max: 5, team_count: 8, budget_tracking: true, ssm_daily_required: true },
    },
    {
      name: "Service Auto Rapid Demo",
      slug: "service-rapid-demo",
      vertical_type: "workshops",
      primary_color: "#263238",
      secondary_color: "#455A64",
      groups: [
        { nume: "Mecanică", slug: "mecanica", tip: "scoala" },
        { nume: "Electrică", slug: "electrica", tip: "scoala" },
      ],
      vertical_config: { workshop_type: "ambele", part_categories: "motor,caroserie,electrice,transmisie", client_portal: true },
    },
  ];

  const results: string[] = [];

  for (const v of VERTICALS) {
    // Check if org already exists
    const { data: existing } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", v.slug)
      .maybeSingle();

    if (existing) {
      results.push(`⏭️ ${v.name} already exists (${existing.id})`);
      continue;
    }

    // Create organization
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({
        name: v.name,
        slug: v.slug,
        vertical_type: v.vertical_type,
        primary_color: v.primary_color,
        secondary_color: v.secondary_color,
      })
      .select()
      .single();

    if (orgErr) {
      results.push(`❌ ${v.name}: ${orgErr.message}`);
      continue;
    }

    // Create groups
    for (const g of v.groups) {
      await supabase.from("groups").insert({
        ...g,
        organization_id: org.id,
      });
    }

    // Store vertical config
    await supabase.from("org_config").insert({
      organization_id: org.id,
      config_key: "vertical_config",
      config_value: v.vertical_config,
    });

    // Store default display settings
    await supabase.from("org_config").insert({
      organization_id: org.id,
      config_key: "display_settings",
      config_value: { slide_duration: 8, ticker_speed: 30, show_menu: v.vertical_type === 'kids', show_schedule: true, show_qr: true },
    });

    // Create a sample announcement
    await supabase.from("announcements").insert({
      organization_id: org.id,
      titlu: `Bine ați venit la ${v.name}!`,
      continut: `Aceasta este organizația demo pentru verticala ${v.vertical_type}. Explorați toate modulele disponibile.`,
      prioritate: "normal",
      target: "scoala",
      autor_nume: "Sistem",
    });

    // Construction-specific seed data
    if (v.vertical_type === "construction") {
      const { data: site1 } = await supabase
        .from("construction_sites")
        .insert({
          organization_id: org.id,
          nume: "Bloc Rezidențial Nou",
          adresa: "Str. Libertății Nr. 10",
          buget: 500000,
          status: "activ",
          progress_pct: 35,
          data_start: "2026-01-15",
          data_estimare_finalizare: "2026-12-31",
        })
        .select()
        .single();

      await supabase.from("construction_sites").insert({
        organization_id: org.id,
        nume: "Vila Popescu",
        adresa: "Str. Florilor Nr. 5",
        buget: 200000,
        status: "activ",
        progress_pct: 60,
        data_start: "2025-09-01",
        data_estimare_finalizare: "2026-06-30",
      });

      // Teams
      for (const team of [
        { nume: "Echipa Zidari", specialitate: "zidarie", nr_membri: 5 },
        { nume: "Echipa Instalații", specialitate: "instalatii", nr_membri: 3 },
        { nume: "Echipa Finisaje", specialitate: "finisaje", nr_membri: 4 },
      ]) {
        await supabase.from("construction_teams").insert({ ...team, organization_id: org.id });
      }

      // SSM template
      await supabase.from("ssm_templates").insert({
        organization_id: org.id,
        nume: "Verificare zilnică SSM",
        items: [
          { text: "Echipament protecție verificat", checked: false },
          { text: "Zona de lucru delimitată", checked: false },
          { text: "Schelele verificate", checked: false },
          { text: "Unelte în stare bună", checked: false },
          { text: "Instructaj echipă efectuat", checked: false },
        ],
      });
    }

    results.push(`✅ ${v.name} created (${org.id}) with ${v.groups.length} groups`);
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
