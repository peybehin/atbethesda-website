/**
 * Generic GitHub proxy — all admin writes go through here.
 * Keeps the PAT server-side; the browser never sees it.
 *
 * GET    /api/github?path=...           → read file or list directory
 * PUT    /api/github  body:{path,content,message,sha?}  → write file
 * DELETE /api/github  body:{path,sha,message?}          → delete file
 *
 * Required CF Pages env vars: GITHUB_PAT, ADMIN_PASSWORD
 */
const REPO = 'peybehin/atbethesda-website';
const GH   = 'https://api.github.com';

const CORS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
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

// Read file or list directory
export async function onRequestGet({ env, request }) {
  if (request.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) return unauthorized();
  const path = new URL(request.url).searchParams.get('path') || '';
  const res = await fetch(`${GH}/repos/${REPO}/contents/${path}`, { headers: ghHeaders(env) });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.ok ? 200 : res.status, headers: CORS });
}

// Write (create or update) any file
export async function onRequestPut({ env, request }) {
  if (request.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) return unauthorized();
  const { path, content, message, sha } = await request.json();
  const payload = { message: message || ('Admin: update ' + path), content };
  if (sha) payload.sha = sha;
  const res = await fetch(`${GH}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: ghHeaders(env),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return new Response(JSON.stringify({ sha: data.content?.sha, ok: res.ok, ghMessage: data.message }), {
    status: res.ok ? 200 : 502,
    headers: CORS,
  });
}

// Delete any file
export async function onRequestDelete({ env, request }) {
  if (request.headers.get('X-Admin-Password') !== env.ADMIN_PASSWORD) return unauthorized();
  const { path, sha, message } = await request.json();
  const res = await fetch(`${GH}/repos/${REPO}/contents/${path}`, {
    method: 'DELETE',
    headers: ghHeaders(env),
    body: JSON.stringify({ message: message || ('Admin: delete ' + path), sha }),
  });
  return new Response(JSON.stringify({ ok: res.ok }), { status: res.ok ? 200 : 502, headers: CORS });
}
