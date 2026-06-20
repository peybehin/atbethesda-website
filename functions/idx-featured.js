export async function onRequest(context) {
  const debug = new URL(context.request.url).searchParams.has('debug');
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

    if (debug) {
      // Return structural info - first 3000 chars with values stripped
      const stripped = js
        .slice(0, 3000)
        .replace(/"[a-z0-9]{16,}"(?=[,:\}\]])/g, '"[HASH]"')
        .replace(/https?:\/\/[^"'\s,]+/g, '[URL]')
        .replace(/\/\/[^"'\s,]+/g, '[URL]');
      return new Response(JSON.stringify({
        length: js.length,
        preview: stripped,
        has_listings: js.includes('"listingPrice"'),
        has_listingID: js.includes('"listingID"'),
        has_bedrooms: js.includes('"bedrooms"'),
        first_listingPrice_pos: js.indexOf('"listingPrice"'),
        first_200_around_listingPrice: js.slice(Math.max(0, js.indexOf('"listingPrice"')-100), js.indexOf('"listingPrice"')+150).replace(/\/\/[^"]+/g,'[URL]').replace(/"[A-Z][^"]{5,}"/g,'"[STR]"'),
        patterns_found: {
          listings_single_quote: !!js.match(/listings='\[/),
          listings_double_quote: !!js.match(/listings="\[/),
          listings_key: !!js.match(/"listings"\s*:/),
          document_write: !!js.match(/document\.write/),
          var_data: !!js.match(/var\s+\w+\s*=\s*\[/),
          first_bracket_array: js.indexOf('[{'),
          idx_lc: !!js.match(/idxLC/),
          idx_props: !!js.match(/idxProps/),
          component_data: !!js.match(/component\s*\(/)
        }
      }, null, 2), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let listings = null;
    const m1 = js.match(/listings='(\[[\s\S]*?\])'/); if (m1) { try { listings = JSON.parse(m1[1]); } catch(e){} }
    if (!listings) { const m2 = js.match(/listings="(\[[\s\S]*?\])"/); if (m2) { try { listings = JSON.parse(m2[1]); } catch(e){} } }
    if (!listings) { const m3 = js.match(/\[\s*\{[^\[]*?"listingID"[\s\S]*?\](?=\s*[,;\)])/); if (m3) { try { listings = JSON.parse(m3[0]); } catch(e){} } }
    if (!listings) { const m4 = js.match(/"listings"\s*:\s*(\[[\s\S]*?\])\s*[,}]/); if (m4) { try { listings = JSON.parse(m4[1]); } catch(e){} } }

    if (!listings || !Array.isArray(listings) || !listings.length) {
      return new Response(JSON.stringify({ error: 'parse_failed', listings: [], hint: 'add ?debug to see structure' }), {
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
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'https://atbethesda.com', 'Cache-Control': 'public, max-age=900' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, listings: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}