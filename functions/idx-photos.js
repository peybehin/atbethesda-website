// Returns just the photo URLs for a listing detail page as tiny JSON.
// Server-side fetch keeps the heavy detail-HTML off the user's phone.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const target = url.searchParams.get('url');
  const cors = { 'content-type': 'application/json', 'access-control-allow-origin': '*' };
  if (!target || !/^https:\/\/search\.atbethesda\.com\/idx\/details\//.test(target)) {
    return new Response(JSON.stringify({ error: 'bad url' }), { status: 400, headers: cors });
  }
  try {
    const r = await fetch(target, { headers: {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      'Accept': 'text/html'
    }});
    const html = await r.text();
    const m = html.match(/https:\/\/bright-media\d*\.prd\.brightmls\.com\/bright\/images\/[^"'\s\\)]+_(?:2048_1536|1024_768)[^"'\s\\)]+\.jpg/gi) || [];
    const seen = {}, photos = [];
    m.forEach(u => { const id = (u.match(/\/(\d{6,})_/) || [])[1] || u; if (!seen[id]) { seen[id] = 1; photos.push(u); } });
    return new Response(JSON.stringify({ status: r.status, len: html.length, count: photos.length, photos: photos.slice(0, 15) }), {
      headers: Object.assign({ 'cache-control': 'public, max-age=3600' }, cors)
    });
  } catch (e) { return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: cors }); }
}
