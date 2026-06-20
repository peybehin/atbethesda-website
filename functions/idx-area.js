export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') || '';
  const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
  const idxHeaders = { 'Content-Type': 'application/x-www-form-urlencoded', 'accesskey': env.IDX_API_KEY, 'outputtype': 'json' };

  if (debug === 'widgetlist') {
    // Get the widgets-legacy list to find all widget JS URLs
    const r = await fetch('https://api.idxbroker.com/clients/widgets-legacy?outputtype=json&offset=0', { headers: idxHeaders });
    return new Response(JSON.stringify({ status: r.status, body: await r.text() }), { headers: corsHeaders });
  }

  if (debug === 'widgetsrc') {
    const r = await fetch('https://api.idxbroker.com/clients/widgetsrc?outputtype=json', { headers: idxHeaders });
    const text = await r.text();
    return new Response(JSON.stringify({ status: r.status, body: text }), { headers: corsHeaders });
  }

  if (debug === 'idxfeatured') {
    // Test the actual idx-featured endpoint response
    const r = await fetch('https://atbethesda.com/idx-featured');
    const text = await r.text();
    return new Response(JSON.stringify({ status: r.status, body: text.slice(0,300) }), { headers: corsHeaders });
  }

  return new Response(JSON.stringify({ msg: 'use debug param: widgetlist, widgetsrc, idxfeatured' }), { headers: corsHeaders });
}
