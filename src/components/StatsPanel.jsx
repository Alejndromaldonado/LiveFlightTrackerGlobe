import React, { useMemo, useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Plane, Target, Info } from 'lucide-react';

const StatsPanel = ({ flights }) => {
  const [hoveredStat, setHoveredStat] = useState(null);

  const stats = useMemo(() => {
    if (!flights.length) return null;

    const total = flights.length;
    let climbing = 0;
    let descending = 0;
    let cruising = 0;
    let avgSpeed = 0;
    let highAlt = 0;

    flights.forEach(f => {
      if (f.verticalRate > 0.5) climbing++;
      else if (f.verticalRate < -0.5) descending++;
      else cruising++;

      avgSpeed += f.velocity || 0;
      if (f.alt > 9144) highAlt++;
    });

    return {
      climbing: Math.round((climbing / total) * 100),
      descending: Math.round((descending / total) * 100),
      cruising: Math.round((cruising / total) * 100),
      avgSpeed: Math.round((avgSpeed / total) * 3.6),
      highAlt: Math.round((highAlt / total) * 100)
    };
  }, [flights]);

  const tooltips = {
    climbing: "Porcentaje de aeronaves ganando altitud (vertical_rate > 0.5 m/s). Indica despegues o cambios de nivel.",
    descending: "Porcentaje de aeronaves perdiendo altitud (vertical_rate < -0.5 m/s). Indica descensos o aproximaciones.",
    cruising: "Flota volando de forma estable. Aviones con una tasa vertical cercana a cero (crucero).",
    speed: "Promedio de la velocidad terrestre (velocity) de todos los aviones activos, convertido a km/h.",
    altitude: "Porcentaje de aviones volando en la 'capa superior' (por encima de los 30,000 pies o 9,144 metros)."
  };

  if (!stats) return null;

  return (
    <div className="stats-panel">
      <div className="stats-header">
        <BarChart3 size={18} />
        <h3>Análisis de Datos Real-Time</h3>
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
            <span className="value">{stats.climbing}%</span>
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
            <span className="value">{stats.descending}%</span>
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
            <span className="value">{stats.cruising}%</span>
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
            <span className="value">{stats.avgSpeed} <small>km/h</small></span>
          </div>
        </div>
      </div>

      <div 
        className="fleet-distribution clickable"
        onMouseEnter={() => setHoveredStat('altitude')}
        onMouseLeave={() => setHoveredStat(null)}
      >
        <div className="dist-label">
          <span>Flota en Alta Cota (&gt;30k ft)</span>
          <span>{stats.highAlt}%</span>
        </div>
        <div className="dist-bar">
          <div className="dist-fill" style={{ width: `${stats.highAlt}%` }}></div>
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
