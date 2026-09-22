import React from 'react';

export default function PostHeroBackdrop() {
  return (
    <div className="post-hero-image-backdrop" aria-hidden="true">
      {/* Vice City Sunset Radiant Sky Gradient */}
      <div className="post-hero-sunset-gradient" />

      {/* Vice City Sunset Photography Backdrop */}
      <div className="post-hero-sunset-image" />

      {/* Atmospheric Miami Palm Tree Silhouette Overlays */}
      <div className="post-hero-palm-silhouettes">
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
