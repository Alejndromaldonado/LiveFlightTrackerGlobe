import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe, Trophy, Layers } from 'lucide-react';

const InsightsPanel = ({ stats }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  if (!stats) return null;

  const airbornePct = Math.round((stats.total_airborne / (stats.total_airborne + stats.total_ground)) * 100) || 0;

  const slides = [
    {
      title: "Estado de la Flota (Total)",
      icon: <Globe size={18} />,
      content: (
        <div className="slideshow-content">
          <div className="status-ring-container">
            <div className="status-ring" style={{ '--pct': `${airbornePct}%` }}>
              <span className="ring-value">{airbornePct}%</span>
            </div>
            <div className="ring-labels">
              <div className="ring-label">
                <span className="dot airborne"></span> Volando: {stats.total_airborne}
              </div>
              <div className="ring-label">
                <span className="dot ground"></span> En Tierra: {stats.total_ground}
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Récords Globales",
      icon: <Trophy size={18} />,
      content: (
        <div className="slideshow-content records">
          <div className="record-card">
            <span className="rec-label">Vuelo más Alto</span>
            <span className="rec-val">{Math.round(stats.highest_flight?.alt * 3.28084 || 0)} <small>ft</small></span>
            <span className="rec-id">ID: {stats.highest_flight?.callsign || 'N/A'}</span>
          </div>
          <div className="record-card">
            <span className="rec-label">Vuelo más Rápido</span>
            <span className="rec-val">{Math.round(stats.fastest_flight?.velocity * 3.6 || 0)} <small>km/h</small></span>
            <span className="rec-id">ID: {stats.fastest_flight?.callsign || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      title: "Análisis Big Data",
      icon: <Layers size={18} />,
      content: (
        <div className="slideshow-content countries">
          <div className="big-data-box">
             <div className="data-row">
               <span>Puntos en Globe:</span>
               <span>400</span>
             </div>
             <div className="data-row">
               <span>Nube Supabase:</span>
               <span>{stats.total_airborne}</span>
             </div>
             <p className="data-info">El globo renderiza solo el top 400 por rendimiento, mientras las estadísticas operan sobre el total mundial.</p>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="insights-panel">
      <div className="panel-header">
        <div className="title-section">
          {slides[activeSlide].icon}
          <h3>{slides[activeSlide].title}</h3>
        </div>
        <div className="carousel-nav">
          <button onClick={prevSlide}><ChevronLeft size={16} /></button>
          <button onClick={nextSlide}><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="slide-body">
        {slides[activeSlide].content}
      </div>

      <div className="slide-dots">
        {slides.map((_, i) => (
          <div key={i} className={`dot ${i === activeSlide ? 'active' : ''}`}></div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
