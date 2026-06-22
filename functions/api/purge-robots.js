// One-shot utility: purges /robots.txt from CF zone cache + disables AI Crawlers Control
// DELETE THIS FILE after use
export async function onRequest(context) {
  const token = context.env.CF_API_TOKEN;
  const zoneId = '597c8c4a1fa2480af4cd47567f491af9';

  if (!token) {
    return new Response(JSON.stringify({ error: 'CF_API_TOKEN not set' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const results = {};

  // 1. Purge /robots.txt from zone cache
  const purgeResp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: [
          'https://atbethesda.com/robots.txt',
          'https://www.atbethesda.com/robots.txt',
        ],
      }),
    }
  );
  results.purge = await purgeResp.json();

  // 2. Try to disable AI Scrapers & Crawlers zone setting
  const aiSettingResp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ai_scrapers_and_crawlers`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: 'off' }),
    }
  );
  results.aiCrawlers = await aiSettingResp.json();

  // 3. Check current setting
  const checkResp = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/settings/ai_scrapers_and_crawlers`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  results.aiCrawlersStatus = await checkResp.json();

  return new Response(JSON.stringify(results, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
