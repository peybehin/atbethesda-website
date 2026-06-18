const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export async function onRequestPost(context) {
  const { env, request } = context;
  let body;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ success: false, error: 'Invalid request' }), { status: 400, headers: CORS });
  }

  const { name, email, phone } = body;
  if (!name || !email) {
    return new Response(JSON.stringify({ success: false, error: 'Name and email are required' }), { status: 400, headers: CORS });
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ success: false, error: 'Invalid email address' }), { status: 400, headers: CORS });
  }

  // Generate a secure token and store the lead
  const token = crypto.randomUUID();
  const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 hours
  const lead = { name, email, phone, token, createdAt: new Date().toISOString(), expiresAt, confirmed: false };

  if (env.LEADS_KV) {
    await env.LEADS_KV.put(`download-token:${token}`, JSON.stringify(lead), { expirationTtl: 86400 });
    await env.LEADS_KV.put(`lead:download:${Date.now()}`, JSON.stringify(lead)).catch(() => {});
  }

  // Send confirmation email via Resend
  const siteUrl = env.SITE_URL || 'https://atbethesda.com';
  const confirmUrl = `${siteUrl}/api/confirm-download?token=${token}`;

  if (env.RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Pey Behin | @Bethesda Real Estate <hello@atbethesda.com>',
        to: [email],
        subject: '🎉 Your Seller\'s Guide is Ready — One Click Away!',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:32px 40px;text-align:center;">
          <p style="color:#cc2936;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 8px;">@Bethesda Real Estate</p>
          <h1 style="color:#ffffff;font-size:26px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin:0;">Your Seller's Guide<br>Is Ready! 🎉</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 40px 32px;">
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${name},</p>
          <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">We are so excited to share this with you! Your free copy of the <strong>@Bethesda Seller's Guide</strong> is ready — packed with everything you need to know about selling your home in Bethesda and the DC Metro area.</p>
          <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;">Inside, you'll find our proven marketing strategy, how we price homes to sell for top dollar, and the exact steps we take from listing to closing.</p>
          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:8px 0 32px;">
              <a href="${confirmUrl}" style="display:inline-block;background:#cc2936;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:8px;letter-spacing:0.05em;text-transform:uppercase;">Download My Seller's Guide →</a>
            </td></tr>
          </table>
          <p style="color:#888;font-size:13px;line-height:1.5;margin:0 0 8px;">This link expires in 24 hours. If you didn't request this, no action is needed.</p>
          <p style="color:#888;font-size:13px;line-height:1.5;margin:0;">Or copy this URL: <span style="color:#cc2936;">${confirmUrl}</span></p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#0a0a0a;padding:24px 40px;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;">Pey Behin · RLAH @properties · Licensed in MD, VA & DC</p>
          <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0;"><a href="https://atbethesda.com" style="color:#cc2936;text-decoration:none;">atbethesda.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
      }),
    }).catch(err => console.error('Resend error:', err?.message));
  }

  return new Response(JSON.stringify({ success: true }), { headers: CORS });
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
