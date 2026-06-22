// GA4 analytics function (refresh token updated 2026-06-22)
export async function onRequest(context) {
  const { env, request } = context;

  const CLIENT_ID = env.GA_CLIENT_ID;
  const CLIENT_SECRET = env.GA_CLIENT_SECRET;
  const REFRESH_TOKEN = env.GA_REFRESH_TOKEN;
  const PROPERTY_ID = '458803237';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get access token via refresh token
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }),
    });

    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: tokenData }), {
        status: 500, headers: corsHeaders,
      });
    }

    const accessToken = tokenData.access_token;
    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    const gaFetch = (body) => fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    ).then(r => r.json());

    // Run totals + top pages in parallel
    const [totals, pages] = await Promise.all([
      gaFetch({
        dateRanges: [
          { startDate: `${days}daysAgo`, endDate: 'today' },
          { startDate: `${days * 2}daysAgo`, endDate: `${days}daysAgo` },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
          { name: 'newUsers' },
        ],
      }),
      gaFetch({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ]);

    return new Response(JSON.stringify({ totals, pages }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: corsHeaders,
    });
  }
}
