export async function onRequest(context) {
  try {
    const resp = await fetch('https://search.atbethesda.com/idx/widgets/160389', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; atbethesda/1.0)',
        'Referer': 'https://atbethesda.com/',
        'Accept': '*/*'
      }
    });
    if (!resp.ok) throw new Error('Widget fetch failed: ' + resp.status);
    const js = await resp.text();

    let listings = null;

    // Strategy 1: listings passed as single-quoted attribute on custom element
    const m1 = js.match(/listings='(\[[\s\S]*?\])'/);
    if (m1) { try { listings = JSON.parse(m1[1]); } catch(e){} }

    // Strategy 2: listings as double-quoted attribute
    if (!listings) {
      const m2 = js.match(/listings="(\[[\s\S]*?\])"/);
      if (m2) { try { listings = JSON.parse(m2[1]); } catch(e){} }
    }

    // Strategy 3: find first JS array containing listingID objects
    if (!listings) {
      const m3 = js.match(/\[\s*\{[^\[]*?"listingID"[\s\S]*?\](?=\s*[,;\)])/);
      if (m3) { try { listings = JSON.parse(m3[0]); } catch(e){} }
    }

    // Strategy 4: find widgetData or props object
    if (!listings) {
      const m4 = js.match(/"listings"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
      if (m4) { try { listings = JSON.parse(m4[1]); } catch(e){} }
    }

    if (!listings || !Array.isArray(listings) || !listings.length) {
      return new Response(JSON.stringify({ error: 'parse_failed', listings: [] }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const clean = listings.slice(0, 9).map(l => ({
      price: l.listingPrice || '',
      address: l.address || '',
      city: l.cityName || '',
      state: l.stateAbrv || '',
      zip: l.zipcode || '',
      beds: l.bedrooms || '',
      baths: l.totalBaths || '',
      sqft: l.sqFt || '',
      status: (l.propStatus || 'ACTIVE').replace(/_/g, ' '),
      photo: (l.image && (l.image.url || (l.image.resized && l.image.resized.url) || (l.image.thumb && l.image.thumb.url))) || '',
      url: l.detailsURL || 'https://search.atbethesda.com/idx/results/listings'
    }));

    return new Response(JSON.stringify({ listings: clean }), {
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