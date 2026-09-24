import React from 'react';
import { ArrowUpRight, Sparkles, Terminal, Lock, CheckCircle, ShieldAlert } from 'lucide-react';

export default function RegistrationCTA() {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-box">
          <div className="section-tag" style={{ marginBottom: '20px' }}>
            <Sparkles size={14} />
            <span>Registration Update</span>
          </div>

          <h2 className="cta-title">REGISTRATIONS ARE OFFICIALLY CLOSED</h2>

          <p className="cta-subtitle">
            Online registrations for Software Freedom Day 2026 at Jaya Engineering College have officially ended as all track capacities and workshop seats are completely filled. We thank every student and institution for the overwhelming enthusiasm!
          </p>

          <div className="cta-buttons">
            <button
              type="button"
              className="btn btn-closed"
              disabled
              style={{ padding: '15px 32px', fontSize: '1.05rem' }}
            >
              <Lock size={18} />
              <span>REGISTRATIONS CLOSED</span>
            </button>

            <a href="#events" className="btn btn-secondary" style={{ padding: '15px 28px' }}>
              <Terminal size={18} color="var(--accent-cyan)" />
              <span>EXPLORE EVENT TRACKS</span>
              <span className="btn-arrow-icon">↗</span>
            </a>
          </div>

          {/* Guarantee Badges */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              marginTop: '40px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#c4b5fd'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="#f43f5e" />
              <span>All 5 Track Capacities Reached</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--accent-cyan)" />
              <span>Confirmed Passes Valid on Event Day</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--accent-cyan)" />
              <span>Prizes & Certificates for Participants</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
