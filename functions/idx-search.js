// Cloudflare Pages Function: /functions/idx-search.js
// Uses clients/featured?idxID=b004 — the working endpoint for this account.
// clients/search is unavailable at this plan tier; featured returns real MLS listings.

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  const apiKey = context.env.IDX_API_KEY;
  if (!apiKey) return jsonResp({ error: 'no_api_key', listings: [] });

  const h = { accesskey: apiKey, outputtype: 'json' };

  try {
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    if (!r.ok) return jsonResp({ error: 'idx_' + r.status, listings: [] });

    const text = await r.text();
    if (!text || text.length < 3) return jsonResp({ error: 'empty_response', listings: [] });

    let raw;
    try { raw = JSON.parse(text); } catch(e) { return jsonResp({ error: 'parse_fail', listings: [] }); }

    // IDX Broker paginates: { data: { listingID: {...}, ... }, total: N, first, last, next, previous }
    let listings = [];
    if (raw && raw.data && typeof raw.data === 'object') {
      listings = Array.isArray(raw.data) ? raw.data : Object.values(raw.data);
    } else if (Array.isArray(raw)) {
      listings = raw;
    } else if (raw && typeof raw === 'object') {
      const vals = Object.values(raw);
      listings = vals.filter(v => v && typeof v === 'object' && !Array.isArray(v) && v.listingID);
    }

    if (listings.length === 0) return jsonResp({ error: 'no_listings', listings: [] });

    const normalized = listings.map(l => {
      const photos = [];
      const addPhoto = u => { if (typeof u === 'string' && u.startsWith('http') && !photos.includes(u)) photos.push(u); };

      if (l.image) {
        if (typeof l.image === 'string') addPhoto(l.image);
        else if (typeof l.image === 'object') Object.values(l.image).forEach(addPhoto);
      }
      ['image1','image2','image3','image4','image5','image6','image7','image8','image9','image10',
       'additionalimage1','additionalimage2','additionalimage3','additionalimage4','additionalimage5'].forEach(k => {
        const v = l[k];
        if (typeof v === 'string') addPhoto(v);
        else if (Array.isArray(v)) v.forEach(addPhoto);
        else if (v && typeof v === 'object') Object.values(v).forEach(addPhoto);
      });

      const price = parseInt(l.listingPrice || l.price || 0, 10);
      return {
        id:         l.listingID    || '',
        price,
        priceStr:   price ? '$' + price.toLocaleString() : 'Price N/A',
        beds:       l.bedrooms     || l.beds || '-',
        baths:      l.totalBaths   || l.baths || '-',
        sqft:       l.sqFt         || l.sqft || '',
        street:     [l.streetNumber, l.streetName].filter(Boolean).join(' '),
        city:       l.cityName     || l.city || '',
        state:      l.state        || 'MD',
        zip:        l.zipcode      || l.zip || '',
        status:     l.propStatus   || 'Active',
        listDate:   l.listDate     || '',
        detailsURL: l.detailsURL   || '',
        photos,
        rawFields:  Object.keys(l),
      };
    });

    return jsonResp({ listings: normalized, count: normalized.length, total: raw.total || normalized.length });
  } catch(e) {
    return jsonResp({ error: 'exception', msg: e.message, listings: [] });
  }
}

function corsHeaders() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' }
  });
}
