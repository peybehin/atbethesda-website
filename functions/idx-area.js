export async function onRequest(context) {
  const { request, env } = context;
  const apiKey = env.IDX_API_KEY;
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const idxHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': apiKey, 'outputtype': 'json' };
  
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug');
  const city = url.searchParams.get('city') || '';
  const state = url.searchParams.get('state') || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';

  if (debug === 'widgets') {
    // Get all widget JS URLs
    const r = await fetch('https://api.idxbroker.com/clients/widgetsrc?outputtype=json', { headers: idxHeaders });
    const text = await r.text();
    return new Response(JSON.stringify({ status: r.status, raw: text }), { headers: corsHeaders });
  }

  // Production mode: fetch widget JS, parse listings, filter by city
  try {
    // Fetch the known featured widget JS
    const widgetResp = await fetch('https://search.atbethesda.com/idx/widgets/160389');
    const widgetJs = await widgetResp.text();

    // Parse idxLC variable from widget JS
    const match = widgetJs.match(/var\s+idxLC\s*=\s*(\{[\s\S]*?\});/);
    if (!match) return new Response('[]', { headers: corsHeaders });
    
    let data;
    try { data = JSON.parse(match[1]); } catch(e) { return new Response('[]', { headers: corsHeaders }); }

    let listings = Object.values(data).filter(l => l && typeof l === 'object' && l.listingPrice);

    // Filter: SF only
    listings = listings.filter(l => {
      const pt = String(l.propType || l.idxPropType || l.pt || '').toLowerCase();
      return pt === 'sf' || pt === '1' || pt === '';
    });

    // Filter by city or neighborhood
    if (city) {
      const cl = city.toLowerCase();
      const byCity = listings.filter(l => (l.cityName || l.city || '').toLowerCase() === cl);
      if (byCity.length > 0) listings = byCity;
    } else if (neighborhood) {
      const nl = neighborhood.toLowerCase();
      const byN = listings.filter(l => (l.subdivision || l.neighborhood || l.cityName || '').toLowerCase().includes(nl));
      if (byN.length > 0) listings = byN;
    }

    // Sort newest first
    listings.sort((a,b) => new Date(b.listingDate||b.dateAdded||0) - new Date(a.listingDate||a.dateAdded||0));

    const mapped = listings.slice(0,9).map(l => {
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
