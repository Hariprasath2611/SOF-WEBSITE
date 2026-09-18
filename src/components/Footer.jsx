import React, { useState, useEffect } from 'react';
import { Terminal, Heart, Code2, ShieldCheck, GitFork, ArrowUp } from 'lucide-react';

export default function Footer() {
  const [uptimeSeconds, setUptimeSeconds] = useState(1420);

  useEffect(() => {
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top Footer Columns */}
        <div className="footer-top">
          {/* Brand & Mission Column */}
          <div className="footer-brand">
            <h3>SOFTWARE FREEDOM DAY 2026</h3>
            <p>
              An open-source celebration organized by the <strong>Department of Computer Science and Engineering, Jaya Engineering College</strong>, Thirunindravur Road, Tamil Nadu.
            </p>
            <div className="footer-uptime-badge">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--accent-green)',
                  boxShadow: '0 0 8px var(--accent-green)'
                }}
              />
              <span>System Uptime: {formatUptime(uptimeSeconds)}</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="footer-col">
            <h5>Navigation</h5>
            <ul className="footer-links">
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#about" className="footer-link">About Host College</a></li>
              <li><a href="#participation" className="footer-link">Eligibility Matrix</a></li>
              <li><a href="#events" className="footer-link">Five Main Events</a></li>
              <li><a href="#register" className="footer-link" style={{ color: 'var(--accent-green)' }}>Registration Portal</a></li>
              <li><a href="#coordinators" className="footer-link">Meet Coordinators</a></li>
              <li><a href="#admin" className="footer-link" style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Admin Console</a></li>
            </ul>
          </div>

          {/* FOSS Philosophy & Event Tracks */}
          <div className="footer-col">
            <h5>Event Tracks</h5>
            <ul className="footer-links">
              <li><a href="#events" className="footer-link">Track 01: Demo Stall</a></li>
              <li><a href="#events" className="footer-link">Track 02: Mini Hackathon</a></li>
              <li><a href="#events" className="footer-link">Track 03: Poster Designing</a></li>
              <li><a href="#events" className="footer-link">Track 04: Hands-on Workshop</a></li>
              <li><a href="#events" className="footer-link">Track 05: Tech Debate Arena</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            <span>© 2026 Department of CSE, Jaya Engineering College. Built for the Open Source Community.</span>
          </div>

          <div className="footer-quote">
            "Freedom to Build. Freedom to Learn. Freedom to Share. Freedom to Create."
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
            aria-label="Back to top"
          >
            <ArrowUp size={14} />
            <span>Top</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
