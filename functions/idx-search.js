export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };

    const tests = {};

    // Get city codes for the client account
    const r1 = await fetch('https://api.idxbroker.com/clients/cities', { headers: h });
    tests.cities = { status: r1.status, body: (await r1.text()).slice(0,300) };

    // Get county codes
    const r2 = await fetch('https://api.idxbroker.com/clients/counties', { headers: h });
    tests.counties = { status: r2.status, body: (await r2.text()).slice(0,150) };

    // Get zip codes
    const r3 = await fetch('https://api.idxbroker.com/clients/zipcodes', { headers: h });
    tests.zips = { status: r3.status, body: (await r3.text()).slice(0,150) };

    // Try clients/search with no params (just get the saved links list)
    const r4 = await fetch('https://api.idxbroker.com/clients/search', { headers: h });
    tests.search_bare = { status: r4.status, body: (await r4.text()).slice(0,150) };

    // soldpending body sample
    const r5 = await fetch('https://api.idxbroker.com/clients/soldpending?limit=2', { headers: h });
    tests.soldpending = { status: r5.status, body: (await r5.text()).slice(0,200) };

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