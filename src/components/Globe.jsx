import React, { useRef, useMemo, useEffect } from 'react';
import Globe from 'react-globe.gl';

import * as THREE from 'three';

const GlobeVisualization = ({ flights, selectedFlight, onFlightClick, displayMode }) => {
  const globeRef = useRef();

  const getMarkerColor = (f) => {
    if (selectedFlight && f.icao24 === selectedFlight.icao24) return '#f43f5e'; 
    return '#38bdf8'; 
  };

  const markers = useMemo(() => {
    // Slice data ONLY in light mode for performance
    const data = displayMode === 'light' ? flights.slice(0, 400) : flights;
    return data.map(f => ({
      ...f,
      color: getMarkerColor(f),
      altitude: Math.min(f.alt / 100000, 0.5) 
    }));
  }, [flights, selectedFlight, displayMode]);

  // Handle camera transition when selecting a flight
  useEffect(() => {
    if (selectedFlight && globeRef.current) {
      globeRef.current.pointOfView({
        lat: selectedFlight.lat,
        lng: selectedFlight.lng,
        altitude: 0.5
      }, 1000);
    }
  }, [selectedFlight]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = false;
    }
  }, []);

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
        
        objectsData={markers}
        objectThreeObject={f => {
          const canvas = document.createElement('canvas');
          canvas.width = 64;
          canvas.height = 64;
          const ctx = canvas.getContext('2d');
          
          ctx.translate(32, 32);
          ctx.rotate(THREE.MathUtils.degToRad(f.heading - 90));
          ctx.fillStyle = f.color;
          ctx.shadowBlur = 15;
          ctx.shadowColor = f.color;
          
          ctx.beginPath();
          ctx.moveTo(20, 0);
          ctx.lineTo(-12, -15);
          ctx.lineTo(-7, 0);
          ctx.lineTo(-12, 15);
          ctx.closePath();
          ctx.fill();
          
          const texture = new THREE.CanvasTexture(canvas);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.9 });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(1.5, 1.5, 1);
          return sprite;
        }}
        objectLat="lat"
        objectLng="lng"
        objectAltitude="altitude"
        onObjectClick={onFlightClick}

        // Selected flight path arc
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
