export default async function handler(req, res) {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return res.status(200).json({ access_token: null, error: 'Faltan variables de entorno en Vercel.' });
  }

  const authHeader = Buffer.from(`${OPENSKY_CLIENT_ID}:${OPENSKY_CLIENT_SECRET}`).toString('base64');
  const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json(data);
    } else {
      console.warn('VERCEL: Auth denegada, modo anónimo.');
      return res.status(200).json({ access_token: null, expires_in: 0 });
    }
  } catch (error) {
    console.error('VERCEL CRITICAL:', error.message);
    return res.status(200).json({ access_token: null, expires_in: 0, error: error.message });
  }
}
