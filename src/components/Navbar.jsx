import React, { useState, useEffect } from 'react';
import { Terminal, Menu, X, ArrowUpRight, Code, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Participation', href: '#participation' },
    { label: 'Events', href: '#events' },
    { label: 'Ecosystem', href: '#ecosystem' },
    { label: 'Coordinators', href: '#coordinators' },
    { label: 'Schedule', href: '#schedule' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' }
  ];

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        {/* Brand Logo */}
        <a href="#home" className="brand-logo" aria-label="Software Freedom Day 2026 Home">
          <div className="brand-icon">
            <Terminal size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">SFD</span>
            <span className="brand-year">2026</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-menu">
            {navLinks.map((item) => (
              <li key={item.label}>
                <a href={item.href} className="nav-link">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Action Button & Mobile Toggle */}
        <div className="header-actions">
          <a href="#events" className="btn btn-primary nav-btn-register">
            <span>Register</span>
            <span className="btn-arrow-icon">→</span>
          </a>

          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <ul className="mobile-nav-links">
          {navLinks.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                <ArrowUpRight size={18} color="#10b981" />
              </a>
            </li>
          ))}
        </ul>

        <div className="mobile-drawer-footer">
          <a
            href="#events"
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => setMobileOpen(false)}
          >
            <span>Register Now</span>
            <span className="btn-arrow-icon">→</span>
          </a>
          <p style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
            Jaya Engineering College · Dept of CSE
          </p>
        </div>
      </div>
    </header>
  );
}
