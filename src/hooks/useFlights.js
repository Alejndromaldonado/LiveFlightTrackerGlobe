import { useState, useEffect } from 'react';
import { opensky } from '../api/opensky';

const STORAGE_KEY = 'opensky_last_flights';
const TIMESTAMP_KEY = 'opensky_last_update';

export const useFlights = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataMode, setDataMode] = useState('live'); // 'live' or 'persistent'
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await opensky.getFlights();
      
      if (data && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        const timestamp = new Date().toLocaleString();
        localStorage.setItem(TIMESTAMP_KEY, timestamp);
        
        setFlights(data);
        setDataMode('live');
        setLastUpdateTime(timestamp);
        setError(null);
      } else {
        throw new Error('Sin datos de vuelo');
      }
      setLoading(false);
    } catch (err) {
      console.warn('API connection failed, loading local cache:', err);
      
      const cached = localStorage.getItem(STORAGE_KEY);
      const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
      
      if (cached) {
        setFlights(JSON.parse(cached));
        setDataMode('persistent');
        setLastUpdateTime(cachedTime);
        setError(`Conexión limitada: Mostrando datos guardados.`);
      } else {
        setError(`Error: ${err.message}. No hay datos previos.`);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFlights, 30000);
    return () => clearInterval(interval);
  }, []);

  return { flights, loading, error, refresh: fetchFlights, dataMode, lastUpdateTime };
};
