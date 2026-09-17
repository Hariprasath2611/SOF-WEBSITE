import React from 'react';
import { timelineData } from '../data/timeline';
import { Clock, Calendar, MapPin, CheckCircle, Flame, Layers } from 'lucide-react';

export default function Timeline() {
  return (
    <section id="schedule" className="section timeline-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag blue">
            <Clock size={14} />
            <span>Event Day Pipeline</span>
          </div>
          <h2 className="section-title">Schedule & Milestone Stages</h2>
          <p className="section-subtitle">
            A continuous sequence of hackathons, technical demonstrations, creative workshops, and debates celebrating Software Freedom Day 2026.
          </p>
        </div>

        {/* Timeline Pipeline */}
        <div className="timeline-pipeline">
          {timelineData.map((stage) => (
            <div key={stage.stage} className="timeline-node-item">
              {/* Center Dot Marker */}
              <div className="timeline-dot-marker">
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 800 }}>
                  {stage.stage}
                </span>
              </div>

              {/* Card Content */}
              <div className="timeline-card-content">
                <div className="timeline-top-row">
                  <span className="timeline-time-badge">{stage.time}</span>
                  <span className="timeline-cat-badge">{stage.category}</span>
                </div>

                <h3 className="timeline-title">{stage.title}</h3>

                <div className="timeline-location-tag">
                  <MapPin size={13} color="#10b981" />
                  <span>{stage.location}</span>
                </div>

                <p className="timeline-desc">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
