// Dynamic robots.txt — served as a Pages Function so CF zone cache can't hold a stale version.
// CF AI Crawlers Control will still prepend its section, but our Allow: / rules override
// CF's Disallow: / per RFC 9309 (equally specific rules: Allow beats Disallow).
export async function onRequest() {
  const content = `# atbethesda.com robots.txt
# AI search engines and all crawlers welcome — AEO optimized

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /widget-test/
Disallow: /test-search-mobile/
Disallow: /our-areas/bethesda-test/
Disallow: /our-areas/bethesda-4col-test/
Disallow: /our-areas/bethesda-trends-test/

# Explicitly allow all major AI search crawlers
User-agent: Googlebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: meta-externalagent
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: https://atbethesda.com/sitemap.xml
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
