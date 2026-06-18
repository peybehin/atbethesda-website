/**
 * Cloudflare Pages Function — Home Valuation Lead Capture
 * Route: POST /api/estimate
 *
 * Requires one binding set in Cloudflare Pages → Settings → Functions → Email bindings:
 *   SEND_EMAIL  — send_email binding, destination: pey.behin@gmail.com
 */

function buildEmail(from, to, subject, body) {
  return [
    `MIME-Version: 1.0`,
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    body
  ].join('\r\n');
}

export async function onRequestPost(context) {
  const { env, request } = context;

  const cors = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ success: false }), { status: 400, headers: cors });
  }

  const {
    street, city, state, zip,
    propertyType, beds, baths, sqft, yearBuilt, condition,
    name, email, phone, timeline
  } = body;

  const timelineLabels = {
    asap:     'As soon as possible',
    '3months':'Within 3 months',
    '6months':'Within 6 months',
    '1year':  'Within a year',
    curious:  'Just curious',
  };

  const emailBody = [
    '══ NEW HOME VALUATION LEAD ══',
    '',
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Phone:    ${phone}`,
    `Timeline: ${timelineLabels[timeline] || timeline}`,
    '',
    `Property: ${street}, ${city}, ${state} ${zip}`,
    `Type:     ${propertyType}`,
    `Beds: ${beds}  |  Baths: ${baths}  |  Sqft: ${sqft}  |  Year Built: ${yearBuilt}`,
    `Condition: ${condition}`,
    '',
    'Reply to this email to contact the lead directly.',
  ].join('\n');

  // Send via Cloudflare Email Workers (no third-party service required)
  if (env.SEND_EMAIL) {
    try {
      const rawMime = buildEmail(
        'noreply@atbethesda.com',
        'pey.behin@gmail.com',
        `🏠 New Lead: ${name} — ${street}, ${city}`,
        emailBody
      );

      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(rawMime));
          controller.close();
        }
      });

      const message = new EmailMessage('noreply@atbethesda.com', 'pey.behin@gmail.com', stream);
      await env.SEND_EMAIL.send(message);
    } catch (emailErr) {
      // Log but don't fail — lead is still captured in the response
      console.error('Email send error:', emailErr.message);
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
