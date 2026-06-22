export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };

    // Test every relevant endpoint
    const tests = {};

    // 1. MLS search - the correct free-form property search endpoint
    const r1 = await fetch('https://api.idxbroker.com/mls/search?pt=1&lp=200000&hp=10000000&limit=5', { headers: h });
    tests.mls_search = { status: r1.status, body: (await r1.text()).slice(0,80) };

    // 2. MLS listings
    const r2 = await fetch('https://api.idxbroker.com/mls/listings?limit=5', { headers: h });
    tests.mls_listings = { status: r2.status, body: (await r2.text()).slice(0,80) };

    // 3. Clients sold/pending
    const r3 = await fetch('https://api.idxbroker.com/clients/soldpending?limit=5', { headers: h });
    tests.soldpending = { status: r3.status, body: (await r3.text()).slice(0,80) };

    // 4. Clients supplemental
    const r4 = await fetch('https://api.idxbroker.com/clients/supplemental?limit=5', { headers: h });
    tests.supplemental = { status: r4.status, body: (await r4.text()).slice(0,80) };

    // 5. Clients search with just a city param (no other params)
    const r5 = await fetch('https://api.idxbroker.com/clients/search?city=Bethesda', { headers: h });
    tests.clients_search_city = { status: r5.status, body: (await r5.text()).slice(0,80) };

    // 6. Check what savedlinks returns (empty but confirm 204 vs 200)
    const r6 = await fetch('https://api.idxbroker.com/clients/savedlinks', { headers: h });
    tests.savedlinks = { status: r6.status, body: (await r6.text()).slice(0,80) };

    return resp({ tests });
  } catch(e) {
    return resp({ error: e.message, stack: (e.stack||'').slice(0,200) });
  }
}
function resp(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
  });
}