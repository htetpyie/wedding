// Cloudflare Pages Function. D1 is bound as DB in the Pages project dashboard.
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
});
export async function onRequest({ request, env }) {
  if (!['GET', 'POST'].includes(request.method)) {
    const response = json({ error: 'Method not allowed.' }, 405);
    response.headers.set('Allow', 'GET, POST'); return response;
  }
  if (!env.DB) return json({ error: 'The guestbook is not connected yet. Please try again later.' }, 503);
  try {
    if (request.method === 'GET') {
      const { results } = await env.DB.prepare('SELECT id, name, message, created_at FROM wishes WHERE approved = 1 ORDER BY created_at DESC, id DESC LIMIT 100').all();
      return json({ wishes: results });
    }
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return json({ error: 'Please submit from the wedding website.' }, 403);
    if (!request.headers.get('Content-Type')?.includes('application/json')) return json({ error: 'Expected JSON.' }, 415);
    // Enforce an actual byte limit, even when Content-Length is absent.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Please include your wish.' }, 400);
    const chunks = []; let size = 0;
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 16384) { await reader.cancel(); return json({ error: 'Your wish is too long.' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    let body;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'Invalid submission.' }, 400); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid submission.' }, 400);
    if (body.website) return json({ error: 'Unable to accept this submission.' }, 400);
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!name || name.length > 80 || message.length < 3 || message.length > 1000) return json({ error: 'Please enter a name (1–80 characters) and a wish (3–1000 characters).' }, 400);
    // Only explicit fields are inserted. Clients cannot choose approval or IDs.
    await env.DB.prepare('INSERT INTO wishes (id, name, message) VALUES (?, ?, ?)').bind(crypto.randomUUID(), name, message).run();
    return json({ message: 'Thank you for the love! Your wish is saved and will appear after approval. ♡' }, 201);
  } catch (error) {
    console.error('Guestbook D1 operation failed:', error);
    return json({ error: 'The guestbook is temporarily unavailable. Please try again.' }, 503);
  }
}
