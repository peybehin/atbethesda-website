export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key' });

    const h = { accesskey: apiKey, outputtype: 'json' };

    // Try 1: minimal search (no city)
    const t1 = await (await fetch('https://api.idxbroker.com/clients/search?pt=1&lp=200000&hp=10000000&limit=5', { headers: h })).text();
    const s1 = await (await fetch('https://api.idxbroker.com/clients/search?pt=1&lp=200000&hp=10000000&limit=5', { headers: h })).status;

    // Try 2: savedlinks
    const r2 = await fetch('https://api.idxbroker.com/clients/savedlinks', { headers: h });
    const t2 = await r2.text();

    // Try 3: listings endpoint
    const r3 = await fetch('https://api.idxbroker.com/clients/listings?limit=5', { headers: h });
    const t3 = await r3.text();

    return resp({
      search_status: s1,
      search_len: t1.length,
      search_first50: t1.slice(0, 50),
      savedlinks_status: r2.status,
      savedlinks_first50: t2.slice(0, 50),
      listings_status: r3.status,
      listings_first50: t3.slice(0, 50)
    });
  } catch(e) {
    return resp({ error: e.message });
  }
}
function resp(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
  });
}
