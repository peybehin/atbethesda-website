/**
 * Cloudflare Pages Function — Instagram Feed Proxy
 * Runs server-side so there are no CORS issues.
 * Route: /api/instagram
 */
export async function onRequest() {
  const res = await fetch('https://instagram-feed.pey-0ae.workers.dev', {
    headers: { Origin: 'https://atbethesda.com' }
  });
  const data = await res.text();
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    }
  });
}
