// Dynamic sitemap — auto-updates whenever a new post is published to GitHub
export async function onRequest(context) {
  const BASE_URL = 'https://atbethesda.com';
  const REPO = 'peybehin/atbethesda-website';
  const TODAY = new Date().toISOString().split('T')[0];
  const GITHUB_TOKEN = context.env.GITHUB_TOKEN; // optional — add to CF Pages env vars for higher rate limit

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

  let blogPosts = [];

  // --- Strategy 1: GitHub Contents API (comprehensive, gets ALL dirs) ---
  try {
    const ghHeaders = { 'User-Agent': 'atbethesda-sitemap/1.0' };
    if (GITHUB_TOKEN) ghHeaders['Authorization'] = `token ${GITHUB_TOKEN}`;

    const ghResp = await fetch(
      `https://api.github.com/repos/${REPO}/contents/`,
      { headers: ghHeaders }
    );

    if (ghResp.ok) {
      const items = await ghResp.json();
      if (Array.isArray(items)) {
        blogPosts = items
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
          }));
      }
    }
  } catch (_) {
    // GitHub API failed — fall through to posts.json fallback
  }

  // --- Strategy 2: posts.json fallback (if GitHub API failed or rate-limited) ---
  if (blogPosts.length === 0) {
    try {
      const postsResp = await fetch(`${BASE_URL}/posts.json`);
      if (postsResp.ok) {
        const posts = await postsResp.json();
        if (Array.isArray(posts)) {
          const seenSlugs = new Set();
          blogPosts = posts
            .filter(p => p.slug && !seenSlugs.has(p.slug) && seenSlugs.add(p.slug))
            .map(p => ({
              url: `/${p.slug}/`,
              priority: '0.7',
              changefreq: 'monthly',
            }));
        }
      }
    } catch (_) {
      // Both sources failed — sitemap will have static pages only
    }
  }

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
}
