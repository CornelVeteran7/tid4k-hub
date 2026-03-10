

# Plan: Merge Contributions into Attendance + Stripe Payments + Separate Stories

## 1. Merge Contributions into Attendance ("Prezența și Contribuție")

**What changes:**
- Rename the `prezenta` module to "PREZENȚA ȘI CONTRIBUȚIE" in `verticalConfig.ts` (Kids vertical only)
- Add a new tab "Contribuții" inside `Attendance.tsx` (alongside the existing "Prezență" and "Statistici" tabs), embedding the full Contributions logic from `Contributions.tsx`
- Remove the standalone `/contributii` route from `App.tsx` and the Contributions import
- The `Contributions.tsx` page becomes unused (or kept as a redirect to `/prezenta`)
- Update `ModuleHub.tsx` mock counts and structural config accordingly

**Files:** `src/config/verticalConfig.ts`, `src/pages/Attendance.tsx`, `src/App.tsx`, `src/components/dashboard/ModuleHub.tsx`

## 2. Stripe Payment Integration for Parent Contributions

**What changes:**
- Enable Stripe integration for the project
- Create an edge function `create-contribution-checkout` that:
  - Receives `child_id`, `month`, `year`, `amount` from the parent
  - Creates a Stripe Checkout Session with the kindergarten as the connected account (or direct charge with application fee)
  - Applies a small platform commission (e.g., 2-3%) as `application_fee_amount`
  - Returns the checkout URL
- Create an edge function `stripe-contribution-webhook` that:
  - Listens for `checkout.session.completed` events
  - Updates `contributions_monthly.amount_paid` and `status` to `'paid'`
  - Records `payment_date`
- In the parent view of the Attendance/Contributions tab, add a "Plătește online" button that calls the checkout edge function and redirects to Stripe
- Add a payment status badge (pending/paid) visible to both parents and secretaries
- The organization does not hold funds -- Stripe processes directly, we take a small commission

**Files:** `supabase/functions/create-contribution-checkout/index.ts`, `supabase/functions/stripe-contribution-webhook/index.ts`, `supabase/config.toml`, `src/pages/Attendance.tsx` (parent view section)

## 3. Separate Stories into Audio/Video Categories

**What changes:**
- The media mode filter (Citește/Ascultă/Video) already exists in `Stories.tsx` from the previous implementation
- Formalize the separation: when in Kids vertical, the Stories module card on the dashboard shows a mini-selector or the three modes as sub-labels
- Update the `ModuleHub.tsx` to show the stories card subtitle as "Citește, ascultă sau privește povești cu Inky"
- No structural changes needed to `Stories.tsx` itself -- the filter layer is already implemented

**Files:** `src/config/verticalConfig.ts` (update subtitle), `src/components/dashboard/ModuleHub.tsx` (optional preview showing mode icons)

## Technical Details

### Stripe Commission Model
- Platform creates Checkout Sessions with `payment_intent_data.application_fee_amount` set to ~2-3% of the contribution amount
- Parents pay the full contribution; Stripe transfers to the kindergarten's bank minus our fee
- Requires the organization to have a Stripe Connect account (onboarding flow can be added later; for now, direct charges work)

### Edge Function: create-contribution-checkout
```text
POST /create-contribution-checkout
Body: { child_id, month, year, amount, org_id }
Returns: { url: "https://checkout.stripe.com/..." }
```

### Edge Function: stripe-contribution-webhook  
```text
POST /stripe-contribution-webhook
Stripe webhook event → updates contributions_monthly record
```

### Attendance Page Tab Structure (after merge)
```text
Tabs: [Prezență] [Statistici] [Contribuții]
                                    ^-- moved from standalone page
                                        includes payment button for parents
```

### Files Changed Summary

| File | Action | What |
|---|---|---|
| `src/config/verticalConfig.ts` | EDIT | Rename prezenta label for kids, update povesti subtitle |
| `src/pages/Attendance.tsx` | EDIT | Add "Contribuții" tab with embedded contributions logic + Stripe pay button |
| `src/App.tsx` | EDIT | Remove `/contributii` route |
| `src/components/dashboard/ModuleHub.tsx` | EDIT | Update subtitle/preview for stories card |
| `supabase/functions/create-contribution-checkout/index.ts` | NEW | Stripe Checkout Session creation |
| `supabase/functions/stripe-contribution-webhook/index.ts` | NEW | Webhook handler for payment confirmation |
| `supabase/config.toml` | EDIT | Add edge function configs with verify_jwt settings |

