export const config = { runtime: 'edge' };

export default async function (req) {
  // Manejamos el pre-vuelo de CORS (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const url = new URL(req.url);
  const target = url.searchParams.get('url');

  if (!target) {
    return new Response('Target "url" parameter is required', { status: 400 });
  }

  try {
    console.log(`PROXING (${req.method}): ${target}`);
    const headers = new Headers();
    
    // Copiamos cabeceras críticas del cliente (como Content-Type y Authorization)
    if (req.headers.has('Content-Type')) headers.set('Content-Type', req.headers.get('Content-Type'));
    if (req.headers.has('Authorization')) headers.set('Authorization', req.headers.get('Authorization'));
    
    // Forzamos un User-Agent de navegador para evitar bloqueos
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36');

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? await req.text() : undefined,
      signal: AbortSignal.timeout(12000)
    });

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    });

  } catch (error) {
    console.error('PROXY FAIL:', error.message);
    return new Response(JSON.stringify({ error: 'Proxy Timeout or Connection Error', message: error.message }), { 
      status: 504,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
