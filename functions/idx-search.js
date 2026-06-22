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
    const dataMap = raw && raw.data;
    if (!dataMap || typeof dataMap !== 'object') return jsonR({ error: 'no_data', listings: [] });

    const listings = Array.isArray(dataMap) ? dataMap : Object.values(dataMap);
    if (listings.length === 0) return jsonR({ error: 'no_listings', listings: [] });

    const normalized = listings.map(l => {
      // Photos: image is { "0": {url, sizes, caption}, "1": {...}, ... }
      const photos = [];
      if (l.image && typeof l.image === 'object') {
        Object.values(l.image).forEach((photo, _i) => {
          if (photo && typeof photo === 'object' && photo.url && photo.url.startsWith('http')) {
            // cover (index 0): keep the optimized IDX-hosted image.
            // gallery: use the 1024x768 thumbnail for speed (full is 2048x1536).
            const _t = photo.sizes && photo.sizes.thumb;
            photos.push(_i === 0 ? photo.url : (_t && _t.indexOf('http') === 0 ? _t : photo.url));
          } else if (typeof photo === 'string' && photo.startsWith('http')) {
            photos.push(photo);
          }
        });
      }

      // Price: l.price is already a clean number
      const price = typeof l.price === 'number' ? l.price
                  : parseInt(String(l.listingPrice || '').replace(/[^0-9]/g, '') || '0', 10);

      // Sqft: IDX returns "1,060" (comma-formatted string) — parse to integer
      // so the HTML template's parseInt() call works correctly
      const sqftRaw = l.sqFt || '';
      const sqft = sqftRaw ? (parseInt(String(sqftRaw).replace(/,/g, ''), 10) || '') : '';

      const status = l.propStatus || l.idxStatus || 'Active';

      return {
        id:          l.listingID     || '',
        price,
        priceStr:    price ? '$' + price.toLocaleString() : (l.listingPrice || 'Price N/A'),
        beds:        l.bedrooms      || '-',
        baths:       l.totalBaths    || '-',
        sqft,
        street:      [l.streetNumber, l.streetDirection, l.streetName].filter(Boolean).join(' '),
        unit:        l.unitNumber    || '',
        city:        l.cityName      || '',
        state:       l.state         || 'MD',
        zip:         l.zipcode       || '',
        status,
        listDate:    l.dateAdded     || '',
        detailsURL:  l.fullDetailsURL || l.detailsURL || '',
        subdivision: l.subdivision   || '',
        photos,
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
