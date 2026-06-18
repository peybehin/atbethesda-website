export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(buildErrorPage('Missing token'), { status: 400, headers: { 'Content-Type': 'text/html' } });
  }

  // Look up the token in KV
  let lead;
  if (env.LEADS_KV) {
    const raw = await env.LEADS_KV.get(`download-token:${token}`);
    if (!raw) {
      return new Response(buildErrorPage('This link has expired or is invalid. Please request a new one.'), { status: 404, headers: { 'Content-Type': 'text/html' } });
    }
    lead = JSON.parse(raw);
    if (Date.now() > lead.expiresAt) {
      return new Response(buildErrorPage('This link has expired. Please request a new one.'), { status: 410, headers: { 'Content-Type': 'text/html' } });
    }
    // Mark as confirmed
    lead.confirmed = true;
    lead.confirmedAt = new Date().toISOString();
    await env.LEADS_KV.put(`download-token:${token}`, JSON.stringify(lead), { expirationTtl: 3600 });
  }

  // Notify Pey of a new confirmed lead
  if (env.RESEND_API_KEY && lead) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Lead Alerts <hello@atbethesda.com>',
        to: ['pey@peybehin.com'],
        subject: `🏠 New Seller's Guide Download — ${lead.name}`,
        html: `
<p><strong>New confirmed seller's guide download:</strong></p>
<table style="border-collapse:collapse;font-family:Arial,sans-serif;">
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Name</td><td style="padding:6px 0;"><strong>${lead.name}</strong></td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Email</td><td style="padding:6px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Phone</td><td style="padding:6px 0;">${lead.phone || '—'}</td></tr>
  <tr><td style="padding:6px 16px 6px 0;color:#888;">Downloaded</td><td style="padding:6px 0;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</td></tr>
</table>`,
      }),
    }).catch(err => console.error('Notify error:', err?.message));
  }

  // Redirect to the PDF
  return Response.redirect('https://atbethesda.com/downloads/sellers-guide.pdf', 302);
}

function buildErrorPage(message) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Link Issue | @Bethesda Real Estate</title>
<style>body{margin:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f4f4f4;display:flex;align-items:center;justify-content:center;min-height:100vh;}
.box{background:#fff;border-radius:12px;padding:48px;max-width:480px;text-align:center;}
h1{font-size:1.4rem;font-weight:900;text-transform:uppercase;color:#0a0a0a;margin:0 0 12px;}
p{color:#666;line-height:1.6;margin:0 0 24px;}
a{display:inline-block;background:#cc2936;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:700;font-size:.9rem;text-transform:uppercase;}
</style></head>
<body><div class="box">
<h1>Oops!</h1>
<p>${message}</p>
<a href="/sellers-guide/">Get a New Link</a>
</div></body>
</html>`;
}
