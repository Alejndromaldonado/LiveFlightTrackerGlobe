import { useState, useEffect } from 'react';
import { opensky } from '../api/opensky';

const STORAGE_KEY = 'opensky_last_flights';
const STATS_KEY = 'opensky_last_stats';
const TIMESTAMP_KEY = 'opensky_last_update';

export const useFlights = () => {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataMode, setDataMode] = useState('live'); 
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const fetchFlights = async () => {
    try {
      setLoading(true);
      
      // Llamadas en paralelo para maxima velocidad
      const [flightsData, statsData] = await Promise.all([
        opensky.getFlights(),
        opensky.getStats()
      ]);
      
      if (flightsData && flightsData.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(flightsData));
        localStorage.setItem(STATS_KEY, JSON.stringify(statsData));
        const timestamp = new Date().toLocaleString();
        localStorage.setItem(TIMESTAMP_KEY, timestamp);
        
        setFlights(flightsData);
        setStats(statsData);
        setDataMode('live');
        setLastUpdateTime(timestamp);
        setError(null);
      } else {
        throw new Error('Sin datos de vuelo');
      }
      setLoading(false);
    } catch (err) {
      console.warn('Supabase fetch failed, loading local cache:', err);
      
      const cached = localStorage.getItem(STORAGE_KEY);
      const cachedStats = localStorage.getItem(STATS_KEY);
      const cachedTime = localStorage.getItem(TIMESTAMP_KEY);
      
      if (cached) {
        setFlights(JSON.parse(cached));
        if (cachedStats) setStats(JSON.parse(cachedStats));
        setDataMode('persistent');
        setLastUpdateTime(cachedTime);
        setError(`Portal de Datos: Mostrando última sesión.`);
      } else {
        setError(`Error: ${err.message}. No hay datos previos.`);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
    // Refrescamos cada 2 minutos para no saturar Supabase ni el servidor
    const interval = setInterval(fetchFlights, 120000);
    return () => clearInterval(interval);
  }, []);

  return { flights, stats, loading, error, refresh: fetchFlights, dataMode, lastUpdateTime };
};
