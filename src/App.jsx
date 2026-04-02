import React, { useState, useMemo, useEffect } from 'react';
import GlobeVisualization from './components/Globe';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import InsightsPanel from './components/InsightsPanel';
import QuickActions from './components/QuickActions';
import MapModal from './components/MapModal';
import { useFlights } from './hooks/useFlights';
import { useDevice } from './hooks/useDevice';
import { Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [displayMode, setDisplayMode] = useState('light');
  const [showMap, setShowMap] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [heatmapMode, setHeatmapMode] = useState(false);

  // Hook para detectar dispositivo y optimizar rendimiento
  const device = useDevice();

  // En móvil, forzar modo light para mejor rendimiento
  useEffect(() => {
    if (device.isMobile && displayMode === 'heavy') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayMode('light');
    }
  }, [device.isMobile, displayMode]);

  // Calcular límite de vuelos según dispositivo y modo
  const limit = useMemo(() => {
    const baseLimit = displayMode === 'heavy' ? 4000 : 400;
    // En móvil, usar el límite recomendado del hook
    if (device.isMobile) {
      return device.getFlightLimit(baseLimit);
    }
    return baseLimit;
  }, [displayMode, device]);

  // Hook con soporte para filtros de servidor
  const { flights, stats, loading, error, refresh, dataMode, lastUpdateTime } = useFlights(limit, activeFilter);
  
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFlights = useMemo(() => {
    let result = flights;
    if (searchTerm) {
      result = result.filter(f => 
        f.callsign.includes(searchTerm) || f.icao24.includes(searchTerm.toLowerCase())
      );
    }
    // El filtro local sigue ayudando para los demas estados inmediatos
    if (activeFilter === 'cruising') {
      result = result.filter(f => Math.abs(f.verticalRate) <= 0.5 && !f.onGround);
    } else if (activeFilter === 'climbing') {
      result = result.filter(f => f.verticalRate > 0.5);
    } else if (activeFilter === 'ground') {
      result = result.filter(f => f.onGround);
    }
    return result;
  }, [flights, searchTerm, activeFilter]);

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Live Flight Tracker <span className="neon-text">Globe</span></h1>
        {loading && <Loader2 className="loader-spin" />}
      </header>

      {/* ALA DERECHA: ESTADO + MODO + SISTEMAS */}
      <div className="top-right-controls">
        <div className={`status-pill ${dataMode}`}>
          <div className="dot"></div>
          <span>{dataMode === 'live' ? 'LIVE' : 'CACHED'} - {lastUpdateTime || '--'}</span>
        </div>
        
        <div className="display-toggle">
          <button 
            className={displayMode === 'light' ? 'active' : ''} 
            onClick={() => setDisplayMode('light')}
          >
            Light
          </button>
          <button 
            className={displayMode === 'heavy' ? 'active' : ''} 
            onClick={() => setDisplayMode('heavy')}
          >
            Ultra Heavy
          </button>
        </div>

        <QuickActions 
          onRefresh={refresh}
          flightCount={filteredFlights.length}
          heatmapMode={heatmapMode}
          setHeatmapMode={setHeatmapMode}
        />
      </div>

      {/* ALA IZQUIERDA: BUSQUEDA Y FILTROS */}
      <ControlPanel 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
      />

      {error && <div className="error-banner">Error: {error}</div>}

      <GlobeVisualization 
        flights={filteredFlights} 
        selectedFlight={selectedFlight}
        displayMode={displayMode}
        onFlightClick={(f) => setSelectedFlight(f)}
        heatmapMode={heatmapMode}
      />

      <Sidebar 
        flight={selectedFlight} 
        onClose={() => setSelectedFlight(null)} 
        onShowMap={() => setShowMap(true)}
      />

      <StatsPanel stats={stats} />
      {!selectedFlight && <InsightsPanel stats={stats} />}

      {showMap && selectedFlight && (
        <MapModal 
          flight={selectedFlight} 
          onClose={() => setShowMap(false)} 
        />
      )}

      <footer className="globe-footer">
        <p>Radar Lake v2.5 | {stats?.total_airborne || flights.length} Tráfico detectado</p>
      </footer>
    </div>
  );
}

export default App;
