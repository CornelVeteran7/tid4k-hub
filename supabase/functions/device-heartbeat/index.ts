import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-device-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate device secret to prevent unauthorized heartbeats
    const deviceSecret = req.headers.get("x-device-secret");
    const expectedSecret = Deno.env.get("DEVICE_HEARTBEAT_SECRET");
    if (expectedSecret && deviceSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: "Invalid device secret" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      raspberry_id,
      organization_id,
      alias,
      screenshot_url,
      ip_address,
      os_info,
      app_version,
      report_data,
    } = await req.json();

    if (!raspberry_id || !organization_id) {
      return new Response(
        JSON.stringify({ error: "raspberry_id and organization_id required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Upsert device: update if raspberry_id exists, insert if new
    const { data: device, error: upsertError } = await supabase
      .from("display_devices")
      .upsert(
        {
          raspberry_id,
          organization_id,
          alias: alias || "Display",
          last_heartbeat: new Date().toISOString(),
          screenshot_url: screenshot_url || null,
          ip_address: ip_address || null,
          os_info: os_info || null,
          app_version: app_version || null,
          status: "online",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "raspberry_id" }
      )
      .select("id")
      .single();

    if (upsertError) {
      // If conflict on raspberry_id fails (no unique constraint yet), try update
      const { data: existing } = await supabase
        .from("display_devices")
        .select("id")
        .eq("raspberry_id", raspberry_id)
        .single();

      if (existing) {
        await supabase
          .from("display_devices")
          .update({
            last_heartbeat: new Date().toISOString(),
            screenshot_url: screenshot_url || undefined,
            ip_address: ip_address || undefined,
            os_info: os_info || undefined,
            app_version: app_version || undefined,
            status: "online",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        // Insert report if provided
        if (report_data) {
          await supabase.from("device_reports").insert({
            device_id: existing.id,
            report_data,
          });
        }

        return new Response(
          JSON.stringify({ success: true, device_id: existing.id, action: "updated" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Insert new
      const { data: newDevice, error: insertError } = await supabase
        .from("display_devices")
        .insert({
          raspberry_id,
          organization_id,
          alias: alias || "Display",
          last_heartbeat: new Date().toISOString(),
          status: "online",
          screenshot_url: screenshot_url || null,
          ip_address: ip_address || null,
          os_info: os_info || null,
          app_version: app_version || null,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      if (report_data && newDevice) {
        await supabase.from("device_reports").insert({
          device_id: newDevice.id,
          report_data,
        });
      }

      return new Response(
        JSON.stringify({ success: true, device_id: newDevice?.id, action: "created" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert succeeded — insert report if provided
    if (report_data && device) {
      await supabase.from("device_reports").insert({
        device_id: device.id,
        report_data,
      });
    }

    return new Response(
      JSON.stringify({ success: true, device_id: device?.id, action: "upserted" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Heartbeat error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
