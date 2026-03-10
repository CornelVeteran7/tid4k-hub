import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { child_id, month, year, amount, child_name } = await req.json();

    if (!child_id || !month || !year || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: child_id, month, year, amount' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeKey) {
      // MOCK MODE: No Stripe key configured, return a mock response
      console.log('MOCK MODE: No STRIPE_SECRET_KEY configured. Returning mock checkout URL.');
      console.log(`Would create checkout for child ${child_name} (${child_id}), ${month}/${year}, amount: ${amount} RON`);

      // Calculate mock commission (2.5%)
      const commissionRate = 0.025;
      const commissionAmount = Math.round(amount * commissionRate * 100) / 100;

      return new Response(
        JSON.stringify({
          mock: true,
          message: 'Stripe nu este configurat încă. Plata online va fi disponibilă în curând.',
          details: {
            child_id,
            child_name,
            month,
            year,
            amount,
            commission: commissionAmount,
            commission_rate: '2.5%',
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIVE MODE: Create actual Stripe Checkout Session
    const amountInBani = Math.round(amount * 100); // RON to bani
    const applicationFee = Math.round(amountInBani * 0.025); // 2.5% commission

    const checkoutBody = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': 'payment',
      'line_items[0][price_data][currency]': 'ron',
      'line_items[0][price_data][unit_amount]': amountInBani.toString(),
      'line_items[0][price_data][product_data][name]': `Contribuție ${child_name || 'copil'} - ${month}/${year}`,
      'line_items[0][quantity]': '1',
      'payment_intent_data[application_fee_amount]': applicationFee.toString(),
      'metadata[child_id]': child_id,
      'metadata[month]': month.toString(),
      'metadata[year]': year.toString(),
      'success_url': `${req.headers.get('origin') || 'https://example.com'}/prezenta?payment=success`,
      'cancel_url': `${req.headers.get('origin') || 'https://example.com'}/prezenta?payment=cancelled`,
    });

    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutBody.toString(),
    });

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('Stripe error:', session);
      return new Response(
        JSON.stringify({ error: 'Eroare la crearea sesiunii de plată', details: session.error?.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
