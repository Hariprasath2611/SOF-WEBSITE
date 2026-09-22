import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Minus, Plus, RotateCcw } from 'lucide-react';

if (typeof window !== 'undefined' && maplibregl.setWorkerUrl) {
  try {
    maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
  } catch {
    // Ignore
  }
}

// Exact Google Maps location for Jaya Engineering College (CTH Road, Prakash Nagar, Thiruninravur)
const JAYA_COORDINATES = [80.045303, 13.135473]; // [lng, lat]
const DEFAULT_ZOOM = 13;

// 100% Free Open-Source Vector Basemap from OpenFreeMap (Zero API key required, zero watermarks)
const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

export default function MapcnVenueMap() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    // Initialize MapLibre GL instance matching mapcn architecture
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_DARK_STYLE,
      center: JAYA_COORDINATES,
      zoom: DEFAULT_ZOOM,
      pitch: 35, // 35-degree GTA isometric slant
      bearing: -10,
      attributionControl: false,
    });

    mapRef.current = map;

    const setupMarkerAndReady = () => {
      if (!isMounted) return;
      setIsLoaded(true);
      map.resize();

      // Create Custom Pulse Pin Element
      const el = document.createElement('div');
      el.className = 'mapcn-custom-marker';
      el.innerHTML = `
        <div class="mapcn-radar-pulse"></div>
        <div class="mapcn-marker-pin">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div class="mapcn-marker-label">JAYA ENGG COLLEGE</div>
      `;

      // Rich Popover Card
      const popup = new maplibregl.Popup({
        offset: 28,
        closeButton: false,
        className: 'mapcn-venue-popup',
      }).setHTML(`
        <div class="mapcn-popup-inner">
          <div class="mapcn-popup-tag">OFFICIAL SFD 2026 VENUE</div>
          <h4 class="mapcn-popup-name">Jaya Engineering College</h4>
          <p class="mapcn-popup-address">CTH Road, Prakash Nagar, Thiruninravur</p>
          <div class="mapcn-popup-coords">13.135473° N, 80.045303° E</div>
        </div>
      `);

      new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(JAYA_COORDINATES)
        .setPopup(popup)
        .addTo(map);
    };

    map.on('load', setupMarkerAndReady);
    map.on('styledata', () => {
      if (isMounted) setIsLoaded(true);
    });

    // Safety fallback to ensure map is marked ready even on slow networks
    const fallbackTimer = setTimeout(() => {
      if (isMounted && !isLoaded) {
        setupMarkerAndReady();
      }
    }, 1200);

    const handleResize = () => map.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimer);
      window.removeEventListener('resize', handleResize);
      try {
        map.remove();
      } catch {
        // Ignore unmount error
      }
    };
  }, []);

  const zoomIn = () => mapRef.current?.zoomIn();
  const zoomOut = () => mapRef.current?.zoomOut();
  const resetView = () => {
    mapRef.current?.flyTo({
      center: JAYA_COORDINATES,
      zoom: DEFAULT_ZOOM,
      pitch: 35,
      bearing: -10,
      duration: 1000,
    });
  };

  return (
    <div className="mapcn-container-card">
      <div ref={mapContainerRef} className="mapcn-canvas-viewport" />

      {/* Top HUD Overlay Tag */}
      <div className="mapcn-hud-bar">
        <div className="mapcn-hud-status">
          <span className="mapcn-hud-dot" />
          <span>RADAR GPS • THIRUNINRAVUR</span>
        </div>
        <span className="mapcn-hud-coords">13.1354, 80.0453</span>
      </div>

      {/* Floating mapcn Controls */}
      <div className="mapcn-controls-group">
        <button
          type="button"
          className="mapcn-ctrl-btn"
          onClick={zoomIn}
          title="Zoom In"
          aria-label="Zoom in"
        >
          <Plus size={14} />
        </button>
        <button
          type="button"
          className="mapcn-ctrl-btn"
          onClick={zoomOut}
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <Minus size={14} />
        </button>
        <button
          type="button"
          className="mapcn-ctrl-btn"
          onClick={resetView}
          title="Center on Campus"
          aria-label="Reset view to venue"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Fallback skeleton while basemap initializes */}
      {!isLoaded && (
        <div className="mapcn-loading-overlay">
          <div className="mapcn-loading-spinner" />
          <span>Acquiring satellite vectors...</span>
        </div>
      )}
    </div>
  );
}
