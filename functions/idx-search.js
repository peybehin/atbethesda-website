export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return jsonResp({ error: 'no_api_key', listings: [] });

    const h = { accesskey: apiKey, outputtype: 'json' };
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    const text = await r.text();

    let raw = null;
    try { raw = JSON.parse(text); } catch(pe) { return jsonResp({ error: 'parse_fail', msg: pe.message, textLen: text.length, textStart: text.slice(0,50) }); }

    if (!raw || typeof raw !== 'object') return jsonResp({ error: 'not_object', type: typeof raw });

    const listings = Array.isArray(raw) ? raw : Object.values(raw);
    if (listings.length === 0) return jsonResp({ error: 'no_listings', listings: [] });

    // Normalize first listing only to test
    const l = listings[0];
    const lType = typeof l;
    const lIsArray = Array.isArray(l);
    const lKeys = Object.keys(l || {});

    // Build minimal normalized object
    const photos = [];
    if (l && l.image && typeof l.image === 'string' && l.image.startsWith('http')) photos.push(l.image);

    const price = parseInt((l && (l.listingPrice || l.price)) || 0, 10);
    const norm0 = {
      id: (l && l.listingID) || '',
      price, priceStr: price ? '$' + price.toLocaleString() : 'N/A',
      beds: (l && l.bedrooms) || '-', baths: (l && l.totalBaths) || '-',
      sqft: (l && l.sqFt) || '',
      street: [(l && l.streetNumber), (l && l.streetName)].filter(Boolean).join(' '),
      city: (l && l.cityName) || '', state: (l && l.state) || 'MD', zip: (l && l.zipcode) || '',
      status: (l && l.propStatus) || 'Active',
      detailsURL: (l && l.detailsURL) || '',
      photos, rawFields: lKeys,
    };

    return jsonResp({ debug: { lType, lIsArray, lKeyCount: lKeys.length, totalListings: listings.length }, firstNorm: norm0 });
  } catch(e) {
    return jsonResp({ error: 'caught', msg: e.message, stack: (e.stack||'').slice(0,300) });
  }
}
function jsonResp(data) {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } });
}