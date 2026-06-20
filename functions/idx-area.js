export async function onRequest(context) {
  const { request, env } = context;
  const apiKey = env.IDX_API_KEY;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(request.url);
  const city         = url.searchParams.get('city')         || '';
  const state        = url.searchParams.get('state')        || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const debug        = url.searchParams.get('debug')        === '1';

  const idxHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accesskey': apiKey,
    'outputtype': 'json'
  };

  // Debug: test multiple endpoints
  if (debug) {
    const tests = {};

    // Test 1: systemlinks (simple metadata, should always work)
    const r1 = await fetch('https://api.idxbroker.com/clients/systemlinks?outputtype=json', { headers: idxHeaders });
    tests.systemlinks = { status: r1.status, body: (await r1.text()).slice(0, 200) };

    // Test 2: featured
    const r2 = await fetch('https://api.idxbroker.com/clients/featured?outputtype=json&limit=5', { headers: idxHeaders });
    tests.featured = { status: r2.status, body: (await r2.text()).slice(0, 200) };

    // Test 3: widgetsrc
    const r3 = await fetch('https://api.idxbroker.com/clients/widgetsrc?outputtype=json', { headers: idxHeaders });
    tests.widgetsrc = { status: r3.status, body: (await r3.text()).slice(0, 300) };

    return new Response(JSON.stringify({ keyPrefix: (apiKey||'').slice(0,5), tests }), { status: 200, headers: corsHeaders });
  }

  // Production: use /clients/featured, filter by city
  try {
    const featResp = await fetch(
      'https://api.idxbroker.com/clients/featured?outputtype=json&limit=50',
      { headers: idxHeaders }
    );

    if (!featResp.ok || featResp.status === 204) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const featText = await featResp.text();
    let data; try { data = JSON.parse(featText); } catch(e) { return new Response('[]', { headers: corsHeaders }); }

    const allListings = Array.isArray(data) ? data : Object.values(data);

    let filtered = allListings.filter(l => l && typeof l === 'object');

    if (city) {
      const cityLow = city.toLowerCase();
      const byCity = filtered.filter(l => (l.cityName || l.city || '').toLowerCase() === cityLow);
      if (byCity.length > 0) filtered = byCity;
    }

    filtered.sort((a,b) => new Date(b.listingDate||b.dateAdded||0) - new Date(a.listingDate||a.dateAdded||0));

    const listings = filtered.slice(0,9).map(l => {
      const raw = String(l.listingPrice || '').replace(/[^0-9]/g,'');
      return {
        price: raw ? '$'+Number(raw).toLocaleString('en-US') : '',
        address: [l.address,l.cityName,l.state,l.zip].filter(Boolean).join(', '),
        beds: l.bedrooms||'', baths: l.totalBaths||'', sqft: l.sqFt||'',
        status: (l.propStatus||'Active').replace(/_/g,' '),
        photo: (l.image&&l.image.url)||'',
        url: l.detailsLink||'https://search.atbethesda.com/idx/results/listings'
      };
    });

    return new Response(JSON.stringify(listings), { headers: corsHeaders });
  } catch(e) {
    return new Response(JSON.stringify({_error:e.message}), { status: 200, headers: corsHeaders });
  }
}
