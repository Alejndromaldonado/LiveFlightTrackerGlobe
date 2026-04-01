exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Configuración faltante: Verifica OPENSKY_CLIENT_ID y OPENSKY_CLIENT_SECRET en Netlify.' })
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', OPENSKY_CLIENT_ID);
    params.append('client_secret', OPENSKY_CLIENT_SECRET);

    console.log('SERVERLESS (Fetch): Solicitando token a OpenSky...');
    const response = await fetch(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('SERVERLESS OPEN-SKY ERROR:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'OpenSky Auth Denied', details: data })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('SERVERLESS CRASH:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Crash en el servidor', message: error.message })
    };
  }
};
