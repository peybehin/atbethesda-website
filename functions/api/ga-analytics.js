// GA4 analytics function (refresh token updated 2026-06-22)
export async function onRequest(context) {
  const { env, request } = context;

  const CLIENT_ID     = env.GA_CLIENT_ID;
  const CLIENT_SECRET = env.GA_CLIENT_SECRET;
  const REFRESH_TOKEN = env.GA_REFRESH_TOKEN;
  const PROPERTY_ID   = '458803237';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token',
      }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenData.access_token) {
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: tokenData }), {
        status: 500, headers: corsHeaders,
      });
    }

    const accessToken = tokenData.access_token;
    const url  = new URL(request.url);
    const days = parseInt(url.searchParams.get('days') || '7', 10);

    const gaReport = (body) => fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runReport`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    ).then(r => r.json());

    const gaRealtime = () => fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${PROPERTY_ID}:runRealtimeReport`,
      { method: 'POST', headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: [{ name: 'activeUsers' }] }) }
    ).then(r => r.json());

    const [totals, pages, daily, sources, devices, realtime] = await Promise.all([
      // 1. Totals (current + previous period for deltas)
      gaReport({
        dateRanges: [
          { startDate: `${days}daysAgo`, endDate: 'today' },
          { startDate: `${days * 2}daysAgo`, endDate: `${days}daysAgo` },
        ],
        metrics: [
          { name: 'sessions' }, { name: 'activeUsers' }, { name: 'screenPageViews' },
          { name: 'averageSessionDuration' }, { name: 'bounceRate' }, { name: 'newUsers' },
        ],
      }),
      // 2. Top 10 pages by sessions
      gaReport({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }, { name: 'screenPageViews' }, { name: 'activeUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
      // 3. Sessions by day (for chart)
      gaReport({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }],
      }),
      // 4. Traffic sources
      gaReport({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8,
      }),
      // 5. Device categories
      gaReport({
        dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      }),
      // 6. Realtime active users
      gaRealtime(),
    ]);

    return new Response(JSON.stringify({ totals, pages, daily, sources, devices, realtime }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}
