import axios from 'axios';

// En producción redirigimos a Netlify Functions para no exponer las Keys en el cliente
const AUTH_URL = '/opensky-auth';
const BASE_URL = '/opensky-api';

class OpenSkyClient {
  constructor() {
    this.accessToken = null;
    this.expiresAt = null;
    this.lastSuccessfulFlights = [];
  }

  async getAccessToken() {
    if (this.accessToken && this.expiresAt && Date.now() < this.expiresAt) {
      return this.accessToken;
    }

    try {
      // Las credenciales se inyectan en la Netlify Function para seguridad
      const response = await axios.post(AUTH_URL);

      this.accessToken = response.data.access_token;
      this.expiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.warn('OpenSky Auth failed. In dev mode, use "netlify dev" for full security.');
      return null;
    }
  }

  async getFlights() {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(BASE_URL, {
        params: { token }
      });
      
      const flights = (response.data.states || []).map(state => ({
        icao24: state[0],
        callsign: (state[1] || '').trim(),
        origin: state[2],
        lng: state[5],
        lat: state[6],
        alt: state[7], // meters
        onGround: state[8],
        velocity: state[9], // m/s
        heading: state[10],
        verticalRate: state[11]
      })).filter(f => f.lat !== null && f.lng !== null);

      this.lastSuccessfulFlights = flights;
      return flights;
    } catch (error) {
      if (error.response?.status === 429 && this.lastSuccessfulFlights.length > 0) {
        return this.lastSuccessfulFlights;
      }
      console.error('Failed to fetch flights:', error);
      throw error;
    }
  }
}

export const opensky = new OpenSkyClient();
