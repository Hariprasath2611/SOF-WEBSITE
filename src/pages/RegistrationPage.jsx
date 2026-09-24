import React, { useState } from 'react';
import { ArrowLeft, Shield, Sparkles, Lock, CheckCircle, MapPin, Phone, AlertCircle } from 'lucide-react';
import { events } from '../data/events';
import ConfirmationPass from '../components/registration/ConfirmationPass';

export default function RegistrationPage({ onBackToHome }) {
  const [confirmedRegistration, setConfirmedRegistration] = useState(null);

  // If a participant has already obtained a pass, show it
  if (confirmedRegistration) {
    return (
      <div className="reg-page-container">
        <div className="reg-inner-wrapper">
          <ConfirmationPass
            registration={confirmedRegistration}
            onReset={() => setConfirmedRegistration(null)}
            onBackToHome={onBackToHome}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page-container">
      <div className="reg-inner-wrapper">
        {/* Navigation Bar / Return to Home */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          {onBackToHome && (
            <button
              type="button"
              className="btn-wizard-back"
              onClick={onBackToHome}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <ArrowLeft size={14} />
              <span>← Back to SFD 2026 Home</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            <Shield size={14} color="#00f0ff" />
            <span className="hide-on-mobile">Official SFD Portal</span>
          </div>
        </div>

        {/* Closed Registration Main Showcase Card */}
        <div className="reg-closed-card">
          <div className="reg-closed-header">
            <div className="reg-closed-icon-ring">
              <Lock size={38} />
            </div>

            <div className="reg-closed-status-pill">
              <span className="closed-pulse-dot" />
              <span>OFFICIAL EVENT NOTICE</span>
            </div>

            <h1 className="reg-closed-title">REGISTRATION IS OFFICIALLY CLOSED</h1>
            
            <p className="reg-closed-subtitle">
              Software Freedom Day 2026 • Department of Computer Science & Engineering, Jaya Engineering College
            </p>
          </div>

          <div className="reg-closed-body">
            <div className="reg-closed-message-box">
              <p className="reg-closed-main-p">
                The registration for this event is now officially over. All available slots across all 5 challenge tracks (Demo Stall, Mini Hackathon, Poster Designing, Workshop, Tech Debate) have been completely filled.
              </p>
              <p className="reg-closed-sub-p">
                No new online submissions or on-spot registrations will be accepted. We sincerely thank every student, team, and engineering college for the overwhelming enthusiasm and support!
              </p>
            </div>

            {/* Crucial Instructions for Participants */}
            <div className="reg-closed-info-grid">
              <div className="reg-closed-info-item">
                <div style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }}>
                  <CheckCircle size={22} />
                </div>
                <div>
                  <h4>Already Registered?</h4>
                  <p>
                    All confirmed participants should carry their <strong>Confirmation Pass</strong> (digital or printout) along with their valid <strong>College ID Card</strong> on the event day.
                  </p>
                </div>
              </div>

              <div className="reg-closed-info-item">
                <div style={{ color: '#00f0ff', flexShrink: 0, marginTop: '2px' }}>
                  <MapPin size={22} />
                </div>
                <div>
                  <h4>Campus Venue & Timing</h4>
                  <p>
                    Venue: <strong>Auditorium, Jaya Engineering College</strong>, CTH Road, Thirunindravur, Chennai. Detailed schedule notifications will be emailed to team leaders.
                  </p>
                </div>
              </div>
            </div>

            {/* Track Coordinators Directory */}
            <div className="reg-closed-coordinators-section">
              <h3 className="coord-section-title">
                <Phone size={15} color="#00f0ff" />
                <span>Need Assistance? Contact Track Coordinators</span>
              </h3>

              <div className="reg-closed-coord-grid">
                {events.map((ev) => (
                  <div key={ev.id} className="reg-coord-card">
                    <div className="coord-track-tag" style={{ color: ev.color }}>
                      TRACK {ev.number} • {ev.title}
                    </div>
                    <div className="coord-name">{ev.coordinator.name}</div>
                    <a href={`tel:${ev.coordinator.phone}`} className="coord-call-link">
                      <Phone size={12} />
                      <span>{ev.coordinator.phone}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="reg-closed-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onBackToHome}
                style={{ padding: '12px 28px' }}
              >
                <span>← Return to SFD 2026 Home</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (onBackToHome) onBackToHome();
                  setTimeout(() => {
                    const el = document.getElementById('events');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                }}
                style={{ padding: '12px 24px' }}
              >
                <span>Explore Event Tracks & Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
