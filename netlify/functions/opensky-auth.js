exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    // Si faltan variables, avisamos pero no matamos la ejecución
    return { statusCode: 200, body: JSON.stringify({ access_token: null, error: 'Faltan credenciales' }) };
  }

  const authHeader = Buffer.from(`${OPENSKY_CLIENT_ID}:${OPENSKY_CLIENT_SECRET}`).toString('base64');
  const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  try {
    console.log('SERVERLESS (Auth): Intentando OAuth2...');
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(6000) // Timeout rápido para no hacer esperar al usuario
    });

    const data = await response.json();

    if (response.ok) {
      return { statusCode: 200, body: JSON.stringify(data) };
    } else {
      console.warn('SERVERLESS (Auth): Auth denegada, continuando en modo anónimo.');
      return { statusCode: 200, body: JSON.stringify({ access_token: null, expires_in: 0 }) };
    }
  } catch (error) {
    console.warn('SERVERLESS (Auth): Bloqueo de red detectado. Forzando modo anónimo.');
    // DEVOLVEMOS 200 con token null para que el navegador NO muestre error y siga a la API
    return { 
      statusCode: 200, 
      body: JSON.stringify({ access_token: null, expires_in: 0, status: 'fallback_active' }) 
    };
  }
};
