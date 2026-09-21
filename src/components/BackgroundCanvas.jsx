import React, { useEffect, useRef } from 'react';

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Natural evening twilight ambient dust particles (soft, non-neon)
    const particleCount = Math.min(Math.floor(width / 32), 40);
    const particles = Array.from({ length: particleCount }, () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.6) * 0.3,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.25 + 0.1,
        pulseSpeed: 0.015 + Math.random() * 0.02,
        pulseVal: Math.random() * Math.PI
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle evening dust particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulseVal += p.pulseSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const currentAlpha = p.alpha * (0.6 + Math.sin(p.pulseVal) * 0.4);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 230, 220, ${currentAlpha})`;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {/* Vice City Sunset Radiant Sky Gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '760px',
          background: 'linear-gradient(180deg, rgba(147, 51, 234, 0.45) 0%, rgba(219, 39, 119, 0.42) 28%, rgba(225, 29, 72, 0.38) 55%, rgba(249, 115, 22, 0.25) 78%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />

      {/* Vice City Sunset Photography Backdrop */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '760px',
          backgroundImage: 'url(/vice_city_sunset.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          opacity: 0.65,
          filter: 'brightness(1.12) contrast(1.05) saturate(1.3)',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 65%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />

      {/* Background HTML5 Canvas */}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', position: 'relative', zIndex: 1 }} />

      {/* Atmospheric Miami Palm Tree Silhouette Overlays (SVG) */}
      <div
        className="gta-palm-silhouettes"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '520px',
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(255, 42, 133, 0.2) 0%, rgba(168, 85, 247, 0.1) 45%, transparent 75%)`
        }}
      >
        {/* Palm tree silhouettes SVG left and right */}
        <svg
          viewBox="0 0 1440 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        >
          {/* Left Palm cluster */}
          <g fill="#000000" opacity="0.85">
            {/* Trunk 1 */}
            <path d="M-20 450 Q40 280 90 140 Q95 125 102 110 L94 110 Q85 130 30 285 L-30 450 Z" />
            {/* Fronds */}
            <path d="M102 110 Q140 70 210 80 Q160 105 102 115 Z" />
            <path d="M102 110 Q160 50 220 50 Q170 85 102 112 Z" />
            <path d="M102 110 Q120 30 170 10 Q140 55 102 108 Z" />
            <path d="M102 110 Q80 20 40 5 Q70 55 98 108 Z" />
            <path d="M102 110 Q50 40 10 50 Q55 80 98 112 Z" />
            <path d="M102 110 Q30 70 -30 90 Q35 105 98 115 Z" />
            <path d="M102 110 Q40 110 -10 150 Q50 135 100 116 Z" />
            <path d="M102 110 Q130 110 180 150 Q135 130 102 115 Z" />

            {/* Trunk 2 (smaller, leaning) */}
            <path d="M40 450 Q85 310 160 180 Q165 170 172 155 L164 155 Q155 172 75 315 L30 450 Z" />
            <path d="M172 155 Q210 120 270 130 Q225 150 172 160 Z" />
            <path d="M172 155 Q220 100 275 105 Q225 130 172 158 Z" />
            <path d="M172 155 Q190 80 230 65 Q205 105 172 154 Z" />
            <path d="M172 155 Q145 75 110 65 Q140 105 168 154 Z" />
            <path d="M172 155 Q125 100 85 110 Q130 130 168 158 Z" />
          </g>

          {/* Right Palm cluster */}
          <g fill="#000000" opacity="0.85">
            <path d="M1470 450 Q1390 270 1330 130 Q1325 115 1318 100 L1326 100 Q1335 120 1400 275 L1480 450 Z" />
            <path d="M1318 100 Q1275 60 1205 70 Q1255 95 1318 105 Z" />
            <path d="M1318 100 Q1255 40 1195 40 Q1245 75 1318 102 Z" />
            <path d="M1318 100 Q1295 20 1245 5 Q1275 50 1318 98 Z" />
            <path d="M1318 100 Q1335 15 1375 0 Q1345 50 1322 98 Z" />
            <path d="M1318 100 Q1365 35 1405 45 Q1360 75 1322 102 Z" />
            <path d="M1318 100 Q1385 65 1445 85 Q1380 100 1322 105 Z" />
            <path d="M1318 100 Q1375 105 1425 145 Q1365 130 1320 111 Z" />
            <path d="M1318 100 Q1285 105 1235 145 Q1280 125 1318 110 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
