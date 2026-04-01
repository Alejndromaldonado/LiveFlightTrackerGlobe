export const config = { runtime: 'edge' };

export default async function (req) {
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
  let target = url.searchParams.get('url');

  if (!target) return new Response('Missing url', { status: 400 });

  // OPTIMIZACIÓN: Si pedimos 'states/all', le añadimos un filtro de área global.
  if (target.includes('states/all')) {
    const separator = target.includes('?') ? '&' : '?';
    if (!target.includes('lamin')) {
      target += `${separator}lamin=-70&lomin=-170&lamax=70&lomax=170`;
    }
  }

  try {
    const headers = new Headers();
    if (req.headers.has('Content-Type')) headers.set('Content-Type', req.headers.get('Content-Type'));
    if (req.headers.has('Authorization')) headers.set('Authorization', req.headers.get('Authorization'));
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    headers.set('Accept-Encoding', 'gzip');

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method === 'POST' ? await req.text() : undefined,
      signal: AbortSignal.timeout(9000) // 9 segundos para no chocar con el límite de Vercel (10s)
    });

    const body = await response.arrayBuffer();

    return new Response(body, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=5'
      }
    });

  } catch (error) {
    console.warn('EDGE PROXY TIMEOUT:', error.message);
    // PLAN C: Ante un 504, devolvemos un JSON vacío pero con éxito para que el globo no se rompa
    return new Response(JSON.stringify({ states: [], warning: 'API saturada' }), { 
      status: 200, 
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
    });
  }
}
