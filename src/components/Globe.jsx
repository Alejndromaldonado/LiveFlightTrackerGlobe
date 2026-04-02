import React, { useRef, useMemo, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';

const GlobeVisualization = ({ flights, selectedFlight, onFlightClick, heatmapMode }) => {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Error cargando fronteras:", err));
  }, []);

  const getMarkerColor = (f) => {
    if (selectedFlight && f.icao24 === selectedFlight.icao24) return '#f43f5e'; 
    return '#38bdf8'; 
  };

  const markers = useMemo(() => {
    return flights.map(f => {
      // --- CALCULO DE ALTITUD VISUAL ---
      // Si está en tierra, altitud mínima pegada.
      // Si está en vuelo (alt > 0), escalamos para que sea majestuoso (entre 0.05 y 0.2 de radio)
      const visualAlt = f.onGround ? 0.002 : Math.min((f.alt / 100000) + 0.02, 0.2);

      return {
        ...f,
        color: getMarkerColor(f),
        visualAlt: visualAlt
      };
    });
  }, [flights, selectedFlight]);

  useEffect(() => {
    if (selectedFlight && globeRef.current) {
      globeRef.current.pointOfView({
        lat: selectedFlight.lat,
        lng: selectedFlight.lng,
        altitude: 0.5
      }, 1000);
    }
  }, [selectedFlight]);

  return (
    <div className="globe-holder">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        globeResolution={32}
        showAtmosphere={true}
        atmosphereColor="#38bdf8"
        atmosphereAltitude={0.15}

        // --- DIVISION POLITICA ---
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(56, 189, 248, 0.05)'} 
        polygonSideColor={() => 'rgba(56, 189, 248, 0.1)'} 
        polygonStrokeColor={() => 'rgba(56, 189, 248, 0.3)'} 
        polygonAltitude={0.005} 
        
        // --- MODO HEATMAP ---
        hexBinPointsData={heatmapMode ? flights : []}
        hexBinPointLat="lat"
        hexBinPointLng="lng"
        hexBinPointWeight="velocity"
        hexBinResolution={4}
        hexMargin={0.1}
        hexTopColor={d => d.points.length > 5 ? '#f43f5e' : d.points.length > 2 ? '#a855f7' : '#38bdf8'}
        hexSideColor={() => 'rgba(56, 189, 248, 0.2)'}
        hexAltitude={d => Math.min(d.points.length * 0.015, 0.15)}
        hexBinMerge={false} 
        hexLabel={d => `
          <div style="background: rgba(15,23,42,0.9); padding: 8px; border-radius: 8px; border: 1px solid #38bdf8;">
            <b style="color: #38bdf8">Densidad de Tráfico</b><br/>
            Detecciones: ${d.points.length}<br/>
            Vel. Media: ${Math.round(d.sumWeight / d.points.length)} km/h
          </div>
        `}
        
        // --- OBJETOS RECUPERADOS ---
        objectsData={heatmapMode ? [] : markers}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="visualAlt"
        objectThreeObject={f => {
          const canvas = document.createElement('canvas');
          canvas.width = 64; canvas.height = 64;
          const ctx = canvas.getContext('2d');
          
          ctx.translate(32, 32);
          ctx.rotate(THREE.MathUtils.degToRad(f.heading - 90));
          ctx.fillStyle = f.color;
          ctx.shadowBlur = 20; // MAS BRILLO
          ctx.shadowColor = f.color;
          
          // FORMA AERODINAMICA
          ctx.beginPath();
          ctx.moveTo(22, 0); ctx.lineTo(-15, -18); ctx.lineTo(-10, 0); ctx.lineTo(-15, 18); ctx.closePath();
          ctx.fill();
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95, depthWrite: false });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(1.8, 1.8, 1); // UN POCO MAS GRANDES
          return sprite;
        }}
        onObjectClick={onFlightClick}

        arcsData={selectedFlight ? [{
          startLat: selectedFlight.lat,
          startLng: selectedFlight.lng,
          endLat: selectedFlight.lat + (Math.random() - 0.5) * 5,
          endLng: selectedFlight.lng + (Math.random() - 0.5) * 5,
          color: ['#f43f5e', '#38bdf8']
        }] : []}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}

        labelsData={selectedFlight ? [selectedFlight] : []}
        labelLat="lat"
        labelLng="lng"
        labelText="callsign"
        labelSize={1.5}
        labelDotRadius={0.5}
        labelColor={() => '#f43f5e'}
        labelResolution={2}
      />
    </div>
  );
};

export default GlobeVisualization;
