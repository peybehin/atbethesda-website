export async function onRequest(context) {
  try {
    const apiKey = context.env.IDX_API_KEY;
    if (!apiKey) return jsonResp({ error: 'no_api_key' });
    const h = { accesskey: apiKey, outputtype: 'json' };
    const r = await fetch('https://api.idxbroker.com/clients/featured?idxID=b004', { headers: h });
    const raw = JSON.parse(await r.text());
    const listings = Array.isArray(raw.data) ? raw.data : Object.values(raw.data);
    const l = listings[0];

    // Inspect key fields carefully
    const inspect = (v) => {
      if (v === null || v === undefined) return 'null';
      if (typeof v === 'number') return 'num:' + v;
      if (typeof v === 'string') return v.length === 0 ? 'empty_str' : 'str(' + v.length + ')starts:' + v.slice(0,8);
      if (Array.isArray(v)) return 'arr[' + v.length + ']el0type:' + typeof v[0];
      if (typeof v === 'object') {
        const keys = Object.keys(v);
        return 'obj{' + keys.length + '}keys:' + keys.slice(0,3).join(',');
      }
      return typeof v;
    };

    return jsonResp({
      listingPrice: inspect(l.listingPrice),
      price: inspect(l.price),
      priceData: inspect(l.priceData),
      image: inspect(l.image),
      mediaData: inspect(l.mediaData),
      mlsPhotoCount: inspect(l.mlsPhotoCount),
      idxStatus: inspect(l.idxStatus),
      propStatus: inspect(l.propStatus),
      address: inspect(l.address),
    });
  } catch(e) { return jsonResp({ error: e.message }); }
}
function jsonResp(d) { return new Response(JSON.stringify(d), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' }}); }