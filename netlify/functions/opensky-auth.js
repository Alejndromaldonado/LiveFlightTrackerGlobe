const axios = require('axios');

exports.handler = async (event, context) => {
  const { OPENSKY_CLIENT_ID, OPENSKY_CLIENT_SECRET } = process.env;

  if (!OPENSKY_CLIENT_ID || !OPENSKY_CLIENT_SECRET) {
    console.error('SERVERLESS ERROR: Missing OPENSKY_CLIENT_ID or OPENSKY_CLIENT_SECRET in Netlify environment.');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Configuración del servidor incompleta (Faltan env vars)' })
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', OPENSKY_CLIENT_ID);
    params.append('client_secret', OPENSKY_CLIENT_SECRET);

    console.log('SERVERLESS: Authenticando con OpenSky...');
    const response = await axios.post(
      'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token',
      params.toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('SERVERLESS AUTH ERROR:', error.response?.data || error.message);
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ 
        error: 'Error de autenticación con OpenSky',
        details: error.response?.data || error.message
      })
    };
  }
};
