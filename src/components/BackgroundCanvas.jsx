import React, { useEffect, useRef } from 'react';

const FLOATING_SNIPPETS = [
  'git clone https://github.com/foss/sfd-2026',
  'git commit -m "feat: freedom to build"',
  'git push origin main',
  'npm install @foss/community',
  'sudo apt update && sudo apt upgrade -y',
  'docker run -d -p 80:80 sfd/open-source:2026',
  'python3 -m freedom.matrix',
  'node server.js --mode=collaborative',
  'curl -sSL https://sfd2026.foss/install.sh | bash',
  'gcc -O3 freedom.c -o freedom',
  'export FOSS_COMMUNITY=active'
];

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

    // Dynamic Network Nodes representing open source contributors & repos
    const nodeCount = Math.min(Math.floor(width / 35), 45);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      isGreen: Math.random() > 0.4
    }));

    // Git Branch Line Paths
    const branches = [
      { y: height * 0.25, offset: 0, speed: 0.3, color: 'rgba(16, 185, 129, 0.15)' },
      { y: height * 0.55, offset: 50, speed: 0.2, color: 'rgba(59, 130, 246, 0.12)' },
      { y: height * 0.85, offset: 120, speed: 0.25, color: 'rgba(139, 92, 246, 0.12)' }
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Developer Matrix Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Git Branch Flow Lines
      branches.forEach((b) => {
        b.offset += b.speed;
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, b.y);

        // Branch curve simulation
        const midX = width * 0.45;
        ctx.lineTo(midX, b.y);
        ctx.bezierCurveTo(midX + 40, b.y, midX + 60, b.y + 35, midX + 110, b.y + 35);
        ctx.lineTo(width, b.y + 35);
        ctx.stroke();

        // Commit nodes on branch
        const commitX = (midX + 110 + (b.offset % (width - midX))) % width;
        ctx.fillStyle = b.color.replace('0.12', '0.6').replace('0.15', '0.7');
        ctx.beginPath();
        ctx.arc(commitX, b.y + 35, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Network Nodes & Dynamic Connection Lines
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.isGreen ? 'rgba(16, 185, 129, 0.5)' : 'rgba(56, 189, 248, 0.4)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = node.x - nodeB.x;
          const dy = node.y - nodeB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nodeB.x, nodeB.y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.18 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
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
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Decorative floating code fragments */}
      <div className="code-particle-stream" aria-hidden="true">
        {FLOATING_SNIPPETS.map((snippet, idx) => (
          <div
            key={idx}
            className="floating-code-snippet"
            style={{
              left: `${(idx * 9 + 4) % 92}%`,
              animationDelay: `${idx * 1.5}s`,
              animationDuration: `${14 + (idx % 4) * 3}s`,
              opacity: 0.18 + (idx % 3) * 0.08
            }}
          >
            {snippet}
          </div>
        ))}
      </div>
    </div>
  );
}
