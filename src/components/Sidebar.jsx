import React, { useRef, useEffect } from 'react';
import { Plane, Navigation, Shield, Wind, Globe as GlobeIcon, X, Map } from 'lucide-react';
import { useDevice } from '../hooks/useDevice';

const Sidebar = ({ flight, onClose, onShowMap }) => {
  const device = useDevice();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!device.isMobile || !sidebarRef.current) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      // Only allow downward swipe from top of drawer
      if (deltaY > 0 && e.target.closest('.sidebar-header')) {
        const translateY = Math.min(deltaY, 100); // Max 100px drag
        sidebarRef.current.style.transform = `translateY(${translateY}px)`;
        sidebarRef.current.style.transition = 'none';
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const deltaY = currentY - startY;
      sidebarRef.current.style.transition = '';

      // If dragged down more than 50px, close the drawer
      if (deltaY > 50) {
        onClose();
      } else {
        sidebarRef.current.style.transform = '';
      }
    };

    const sidebar = sidebarRef.current;
    sidebar.addEventListener('touchstart', handleTouchStart, { passive: true });
    sidebar.addEventListener('touchmove', handleTouchMove, { passive: true });
    sidebar.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      sidebar.removeEventListener('touchstart', handleTouchStart);
      sidebar.removeEventListener('touchmove', handleTouchMove);
      sidebar.removeEventListener('touchend', handleTouchEnd);
    };
  }, [device.isMobile, onClose]);

  if (!flight) return null;

  return (
    <div className="sidebar" ref={sidebarRef}>
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

          <button 
            onClick={onShowMap}
            className="osm-link"
            style={{ width: '100%', border: 'none', cursor: 'pointer' }}
          >
            <Map className="icon" />
            Ver Mapa Interactivo (OSM)
          </button>
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
