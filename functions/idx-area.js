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

  try {
    const params = new URLSearchParams();
    // Area filter
    if (neighborhood) {
      params.append('neighborhood[]', neighborhood);
    } else if (city) {
      params.append('city[]', city);
      if (state) params.append('state[]', state);
    }
    // Single-family homes only, newest first
    params.append('proptype[]', 'sf');
    params.append('orderby', 'listingDate');
    params.append('order', 'desc');
    params.append('limit', '12');
    params.append('outputtype', 'json');

    const apiResp = await fetch(
      'https://api.idxbroker.com/clients/activelistings?' + params.toString(),
      { headers: { 'accesskey': apiKey, 'outputtype': 'json' } }
    );

    if (apiResp.status === 204) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    if (!apiResp.ok) {
      const errText = await apiResp.text();
      // Return empty array so carousel falls back gracefully
      return new Response(
        JSON.stringify({ _error: apiResp.status, _detail: errText.slice(0, 300) }),
        { status: 200, headers: corsHeaders }
      );
    }

    const data = await apiResp.json();
    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const listings = Object.values(data)
      .filter(l => l && typeof l === 'object')
      .map(l => {
        const raw = String(l.listingPrice || '').replace(/[^0-9]/g, '');
        const price = raw ? '$' + Number(raw).toLocaleString('en-US') : '';
        const photo = (l.image && l.image.url)
                   || (l.image && l.image.resized && l.image.resized.url)
                   || '';
        return {
          price,
          address: [l.address, l.cityName, l.state, l.zip].filter(Boolean).join(', '),
          beds:   l.bedrooms  || '',
          baths:  l.totalBaths || '',
          sqft:   l.sqFt      || '',
          status: (l.propStatus || 'Active').replace(/_/g, ' '),
          photo,
          url: l.detailsLink || 'https://search.atbethesda.com/idx/results/listings'
        };
      });

    return new Response(JSON.stringify(listings), { headers: corsHeaders });

  } catch (e) {
    return new Response(JSON.stringify({ _error: e.message }), { status: 200, headers: corsHeaders });
  }
}
