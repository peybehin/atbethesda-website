/**
 * GET  /api/posts  → read  data/admin-posts.json from GitHub
 * PUT  /api/posts  → write data/admin-posts.json to GitHub
 *
 * Required CF Pages env vars:
 *   GITHUB_PAT      — fine-grained token, Contents read+write on atbethesda-website
 *   ADMIN_PASSWORD  — same password as the admin login screen
 */
const REPO       = 'peybehin/atbethesda-website';
const GH         = 'https://api.github.com';
const POSTS_PATH = 'data/admin-posts.json';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
};

function ghHeaders(env) {
  return {
    Authorization: `Bearer ${env.GITHUB_PAT}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'atbethesda-admin',
  };
}

function unauthorized() {
  return new Response('Unauthorized', { status: 401, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}

export async function onRequestGet({ env, request }) {
  if (request.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) return unauthorized();

  const res = await fetch(`${GH}/repos/${REPO}/contents/${POSTS_PATH}`, { headers: ghHeaders(env) });

  if (res.status === 404) {
    return new Response(JSON.stringify({ posts: [], sha: null }), { headers: CORS });
  }
  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'GitHub error', status: res.status }), { status: 502, headers: CORS });
  }

  const file = await res.json();
  let posts = [];
  try {
    const raw = Uint8Array.from(atob(file.content.replace(/\n/g, '')), c => c.charCodeAt(0));
    posts = JSON.parse(new TextDecoder('utf-8').decode(raw));
  } catch (e) {}

  return new Response(JSON.stringify({ posts, sha: file.sha }), { headers: CORS });
}

export async function onRequestPut({ env, request }) {
  if (request.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) return unauthorized();

  const { posts, sha } = await request.json();
  const bytes = new TextEncoder().encode(JSON.stringify(posts, null, 2));
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  const b64 = btoa(bin);

  const payload = { message: 'Admin: sync posts', content: b64 };
  if (sha) payload.sha = sha;

  const res = await fetch(`${GH}/repos/${REPO}/contents/${POSTS_PATH}`, {
    method: 'PUT',
    headers: ghHeaders(env),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ error: err.message || 'GitHub write failed' }), { status: 502, headers: CORS });
  }

  const data = await res.json();
  return new Response(JSON.stringify({ sha: data.content?.sha }), { headers: CORS });
}
