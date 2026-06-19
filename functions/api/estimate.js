/**
 * POST /api/estimate — Home valuation lead capture
 * Saves lead to Cloudflare KV (LEADS_KV binding)
 * Sends instant email via atbethesda-email-sender Worker (EMAIL_WORKER_URL + WORKER_SECRET)
 */
export async function onRequestPost(context) {
  const { env, request } = context;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400, headers: cors });
  }

  const { street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition,
          name, email, phone, timeline, source, sourcePage, leadType } = body;

  // Store lead in KV
  if (env.LEADS_KV) {
    const key = `lead:${Date.now()}`;
    const lead = {
      leadType: leadType || 'valuation',
      name, email, phone, timeline,
      street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition,
      source: source || 'Direct',
      sourcePage: sourcePage || '',
      submittedAt: new Date().toISOString()
    };
    await env.LEADS_KV.put(key, JSON.stringify(lead)).catch(() => {});
  }

  // Send instant email via the atbethesda-email-sender Worker
  if (env.EMAIL_WORKER_URL && env.WORKER_SECRET) {
    try {
      const address = [street, city, state, zip].filter(Boolean).join(', ');
      const details = [
        propertyType && `Type: ${propertyType}`,
        beds         && `Beds: ${beds}`,
        baths        && `Baths: ${baths}`,
        sqft         && `Sqft: ${sqft}`,
        yearBuilt    && `Year Built: ${yearBuilt}`,
        condition    && `Condition: ${condition}`,
        source       && `Source: ${source}`,
        sourcePage   && `Landing Page: ${sourcePage}`,
      ].filter(Boolean).join('\n');

      await fetch(env.EMAIL_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Secret': env.WORKER_SECRET },
        body: JSON.stringify({ name, email, phone, timeline, address, details }),
      });
    } catch (err) {
      console.error('Email worker call failed:', err?.message);
    }
  }

  return new Response(JSON.stringify({ success: true }), { headers: cors });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
