// Cloudflare Pages Function: server-side proxy + parser for Altos market data.
// Endpoint:  /altos-snapshot?hash=<area-hash>&resTypeId=100
// Returns JSON the custom 2-column widget renders. Server-side fetch avoids CORS.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hash = url.searchParams.get('hash');
  const resTypeId = url.searchParams.get('resTypeId') || '100'; // 100=houses,200=condos
  const sparkN = parseInt(url.searchParams.get('spark') || '14', 10);

  const json = (obj, status = 200, smax = 21600) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': `public, max-age=900, s-maxage=${smax}`
      }
    });

  if (!hash) return json({ error: 'missing_hash' }, 400, 0);

  const base = 'https://cdn.altos.re/api/_';
  try {
    const [dataRes, textRes] = await Promise.all([
      fetch(`${base}/data?hash=${hash}&resTypeId=${resTypeId}`),
      fetch(`${base}/conditional-text-new?hash=${hash}&resTypeId=${resTypeId}`)
    ]);
    if (!dataRes.ok) return json({ error: 'altos_data_unavailable', status: dataRes.status }, 502, 0);

    const data = await dataRes.json();
    const text = textRes.ok ? await textRes.json() : {};

    // Use the 6-week smoothed series (range "6"), overall quartile "__ALL".
    const series = (Array.isArray(data) && (data.find(d => String(d.range) === '6') || data[0])) || null;
    if (!series || !Array.isArray(series.date)) return json({ error: 'unexpected_shape' }, 502, 0);

    const dates = series.date;
    const last = dates.length - 1;
    const qIdx = (series.quartile || []).indexOf('__ALL');
    const pick = qIdx >= 0 ? qIdx : 0;

    const at = (metric, i) => {
      const m = series[metric];
      if (!Array.isArray(m)) return null;
      const s = Array.isArray(m[pick]) ? m[pick] : m;
      return s[i];
    };
    const tail = (metric) => {
      const m = series[metric];
      if (!Array.isArray(m)) return [];
      const s = Array.isArray(m[pick]) ? m[pick] : m;
      return s.slice(Math.max(0, s.length - sparkN)).map(Number);
    };

    const usd = (n) => '$' + Math.round(n).toLocaleString('en-US');
    const usd2 = (n) => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const int = (n) => String(Math.round(n));
    const pct = (n) => Math.round(n * 100) + '%';

    // metric -> display config. fmt for value, cfmt for the change magnitude.
    const defs = [
      { key: 'price_median', label: 'Median List Price', fmt: usd, cfmt: usd },
      { key: 'dom_mean', label: 'Avg DOM', fmt: int, cfmt: (n) => int(Math.abs(n)) + ' days' },
      { key: 'mai', label: 'Market Action', fmt: int, cfmt: (n) => int(Math.abs(n)) },
      { key: 'count', label: 'Inventory', fmt: int, cfmt: (n) => int(Math.abs(n)) },
      { key: 'price_of_new_listings_median', label: 'Median Price Of New Listings', fmt: usd, cfmt: usd },
      { key: 'dom_median', label: 'Median DOM', fmt: int, cfmt: (n) => int(Math.abs(n)) },
      { key: 'per_sqft_median', label: '$ Per Sq. Ft', fmt: (n) => usd(n), cfmt: usd2 },
      { key: 'price_decreased_percent', label: 'Price Decreased %', fmt: pct, cfmt: (n) => (Math.abs(n) * 100).toFixed(2) + '%' }
    ];

    const stats = defs.map(d => {
      const cur = at(d.key, last);
      const prev = at(d.key, last - 1);
      const delta = (cur != null && prev != null) ? (cur - prev) : 0;
      const dir = delta > 0 ? 'up' : (delta < 0 ? 'down' : 'flat');
      return {
        key: d.key,
        label: d.label,
        value: cur != null ? d.fmt(cur) : '—',
        change: d.cfmt(delta),
        dir,
        spark: tail(d.key)
      };
    });

    return json({
      hash,
      resTypeId,
      dataDate: dates[last],
      narrative: text.median_market_trend || '',
      stats
    });
  } catch (e) {
    return json({ error: 'fetch_failed', detail: String(e) }, 502, 0);
  }
}
