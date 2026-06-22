export async function onRequest(context) {
  const token = context.env.CF_API_TOKEN;
  if (!token) {
    return new Response(JSON.stringify({ error: 'CF_API_TOKEN not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  const zoneId = '597c8c4a1fa2480af4cd47567f491af9';
  const days = parseInt(new URL(context.request.url).searchParams.get('days') || '7');
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const until = new Date().toISOString().split('T')[0];

  const query = `{
    viewer {
      zones(filter: {zoneTag: "${zoneId}"}) {
        daily: httpRequests1dGroups(
          orderBy: [date_ASC]
          limit: 90
          filter: {date_geq: "${since}", date_leq: "${until}"}
        ) {
          dimensions { date }
          sum {
            requests
            pageViews
            cachedRequests
            bytes
            threats
          }
          uniq { uniques }
        }
        totals: httpRequests1dGroups(
          orderBy: [date_ASC]
          limit: 90
          filter: {date_geq: "${since}", date_leq: "${until}"}
        ) {
          sum {
            requests
            pageViews
            cachedRequests
            bytes
            threats
            responseStatusMap { edgeResponseStatus requests }
          }
          uniq { uniques }
        }
      }
    }
  }`;

  try {
    const resp = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });
    const data = await resp.json();

    // Surface GraphQL errors if any
    if (data.errors && data.errors.length > 0) {
      return new Response(JSON.stringify({ error: 'GraphQL error', details: data.errors }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const zones = data?.data?.viewer?.zones?.[0];
    if (!zones) {
      return new Response(JSON.stringify({ error: 'No zone data', raw: data }), {
        status: 500, headers: { 'Content-Type': 'application/json' }
      });
    }

    const daily = zones?.daily || [];
    const totals = zones?.totals || [];

    let aggRequests = 0, aggPageViews = 0, aggCached = 0, aggBytes = 0, aggThreats = 0, aggUniques = 0;
    let errors4xx = 0, errors5xx = 0;

    totals.forEach(d => {
      aggRequests  += d.sum.requests || 0;
      aggPageViews += d.sum.pageViews || 0;
      aggCached    += d.sum.cachedRequests || 0;
      aggBytes     += d.sum.bytes || 0;
      aggThreats   += d.sum.threats || 0;
      aggUniques   += d.uniq.uniques || 0;
      (d.sum.responseStatusMap || []).forEach(s => {
        const code = s.edgeResponseStatus;
        if (code >= 400 && code < 500) errors4xx += s.requests;
        if (code >= 500) errors5xx += s.requests;
      });
    });

    return new Response(JSON.stringify({
      summary: {
        uniqueVisitors: aggUniques,
        requests: aggRequests,
        pageViews: aggPageViews,
        cacheHitRate: aggRequests > 0 ? Math.round((aggCached / aggRequests) * 100) : 0,
        bandwidthGB: (aggBytes / 1e9).toFixed(2),
        threats: aggThreats,
        errors4xx,
        errors5xx
      },
      daily: daily.map(d => ({
        date: d.dimensions.date,
        visitors: d.uniq.uniques,
        requests: d.sum.requests,
        pageViews: d.sum.pageViews
      }))
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
