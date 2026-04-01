exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Faltan variables de entorno.' }) };
  }

  // Estándar OAuth2: Credenciales en la cabecera convertidas a Base64
  const authHeader = Buffer.from(`${OPENSKY_CLIENT_ID}:${OPENSKY_CLIENT_SECRET}`).toString('base64');
  
  const AUTH_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token';

  try {
    console.log('SERVERLESS (Auth): Solicitando token vía Basic Authorization header...');
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded' 
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(12000) // 12 segundos de margen
    });

    const data = await response.json();

    if (response.ok) {
      console.log('SERVERLESS (Auth): ¡Éxito con Basic Auth header!');
      return { statusCode: 200, body: JSON.stringify(data) };
    } else {
      console.error('SERVERLESS (Auth): Servidor respondió con error:', data);
      return { statusCode: response.status, body: JSON.stringify(data) };
    }
  } catch (error) {
    console.error('SERVERLESS (Auth) FATAL:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Timeout o Bloqueo de Red', message: error.message })
    };
  }
};
