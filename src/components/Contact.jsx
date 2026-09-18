import React from 'react';
import { Phone, Mail, MapPin, MessageSquare, ExternalLink, Globe } from 'lucide-react';

export default function Contact() {
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Jaya+Engineering+College+Thirunindravur+Tamil+Nadu';

  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag blue">
            <MessageSquare size={14} />
            <span>Connect With Us</span>
          </div>
          <h2 className="section-title">HAVE A QUESTION?</h2>
          <p className="section-subtitle">
            Need clarification regarding registration, event guidelines, or campus transportation? Reach out to our central team directly.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="contact-grid">
          {/* General Helpdesk Card */}
          <div className="contact-card">
            <div className="contact-icon-box">
              <Phone size={22} />
            </div>
            <h4>Helpline & Coordinators</h4>
            <p>
              Connect with our student organizing committee for rapid assistance on scheduling, team registrations, and queries.
            </p>
            <a href="tel:+919025877663" className="contact-link">
              <Phone size={15} />
              <span>+91 90258 77663 (Nishanth)</span>
            </a>
          </div>

          {/* Official Email Card */}
          <div className="contact-card">
            <div className="contact-icon-box" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
              <Mail size={22} />
            </div>
            <h4>Official Correspondence</h4>
            <p>
              Send in institutional inquiries, sponsorship propositions, or certificate verifications directly to the department desk.
            </p>
            <a href="mailto:sfd2026@jaya.edu.in" className="contact-link" style={{ color: '#38bdf8' }}>
              <Mail size={15} />
              <span>sfd2026@jaya.edu.in</span>
            </a>
          </div>

          {/* Venue & College Info Card */}
          <div className="contact-card">
            <div className="contact-icon-box" style={{ color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
              <MapPin size={22} />
            </div>
            <h4>Campus & Location</h4>
            <p>
              Jaya Engineering College, Thirunindravur Road, Tamil Nadu 602024. Reachable via suburban trains and MTC bus transit.
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
              style={{ color: '#a855f7' }}
            >
              <Navigation size={15} />
              <span>Navigate on Google Maps</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Navigation(props) {
  return <MapPin {...props} />;
}
