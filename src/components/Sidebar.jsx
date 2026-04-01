import React from 'react';
import { Plane, Navigation, Shield, Wind, Globe as GlobeIcon, X, Map } from 'lucide-react';

const Sidebar = ({ flight, onClose }) => {
  if (!flight) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="title-group">
          <Plane className="icon neon-blue" />
          <h2>Detalles del Vuelo</h2>
        </div>
        <button onClick={onClose} className="close-btn">
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-content">
        <div className="callsign-badge">
          <span className="label">Indicativo (Callsign)</span>
          <span className="value">{flight.callsign || 'N/A'}</span>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <Shield className="icon" />
            <div className="text">
              <span className="label">Matrícula (ICAO24)</span>
              <span className="value">{flight.icao24}</span>
            </div>
          </div>

          <div className="info-card">
            <Navigation className="icon" />
            <div className="text">
              <span className="label">Rumbo</span>
              <span className="value">{Math.round(flight.heading)}°</span>
            </div>
          </div>

          <div className="info-card">
            <Wind className="icon" />
            <div className="text">
              <span className="label">Velocidad</span>
              <span className="value">{Math.round(flight.velocity * 3.6)} km/h</span>
            </div>
          </div>

          <div className="info-card">
            <GlobeIcon className="icon" />
            <div className="text">
              <span className="label">País de Origen</span>
              <span className="value">{flight.origin}</span>
            </div>
          </div>

          <a 
            href={`https://www.openstreetmap.org/?mlat=${flight.lat}&mlon=${flight.lng}#map=12/${flight.lat}/${flight.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="osm-link"
          >
            <Map className="icon" />
            Ver en OpenStreetMap
          </a>
        </div>

        <div className="altitude-section">
          <div className="alt-info">
            <span className="label">Altitud</span>
            <span className="value">{Math.round(flight.alt)} m</span>
          </div>
          <div className="alt-bar">
            <div 
              className="alt-fill" 
              style={{ width: `${Math.min((flight.alt / 12000) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
