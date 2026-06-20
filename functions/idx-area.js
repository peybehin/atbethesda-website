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
  const city        = url.searchParams.get('city')         || '';
  const state       = url.searchParams.get('state')        || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const debug       = url.searchParams.get('debug')        === '1';

  try {
    // Build query for IDX Broker REST API
    // Only SF (proptype=sf), newest first
    const params = new URLSearchParams();
    params.set('outputtype', 'json');
    params.set('orderby', 'listingDate');
    params.set('order', 'desc');
    params.set('limit', '12');
    // Property type: single family only
    params.append('proptype[]', 'sf');

    // Area filter
    if (neighborhood) {
      params.append('neighborhood[]', neighborhood);
    } else if (city) {
      params.append('city[]', city);
      if (state) params.append('state[]', state);
    }

    const idxUrl = 'https://api.idxbroker.com/clients/listings?' + params.toString();

    const apiResp = await fetch(idxUrl, {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json'
      }
    });

    const rawText = await apiResp.text();

    if (debug) {
      return new Response(JSON.stringify({
        status: apiResp.status,
        url: idxUrl,
        keyPrefix: apiKey.slice(0,5),
        body: rawText.slice(0, 1000)
      }), { status: 200, headers: corsHeaders });
    }

    if (apiResp.status === 204 || !rawText || rawText === '[]') {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (!apiResp.ok) {
      return new Response(JSON.stringify([]), { status: 200, headers: corsHeaders });
    }

    let data;
    try { data = JSON.parse(rawText); } catch(e) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const rows = Array.isArray(data) ? data : Object.values(data);
    const listings = rows
      .filter(l => l && typeof l === 'object')
      .map(l => {
        const raw = String(l.listingPrice || l.price || '').replace(/[^0-9]/g, '');
        const price = raw ? '$' + Number(raw).toLocaleString('en-US') : '';
        const photo = (l.image && l.image.url)
                   || (l.image && l.image.resized && l.image.resized.url)
                   || (Array.isArray(l.photos) && l.photos[0])
                   || '';
        return {
          price,
          address: [l.address, l.cityName, l.state, l.zip].filter(Boolean).join(', '),
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
