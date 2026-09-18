import React, { useEffect, useRef } from 'react';

/**
 * Modern Ambient Background Canvas
 * Clean, subtle, human-crafted atmospheric background
 * Replaces AI-template floating code snippets and laser lines with
 * calm, elegant depth and soft ambient glow.
 */
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

    // Subtle, calm ambient particles (very low opacity, slow natural drift)
    const particleCount = Math.min(Math.floor(width / 70), 25);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.25 + 0.08
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Deep atmospheric radial glow at top-left
      const gradTop = ctx.createRadialGradient(
        width * 0.15,
        height * 0.1,
        0,
        width * 0.15,
        height * 0.1,
        width * 0.55
      );
      gradTop.addColorStop(0, 'rgba(16, 185, 129, 0.045)');
      gradTop.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradTop;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft subtle navy/indigo glow at center-right
      const gradRight = ctx.createRadialGradient(
        width * 0.85,
        height * 0.45,
        0,
        width * 0.85,
        height * 0.45,
        width * 0.5
      );
      gradRight.addColorStop(0, 'rgba(59, 130, 246, 0.035)');
      gradRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradRight;
      ctx.fillRect(0, 0, width, height);

      // 3. Gentle calm particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
        background: '#070a10'
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
