// Diagnostic: inspect the IDX API image structure (how many photos per listing).
export async function onRequest(context) {
  const apiKey = context.env.IDX_API_KEY;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };
  if (!apiKey) return new Response(JSON.stringify({ error: 'no_api_key' }), { headers: cors });
  const headers = { accesskey: apiKey, outputtype: 'json' };
  const fields = 'rf[]=listingID&rf[]=address&rf[]=image';
  async function tryEp(url) {
    try { const r = await fetch(url, { headers }); const t = await r.text();
      let j; try { j = JSON.parse(t); } catch(e){ return { url, status:r.status, parse:'fail', raw:t.slice(0,200) }; }
      const arr = Array.isArray(j) ? j : Object.values(j);
      const first = arr.find(x=>x && x.image) || arr[0] || {};
      const img = first.image;
      return { url, status:r.status, count:arr.length,
        firstImageType: typeof img,
        firstImageKeys: img && typeof img==='object' ? Object.keys(img).slice(0,40) : null,
        firstImageSample: img };
    } catch(e){ return { url, error:String(e) }; }
  }
  const out = {};
  out.featured = await tryEp(`https://api.idxbroker.com/clients/featured?limit=3&${fields}`);
  out.listingsFeatured = await tryEp(`https://api.idxbroker.com/listings/featured?limit=3&${fields}`);
  return new Response(JSON.stringify(out, null, 2), { headers: cors });
}
