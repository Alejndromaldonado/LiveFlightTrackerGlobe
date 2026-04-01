import React from 'react';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';

const ControlPanel = ({ searchTerm, setSearchTerm, onRefresh, flightCount }) => {
  return (
    <div className="control-panel">
      <div className="search-box">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search by callsign..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
        />
      </div>
      
      <div className="stats-badge">
        <div className="dot"></div>
        <span>{flightCount} Live Flights</span>
        {/* Placeholder for rate limit warning */}
      </div>

      <button className="refresh-btn" onClick={onRefresh}>
        <RefreshCw size={18} />
      </button>
    </div>
  );
};

export default ControlPanel;
