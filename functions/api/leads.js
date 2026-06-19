/**
 * GET /api/leads
 * Returns all leads from KV, newest first.
 */
export async function onRequestGet(context) {
  const { env } = context;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  if (!env.LEADS_KV) {
    return new Response(JSON.stringify({ error: 'LEADS_KV not configured' }), { status: 500, headers: cors });
  }

  const [listA, listB] = await Promise.all([
    env.LEADS_KV.list({ prefix: 'lead:' }),
    env.LEADS_KV.list({ prefix: 'lead:download:' }),
  ]);

  const seen = new Set();
  const keys = [...listA.keys, ...listB.keys].filter(k => {
    if (seen.has(k.name)) return false;
    seen.add(k.name);
    return true;
  });

  const leads = (await Promise.all(
    keys.map(k => env.LEADS_KV.get(k.name, { type: 'json' }))
  )).filter(Boolean);

  leads.sort((a, b) =>
    new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0)
  );

  return new Response(JSON.stringify({ leads, count: leads.length }), { headers: cors });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
