export default async function handler(req, res) {
  const { token } = req.query || {};
  
  const STATES_URL = 'https://opensky-network.org/api/states/all';
  const cleanToken = (token && token !== 'null' && token !== 'undefined') ? token : null;

  try {
    const headers = cleanToken ? { 'Authorization': `Bearer ${cleanToken}` } : {};

    const response = await fetch(STATES_URL, {
      headers,
      signal: AbortSignal.timeout(15000)
    });

    const data = await response.json();

    if (!response.ok) {
      console.warn('VERCEL (API): Token Error, retrying anonymous...');
      const anonResponse = await fetch(STATES_URL, { signal: AbortSignal.timeout(10000) });
      const anonData = await anonResponse.json();
      return res.status(200).json(anonData);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('VERCEL API ERROR:', error.message);
    
    try {
      console.log('VERCEL: Fallback Anonymous...');
      const fallback = await fetch(STATES_URL, { signal: AbortSignal.timeout(10000) });
      const fbData = await fallback.json();
      return res.status(200).json(fbData);
    } catch (finalError) {
      return res.status(504).json({ error: 'OpenSky API Unreachable from Vercel.' });
    }
  }
}
