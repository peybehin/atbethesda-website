export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return jsonResp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    const text = await r.text();
    let raw;
    try { raw = JSON.parse(text); } catch(e) { return jsonResp({ error: 'parse', msg: e.message }); }

    // Map every top-level key → its type + length
    const topLevel = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === 'number')       topLevel[k] = 'number:' + v;
      else if (typeof v === 'string')  topLevel[k] = 'string(' + v.length + ')';
      else if (Array.isArray(v))       topLevel[k] = 'array[' + v.length + ']';
      else if (v && typeof v === 'object') {
        const subKeys = Object.keys(v);
        const firstSubType = subKeys.length > 0 ? typeof Object.values(v)[0] : 'empty';
        topLevel[k] = 'object{' + subKeys.length + '}first=' + firstSubType;
      }
      else topLevel[k] = String(typeof v);
    }

    return jsonResp({ topLevel, rawIsArray: Array.isArray(raw), rawKeyCount: Object.keys(raw).length });
  } catch(e) { return jsonResp({ error: e.message }); }
}
function jsonResp(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}