import { useState, useEffect, useCallback, useRef } from 'react';
import { opensky } from '../api/opensky';

export function useFlights(limit = 400, filterType = 'all') {
  const [flights, setFlights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataMode, setDataMode] = useState('live');
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const refreshInterval = useRef(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [flightData, statsData] = await Promise.all([
        opensky.getFlights(limit, filterType),
        opensky.getStats()
      ]);

      setFlights(flightData);
      setStats(statsData);
      setLastUpdateTime(new Date().toLocaleTimeString());
      setDataMode(flightData.length > 0 ? 'live' : 'cached');
    } catch (err) {
      setError(err.message || 'Error al obtener datos');
      setDataMode('cached');
    } finally {
      setLoading(false);
    }
  }, [limit, filterType]);

  useEffect(() => {
    fetchAllData();
    refreshInterval.current = setInterval(fetchAllData, 30000);
    return () => clearInterval(refreshInterval.current);
  }, [fetchAllData]);

  return { 
    flights, 
    stats, 
    loading, 
    error, 
    refresh: fetchAllData, 
    dataMode, 
    lastUpdateTime 
  };
}
