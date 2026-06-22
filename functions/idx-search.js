export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }
  if (!apiKey) return jsonResp({ error: 'no_api_key', listings: [] });

  const h = { accesskey: apiKey, outputtype: 'json' };

  // clients/featured with idxID=b004 is the working endpoint for this account
  // clients/search returns 400 (plan doesn't include free-form MLS search)
  let listings = [];
  try {
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    if (r.ok) {
      const text = await r.text();
      if (text && text !== 'null' && text.length > 2) {
        const raw = JSON.parse(text);
        // IDX returns either array or object keyed by listingID
        if (Array.isArray(raw)) listings = raw;
        else if (raw && typeof raw === 'object') listings = Object.values(raw);
      }
    }
  } catch(e) { /* fall through */ }

  if (listings.length === 0) return jsonResp({ error: 'no_listings', listings: [] });

  const normalized = listings.map(l => {
    // Collect all photo URLs
    const photos = [];
    const addPhoto = (v) => {
      if (typeof v === 'string' && v.startsWith('http') && !photos.includes(v)) photos.push(v);
    };

    // Primary image field
    if (l.image) {
      if (typeof l.image === 'string') addPhoto(l.image);
      else if (typeof l.image === 'object') Object.values(l.image).forEach(addPhoto);
    }

    // Additional image fields
    ['image1','image2','image3','image4','image5','image6','image7','image8','image9','image10',
     'additionalimage1','additionalimage2','additionalimage3','additionalimage4','additionalimage5',
     'imageurl','images','photos','photo'].forEach(k => {
      const v = l[k];
      if (!v) return;
      if (typeof v === 'string') addPhoto(v);
      else if (Array.isArray(v)) v.forEach(addPhoto);
      else if (typeof v === 'object') Object.values(v).forEach(addPhoto);
    });

    const price = parseInt(l.listingPrice || l.price || 0, 10);
    return {
      id:         l.listingID    || l.listingId || '',
      price,
      priceStr:   price ? '$' + price.toLocaleString() : 'Price N/A',
      beds:       l.bedrooms     || l.beds || '–',
      baths:      l.totalBaths   || l.baths || '–',
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

  return jsonResp({ listings: normalized, count: normalized.length });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=120',
    }
  });
}
