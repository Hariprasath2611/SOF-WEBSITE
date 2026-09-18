import React from 'react';
import { ArrowRight, MapPin, Sparkles, Terminal, Code2, Users, Layers } from 'lucide-react';
import HeroTerminal from './HeroTerminal';

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column Content */}
          <div className="hero-content">
            {/* Host Badge */}
            <div className="hero-host-badge">
              <span className="host-pulse-dot" />
              <span>Department of Computer Science & Engineering</span>
            </div>

            {/* Main Title Group */}
            <div className="hero-title-group">
              <h1 className="hero-title">
                SOFTWARE FREEDOM <br />
                <span className="title-accent">DAY 2026</span>
              </h1>

              <div className="hero-headline">
                <span>Celebrate Freedom. Build Open. Share Knowledge.</span>
              </div>

              <p className="hero-description">
                A premier global celebration of Free and Open Source Software (FOSS), engineering innovation, developer culture, collaborative creativity, and digital technology freedom.
              </p>
            </div>

            {/* Event Host & Location Info Box */}
            <div className="hero-host-info">
              <div className="host-org">Department of Computer Science and Engineering</div>
              <div className="host-institution">Jaya Engineering College</div>
              <div className="host-location">
                <MapPin size={14} />
                <span>Thirunindravur Road, Tamil Nadu</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="hero-cta-group">
              <a href="#events" className="btn btn-primary">
                <span>Explore Events</span>
                <span className="btn-arrow-icon">→</span>
              </a>

              <a href="#register" className="btn btn-secondary">
                <span>Register Now</span>
                <span className="btn-arrow-icon">↗</span>
              </a>
            </div>

            {/* Live Metrics Row */}
            <div className="hero-stats-row">
              <div className="hero-stat-item">
                <span className="stat-number green">05</span>
                <span className="stat-label">Major Tracks</span>
              </div>

              <div className="hero-stat-item">
                <span className="stat-number">10</span>
                <span className="stat-label">Coordinators</span>
              </div>

              <div className="hero-stat-item">
                <span className="stat-number green">100%</span>
                <span className="stat-label">FOSS Spirit</span>
              </div>

              <div className="hero-stat-item">
                <span className="stat-number">ALL</span>
                <span className="stat-label">Engineering Depts</span>
              </div>
            </div>
          </div>

          {/* Right Column Interactive Terminal */}
          <div className="hero-terminal-col">
            <HeroTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
