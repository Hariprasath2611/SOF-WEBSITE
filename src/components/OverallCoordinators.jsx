import React from 'react';
import { overallCoordinators } from '../data/coordinators';
import { Users, UserCheck } from 'lucide-react';

function CoordinatorCard({ coord }) {
  const [imageFailed, setImageFailed] = React.useState(false);

  return (
    <article className="coord-card">
      {/* Profile Avatar Frame */}
      <div className="coord-avatar-frame">
        <div className="coord-avatar-inner">
          {coord.photo && !imageFailed ? (
            <img
              src={coord.photo}
              alt={coord.name}
              className="coord-avatar-img"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Users size={32} />
          )}
        </div>
      </div>

      {/* Coordinator Metadata */}
      <div className="coord-meta">
        <h4 className="coord-name">{coord.name}</h4>
        <div className="coord-designation">{coord.designation}</div>
      </div>
    </article>
  );
}

export default function OverallCoordinators() {
  return (
    <section id="coordinators" className="section coordinators-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag blue">
            <UserCheck size={14} />
            <span>Central Management Team</span>
          </div>
          <h2 className="section-title">MEET THE EVENT COORDINATORS</h2>
          <p className="section-subtitle">
            Ten dedicated student organizers ensuring seamless logistics, hospitality, technical infrastructure, and participant satisfaction for Software Freedom Day 2026.
          </p>
        </div>

        {/* 10 Coordinators Team Big Box (One unified container) */}
        <div className="coordinators-big-box">
          {/* Top Center Title Header */}
          <div className="coordinators-box-header">
            <span className="coordinators-box-title">OVERALL EVENT COORDINATORS</span>
          </div>

          {/* 10 Coordinators Grid */}
          <div className="coordinators-grid">
            {overallCoordinators.map((coord) => (
              <CoordinatorCard key={coord.id} coord={coord} />
            ))}
          </div>

          {/* Bottom Right Dept Footer */}
          <div className="coordinators-box-footer">
            <span className="coordinators-box-dept">Dept of Computer Science &amp; Engineering</span>
          </div>
        </div>
      </div>
    </section>
  );
}
