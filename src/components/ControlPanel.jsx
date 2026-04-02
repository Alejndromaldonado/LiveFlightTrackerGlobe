import React from 'react';
import { Search, Layers, Target, Plane } from 'lucide-react';

const ControlPanel = ({ 
  searchTerm, 
  setSearchTerm, 
  activeFilter, 
  setActiveFilter 
}) => {
  const filters = [
    { id: 'all', label: 'Ver Todo', icon: <Layers size={14} /> },
    { id: 'cruising', label: 'Estable', icon: <Plane size={14} /> },
    { id: 'climbing', label: 'Ascenso', icon: <Target size={14} /> }
  ];

  return (
    <div className="left-panel-stack">
      {/* SECCION 1: BUSQUEDA */}
      <div className="panel-section search-section">
        <label className="section-label">Monitorización Local</label>
        <div className="search-box">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Indicativo (IBE...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
          />
        </div>
      </div>

      {/* SECCION 2: FILTROS CATEGORIAS */}
      <div className="panel-section">
        <label className="section-label">Filtros Rápidos</label>
        <div className="filters-grid-compact">
          {filters.map(filter => (
            <button 
              key={filter.id}
              className={`filter-btn-chip ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.icon}
              <span className="chip-label">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
