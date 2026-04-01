export default async function handler(req, res) {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return res.status(200).json({ access_token: null, error: 'Config missing' });
  }

  const authHeader = Buffer.from(`${OPENSKY_CLIENT_ID}:${OPENSKY_CLIENT_SECRET}`).toString('base64');
  const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  try {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(8000)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({ access_token: null, error: 'Auth server unreachable' });
  }
}
