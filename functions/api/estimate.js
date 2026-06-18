/**
 * Cloudflare Pages Function — Home Valuation Estimate
 * Route: POST /api/estimate
 *
 * Environment variables required (set in Cloudflare Pages → Settings → Environment Variables):
 *   ESTATED_TOKEN   — Your Estated API token (estated.com → free signup)
 *   WEB3FORMS_KEY   — Your Web3Forms access key (web3forms.com → free signup)
 */

export async function onRequestPost(context) {
  const { env, request } = context;

  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();
    const {
      street, city, state, zip,
      propertyType, beds, baths, sqft, yearBuilt, condition,
      name, email, phone, timeline
    } = body;

    // ── 1. ESTATED PROPERTY LOOKUP ──
    let estimatedLow = null, estimatedHigh = null, estimatedValue = null;

    if (env.ESTATED_TOKEN && street && zip) {
      try {
        const params = new URLSearchParams({
          token: env.ESTATED_TOKEN,
          street: street,
          city:   city   || '',
          state:  state  || 'MD',
          zip:    zip    || '',
        });

        const estatedRes = await fetch(
          `https://apis.estated.com/v4/property?${params}`,
          { headers: { 'User-Agent': 'atbethesda-valuation/1.0' }, cf: { cacheEverything: false } }
        );

        if (estatedRes.ok) {
          const { data: prop } = await estatedRes.json();

          if (prop) {
            let baseValue = null;

            // Priority 1: Enhanced package AVM
            if (prop.valuation?.value > 10000) {
              baseValue = prop.valuation.value;
            }
            // Priority 2: Assessor market value
            else if (prop.market_assessments?.length > 0) {
              const mktVal = prop.market_assessments[0].total_value;
              if (mktVal > 10000) baseValue = mktVal;
            }
            // Priority 3: Last sale + DC Metro appreciation (~4.5%/yr)
            else if (prop.deeds?.length > 0) {
              const deed = prop.deeds[0];
              if (deed.sale_price > 10000 && deed.recording_date) {
                const saleDateMs = new Date(deed.recording_date).getTime();
                const yearsAgo = (Date.now() - saleDateMs) / (365.25 * 86400 * 1000);
                if (yearsAgo > 0 && yearsAgo < 50) {
                  baseValue = Math.round(deed.sale_price * Math.pow(1.045, yearsAgo));
                }
              }
            }

            if (baseValue) {
              // Condition adjustment
              const condMap = {
                'excellent':  1.06,
                'good':       1.01,
                'fair':       0.94,
                'needs-work': 0.86,
              };
              const condMult = condMap[condition] ?? 1.0;

              // Sqft adjustment — cap at ±20% so one wrong field can't explode the estimate
              const assessorSqft = prop.structure?.total_area_sq_ft;
              let sqftMult = 1.0;
              if (assessorSqft > 200 && sqft > 200) {
                sqftMult = Math.min(Math.max(sqft / assessorSqft, 0.80), 1.20);
              }

              estimatedValue = Math.round(baseValue * condMult * sqftMult);
              // ±8% range
              estimatedLow   = Math.round(estimatedValue * 0.92);
              estimatedHigh  = Math.round(estimatedValue * 1.08);
            }
          }
        }
      } catch (estatedErr) {
        // Don't fail the whole request if Estated is down
        console.error('Estated error:', estatedErr.message);
      }
    }

    // ── 2. EMAIL LEAD VIA WEB3FORMS ──
    if (env.WEB3FORMS_KEY) {
      const valueStr = estimatedValue
        ? `$${estimatedLow.toLocaleString()} – $${estimatedHigh.toLocaleString()}`
        : 'Could not auto-calculate — needs manual CMA';

      const timelineMap = {
        'asap':     'As soon as possible',
        '3months':  'Within 3 months',
        '6months':  'Within 6 months',
        '1year':    'Within a year',
        'curious':  'Just curious',
      };

      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: env.WEB3FORMS_KEY,
          subject: `🏠 New Valuation Lead — ${street}, ${city}`,
          from_name: `${name} (atbethesda.com valuation tool)`,
          reply_to: email,
          message: [
            '══ NEW HOME VALUATION LEAD ══',
            '',
            `Name:     ${name}`,
            `Email:    ${email}`,
            `Phone:    ${phone}`,
            `Timeline: ${timelineMap[timeline] || timeline}`,
            '',
            `Property: ${street}, ${city}, ${state} ${zip}`,
            `Type:     ${propertyType}`,
            `Beds:     ${beds}  |  Baths: ${baths}  |  Sqft: ${sqft}  |  Year: ${yearBuilt}`,
            `Condition: ${condition}`,
            '',
            `Auto-estimate: ${valueStr}`,
          ].join('\n'),
        }),
      }).catch(() => {/* email failure should not block response */});
    }

    // ── 3. RESPOND ──
    return new Response(
      JSON.stringify({
        success: true,
        estimate: estimatedValue,
        low:      estimatedLow,
        high:     estimatedHigh,
        address:  `${street}, ${city}, ${state}`,
      }),
      { headers: cors }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server error. Please try again.' }),
      { status: 500, headers: cors }
    );
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
