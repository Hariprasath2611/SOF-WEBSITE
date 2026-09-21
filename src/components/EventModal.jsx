import React, { useEffect } from 'react';
import {
  X,
  Phone,
  FolderGit2,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!event) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <FolderGit2 size={16} color="#10b981" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#94a3b8' }}>
                {event.repo}
              </span>
            </div>
            <h2>
              <span>Track {event.number}:</span> {event.title}
            </h2>
            <p>{event.tagline}</p>
          </div>

          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close event details dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-body">
          {/* About Section */}
          <div>
            <div className="modal-section-title">
              <ShieldCheck size={16} />
              <span>About The Track</span>
            </div>
            <p className="modal-description">{event.description}</p>
          </div>

          {/* Key Specs Grid */}
          <div className="modal-specs-grid">
            <div className="modal-spec-card">
              <h5>Eligibility</h5>
              <p>{event.eligibility}</p>
            </div>
            <div className="modal-spec-card">
              <h5>Team Configuration</h5>
              <p>{event.teamSize}</p>
            </div>
            <div className="modal-spec-card">
              <h5>Duration & Schedule</h5>
              <p>{event.duration}</p>
            </div>
            <div className="modal-spec-card">
              <h5>Assigned Venue</h5>
              <p>{event.venue}</p>
            </div>
          </div>



          {/* Official Rules & Guidelines */}
          <div>
            <div className="modal-section-title">
              <AlertCircle size={16} />
              <span>Rules & Guidelines</span>
            </div>
            <ul className="modal-rules-list">
              {event.rules.map((rule, idx) => (
                <li key={idx} className="modal-rule-item">
                  <CheckCircle2 size={16} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dedicated Event Coordinator Callout */}
          <div className="modal-coordinator-callout">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                className="coordinator-avatar"
                style={{
                  borderColor: event.color,
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {event.coordinator.photo ? (
                  <img
                    src={event.coordinator.photo}
                    alt={event.coordinator.name}
                    className="coord-avatar-img"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>EC{event.number}</span>
                )}
              </div>
              <div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}
                >
                  Track Coordinator
                </span>
                <h4 style={{ fontSize: '1.05rem', color: '#fff', margin: '2px 0 0 0' }}>{event.coordinator.name}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)', margin: '2px 0 0 0' }}>
                  {event.coordinator.phone}
                </p>
              </div>
            </div>

            <a href={`tel:${event.coordinator.phone}`} className="btn btn-phone">
              <Phone size={14} style={{ flexShrink: 0 }} />
              <span>Call Coordinator</span>
            </a>
          </div>
        </div>

        {/* Modal Footer with Registration CTA */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          <a
            href={event.registrationLink}
            className="btn btn-primary"
            onClick={onClose}
          >
            <span>Register for {event.title}</span>
            <span className="btn-arrow-icon">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
