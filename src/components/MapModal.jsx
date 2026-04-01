import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const MapModal = ({ flight, onClose }) => {
  if (!flight) return null;

  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${flight.lng-0.05}%2C${flight.lat-0.03}%2C${flight.lng+0.05}%2C${flight.lat+0.03}&layer=mapnik&marker=${flight.lat}%2C${flight.lng}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mapa de Posición: {flight.callsign || flight.icao24}</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        
        <div className="modal-body">
          <iframe 
            title="OSM Map"
            width="100%" 
            height="450" 
            src={osmUrl}
            style={{ borderRadius: '12px', border: '1px solid var(--accent-blue-30)' }}
          ></iframe>
        </div>

        <div className="modal-footer">
          <p>Ubicación: {flight.lat.toFixed(4)}, {flight.lng.toFixed(4)}</p>
          <a 
            href={`https://www.openstreetmap.org/?mlat=${flight.lat}&mlon=${flight.lng}#map=12/${flight.lat}/${flight.lng}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="external-link"
          >
            Abrir en pestaña nueva <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
