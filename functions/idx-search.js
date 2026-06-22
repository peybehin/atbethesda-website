// Cloudflare Pages Function: /functions/idx-search.js
// Proxies IDX Broker clients/featured?idxID=b004 — the only working endpoint for this account.
// Response structure: { data: { listingID: { price, image: {0:{url,sizes,caption},...}, ... } }, total, first, last }

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsH() });
  }
  const apiKey = context.env.IDX_API_KEY;
  if (!apiKey) return jsonR({ error: 'no_api_key', listings: [] });

  try {
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', {
      headers: { accesskey: apiKey, outputtype: 'json' }
    });
    if (!r.ok) return jsonR({ error: 'idx_http_' + r.status, listings: [] });

    const raw = JSON.parse(await r.text());
    // IDX wraps results: { data: {listingID: {...}}, total, first, last, next, previous }
    const dataMap = raw && raw.data;
    if (!dataMap || typeof dataMap !== 'object') return jsonR({ error: 'no_data', listings: [] });

    const listings = Array.isArray(dataMap) ? dataMap : Object.values(dataMap);
    if (listings.length === 0) return jsonR({ error: 'no_listings', listings: [] });

    const normalized = listings.map(l => {
      // Photos: image is { "0": {url,sizes,caption}, "1": {...}, ... }
      const photos = [];
      if (l.image && typeof l.image === 'object') {
        Object.values(l.image).forEach(photo => {
          if (photo && typeof photo === 'object' && photo.url && photo.url.startsWith('http')) {
            photos.push(photo.url);
          } else if (typeof photo === 'string' && photo.startsWith('http')) {
            photos.push(photo);
          }
        });
      }

      // Price: l.price is a clean number; l.listingPrice is "$445,000" formatted string
      const price = typeof l.price === 'number' ? l.price : parseInt((l.listingPrice || '').replace(/[^0-9]/g, '') || '0', 10);

      // Status: idxStatus is lowercase ('active','uc','pending','sold')
      // propStatus is display string ('ACTIVE', 'ACTIVE UNDER CONTRACT', 'SOLD', etc.)
      const status = l.propStatus || l.idxStatus || 'Active';

      return {
        id:         l.listingID    || '',
        price,
        priceStr:   price ? '$' + price.toLocaleString() : (l.listingPrice || 'Price N/A'),
        beds:       l.bedrooms     || '-',
        baths:      l.totalBaths   || '-',
        sqft:       l.sqFt         || '',
        street:     [l.streetNumber, l.streetDirection, l.streetName].filter(Boolean).join(' '),
        unit:       l.unitNumber   || '',
        city:       l.cityName     || '',
        state:      l.state        || 'MD',
        zip:        l.zipcode      || '',
        status,
        listDate:   l.dateAdded    || '',
        detailsURL: l.fullDetailsURL || l.detailsURL || '',
        subdivision: l.subdivision  || '',
        photos,
        rawFields:  Object.keys(l),
      };
    });

    return jsonR({ listings: normalized, count: normalized.length, total: raw.total || normalized.length });
  } catch(e) {
    return jsonR({ error: 'exception', msg: e.message, listings: [] });
  }
}

function corsH() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}
function jsonR(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' }
  });
}
