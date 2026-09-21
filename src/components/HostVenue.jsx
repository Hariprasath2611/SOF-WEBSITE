import React from 'react';
import { MapPin, Navigation, Building2, Award, Laptop, Users, ExternalLink } from 'lucide-react';
import MapcnVenueMap from './MapcnVenueMap';

export default function HostVenue() {
  const mapsUrl = 'https://www.google.com/maps/place/Jaya+Engineering+College/@13.135473,80.045303,17z/data=!4m6!3m5!1s0x3a5289b72cf8bb8f:0xd5fed379d9b04ecc!8m2!3d13.135473!4d80.045303!16s%2Fm%2F0cw1fjr';

  return (
    <section id="about" className="section host-section">
      <div className="container">
        <div className="section-header">
          <div className="section-tag">
            <Building2 size={14} />
            <span>The Host Institution</span>
          </div>
          <h2 className="section-title">Where Open Source Meets Engineering Excellence</h2>
          <p className="section-subtitle">
            Hosted with pride by the Department of Computer Science and Engineering at Jaya Engineering College, bringing together technology enthusiasts, open-source developers, and engineers.
          </p>
        </div>

        <div className="host-card">
          {/* Left Details */}
          <div className="host-details">
            <div className="host-kicker">
              <span>Department of Computer Science & Engineering</span>
            </div>

            <h3 className="host-main-title">
              Jaya Engineering College
            </h3>
            <div className="host-sub-title">
              Pioneering Open Source & Technical Innovation
            </div>

            <p className="host-bio">
              The Department of Computer Science and Engineering is dedicated to nurturing technical competence, open inquiry, and collaborative software freedom. Software Freedom Day 2026 brings an open-source festival designed to inspire, build, and celebrate community-driven technology solutions.
            </p>

            <div className="host-features-grid">
              <div className="host-feature-item">
                <Laptop size={20} className="host-feature-icon" />
                <div className="host-feature-text">
                  <h4>Modern Computing Facilities</h4>
                  <p>Equipped with Linux terminal labs, high-speed connectivity, and developer workbenches.</p>
                </div>
              </div>

              <div className="host-feature-item">
                <Award size={20} className="host-feature-icon" />
                <div className="host-feature-text">
                  <h4>FOSS Culture & Community</h4>
                  <p>Active developer workshops, coding sprints, and open-source contribution drives.</p>
                </div>
              </div>

              <div className="host-feature-item">
                <Users size={20} className="host-feature-icon" />
                <div className="host-feature-text">
                  <h4>Interdisciplinary Collaboration</h4>
                  <p>Empowering cross-disciplinary engineering teams from all departments.</p>
                </div>
              </div>

              <div className="host-feature-item">
                <Building2 size={20} className="host-feature-icon" />
                <div className="host-feature-text">
                  <h4>Spacious Campus Venues</h4>
                  <p>Auditoriums, seminar halls, and presentation arenas for all 5 tracks.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Location Box */}
          <div className="host-location-widget">
            <div className="location-header">
              <div className="location-status">
                <span className="location-radar" />
                <span>OFFICIAL VENUE</span>
              </div>
              <MapPin size={20} color="var(--accent-pink)" />
            </div>

            <div className="location-address-box">
              <div className="address-item">
                <Building2 size={20} className="address-icon" />
                <div className="address-content">
                  <h5>Institution</h5>
                  <p>Jaya Engineering College</p>
                  <small>Department of Computer Science & Engineering</small>
                </div>
              </div>

              <div className="address-item">
                <Navigation size={20} className="address-icon" />
                <div className="address-content">
                  <h5>Location & Campus Address</h5>
                  <p>CTH Road, Prakash Nagar, Thiruninravur</p>
                  <small>Pin Code: 602 024 · Accessible via suburban rail & bus routes</small>
                </div>
              </div>
            </div>

            {/* Custom mapcn Dark Theme Venue Map */}
            <MapcnVenueMap />

            <div className="map-btn-wrapper">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-green"
                style={{ width: '100%' }}
              >
                <Navigation size={16} />
                <span>View Location on Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
