/**
 * GET /api/leads?token=SECRET&since=ISO_TIMESTAMP
 * Returns leads from KV newer than `since` (defaults to all leads).
 * Protected by LEADS_TOKEN secret.
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const cors = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!env.LEADS_TOKEN || token !== env.LEADS_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
  }

  const since = url.searchParams.get('since');
  const sinceMs = since ? new Date(since).getTime() : 0;

  // List all keys with prefix "lead:"
  const list = await env.LEADS_KV.list({ prefix: 'lead:' });
  const leads = [];

  for (const key of list.keys) {
    // Key format: lead:{timestamp}
    const ts = parseInt(key.name.split(':')[1], 10);
    if (ts >= sinceMs) {
      const val = await env.LEADS_KV.get(key.name, { type: 'json' });
      if (val) leads.push(val);
    }
  }

  // Sort newest first
  leads.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  return new Response(JSON.stringify({ leads, count: leads.length }), { headers: cors });
}
