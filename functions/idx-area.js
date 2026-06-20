export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const city         = url.searchParams.get('city')         || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const debug        = url.searchParams.get('debug')        || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=600'
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Must include User-Agent — without it the widget returns an HTML error page
    const resp = await fetch('https://search.atbethesda.com/idx/widgets/160389', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; atbethesda/1.0)',
        'Referer': 'https://atbethesda.com/'
      }
    });
    if (!resp.ok) throw new Error('Widget fetch failed: ' + resp.status);
    const js = await resp.text();

    // Debug: inspect raw structure
    if (debug === 'raw') {
      return new Response(JSON.stringify({
        len: js.length,
        has_bedrooms:    js.includes('"bedrooms"'),
        has_listingPrice: js.includes('"listingPrice"'),
        has_cityName:    js.includes('"cityName"'),
        has_propType:    js.includes('"propType"'),
        has_idxPropType: js.includes('"idxPropType"'),
        preview: js.slice(0, 600)
      }), { headers: corsHeaders });
    }

    // Parse listings — mirror idx-featured.js strategies
    let listings = null;

    // m1: listings="[...]"
    const m1 = js.match(/listings="(\[[\s\S]*?\])"/);
    if (m1) { try { listings = JSON.parse(m1[1]); } catch(e) {} }

    // m2: listings='[...]'
    if (!listings) {
      const m2 = js.match(/listings='(\[[\s\S]*?\])'/);
      if (m2) { try { listings = JSON.parse(m2[1]); } catch(e) {} }
    }

    // m3: raw array containing "listingID"
    if (!listings) {
      const m3 = js.match(/\[\s*\{[^\[]*?"listingID"[\s\S]*?\](?=\s*[,;\)])/);
      if (m3) { try { listings = JSON.parse(m3[0]); } catch(e) {} }
    }

    // m4: "listings": [...]
    if (!listings) {
      const m4 = js.match(/"listings"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
      if (m4) { try { listings = JSON.parse(m4[1]); } catch(e) {} }
    }

    if (!listings || !listings.length) {
      if (debug) return new Response(JSON.stringify({ error: 'parse_failed', len: js.length, preview: js.slice(0,600) }), { headers: corsHeaders });
      return new Response('[]', { headers: corsHeaders });
    }

    // Debug: show all parsed listing samples + fields
    if (debug === 'all') {
      const sample = listings.slice(0, 3).map(l => ({
        cityName: l.cityName, propType: l.propType, idxPropType: l.idxPropType,
        pt: l.pt, price: l.listingPrice, status: l.propStatus, date: l.listingDate
      }));
      return new Response(JSON.stringify({ total: listings.length, sample }), { headers: corsHeaders });
    }

    // Filter: single family only — exclude known condo/townhouse types
    const EXCLUDE_TYPES = ['co','2','cc','condo','th','3','tc','townhouse','mf','4','multi'];
    let filtered = listings.filter(l => {
      const pt = String(l.propType || l.idxPropType || l.pt || '').toLowerCase().trim();
      return !EXCLUDE_TYPES.includes(pt);
    });
    if (filtered.length === 0) filtered = listings; // safety: if all filtered out, use all

    // Filter by city or neighborhood
    if (city) {
      const cl = city.toLowerCase();
      const byCity = filtered.filter(l => (l.cityName || '').toLowerCase() === cl);
      if (byCity.length > 0) filtered = byCity;
    } else if (neighborhood) {
      const nl = neighborhood.toLowerCase();
      const byN = filtered.filter(l =>
        (l.subdivision || l.neighborhood || l.cityName || '').toLowerCase().includes(nl)
      );
      if (byN.length > 0) filtered = byN;
    }

    // Sort newest first
    filtered.sort((a,b) =>
      new Date(b.listingDate || b.dateAdded || 0) - new Date(a.listingDate || a.dateAdded || 0)
    );

    const mapped = filtered.slice(0, 9).map(l => ({
      price:   l.listingPrice || '',
      address: [l.address, l.cityName, l.state, l.zipcode || l.zip].filter(Boolean).join(', '),
      beds:    l.bedrooms   || '',
      baths:   l.totalBaths || '',
      sqft:    l.sqFt       || '',
      status:  (l.propStatus || 'Active').replace(/_/g, ' '),
      photo:   (l.image && (l.image.url
               || (l.image.resized && l.image.resized.url)
               || (l.image.thumb   && l.image.thumb.url))) || '',
      url:     l.detailsLink || 'https://search.atbethesda.com/idx/results/listings'
    }));

    return new Response(JSON.stringify(mapped), { headers: corsHeaders });

  } catch(e) {
    return new Response(JSON.stringify({ _error: e.message }), { headers: corsHeaders });
  }
}
