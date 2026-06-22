export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return jsonResp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    const raw = JSON.parse(await r.text());
    const listings = Array.isArray(raw.data) ? raw.data : Object.values(raw.data);
    const l = listings[0];

    const img = l.image;
    const imgVals = Object.values(img);
    const img0 = imgVals[0];
    const img0Type = typeof img0;
    const img0Keys = img0 && typeof img0 === 'object' ? Object.keys(img0).slice(0,8) : null;
    const img0Str = typeof img0 === 'string' ? img0.slice(0,40) : null;
    // If img0 is object, get values
    const img0SubVals = img0Keys ? Object.values(img0).map(v => typeof v === 'string' ? ('str:'+v.slice(0,30)) : typeof v).slice(0,5) : null;

    return jsonResp({ img0Type, img0Keys, img0Str, img0SubVals, imgCount: imgVals.length });
  } catch(e) { return jsonResp({ error: e.message }); }
}
function jsonResp(d) { return new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }}); }