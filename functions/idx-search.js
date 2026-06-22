export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };
    const tests = {};

    // KEY THEORY: idxID=b004 is the required MLS connection parameter
    // Try search WITH idxID
    const r1 = await fetch('https://api.idxbroker.com/clients/search?idxID=b004&limit=5', { headers: h });
    tests.search_b004 = { status: r1.status, len: 0 };
    const t1 = await r1.text(); tests.search_b004.len = t1.length;
    try { const p = JSON.parse(t1); tests.search_b004.count = Array.isArray(p) ? p.length : Object.keys(p).length; tests.search_b004.sample = JSON.stringify(p).slice(0,100); } catch(e) { tests.search_b004.parseErr = e.message; tests.search_b004.raw = t1.slice(0,80); }

    // Try search with idxID + city
    const r2 = await fetch('https://api.idxbroker.com/clients/search?idxID=b004&ccz=city&city=Bethesda&limit=5', { headers: h });
    tests.search_b004_bethesda = { status: r2.status };
    const t2 = await r2.text();
    try { const p = JSON.parse(t2); tests.search_b004_bethesda.count = Array.isArray(p) ? p.length : Object.keys(p).length; } catch(e) { tests.search_b004_bethesda.raw = t2.slice(0,60); }

    // Try combinedActiveMLS
    const r3 = await fetch('https://api.idxbroker.com/clients/search?idxID=combinedActiveMLS&limit=5', { headers: h });
    tests.search_combined = { status: r3.status };
    const t3 = await r3.text();
    try { const p = JSON.parse(t3); tests.search_combined.count = Array.isArray(p) ? p.length : Object.keys(p).length; } catch(e) { tests.search_combined.raw = t3.slice(0,60); }

    // Try featured WITH idxID
    const r4 = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004&limit=5', { headers: h });
    tests.featured_b004 = { status: r4.status };
    const t4 = await r4.text();
    try { const p = JSON.parse(t4); tests.featured_b004.count = Array.isArray(p) ? p.length : Object.keys(p).length; } catch(e) { tests.featured_b004.raw = t4.slice(0,60); }

    return resp({ tests });
  } catch(e) { return resp({ error: e.message }); }
}
function resp(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}