// Dynamic sitemap — auto-updates whenever a new post is published to GitHub
export async function onRequest(context) {
  const BASE_URL = 'https://atbethesda.com';
  const REPO = 'peybehin/atbethesda-website';
  const TODAY = new Date().toISOString().split('T')[0];

  // Directories that are NOT public pages
  const EXCLUDE = new Set([
    'admin', 'css', 'js', 'images', 'functions', 'downloads',
    'properties', 'widget-test', 'test-search-mobile',
    'bethesda-test', 'bethesda-4col-test', 'bethesda-trends-test',
    'top-5-hidden-fees-when-buying-a-house-copy', 'our-areas',
    'perfect-home-finder',
  ]);

  // Known pages with custom priority/changefreq
  const PAGES = [
    { url: '/',                         priority: '1.0', changefreq: 'weekly'  },
    { url: '/about/',                   priority: '0.8', changefreq: 'monthly' },
    { url: '/contact/',                 priority: '0.8', changefreq: 'monthly' },
    { url: '/vlog/',                    priority: '0.8', changefreq: 'weekly'  },
    { url: '/whats-my-home-worth/',     priority: '0.9', changefreq: 'monthly' },
    { url: '/sellers-guide/',           priority: '0.9', changefreq: 'monthly' },
    { url: '/buyers-guide/',            priority: '0.8', changefreq: 'monthly' },
    { url: '/mortgage-calculator/',     priority: '0.7', changefreq: 'monthly' },
    { url: '/testimonials/',            priority: '0.7', changefreq: 'monthly' },
    { url: '/our-areas/',              priority: '0.9', changefreq: 'weekly'  },
    // Area pages
    { url: '/our-areas/bethesda/',         priority: '0.9', changefreq: 'weekly' },
    { url: '/our-areas/chevy-chase/',      priority: '0.9', changefreq: 'weekly' },
    { url: '/our-areas/potomac/',          priority: '0.9', changefreq: 'weekly' },
    { url: '/our-areas/north-bethesda/',   priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/silver-spring/',    priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/rockville/',        priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/gaithersburg/',     priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/kensington/',       priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/great-falls/',      priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/cabin-john/',       priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/north-potomac/',    priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/mclean-vienna-tysons/', priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/arlington/',        priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/alexandria/',       priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/fairfax/',          priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/falls-church/',     priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/georgetown/',       priority: '0.8', changefreq: 'weekly' },
    { url: '/our-areas/spring-valley/',    priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/palisades/',        priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/friendship-heights/', priority: '0.7', changefreq: 'weekly' },
    { url: '/our-areas/chevy-chase-dc/',   priority: '0.7', changefreq: 'weekly' },
  ];

  // Known page slugs (don't treat as blog posts)
  const PAGE_SLUGS = new Set([
    'about','contact','vlog','whats-my-home-worth','sellers-guide',
    'buyers-guide','mortgage-calculator','testimonials','open-houses',
    'rent-buy-home','getting-preapproved','first-time-homebuyers',
    'get-holiday-rental','things-shouldnt-buying-home',
    'video-when-is-the-best-time-to-sell-a-house',
  ]);

  try {
    // Fetch root directory listing from GitHub (public repo, no auth needed)
    const ghResp = await fetch(
      `https://api.github.com/repos/${REPO}/contents/`,
      { headers: { 'User-Agent': 'atbethesda-sitemap/1.0' } }
    );
    const items = await ghResp.json();

    // Blog posts = dirs not in EXCLUDE and not in PAGE_SLUGS
    const blogPosts = Array.isArray(items)
      ? items
          .filter(item =>
            item.type === 'dir' &&
            !EXCLUDE.has(item.name) &&
            !PAGE_SLUGS.has(item.name) &&
            !item.name.startsWith('.')
          )
          .map(item => ({
            url: `/${item.name}/`,
            priority: '0.7',
            changefreq: 'monthly',
          }))
      : [];

    const allUrls = [...PAGES, ...blogPosts];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(p => `  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });

  } catch (err) {
    return new Response(`<?xml version="1.0"?><error>${err.message}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
