export async function onRequest(context) {
  const { request, env } = context;
  const apiKey = env.IDX_API_KEY;
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const idxHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': apiKey, 'outputtype': 'json' };

  const url = new URL(request.url);
  const city = url.searchParams.get('city') || '';
  const state = url.searchParams.get('state') || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const debug = url.searchParams.get('debug') || '';

  if (debug === 'widgets') {
    const r = await fetch('https://api.idxbroker.com/clients/widgetsrc?outputtype=json', { headers: idxHeaders });
    return new Response(JSON.stringify({ status: r.status, raw: await r.text() }), { headers: corsHeaders });
  }

  try {
    const widgetResp = await fetch('https://search.atbethesda.com/idx/widgets/160389');
    const widgetJs = await widgetResp.text();

    if (debug === 'raw') {
      return new Response(JSON.stringify({ len: widgetJs.length, preview: widgetJs.slice(0,500) }), { headers: corsHeaders });
    }

    // Parse the idxLC object from widget JS
    // Widget JS looks like: var idxLC = {...};
    const matchIdx = widgetJs.indexOf('var idxLC');
    if (matchIdx === -1) {
      if (debug) return new Response(JSON.stringify({ error: 'idxLC not found', preview: widgetJs.slice(0,300) }), { headers: corsHeaders });
      return new Response('[]', { headers: corsHeaders });
    }

    // Find the JSON object start
    const objStart = widgetJs.indexOf('{', matchIdx);
    // Find the matching closing brace
    let depth = 0, objEnd = -1;
    for (let i = objStart; i < widgetJs.length; i++) {
      if (widgetJs[i] === '{') depth++;
      else if (widgetJs[i] === '}') { depth--; if (depth === 0) { objEnd = i; break; } }
    }

    if (objEnd === -1) {
      if (debug) return new Response(JSON.stringify({ error: 'no closing brace' }), { headers: corsHeaders });
      return new Response('[]', { headers: corsHeaders });
    }

    let data;
    try { data = JSON.parse(widgetJs.slice(objStart, objEnd+1)); } catch(e) {
      if (debug) return new Response(JSON.stringify({ error: 'JSON parse failed: '+e.message }), { headers: corsHeaders });
      return new Response('[]', { headers: corsHeaders });
    }

    let listings = Object.values(data).filter(l => l && typeof l === 'object');

    if (debug === 'all') {
      const sample = listings.slice(0,3).map(l => ({ city: l.cityName, pt: l.propType||l.idxPropType||l.pt, price: l.listingPrice, addr: l.address }));
      return new Response(JSON.stringify({ total: listings.length, sample }), { headers: corsHeaders });
    }

    // Filter: SF only (pt=1 in IDX Broker = Single Family)
    const sfListings = listings.filter(l => {
      const pt = String(l.propType || l.idxPropType || l.pt || '').toLowerCase();
      return pt === 'sf' || pt === '1' || pt === 'res' || pt === 'resi';
    });

    // Use sfListings if not empty, else use all (so carousel shows something)
    let filtered = sfListings.length > 0 ? sfListings : listings;

    if (city) {
      const cl = city.toLowerCase();
      const byCity = filtered.filter(l => (l.cityName || '').toLowerCase() === cl);
      if (byCity.length > 0) filtered = byCity;
    } else if (neighborhood) {
      const nl = neighborhood.toLowerCase();
      const byN = filtered.filter(l => (l.subdivision || l.neighborhood || l.cityName || '').toLowerCase().includes(nl));
      if (byN.length > 0) filtered = byN;
    }

    filtered.sort((a,b) => new Date(b.listingDate||b.dateAdded||0) - new Date(a.listingDate||a.dateAdded||0));

    const mapped = filtered.slice(0,9).map(l => {
      const raw = String(l.listingPrice||'').replace(/[^0-9]/g,'');
      return {
        price: raw ? '$'+Number(raw).toLocaleString('en-US') : '',
        address: [l.address,l.cityName,l.state,l.zip].filter(Boolean).join(', '),
        beds: l.bedrooms||'', baths: l.totalBaths||'', sqft: l.sqFt||'',
        status: (l.propStatus||'Active').replace(/_/g,' '),
        photo: (l.image&&l.image.url)||(l.image&&l.image.resized&&l.image.resized.url)||'',
        url: l.detailsLink||'https://search.atbethesda.com/idx/results/listings'
      };
    });

    return new Response(JSON.stringify(mapped), { headers: corsHeaders });
  } catch(e) {
    return new Response(JSON.stringify({_error: e.message}), { headers: corsHeaders });
  }
}
