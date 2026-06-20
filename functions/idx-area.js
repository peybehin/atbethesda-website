export async function onRequest(context) {
  const { request, env } = context;
  const apiKey = env.IDX_API_KEY;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'IDX_API_KEY not configured' }), { status: 500, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const city         = url.searchParams.get('city')         || '';
  const state        = url.searchParams.get('state')        || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const debug        = url.searchParams.get('debug')        === '1';

  // Required IDX Broker headers
  const idxHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'accesskey': apiKey,
    'outputtype': 'json'
  };

  try {
    // Fetch /clients/featured — the only client-tier endpoint for active listings
    const featResp = await fetch(
      'https://api.idxbroker.com/clients/featured?outputtype=json&limit=50',
      { headers: idxHeaders }
    );

    const featText = await featResp.text();

    if (debug) {
      return new Response(JSON.stringify({
        status: featResp.status,
        keyPrefix: apiKey.slice(0,5),
        bodyPreview: featText.slice(0, 500)
      }), { status: 200, headers: corsHeaders });
    }

    if (!featResp.ok || featResp.status === 204) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    let data;
    try { data = JSON.parse(featText); } catch(e) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const allListings = Array.isArray(data) ? data : Object.values(data);

    // Filter: SF only (propType === 'sf' or pt=1), then by city/neighborhood
    let filtered = allListings.filter(l => {
      if (!l || typeof l !== 'object') return false;
      const pt = (l.propType || l.idxPropType || l.pt || '').toLowerCase();
      const isSF = pt === 'sf' || pt === '1' || pt === 'res' || pt === '';
      return isSF;
    });

    if (city) {
      const cityLow = city.toLowerCase();
      const cityFiltered = filtered.filter(l =>
        (l.cityName || l.city || '').toLowerCase() === cityLow
      );
      if (cityFiltered.length > 0) filtered = cityFiltered;
    }

    if (neighborhood) {
      const nbhdLow = neighborhood.toLowerCase();
      const nbhdFiltered = filtered.filter(l =>
        (l.subdivision || l.neighborhood || l.cityName || '').toLowerCase().includes(nbhdLow)
      );
      if (nbhdFiltered.length > 0) filtered = nbhdFiltered;
    }

    // Sort by listing date newest first
    filtered.sort((a, b) => {
      const da = new Date(a.listingDate || a.dateAdded || 0);
      const db = new Date(b.listingDate || b.dateAdded || 0);
      return db - da;
    });

    const listings = filtered.slice(0, 9).map(l => {
      const raw = String(l.listingPrice || l.price || '').replace(/[^0-9]/g, '');
      const price = raw ? '$' + Number(raw).toLocaleString('en-US') : '';
      const photo = (l.image && l.image.url)
                 || (l.image && l.image.resized && l.image.resized.url)
                 || (Array.isArray(l.photos) && l.photos[0])
                 || (typeof l.photos === 'string' && l.photos)
                 || '';
      return {
        price,
        address: [l.address, l.cityName || l.city, l.state, l.zip].filter(Boolean).join(', '),
        beds:   l.bedrooms  || l.beds || '',
        baths:  l.totalBaths || l.baths || '',
        sqft:   l.sqFt || l.sqft || '',
        status: (l.propStatus || l.status || 'Active').replace(/_/g, ' '),
        photo,
        url: l.detailsLink || l.url || 'https://search.atbethesda.com/idx/results/listings'
      };
    });

    return new Response(JSON.stringify(listings), { headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ _error: e.message }), { status: 200, headers: corsHeaders });
  }
}
