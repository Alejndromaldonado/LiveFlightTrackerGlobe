import axios from 'axios';

// --- CONFIGURACIÓN SUPABASE (Data Lake del Radar) ---
const SUPABASE_URL = 'https://jpqsmpldwttqnffprapx.supabase.co/rest/v1/flights';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcXNtcGxkd3R0cW5mZnByYXB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNzk1ODksImV4cCI6MjA5MDY1NTU4OX0.9UNmlqL3FVN5lB_xL1cr5OjsfQEfUqStDCmK47_NXV0';

class OpenSkyClient {
  constructor() {
    this.lastSuccessfulFlights = [];
  }

  /**
   * Obtiene los vuelos desde Supabase (Alimentado por AWS Worker)
   */
  async getFlights() {
    try {
      // Pedimos solo los vuelos que estan en el aire (lat/lng no nulos)
      // Y opcionalmente podemos filtrar por tiempo si queremos ser mas estrictos
      const response = await axios.get(SUPABASE_URL, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        params: {
          // Opcional: Solo traer vuelos que se hayan actualizado hace menos de 10 min
          // select: '*',
          // order: 'updated_at.desc'
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

      if (flights.length > 0) {
        this.lastSuccessfulFlights = flights;
      }
      return flights;
    } catch (error) {
      console.warn('Fallo en Supabase, intentando cargar local cache:', error.message);
      if (this.lastSuccessfulFlights.length > 0) {
        return this.lastSuccessfulFlights;
      }
      throw error;
    }
  }

  // Mantenemos este metodo por compatibilidad si el frontend lo requiere, aunque ya no necesitemos Token
  async getAccessToken() {
    return "supabase_active_session";
  }
}

// Exportamos como 'opensky' para no romper ningun componente existente
export const opensky = new OpenSkyClient();
