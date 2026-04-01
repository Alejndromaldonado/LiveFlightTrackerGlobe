import axios from 'axios';

// Usamos NUESTRO PROPIO PROPIO PROXY en Vercel Edge
const PROXY_URL = '/api/proxy?url=';
const AUTH_URL = `${PROXY_URL}https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token`;
const BASE_URL = `${PROXY_URL}https://opensky-network.org/api/states/all`;

const CLIENT_ID = import.meta.env.VITE_OPENSKY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_OPENSKY_CLIENT_SECRET;

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
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', CLIENT_ID);
      params.append('client_secret', CLIENT_SECRET);

      const response = await axios.post(AUTH_URL, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      this.accessToken = response.data.access_token;
      this.expiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
      return this.accessToken;
    } catch (error) {
      console.warn('OpenSky Auth error via Proxy, trying anonymous.');
      return null;
    }
  }

  async getFlights() {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(BASE_URL, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
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
      if (this.lastSuccessfulFlights.length > 0) {
        return this.lastSuccessfulFlights;
      }
      console.error('Failed to fetch flights via Proxy:', error);
      throw error;
    }
  }
}

export const opensky = new OpenSkyClient();
