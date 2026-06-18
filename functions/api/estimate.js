/**
 * POST /api/estimate — Home valuation lead capture
 * Saves lead to Cloudflare KV (LEADS_KV binding)
 * Sends instant email via Cloudflare Email Workers (SEND_EMAIL binding)
 * Requires: LEADS_KV binding, SEND_EMAIL binding (destination: pey@peybehin.com)
 */
export async function onRequestPost(context) {
  const { env, request } = context;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400, headers: cors });
  }

  const { street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition, name, email, phone, timeline } = body;

  // Store lead in KV
  if (env.LEADS_KV) {
    const key = `lead:${Date.now()}`;
    const lead = { name, email, phone, timeline, street, city, state, zip, propertyType, beds, baths, sqft, yearBuilt, condition, submittedAt: new Date().toISOString() };
    await env.LEADS_KV.put(key, JSON.stringify(lead)).catch(() => {});
  }

  // Send instant email notification via Cloudflare Email Workers
  if (env.SEND_EMAIL) {
    try {
      const address = [street, city, state, zip].filter(Boolean).join(', ');
      const details = [
        propertyType && `Type: ${propertyType}`,
        beds && `Beds: ${beds}`,
        baths && `Baths: ${baths}`,
        sqft && `Sqft: ${sqft}`,
        yearBuilt && `Year Built: ${yearBuilt}`,
        condition && `Condition: ${condition}`,
      ].filter(Boolean).join('\n');

      const emailText = [
        'New home valuation request from atbethesda.com',
        '',
        'CONTACT',
        `Name:     ${name || '—'}`,
        `Email:    ${email || '—'}`,
        `Phone:    ${phone || '—'}`,
        `Timeline: ${timeline || '—'}`,
        '',
        'PROPERTY',
        `Address:  ${address || '—'}`,
        details,
        '',
        `Submitted: ${new Date().toISOString()}`,
      ].join('\n');

      await env.SEND_EMAIL.send({
        from: 'leads@atbethesda.com',
        to: 'pey@peybehin.com',
        subject: `New Lead: ${name || 'Unknown'} — ${address || 'No address'}`,
        text: emailText,
      });
    } catch (err) {
      // Don't fail the request if email fails — lead is already saved to KV
      console.error('Email send failed:', err?.message);
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
