import React from 'react';
import { overallCoordinators } from '../data/coordinators';
import { Users, Phone, UserCheck } from 'lucide-react';

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

        {/* 10 Coordinators Team Grid (5x2 Desktop) */}
        <div className="coordinators-grid">
          {overallCoordinators.map((coord) => (
            <article key={coord.id} className="coord-card">
              {/* Profile Avatar Frame */}
              <div className="coord-avatar-frame">
                <div className="coord-avatar-inner">
                  {coord.photo ? (
                    <img
                      src={coord.photo}
                      alt={coord.name}
                      className="coord-avatar-img"
                      loading="lazy"
                    />
                  ) : (
                    <Users size={32} />
                  )}
                </div>
                <span className="coord-avatar-badge">{coord.avatarBadge}</span>
              </div>

              {/* Coordinator Metadata */}
              <div className="coord-meta">
                <h4 className="coord-name">{coord.name}</h4>
                <div className="coord-role">{coord.role}</div>
                <div className="coord-designation">{coord.designation}</div>
                <div className="coord-dept">{coord.department}</div>
              </div>

              {/* Direct 1-tap Phone Call */}
              <div className="coord-contact-actions">
                <a
                  href={`tel:${coord.phone}`}
                  className="coord-call-btn"
                  title={`Call ${coord.name}`}
                  aria-label={`Call coordinator ${coord.name} at ${coord.phone}`}
                >
                  <Phone size={13} />
                  <span>{coord.phone}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
