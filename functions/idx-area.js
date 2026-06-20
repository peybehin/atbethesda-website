export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const city         = url.searchParams.get('city')         || '';
  const neighborhood = url.searchParams.get('neighborhood') || '';
  const state        = url.searchParams.get('state')        || '';

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // IDX widget requires browser session cookies to return JS data.
    // Without cookies, server returns ~730-char HTML shell.
    // All parsing below gracefully returns [] so client falls back to extractFromIframe().
    const resp = await fetch('https://search.atbethesda.com/idx/widgets/160389', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://atbethesda.com/',
        'Accept': 'application/javascript, */*'
      }
    });

    if (!resp.ok) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    const js = await resp.text();

    // Server returned HTML shell (no cookies) — return empty so client uses fallback
    if (js.length < 1000 || js.trim().startsWith('<')) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // Strategy 1: JSON array with listing objects
    let listings = [];
    const m1 = js.match(/\[[\s\S]{50,}\]/g);
    if (m1) {
      for (const candidate of m1) {
        try {
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].address) {
            listings = parsed; break;
          }
        } catch(e) {}
      }
    }

    // Strategy 2: variable assignment
    if (!listings.length) {
      const m2 = js.match(/(?:listings|data|results)\s*=\s*(\[[\s\S]*?\])\s*[;,]/);
      if (m2) { try { listings = JSON.parse(m2[1]); } catch(e) {} }
    }

    if (!listings.length) {
      return new Response(JSON.stringify([]), { headers: corsHeaders });
    }

    // Filter SF only (pt=1)
    const sf = listings.filter(l => {
      const pt = (l.propType || l.pt || l.propertyType || '').toLowerCase();
      return !pt || pt.includes('single') || pt === '1' || pt === 'sfr';
    });

    // Filter by city or neighborhood if provided
    const target = (neighborhood || city || '').toLowerCase();
    const filtered = target
      ? sf.filter(l => (l.address || l.city || '').toLowerCase().includes(target))
      : sf;

    // Sort newest first
    filtered.sort((a, b) => new Date(b.listDate || b.date || 0) - new Date(a.listDate || a.date || 0));

    return new Response(JSON.stringify(filtered.slice(0, 9)), { headers: corsHeaders });

  } catch(e) {
    return new Response(JSON.stringify([]), { headers: corsHeaders });
  }
}
