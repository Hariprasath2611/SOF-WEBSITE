import React, { useMemo, useState } from 'react';
import { GitCommit, Sparkles, Activity } from 'lucide-react';

export default function ContributionGraph() {
  const [hoveredCell, setHoveredCell] = useState(null);

  // Generate 52 weeks x 7 days pseudo-activity heatmap with clustering
  const weeks = 36;
  const days = 7;

  const cells = useMemo(() => {
    const grid = [];
    for (let w = 0; w < weeks; w++) {
      for (let d = 0; d < days; d++) {
        // Deterministic pseudo-random pattern with active bursts
        const val = Math.sin(w * 0.4 + d * 0.8) * Math.cos(w * 0.2);
        let level = 0;
        if (val > 0.45) level = 4;
        else if (val > 0.15) level = 3;
        else if (val > -0.2) level = 2;
        else if (val > -0.55) level = 1;

        const commits = level === 0 ? 0 : level * 3 + Math.floor(Math.abs(val * 5));
        grid.push({
          id: `${w}-${d}`,
          week: w,
          day: d,
          level,
          commits
        });
      }
    }
    return grid;
  }, [weeks, days]);

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="contribution-widget">
          {/* Header Row */}
          <div className="contrib-header">
            <div className="contrib-title-group">
              <h3>
                <GitCommit size={20} color="#10b981" />
                <span>EVERY CONTRIBUTION MATTERS.</span>
              </h3>
              <p>
                Open source grows when people learn, build, share, and contribute together. From first pull requests to campus hackathons.
              </p>
            </div>

            <div className="contrib-stats">
              <div className="contrib-stat">
                <span>1,248+</span> SFD Commits
              </div>
              <div className="contrib-stat">
                <span>100%</span> FOSS Code
              </div>
            </div>
          </div>

          {/* Activity Matrix Grid */}
          <div className="contrib-grid-wrapper">
            <div className="contrib-grid" role="grid" aria-label="Contribution Activity Grid">
              {cells.map((cell) => (
                <div
                  key={cell.id}
                  className={`contrib-cell level-${cell.level}`}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  title={`${cell.commits} open source contributions in week ${cell.week + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Bottom Info & Legend */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#94a3b8' }}>
              {hoveredCell ? (
                <span>
                  Week {hoveredCell.week + 1}: <strong>{hoveredCell.commits} open-source contributions</strong>
                </span>
              ) : (
                <span>Hover over grid cells to inspect commit telemetry</span>
              )}
            </div>

            <div className="contrib-legend">
              <span>Less</span>
              <span className="contrib-cell level-0" style={{ width: 11, height: 11 }} />
              <span className="contrib-cell level-1" style={{ width: 11, height: 11 }} />
              <span className="contrib-cell level-2" style={{ width: 11, height: 11 }} />
              <span className="contrib-cell level-3" style={{ width: 11, height: 11 }} />
              <span className="contrib-cell level-4" style={{ width: 11, height: 11 }} />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
