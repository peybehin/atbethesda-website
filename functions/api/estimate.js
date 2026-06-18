/**
 * POST /api/estimate — Home valuation lead capture
 * Saves lead to Cloudflare KV (LEADS_KV binding)
 * Sends instant email via Cloudflare Email Workers (SEND_EMAIL binding)
 * Requires: LEADS_KV binding, SEND_EMAIL binding, LEADS_TOKEN secret
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

      const emailBody = [
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

      const rawEmail = [
        'From: "AT Bethesda" <leads@atbethesda.com>',
        'To: pey@peybehin.com',
        `Subject: New Lead: ${name || 'Unknown'} — ${address || 'No address'}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=utf-8',
        '',
        emailBody,
      ].join('\r\n');

      const { EmailMessage } = await import('cloudflare:email');
      const message = new EmailMessage('leads@atbethesda.com', 'pey@peybehin.com', rawEmail);
      await env.SEND_EMAIL.send(message);
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
