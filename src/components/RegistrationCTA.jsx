import React from 'react';
import { ArrowUpRight, Sparkles, Terminal, Rocket, CheckCircle } from 'lucide-react';

export default function RegistrationCTA() {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-box">
          <div className="section-tag" style={{ marginBottom: '20px' }}>
            <Sparkles size={14} />
            <span>Registration Update</span>
          </div>

          <h2 className="cta-title">REGISTRATIONS ARE NOW CLOSED</h2>

          <p className="cta-subtitle">
            Thank you for the tremendous response! Online registrations for Software Freedom Day 2026 across all event tracks have reached full capacity and are officially closed. Explore event tracks and coordinator details below.
          </p>

          <div className="cta-buttons">
            <a
              href="#register"
              className="btn btn-secondary"
              style={{ padding: '15px 32px', fontSize: '1.05rem', borderColor: 'rgba(239, 68, 68, 0.45)', color: '#fca5a5' }}
            >
              <Rocket size={18} />
              <span>REGISTRATION STATUS</span>
              <span className="btn-arrow-icon">→</span>
            </a>

            <a href="#events" className="btn btn-primary" style={{ padding: '15px 28px' }}>
              <Terminal size={18} />
              <span>EXPLORE EVENTS</span>
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
              <CheckCircle size={15} color="var(--accent-cyan)" />
              <span>₹100 Registration / Event</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--accent-cyan)" />
              <span>Participation Certificates</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="var(--accent-cyan)" />
              <span>Exciting Cash Prizes & Swag</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
