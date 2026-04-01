exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  
  const STATES_URL = 'https://opensky-network.org/api/states/all';

  try {
    console.log('SERVERLESS: Intentando obtener estados de vuelos...');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(STATES_URL, {
      headers,
      signal: AbortSignal.timeout(15000) // Mucho más margen para la data pesada de vuelos
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn(`SERVERLESS (API): Error con token (Status ${response.status}). Retrying Anonymous...`);
      // Fallback a modo anónimo si el token no funciona
      const anonResponse = await fetch(STATES_URL, { signal: AbortSignal.timeout(15000) });
      const anonData = await anonResponse.json();
      return { statusCode: anonResponse.status, body: JSON.stringify(anonData) };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('SERVERLESS API ERROR:', error.message);
    
    // Último intento: Forzar anónimo si falla por timeout arriba
    try {
      console.log('SERVERLESS: Fallback final a modo ANÓNIMO...');
      const fallback = await fetch(STATES_URL, { signal: AbortSignal.timeout(10000) });
      const fbData = await fallback.json();
      return { statusCode: 200, body: JSON.stringify(fbData) };
    } catch (finalError) {
      return {
        statusCode: 504,
        body: JSON.stringify({ error: 'La API de OpenSky no responde. Intentando de nuevo...' })
      };
    }
  }
};
