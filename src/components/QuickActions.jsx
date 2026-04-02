import React from 'react';
import { RefreshCw, Activity, BarChart2 } from 'lucide-react';

const QuickActions = ({ 
  onRefresh, 
  flightCount, 
  heatmapMode, 
  setHeatmapMode 
}) => {
  return (
    <div className="right-panel-actions">
      <div className="panel-section systems-section shadow-red">
        <label className="section-label">Sistemas y Radar</label>
        <div className="actions-flex">
          <button 
            className={`action-btn-large ${heatmapMode ? 'active' : ''}`} 
            onClick={() => setHeatmapMode(!heatmapMode)}
            title="Mapa de Densidad Térmica"
          >
            <Activity size={18} />
            <span>{heatmapMode ? 'Heatmap: ON' : 'Heatmap: OFF'}</span>
          </button>
          
          <button className="action-btn-icon" onClick={onRefresh} title="Refrescar">
            <RefreshCw size={18} />
          </button>
        </div>
        
        <div className="detection-count-badge">
          <BarChart2 size={14} />
          <span>{flightCount} Detectados</span>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
