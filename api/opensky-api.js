export default async function handler(req, res) {
  const { token } = req.query || {};
  
  const STATES_URL = 'https://opensky-network.org/api/states/all';
  const cleanToken = (token && token !== 'null' && token !== 'undefined') ? token : null;

  try {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br'
    };

    if (cleanToken) {
      headers['Authorization'] = `Bearer ${cleanToken}`;
    }

    console.log(`VERCEL (API): States API call (${cleanToken ? 'AUTH' : 'ANON'})...`);
    
    // Timeout ajustado a 9.5s para no chocar con el límite de Vercel de 10s
    const response = await fetch(STATES_URL, {
      headers,
      signal: AbortSignal.timeout(9500)
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.warn('VERCEL API FAIL:', error.message);
    
    // Si falla (Timeout), intentamos una última vez pero sin autenticación y con tiempo ínfimo
    // A veces la respuesta anónima es servida por otros nodos que no están saturados.
    try {
      const fallback = await fetch(STATES_URL, { 
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        signal: AbortSignal.timeout(6000) 
      });
      const fbData = await fallback.json();
      return res.status(200).json(fbData);
    } catch (finalError) {
      // Devolvemos un 200 pero vacío para que el navegador NO muestre error 504 y siga intentando
      // en el próximo refresco, manteniendo viva la UI.
      return res.status(200).json({ states: [], status: 'retry_soon', error: 'Server slow' });
    }
  }
}
