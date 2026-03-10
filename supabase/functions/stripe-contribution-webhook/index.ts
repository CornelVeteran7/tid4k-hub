import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey || !webhookSecret) {
      console.log('MOCK MODE: Stripe keys not configured. Webhook endpoint ready but inactive.');
      return new Response(
        JSON.stringify({ mock: true, message: 'Webhook endpoint ready. Configure STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET to activate.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify webhook signature using Stripe's method
    // For production, use stripe SDK or manual HMAC verification
    // For now, we parse the event directly (signature verification should be added with proper Stripe SDK)
    const event = JSON.parse(body);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadata = session.metadata || {};
      const { child_id, month, year } = metadata;

      if (!child_id || !month || !year) {
        console.error('Missing metadata in checkout session:', metadata);
        return new Response(
          JSON.stringify({ error: 'Missing metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const amountPaid = (session.amount_total || 0) / 100; // bani to RON

      // Update the contributions_monthly record
      const { error: updateError } = await supabase
        .from('contributions_monthly')
        .update({
          amount_paid: amountPaid,
          status: 'paid',
          updated_at: new Date().toISOString(),
        })
        .eq('child_id', child_id)
        .eq('month', parseInt(month))
        .eq('year', parseInt(year));

      if (updateError) {
        console.error('Error updating contribution:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update contribution record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Payment recorded: child ${child_id}, ${month}/${year}, ${amountPaid} RON`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
