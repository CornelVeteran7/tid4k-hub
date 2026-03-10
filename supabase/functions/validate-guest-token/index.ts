import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (resets on cold start, good enough for edge)
const ipCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // requests per minute per IP
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by IP
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: "Prea multe cereri. Încercați din nou în curând." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { token, orgSlug, turnstileToken } = await req.json();

    // Validate input
    if (!token || typeof token !== "string" || token.length > 20) {
      return new Response(
        JSON.stringify({ error: "Token invalid" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!orgSlug || typeof orgSlug !== "string" || orgSlug.length > 100) {
      return new Response(
        JSON.stringify({ error: "Organizație invalidă" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate Turnstile if secret is configured
    const turnstileSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    if (turnstileSecret && turnstileToken) {
      const tsResp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: turnstileSecret,
          response: turnstileToken,
          remoteip: ip,
        }),
      });
      const tsResult = await tsResp.json();
      if (!tsResult.success) {
        return new Response(
          JSON.stringify({ error: "Verificare de securitate eșuată. Reîncărcați pagina." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate token against database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokenRow, error } = await supabase
      .from("guest_tokens")
      .select("id, organization_id, valid_date")
      .eq("token", token)
      .single();

    if (error || !tokenRow) {
      return new Response(
        JSON.stringify({ error: "Token invalid sau expirat. Scanați QR-ul de pe display." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check token is for today
    const today = new Date().toISOString().split("T")[0];
    if (tokenRow.valid_date !== today) {
      return new Response(
        JSON.stringify({ error: "Token expirat. Scanați QR-ul de pe display pentru codul de azi." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify org slug matches
    const { data: org } = await supabase
      .from("organizations")
      .select("id, slug, name, vertical_type")
      .eq("id", tokenRow.organization_id)
      .single();

    if (!org || org.slug !== orgSlug) {
      return new Response(
        JSON.stringify({ error: "Token nu corespunde organizației." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        orgId: org.id,
        orgName: org.name,
        verticalType: org.vertical_type,
        expiresAt: today + "T23:59:59",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Eroare internă" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
