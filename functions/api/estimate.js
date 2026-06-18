/**
 * POST /api/estimate — Home valuation lead capture
 * Saves lead to Cloudflare KV (LEADS_KV binding)
 * Requires: LEADS_KV binding, LEADS_TOKEN secret (set in Pages settings)
 */
export async function onRequestPost(context) {
  const { env, request } = context;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400, headers: cors });
  }

  const { street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition, name, email, phone, timeline } = body;

  // Store lead in KV with timestamp key so they sort chronologically
  if (env.LEADS_KV) {
    const key = `lead:${Date.now()}`;
    const lead = { name, email, phone, timeline, street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition, submittedAt: new Date().toISOString() };
    await env.LEADS_KV.put(key, JSON.stringify(lead)).catch(() => {});
  }

  return new Response(JSON.stringify({ success: true }), { headers: cors });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }
  });
}
