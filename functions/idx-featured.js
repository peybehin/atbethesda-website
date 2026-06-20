export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'no_api_key', listings: [] }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    // Use IDX Broker API directly - much more reliable than widget scraping
    const resp = await fetch('https://api.idxbroker.com/listings/featured?limit=12&rf[]=listingID&rf[]=listingPrice&rf[]=bedrooms&rf[]=totalBaths&rf[]=sqFt&rf[]=cityName&rf[]=state&rf[]=zipcode&rf[]=image&rf[]=detailsURL&rf[]=propStatus', {
      headers: {
        'accesskey': apiKey,
        'outputtype': 'json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: 'api_error_' + resp.status, detail: errText.substring(0, 200), listings: [] }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await resp.json();

    // IDX Broker API returns object keyed by listingID
    const entries = Array.isArray(data) ? data : Object.values(data);

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
      photo: l.image ? (l.image.url || l.image.thumb?.url || '') : '',
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