import React from 'react';
import { ArrowUpRight, Sparkles, Terminal, Rocket, CheckCircle } from 'lucide-react';

export default function RegistrationCTA() {
  return (
    <section className="section cta-section">
      <div className="container">
        <div className="cta-box">
          <div className="section-tag" style={{ marginBottom: '20px' }}>
            <Sparkles size={14} />
            <span>Join The Celebration</span>
          </div>

          <h2 className="cta-title">READY TO BUILD OPEN?</h2>

          <p className="cta-subtitle">
            Join Software Freedom Day 2026 at Jaya Engineering College and experience a day of open-source technology, creativity, learning, collaboration, and innovation. Open to engineering students across all colleges and branches!
          </p>

          <div className="cta-buttons">
            <a href="#events" className="btn btn-primary" style={{ padding: '15px 32px', fontSize: '1.05rem' }}>
              <Rocket size={18} />
              <span>REGISTER NOW</span>
              <span className="btn-arrow-icon">→</span>
            </a>

            <a href="#events" className="btn btn-secondary" style={{ padding: '15px 28px' }}>
              <Terminal size={18} color="#10b981" />
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
              color: '#94a3b8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="#10b981" />
              <span>Free & Open Registration</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="#10b981" />
              <span>Participation Certificates</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={15} color="#10b981" />
              <span>Exciting Cash Prizes & Swag</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
