export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return resp({ error: 'no_api_key', listings: [] });

    const url = new URL(context.request.url);
    const city = url.searchParams.get('city') || 'Bethesda';

    const qp = ['pt=1','a_beds=1','lp=200000','hp=10000000','ccz=city','limit=5',
      'city=' + encodeURIComponent(city)].join('&');

    const idxResp = await fetch(
      'https://api.idxbroker.com/clients/search?' + qp,
      { headers: { accesskey: apiKey, outputtype: 'json', 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    const text = await idxResp.text();

    let raw = null;
    try { raw = JSON.parse(text); } catch(e) {}

    let listings = [];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) listings = Object.values(raw);
    else if (Array.isArray(raw)) listings = raw;

    const normalized = listings.map(l => ({
      id: l.listingID || '',
      price: parseInt(l.listingPrice || 0, 10),
      priceStr: l.listingPrice ? '$' + parseInt(l.listingPrice).toLocaleString() : 'N/A',
      beds: l.bedrooms || '-', baths: l.totalBaths || '-', sqft: l.sqFt || '',
      street: (l.streetNumber||'') + ' ' + (l.streetName||''),
      city: l.cityName||'', state: l.state||'MD', zip: l.zipcode||'',
      status: l.propStatus || 'Active', listDate: l.listDate||'',
      detailsURL: l.detailsURL || '',
      photos: l.image ? (typeof l.image === 'string' ? [l.image] : Object.values(l.image||{}).filter(v=>typeof v==='string'&&v.startsWith('http'))) : [],
      rawFields: Object.keys(l)
    }));

    return resp({
      listings: normalized, count: normalized.length,
      idxStatus: idxResp.status,
      idxBody: text.slice(0, 300),
      error: normalized.length === 0 ? 'no_listings' : null
    });
  } catch(e) {
    return resp({ error: e.message, stack: (e.stack||'').slice(0,300), listings: [] });
  }
}
function resp(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }
  });
}
