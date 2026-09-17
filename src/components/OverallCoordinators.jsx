import React from 'react';
import { overallCoordinators } from '../data/coordinators';
import { Users, Phone, Mail, ShieldCheck, UserCheck, Globe } from 'lucide-react';

function GithubIcon({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
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

              {/* Action Buttons with 1-tap call support */}
              <div className="coord-contact-actions">
                <a
                  href={`tel:${coord.phone}`}
                  className="coord-call-btn"
                  title={`Call ${coord.name}`}
                  aria-label={`Call coordinator ${coord.name} at ${coord.phone}`}
                >
                  <Phone size={13} />
                  <span>Call</span>
                </a>

                <a
                  href={`mailto:${coord.email}`}
                  className="coord-icon-btn"
                  title={`Email ${coord.name}`}
                  aria-label={`Email ${coord.name}`}
                >
                  <Mail size={15} />
                </a>

                {coord.github && (
                  <a
                    href={coord.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="coord-icon-btn"
                    title="GitHub Profile"
                    aria-label={`${coord.name} GitHub profile`}
                  >
                    <GithubIcon size={15} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
