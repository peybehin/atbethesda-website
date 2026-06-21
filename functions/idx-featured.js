export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'no_api_key', listings: [] }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  const headers = {
    'accesskey': apiKey,
    'outputtype': 'json',
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  const fields = 'rf[]=listingID&rf[]=listingPrice&rf[]=bedrooms&rf[]=totalBaths&rf[]=sqFt&rf[]=cityName&rf[]=state&rf[]=zipcode&rf[]=image&rf[]=detailsURL&rf[]=propStatus';

  async function tryEndpoint(url) {
    const resp = await fetch(url, { headers });
    if (!resp.ok) return null;
    const text = await resp.text();
    try {
      const json = JSON.parse(text);
      // IDX returns 204/empty or an object with listings
      const entries = Array.isArray(json) ? json : Object.values(json);
      return entries.length ? entries : null;
    } catch {
      return null;
    }
  }

  try {
    // Try in order: featured → supplemental
    let entries =
      await tryEndpoint(`https://api.idxbroker.com/listings/featured?limit=12&${fields}`) ||
      await tryEndpoint(`https://api.idxbroker.com/listings/supplemental?limit=12&${fields}`);

    if (!entries || !entries.length) {
      return new Response(JSON.stringify({ error: 'no_listings', listings: [] }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const listings = entries.slice(0, 12).map(l => ({
      id: l.listingID || '',
      price: l.listingPrice || '',
      city: l.cityName || '',
      state: l.state || '',
      zip: l.zipcode || '',
      beds: l.bedrooms || '',
      baths: l.totalBaths || '',
      sqft: l.sqFt || '',
      status: (l.propStatus || 'ACTIVE').replace(/_/g, ' '),
      photo: l.image ? (l.image.url || l.image.thumb?.url || l.image['1']?.url || '') : '',
      url: l.detailsURL || 'https://search.atbethesda.com/idx/results/listings'
    }));

    return new Response(JSON.stringify({ listings }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://atbethesda.com',
        'Cache-Control': 'public, max-age=900'
      }
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, listings: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
