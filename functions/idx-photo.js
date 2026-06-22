// Photo proxy (pass-through): fetch BRIGHT image server-side with a detail-page Referer to bypass hotlink, re-serve.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const u = url.searchParams.get('u');
  const cors = { 'Access-Control-Allow-Origin': '*' };
  if (!u || !/^https:\/\/bright-media\d*\.prd\.brightmls\.com\/bright\/images\//.test(u)) {
    return new Response('bad url', { status: 400, headers: cors });
  }
  const ref = url.searchParams.get('ref') || 'https://search.atbethesda.com/idx/details/listing/';
  try {
    const resp = await fetch(u, { headers: { 'Referer': ref, 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) return new Response('upstream ' + resp.status, { status: 502, headers: cors });
    const buf = await resp.arrayBuffer();
    return new Response(buf, { headers: {
      'Content-Type': resp.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*'
    }});
  } catch (e) { return new Response('err ' + e.message, { status: 502, headers: cors }); }
}
