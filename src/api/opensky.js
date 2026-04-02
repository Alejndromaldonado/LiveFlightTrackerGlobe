import axios from 'axios';

const SUPABASE_BASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://jpqsmpldwttqnffprapx.supabase.co/rest/v1';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

class OpenSkyClient {
  constructor() {
    this.lastSuccessfulFlights = [];
    this.lastSuccessfulStats = null;
  }

  async getFlights(limit = 400, filterType = 'all') {
    try {
      const pageSize = 1000;
      const pagesNeeded = Math.ceil(limit / pageSize);
      
      const requests = [];
      for (let i = 0; i < pagesNeeded; i++) {
        const queryParams = {
          select: '*',
        };

        // --- DINAMICA DE ORDENAMIENTO (CRUCIAL) ---
        if (filterType === 'ground') {
          queryParams.on_ground = 'is.true';
          queryParams.order = 'velocity.asc.nullsfirst'; // Primero los quietos
        } else {
          // RESTAURADO: Si es "Todos" o "Crucero", priorizamos aviones con velocidad y altura
          queryParams.order = 'velocity.desc.nullslast'; 
        }

        requests.push(
          axios.get(`${SUPABASE_BASE_URL}/flights`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`,
              'Range': `${i * pageSize}-${(i + 1) * pageSize - 1}`
            },
            params: queryParams
          })
        );
      }

      const responses = await Promise.all(requests);
      const allData = responses.flatMap(r => r.data || []);
      
      const flights = allData.map(row => ({
        icao24: row.icao24,
        callsign: (row.callsign || '').trim(),
        origin: row.origin,
        lng: row.lng,
        lat: row.lat,
        alt: row.alt,
        onGround: row.on_ground === true,
        velocity: row.velocity,
        heading: row.heading,
        verticalRate: row.vertical_rate
      })).slice(0, limit);

      if (flights.length > 0) this.lastSuccessfulFlights = flights;
      return flights;
    } catch (error) {
      console.warn('Error en fetch masivo:', error.message);
      return this.lastSuccessfulFlights;
    }
  }

  async getStats() {
    try {
      const response = await axios.post(`${SUPABASE_BASE_URL}/rpc/get_flight_stats`, {}, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      });
      this.lastSuccessfulStats = response.data;
      return response.data;
    } catch {
      return this.lastSuccessfulStats;
    }
  }
}

export const opensky = new OpenSkyClient();
