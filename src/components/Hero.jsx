import React from 'react';
import { ArrowRight, MapPin, Sparkles, Terminal, Code2, Users, Layers, Building2, Lock } from 'lucide-react';
import HeroTerminal from './HeroTerminal';

export default function Hero() {
  return (
    <section id="home" className="hero-section">
      {/* Background Video (Full Real Hero Car Video) */}
      <div className="hero-video-bg-container" aria-hidden="true">
        <video
          className="hero-video-bg"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/gta-hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="container hero-container">
        {/* The Iconic GTA 6 Slanted Banner Container */}
        <div className="gta-hero-banner-wrapper">
          <div className="gta-hero-banner">
            <div className="banner-grid-content">
              {/* Left Side: Bold Title Slab (Like the GTA VI Logo Box in Reference) */}
              <div className="banner-left-title-box">
                <h1 className="hero-title">
                  <span className="title-row">SOFTWARE</span>
                  <span className="title-row">FREEDOM</span>
                  <span className="title-accent">DAY 2026</span>
                </h1>
              </div>

              {/* Right Side: Headline, Description, and Metadata */}
              <div className="banner-right-info-box">
                {/* Registration Closed Notice Pill */}
                <div className="hero-closed-alert-pill">
                  <span className="closed-pulse-dot" />
                  <Lock size={13} />
                  <span>REGISTRATIONS OFFICIALLY CLOSED • SLOTS FULL</span>
                </div>

                <div className="hero-headline">
                  <span>Celebrate Freedom. Build Open. Share Knowledge.</span>
                </div>

                <p className="hero-description">
                  A premier global celebration of Free and Open Source Software (FOSS), engineering innovation, developer culture, collaborative creativity, and digital technology freedom.
                </p>

                {/* Host Details Row */}
                <div className="hero-host-info">
                  <div className="host-meta-item">
                    <Building2 size={15} className="host-meta-icon" />
                    <span className="host-org">Department of Computer Science and Engineering</span>
                  </div>
                  <div className="host-meta-item">
                    <span className="host-institution">Jaya Engineering College</span>
                  </div>
                  <div className="host-meta-item host-location">
                    <MapPin size={15} />
                    <span>Thirunindravur Road, Tamil Nadu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom-Right Hanging Action Buttons (Matches Reference 'BUY TICKETS' Button) */}
            <div className="banner-hanging-actions">
              <a href="#events" className="btn btn-primary">
                <span>Explore Events</span>
                <span className="btn-arrow-icon">→</span>
              </a>

              <a href="#register" className="btn-closed-hanging">
                <Lock size={14} />
                <span>Registrations Closed</span>
              </a>
            </div>
          </div>
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

        {/* Centered Interactive Cyber Terminal Console */}
        <div className="hero-terminal-centered">
          <HeroTerminal />
        </div>
      </div>
    </section>
  );
}
