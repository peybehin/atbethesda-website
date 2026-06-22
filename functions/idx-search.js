export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    const url = new URL(context.request.url);
    const city = url.searchParams.get('city') || 'Bethesda';
    const limit = parseInt(url.searchParams.get('limit') || '5', 10);

    if (!apiKey) {
      return resp({ error: 'no_api_key', listings: [] });
    }

    const qp = [
      'pt=1', 'a_beds=1', 'lp=200000', 'hp=10000000',
      'ccz=city', 'limit=' + limit,
      'rf[]=listingID', 'rf[]=listingPrice', 'rf[]=bedrooms',
      'rf[]=totalBaths', 'rf[]=sqFt', 'rf[]=cityName',
      'rf[]=streetNumber', 'rf[]=streetName', 'rf[]=state',
      'rf[]=zipcode', 'rf[]=image', 'rf[]=detailsURL',
      'rf[]=propStatus', 'rf[]=listDate',
      'city=' + encodeURIComponent(city)
    ];

    const idxResp = await fetch(
      'https://api.idxbroker.com/clients/search?' + qp.join('&'),
      { headers: { accesskey: apiKey, outputtype: 'json' } }
    );
    const status = idxResp.status;
    const text = await idxResp.text();

    let raw = null;
    try { raw = JSON.parse(text); } catch (e) {}

    let listings = [];
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      listings = Object.values(raw);
    } else if (Array.isArray(raw)) {
      listings = raw;
    }

    const normalized = listings.map(l => ({
      id:       l.listingID   || '',
      price:    parseInt(l.listingPrice || 0, 10),
      priceStr: l.listingPrice ? '$' + parseInt(l.listingPrice).toLocaleString() : 'N/A',
      beds:     l.bedrooms    || '–',
      baths:    l.totalBaths  || '–',
      sqft:     l.sqFt        || '',
      street:   (l.streetNumber || '') + ' ' + (l.streetName || ''),
      city:     l.cityName    || '',
      state:    l.state       || '',
      zip:      l.zipcode     || '',
      status:   l.propStatus  || 'Active',
      listDate: l.listDate    || '',
      detailsURL: l.detailsURL || '',
      photos:   l.image ? [l.image] : [],
      rawFields: Object.keys(l)
    }));

    return resp({
      listings: normalized,
      count: normalized.length,
      idxStatus: status,
      rawLength: text.length,
      error: normalized.length === 0 ? 'no_listings' : null
    });

  } catch (e) {
    return resp({ error: e.message, stack: e.stack, listings: [] });
  }
}

function resp(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=60'
    }
  });
}
