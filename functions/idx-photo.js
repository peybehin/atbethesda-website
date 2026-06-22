// Photo proxy: fetches a BRIGHT MLS image server-side with a detail-page Referer
// (to pass hotlink protection) and re-serves it, optionally resized via Cloudflare Image Resizing.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const u = url.searchParams.get('u');
  const w = parseInt(url.searchParams.get('w') || '1024', 10);
  if (!u || !/^https:\/\/bright-media\d*\.prd\.brightmls\.com\/bright\/images\//.test(u)) {
    return new Response('bad url', { status: 400 });
  }
  const ref = url.searchParams.get('ref') || 'https://search.atbethesda.com/idx/details/listing/';
  try {
    const resp = await fetch(u, {
      headers: { 'Referer': ref, 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' },
      cf: { image: { width: w, quality: 72, fit: 'scale-down' }, cacheTtl: 86400, cacheEverything: true }
    });
    if (!resp.ok) return new Response('upstream ' + resp.status, { status: 502 });
    const h = new Headers();
    h.set('Content-Type', resp.headers.get('Content-Type') || 'image/jpeg');
    h.set('Cache-Control', 'public, max-age=86400');
    h.set('Access-Control-Allow-Origin', '*');
    h.set('X-Proxy-CFResize', resp.headers.get('cf-resized') || 'none');
    return new Response(resp.body, { headers: h });
  } catch (e) {
    return new Response('err ' + e.message, { status: 502 });
  }
}
