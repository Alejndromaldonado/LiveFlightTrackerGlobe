import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para detectar características del dispositivo y optimizar rendimiento
 * Detecta móviles, tablets, orientación y capacidades touch
 */
export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isTouch: false,
    isLandscape: false,
    screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1920,
    screenHeight: typeof window !== 'undefined' ? window.innerHeight : 1080,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio : 1,
    // Recomendaciones de rendimiento
    recommendedFlightLimit: 400, // Default para desktop
    shouldReduceMotion: false,
    shouldUseLowResGlobe: false
  });

  // Función para calcular recomendaciones de rendimiento
  const calculatePerformanceSettings = useCallback((width, height, isMobile, isTablet, pixelRatio) => {
    // Límite de vuelos basado en dispositivo
    let recommendedFlightLimit = 400; // Desktop default
    let shouldUseLowResGlobe = false;
    let shouldReduceMotion = false;

    if (isMobile) {
      // Móviles: menos vuelos, globe en baja resolución
      recommendedFlightLimit = 100;
      shouldUseLowResGlobe = true;
      shouldReduceMotion = true;
    } else if (isTablet) {
      // Tablets: límite medio
      recommendedFlightLimit = 250;
      shouldUseLowResGlobe = pixelRatio > 1.5; // Solo si pixel ratio alto
      shouldReduceMotion = false;
    }

    // Ajustar por tamaño de pantalla específico
    if (width < 400) {
      // Pantallas muy pequeñas
      recommendedFlightLimit = Math.min(recommendedFlightLimit, 60);
    } else if (width < 600) {
      recommendedFlightLimit = Math.min(recommendedFlightLimit, 80);
    }

    // Detectar preferencia de movimiento reducido
    const prefersReducedMotion = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    if (prefersReducedMotion) {
      shouldReduceMotion = true;
    }

    return {
      recommendedFlightLimit,
      shouldUseLowResGlobe,
      shouldReduceMotion
    };
  }, []);

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const pixelRatio = window.devicePixelRatio || 1;

      // Detectar tipo de dispositivo
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;

      // Detectar touch
      const isTouch = (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
      );

      // Detectar orientación
      const isLandscape = width > height;

      // Calcular settings de rendimiento
      const performanceSettings = calculatePerformanceSettings(
        width, height, isMobile, isTablet, pixelRatio
      );

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isTouch,
        isLandscape,
        screenWidth: width,
        screenHeight: height,
        pixelRatio,
        ...performanceSettings
      });
    };

    // Inicializar
    updateDeviceInfo();

    // Escuchar cambios de tamaño y orientación
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, [calculatePerformanceSettings]);

  // Función para obtener límite de vuelos dinámico
  const getFlightLimit = useCallback((userLimit) => {
    // Si el usuario ya eligió un límite bajo, respetarlo
    if (userLimit && userLimit <= deviceInfo.recommendedFlightLimit) {
      return userLimit;
    }
    // En móvil, siempre usar el recomendado
    if (deviceInfo.isMobile) {
      return deviceInfo.recommendedFlightLimit;
    }
    return userLimit || deviceInfo.recommendedFlightLimit;
  }, [deviceInfo.recommendedFlightLimit, deviceInfo.isMobile]);

  return {
    ...deviceInfo,
    getFlightLimit
  };
};

export default useDevice;