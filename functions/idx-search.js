// Cloudflare Pages Function: /functions/idx-search.js
// Proxies IDX Broker search API with CORS headers
// Endpoint: GET /idx-search?city=Bethesda&minBeds=2&minPrice=400000&maxPrice=3000000&limit=15

export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;

  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  if (!apiKey) {
    return jsonResponse({ error: 'no_api_key', listings: [] }, 200);
  }

  const url = new URL(context.request.url);
  const params = url.searchParams;

  const city     = params.get('city')     || '';
  const minBeds  = params.get('minBeds')  || '1';
  const minPrice = params.get('minPrice') || '200000';
  const maxPrice = params.get('maxPrice') || '5000000';
  const limit    = Math.min(parseInt(params.get('limit') || '20', 10), 50);
  const propType = params.get('pt')       || '1';

  const queryParts = [
    `pt=${propType}`,
    `a_beds=${minBeds}`,
    `lp=${minPrice}`,
    `hp=${maxPrice}`,
    `ccz=city`,
    `limit=${limit}`,
    'rf[]=listingID',
    'rf[]=listingPrice',
    'rf[]=bedrooms',
    'rf[]=totalBaths',
    'rf[]=sqFt',
    'rf[]=cityName',
    'rf[]=streetNumber',
    'rf[]=streetName',
    'rf[]=state',
    'rf[]=zipcode',
    'rf[]=image',
    'rf[]=detailsURL',
    'rf[]=propStatus',
    'rf[]=listDate',
    'rf[]=acres',
    'rf[]=garage',
    'rf[]=yearBuilt',
  ];

  if (city) queryParts.push(`city=${encodeURIComponent(city)}`);

  const idxHeaders = {
    'accesskey': apiKey,
    'outputtype': 'json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  let listings = [];
  let rawResponse = null;

  try {
    const searchUrl = `https://api.idxbroker.com/clients/search?${queryParts.join('&')}`;
    const resp = await fetch(searchUrl, { headers: idxHeaders });
    const text = await resp.text();
    if (resp.ok && text && text !== 'null' && text !== '[]') {
      try { rawResponse = JSON.parse(text); } catch { rawResponse = null; }
    }
  } catch (e) { rawResponse = null; }

  if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
    listings = Object.values(rawResponse);
  } else if (Array.isArray(rawResponse)) {
    listings = rawResponse;
  }

  if (listings.length === 0) {
    try {
      const featUrl = `https://api.idxbroker.com/clients/featured?rf[]=listingID&rf[]=listingPrice&rf[]=bedrooms&rf[]=totalBaths&rf[]=sqFt&rf[]=cityName&rf[]=streetNumber&rf[]=streetName&rf[]=state&rf[]=zipcode&rf[]=image&rf[]=detailsURL&rf[]=propStatus&rf[]=listDate`;
      const resp = await fetch(featUrl, { headers: idxHeaders });
      const text = await resp.text();
      if (resp.ok && text && text !== 'null' && text !== '[]') {
        try {
          const parsed = JSON.parse(text);
          if (typeof parsed === 'object' && !Array.isArray(parsed)) {
            listings = Object.values(parsed);
          } else if (Array.isArray(parsed)) {
            listings = parsed;
          }
        } catch { }
      }
    } catch { }
  }

  if (listings.length === 0) {
    return jsonResponse({ error: 'no_listings', listings: [] }, 200);
  }

  const normalized = listings.map(l => normalizeListing(l));
  return jsonResponse({ listings: normalized, count: normalized.length }, 200);
}

function normalizeListing(l) {
  const photos = [];

  if (l.image && typeof l.image === 'string' && l.image.startsWith('http')) {
    photos.push(l.image);
  } else if (l.image && typeof l.image === 'object') {
    Object.values(l.image).forEach(v => {
      if (typeof v === 'string' && v.startsWith('http')) photos.push(v);
    });
  }

  ['image2','image3','image4','image5','image6','image7','image8','image9','image10',
   'additionalimage1','additionalimage2','additionalimage3','additionalimage4','additionalimage5',
   'images','photos'].forEach(key => {
    const val = l[key] || l[key.toLowerCase()] || l[key.toUpperCase()];
    if (!val) return;
    if (typeof val === 'string' && val.startsWith('http') && !photos.includes(val)) {
      photos.push(val);
    } else if (Array.isArray(val)) {
      val.forEach(v => {
        if (typeof v === 'string' && v.startsWith('http') && !photos.includes(v)) photos.push(v);
        if (typeof v === 'object' && v.url && !photos.includes(v.url)) photos.push(v.url);
        if (typeof v === 'object' && v.fullURL && !photos.includes(v.fullURL)) photos.push(v.fullURL);
      });
    }
  });

  const price = parseInt(l.listingPrice || l.price || 0, 10);

  return {
    id:         l.listingID    || l.listingId || '',
    price:      price,
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
    photos:     photos,
    rawFields:  Object.keys(l),
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=120',
    }
  });
}
