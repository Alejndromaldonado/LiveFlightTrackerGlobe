import React, { useState } from 'react';
import GlobeVisualization from './components/Globe';
import Sidebar from './components/Sidebar';
import ControlPanel from './components/ControlPanel';
import StatsPanel from './components/StatsPanel';
import InsightsPanel from './components/InsightsPanel';
import { useFlights } from './hooks/useFlights';
import { Loader2 } from 'lucide-react';
import './index.css';

function App() {
  const [displayMode, setDisplayMode] = useState('light'); // 'light' or 'heavy'
  const limit = displayMode === 'heavy' ? 800 : 400;
  const { flights, stats, loading, error, refresh, dataMode, lastUpdateTime } = useFlights(limit);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFlights = flights.filter(f => 
    f.callsign.includes(searchTerm) || f.icao24.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-container">
      <header className="main-header">
        <h1>Live Flight Tracker <span className="neon-text">Globe</span></h1>
        {loading && <Loader2 className="loader-spin" />}
      </header>

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
            Heavy
          </button>
        </div>
      </div>

      <ControlPanel 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        onRefresh={refresh}
        flightCount={filteredFlights.length}
      />

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      <GlobeVisualization 
        flights={filteredFlights} 
        selectedFlight={selectedFlight}
        displayMode={displayMode}
        onFlightClick={(f) => setSelectedFlight(f)}
      />

      <Sidebar 
        flight={selectedFlight} 
        onClose={() => setSelectedFlight(null)} 
      />

      <StatsPanel stats={stats} />
      {!selectedFlight && <InsightsPanel stats={stats} />}

      <footer className="globe-footer">
        <p>Datos en tiempo real de OpenSky Network | {stats?.total_airborne || flights.length} aeronaves activas detectadas</p>
      </footer>
    </div>
  );
}

export default App;
