import React, { useRef, useMemo, useEffect, useState } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { useDevice } from '../hooks/useDevice';

const GlobeVisualization = ({ flights, selectedFlight, onFlightClick, heatmapMode }) => {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const device = useDevice();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson')
      .then(res => res.json())
      .then(setCountries)
      .catch(err => console.error("Error cargando fronteras:", err));
  }, []);

  const markers = useMemo(() => {
    const getMarkerColor = (f) => {
      if (selectedFlight && f.icao24 === selectedFlight.icao24) return '#f43f5e';
      return '#38bdf8';
    };
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

  const arcsData = useMemo(() => {
    if (!selectedFlight) return [];
    return [{
      startLat: selectedFlight.lat,
      startLng: selectedFlight.lng,
      endLat: selectedFlight.lat + 0.5, // Fixed offset for visual effect
      endLng: selectedFlight.lng + 0.5,
      color: ['#f43f5e', '#38bdf8']
    }];
  }, [selectedFlight]);

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
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl={device.isMobile 
          ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" // Textura más ligera
          : "//unpkg.com/three-globe/example/img/earth-night.jpg"}
        bumpImageUrl={device.isMobile ? null : "//unpkg.com/three-globe/example/img/earth-topology.png"}
        backgroundImageUrl={device.isMobile ? null : "//unpkg.com/three-globe/example/img/night-sky.png"}

        globeResolution={device.isMobile ? 12 : 32} // Bajamos aún más la resolución del mesh
        showAtmosphere={!device.isMobile}
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
        hexBinResolution={device.isMobile ? 1 : 4}
        hexMargin={0.1}
        hexBinMerge={device.isMobile} 
        hexTopColor={d => d.points.length > 5 ? '#f43f5e' : d.points.length > 2 ? '#a855f7' : '#38bdf8'}
        hexSideColor={() => 'rgba(56, 189, 248, 0.2)'}
        hexAltitude={d => Math.min(d.points.length * 0.015, 0.15)}
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
          // Optimize for mobile: smaller canvas and scale
          const canvasSize = device.isMobile ? 32 : 64;
          const spriteScale = device.isMobile ? 0.9 : 1.8;

          const canvas = document.createElement('canvas');
          canvas.width = canvasSize; canvas.height = canvasSize;
          const ctx = canvas.getContext('2d');

          ctx.translate(canvasSize / 2, canvasSize / 2);
          ctx.rotate(THREE.MathUtils.degToRad(f.heading - 90));
          ctx.fillStyle = f.color;
          ctx.shadowBlur = device.isMobile ? 10 : 20; // Less blur on mobile
          ctx.shadowColor = f.color;

          // FORMA AERODINAMICA - scale based on canvas
          const scale = canvasSize / 64;
          ctx.beginPath();
          ctx.moveTo(22 * scale, 0); ctx.lineTo(-15 * scale, -18 * scale); ctx.lineTo(-10 * scale, 0); ctx.lineTo(-15 * scale, 18 * scale); ctx.closePath();
          ctx.fill();

          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.95, depthWrite: false });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(spriteScale, spriteScale, 1);
          return sprite;
        }}
        onObjectClick={onFlightClick}

        arcsData={arcsData}
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
