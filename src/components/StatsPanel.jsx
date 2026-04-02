import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Plane, Target, Info } from 'lucide-react';

const StatsPanel = ({ stats }) => {
  const [hoveredStat, setHoveredStat] = useState(null);

  const tooltips = {
    climbing: "Porcentaje de aeronaves ganando altitud (vertical_rate > 0.5 m/s). Indica despegues o cambios de nivel.",
    descending: "Porcentaje de aeronaves perdiendo altitud (vertical_rate < -0.5 m/s). Indica descensos o aproximaciones.",
    cruising: "Flota volando de forma estable. Aviones con una tasa vertical cercana a cero (fase de crucero).",
    speed: "Velocidad media (Promedio) de toda la flota mundial procesada en Supabase.",
    cruiseSpeed: "Promedio de velocidad de toda la flota mundial que se encuentra en fase de crucero estable (> 9,000m)."
  };

  if (!stats) return null;

  const total = stats.total_airborne || 1;
  const climbingPct = Math.round((stats.climbing / total) * 100);
  const descendingPct = Math.round((stats.descending / total) * 100);
  const cruisingPct = Math.round((stats.cruising / total) * 100);
  
  // Velocidad de Crucero (calculada en el RPC nuevo)
  const avgCruiseVel = Math.round((stats.avg_cruise_velocity || 0) * 3.6);
  // Barra de progreso relativa (ej: respecto a 900 km/h que es un crucero estandar)
  const cruisePct = Math.min((avgCruiseVel / 900) * 100, 100);

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <BarChart3 size={18} />
        <h3>Monitorización de Flota Mundial</h3>
      </div>
      
      <div className="stats-grid">
        <div 
          className="stat-item clickable"
          onMouseEnter={() => setHoveredStat('climbing')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-icon climbing"><TrendingUp size={14} /></div>
          <div className="stat-info">
            <span className="label">En Ascenso</span>
            <span className="value">{climbingPct}%</span>
          </div>
        </div>

        <div 
          className="stat-item clickable"
          onMouseEnter={() => setHoveredStat('descending')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-icon descending"><TrendingDown size={14} /></div>
          <div className="stat-info">
            <span className="label">En Descenso</span>
            <span className="value">{descendingPct}%</span>
          </div>
        </div>

        <div 
          className="stat-item clickable"
          onMouseEnter={() => setHoveredStat('cruising')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-icon cruising"><Plane size={14} /></div>
          <div className="stat-info">
            <span className="label">En Crucero</span>
            <span className="value">{cruisingPct}%</span>
          </div>
        </div>

        <div 
          className="stat-item clickable"
          onMouseEnter={() => setHoveredStat('speed')}
          onMouseLeave={() => setHoveredStat(null)}
        >
          <div className="stat-icon speed"><Target size={14} /></div>
          <div className="stat-info">
            <span className="label">Vel. Media</span>
            <span className="value">{Math.round(stats.avg_velocity * 3.6 || 0)} <small>km/h</small></span>
          </div>
        </div>
      </div>

      <div 
        className="fleet-distribution clickable"
        onMouseEnter={() => setHoveredStat('cruiseSpeed')}
        onMouseLeave={() => setHoveredStat(null)}
      >
        <div className="dist-label">
          <span>Vel. Promedio en Crucero (Flota Estable)</span>
          <span>{avgCruiseVel} km/h</span>
        </div>
        <div className="dist-bar shadow-glow">
          <div className="dist-fill" style={{ width: `${cruisePct}%` }}></div>
        </div>
      </div>

      {hoveredStat && (
        <div className="stats-tooltip">
          <Info size={12} className="info-icon" />
          <p>{tooltips[hoveredStat]}</p>
        </div>
      )}
    </div>
  );
};

export default StatsPanel;
