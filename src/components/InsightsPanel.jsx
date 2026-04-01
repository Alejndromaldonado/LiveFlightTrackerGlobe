import React, { useMemo, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Globe, Gauge, Trophy, Layers } from 'lucide-react';

const InsightsPanel = ({ flights }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const insights = useMemo(() => {
    if (!flights.length) return null;

    // Slide 0: Status (Airborne vs Ground)
    const onGround = flights.filter(f => f.onGround).length;
    const airborne = flights.length - onGround;

    // Slide 1: Records
    const highest = [...flights].sort((a, b) => (b.alt || 0) - (a.alt || 0))[0];
    const fastest = [...flights].sort((a, b) => (b.velocity || 0) - (a.velocity || 0))[0];

    // Slide 2: Top Countries
    const countries = {};
    flights.forEach(f => {
      if (f.origin) {
        countries[f.origin] = (countries[f.origin] || 0) + 1;
      }
    });
    const topCountries = Object.entries(countries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      status: {
        airborne,
        onGround,
        airbornePct: Math.round((airborne / flights.length) * 100)
      },
      records: {
        highest: {
          callsign: highest?.callsign || 'N/A',
          alt: Math.round((highest?.alt || 0) * 3.28084) // to feet
        },
        fastest: {
          callsign: fastest?.callsign || 'N/A',
          speed: Math.round((fastest?.velocity || 0) * 3.6) // to km/h
        }
      },
      topCountries
    };
  }, [flights]);

  const slides = [
    {
      title: "Estado de la Flota",
      icon: <Globe size={18} />,
      content: (
        <div className="slideshow-content">
          <div className="status-ring-container">
            <div className="status-ring" style={{ '--pct': `${insights?.status.airbornePct}%` }}>
              <span className="ring-value">{insights?.status.airbornePct}%</span>
            </div>
            <div className="ring-labels">
              <div className="ring-label">
                <span className="dot airborne"></span> Voando: {insights?.status.airborne}
              </div>
              <div className="ring-label">
                <span className="dot ground"></span> En Tierra: {insights?.status.onGround}
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
            <span className="rec-val">{insights?.records.highest.alt} <small>ft</small></span>
            <span className="rec-id">ID: {insights?.records.highest.callsign}</span>
          </div>
          <div className="record-card">
            <span className="rec-label">Vuelo más Rápido</span>
            <span className="rec-val">{insights?.records.fastest.speed} <small>km/h</small></span>
            <span className="rec-id">ID: {insights?.records.fastest.callsign}</span>
          </div>
        </div>
      )
    },
    {
      title: "Top Orígenes (Reg.)",
      icon: <Layers size={18} />,
      content: (
        <div className="slideshow-content countries">
          {insights?.topCountries.map(([name, count], i) => (
            <div key={i} className="bar-item">
              <div className="bar-label"><span>{name}</span> <span>{count}</span></div>
              <div className="bar-bg"><div className="bar-fill" style={{ width: `${(count / insights.topCountries[0][1]) * 100}%` }}></div></div>
            </div>
          ))}
        </div>
      )
    }
  ];

  if (!insights) return null;

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
