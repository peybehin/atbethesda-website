// Diagnostic: inspect raw IDX photo object (url + sizes + caption) to see if IDX hosts all photos.
export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!apiKey) return new Response(JSON.stringify({ error: 'no_api_key' }), { headers: cors });
  try {
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: { accesskey: apiKey, outputtype: 'json' } });
    const raw = JSON.parse(await r.text());
    const listings = Array.isArray(raw.data) ? raw.data : Object.values(raw.data || {});
    const first = listings[0] || {};
    const img = first.image || {};
    const keys = Object.keys(img);
    const sample = {};
    keys.slice(0, 3).forEach(k => { sample[k] = img[k]; });
    return new Response(JSON.stringify({ listingID: first.listingID, imageCount: keys.length, firstThreePhotosFull: sample }, null, 2), { headers: cors });
  } catch (e) { return new Response(JSON.stringify({ error: 'exception', msg: e.message }), { headers: cors }); }
}
