export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };

    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    const text = await r.text();
    let raw = null;
    try { raw = JSON.parse(text); } catch(e) {}

    if (!raw || (typeof raw === 'object' && Object.keys(raw).length === 0)) {
      return resp({ error: 'no_data', status: r.status, len: text.length });
    }

    // Get listings array
    const listings = Array.isArray(raw) ? raw : Object.values(raw);
    const first = listings[0] || {};

    // Return structural info about the first listing (field names + types only, not values)
    const fieldTypes = {};
    for (const [k,v] of Object.entries(first)) {
      fieldTypes[k] = typeof v === 'string' ? (v.startsWith('http') ? 'url:' + v.slice(0,30) : 'str:' + v.slice(0,20)) : typeof v;
    }

    return resp({
      count: listings.length,
      fieldTypes,
      listingKeys: Object.keys(first)
    });
  } catch(e) { return resp({ error: e.message }); }
}
function resp(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}