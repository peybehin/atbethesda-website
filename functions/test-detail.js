// Diagnostic: can we read a listing's photos server-side from its detail page?
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const detail = url.searchParams.get('u') || 'https://search.atbethesda.com/idx/details/listing/b004/MDMC2241874/8566-Brickyard-Rd';
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  try {
    const r = await fetch(detail, { headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15' } });
    const html = await r.text();
    const matches = [...html.matchAll(/https?:\/\/[^"'\s\\)]*mlsphotos[^"'\s\\)]*/gi)].map(m => m[0]);
    const uniq = [...new Set(matches.map(s => s.split('?')[0]))].filter(s => !/logo/i.test(s));
    return new Response(JSON.stringify({ status: r.status, htmlLen: html.length, photoUrlsFound: uniq.length, samples: uniq.slice(0, 6) }, null, 2), { headers: cors });
  } catch (e) { return new Response(JSON.stringify({ error: String(e) }), { headers: cors }); }
}
