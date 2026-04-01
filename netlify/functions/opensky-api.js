exports.handler = async (event, context) => {
  const { token } = event.queryStringParameters || {};
  
  const STATES_URL = 'https://opensky-network.org/api/states/all';

  // Si el token es literal 'null' (pasado por la URL), lo ignoramos
  const cleanToken = (token && token !== 'null' && token !== 'undefined') ? token : null;

  try {
    console.log(`SERVERLESS (API): Obteniendo estados (${cleanToken ? 'AUTENTICADO' : 'ANÓNIMO'})...`);
    const headers = cleanToken ? { 'Authorization': `Bearer ${cleanToken}` } : {};

    const response = await fetch(STATES_URL, {
      headers,
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn(`SERVERLESS (API): Error con token (Status ${response.status}). Retrying Anonymous...`);
      // Fallback a modo anónimo
      const anonResponse = await fetch(STATES_URL, { signal: AbortSignal.timeout(15000) });
      const anonData = await anonResponse.json();
      return { statusCode: 200, body: JSON.stringify(anonData) };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('SERVERLESS API ERROR:', error.message);
    
    // Intento final: Cargar como ANÓNIMO si hubo timeout antes
    try {
      console.log('SERVERLESS: Fallback final a modo ANÓNIMO...');
      const fallback = await fetch(STATES_URL, { signal: AbortSignal.timeout(10000) });
      const fbData = await fallback.json();
      return { statusCode: 200, body: JSON.stringify(fbData) };
    } catch (finalError) {
      return {
        statusCode: 504,
        body: JSON.stringify({ error: 'La API de OpenSky no responde. Reintentando...' })
      };
    }
  }
};
