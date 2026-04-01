exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Faltan variables de entorno.' }) };
  }

  // Lista de posibles URLs de autenticación (OpenSky suele actualizarlas)
  const AUTH_URLS = [
    'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
    'https://opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token'
  ];

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', OPENSKY_CLIENT_ID);
  params.append('client_secret', OPENSKY_CLIENT_SECRET);

  for (const url of AUTH_URLS) {
    try {
      console.log(`SERVERLESS (Auth): Probando URL: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
        signal: AbortSignal.timeout(8000) // Timeout de 8s para saltar rápido si falla
      });

      const data = await response.json();

      if (response.ok) {
        console.log('SERVERLESS (Auth): ¡Éxito! Token obtenido.');
        return { statusCode: 200, body: JSON.stringify(data) };
      } else {
        console.warn(`SERVERLESS (Auth): URL ${url} respondió con error:`, data);
      }
    } catch (error) {
      console.error(`SERVERLESS (Auth): Fallo en URL ${url}: ${error.message}`);
    }
  }

  return {
    statusCode: 502,
    body: JSON.stringify({ 
      error: 'No se pudo conectar con los servidores de autenticación de OpenSky.',
      suggestion: 'Verifica que tus credenciales provengan de la sección "API Client" de OpenSky y no sean tu usuario/pass común.'
    })
  };
};
