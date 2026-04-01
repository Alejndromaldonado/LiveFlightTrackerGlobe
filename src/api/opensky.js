import axios from 'axios';

// --- CONFIGURACIÓN SUPABASE (Data Lake del Radar) ---
const SUPABASE_BASE_URL = 'https://jpqsmpldwttqnffprapx.supabase.co/rest/v1';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcXNtcGxkd3R0cW5mZnByYXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzk1ODksImV4cCI6MjA5MDY1NTU4OX0.9UNmlqL3FVN5lB_xL1cr5OjsfQEfUqStDCmK47_NXV0';

class OpenSkyClient {
  constructor() {
    this.lastSuccessfulFlights = [];
    this.lastSuccessfulStats = null;
  }

  /**
   * Obtiene los vuelos globales (limitado por rendimiento segun el modo)
   * limit: 400 (Light) o 800 (Heavy)
   */
  async getFlights(limit = 400) {
    try {
      const response = await axios.get(`${SUPABASE_BASE_URL}/flights`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        params: {
          select: '*',
          limit: limit,
          order: 'velocity.desc.nullslast'
        }
      });
      
      const flights = (response.data || []).map(row => ({
        icao24: row.icao24,
        callsign: (row.callsign || '').trim(),
        origin: row.origin,
        lng: row.lng,
        lat: row.lat,
        alt: row.alt,
        onGround: row.lat === null || row.lng === null,
        velocity: row.velocity,
        heading: row.heading,
        verticalRate: row.vertical_rate
      }));

      if (flights.length > 0) this.lastSuccessfulFlights = flights;
      return flights;
    } catch (error) {
      if (this.lastSuccessfulFlights.length > 0) return this.lastSuccessfulFlights;
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await axios.post(`${SUPABASE_BASE_URL}/rpc/get_flight_stats`, {}, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      this.lastSuccessfulStats = response.data;
      return response.data;
    } catch (error) {
      console.warn('Fallo en RPC Stats:', error.message);
      return this.lastSuccessfulStats;
    }
  }
}

export const opensky = new OpenSkyClient();
