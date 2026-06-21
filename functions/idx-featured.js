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

  try {
    // Try /listings/featured first, fall back to /listings/search
    let data = null;

    const featuredResp = await fetch(
      `https://api.idxbroker.com/listings/featured?limit=12&${fields}`,
      { headers }
    );

    if (featuredResp.ok) {
      data = await featuredResp.json();
    } else {
      // Fallback: search for active single-family listings in Bethesda area
      const searchResp = await fetch(
        `https://api.idxbroker.com/listings/search?limit=12&pt=sf&a_propStatus[]=Active&${fields}`,
        { headers }
      );
      if (searchResp.ok) {
        data = await searchResp.json();
      } else {
        const errText = await searchResp.text();
        return new Response(JSON.stringify({ error: 'api_error_' + searchResp.status, detail: errText.substring(0, 200), listings: [] }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

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
