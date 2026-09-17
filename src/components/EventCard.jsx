import React from 'react';
import {
  Phone,
  Layers,
  Terminal,
  Palette,
  Cpu,
  MessageSquareCode,
  FolderGit2,
  Users,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

const ICON_MAP = {
  Layers: Layers,
  Terminal: Terminal,
  Palette: Palette,
  Cpu: Cpu,
  MessageSquareCode: MessageSquareCode
};

export default function EventCard({ event, onOpenDetails }) {
  const IconComponent = ICON_MAP[event.icon] || Terminal;

  return (
    <article className="event-card">
      {/* Repository Style Top Bar */}
      <div className="event-repo-bar">
        <div className="repo-slug">
          <FolderGit2 size={13} />
          <span>{event.repo}</span>
        </div>
        <span className="event-number-tag">TRACK {event.number}</span>
      </div>

      {/* Main Body */}
      <div className="event-card-body">
        <div className="event-card-header">
          <div className="event-card-icon-wrap" style={{ color: event.color, borderColor: `${event.color}44` }}>
            <IconComponent size={24} />
          </div>
          <div className="event-title-group">
            <h3>{event.title}</h3>
            <div className="event-tagline">{event.tagline}</div>
          </div>
        </div>

        <p className="event-summary">{event.summary}</p>

        {/* Quick Meta Chips */}
        <div className="event-meta-specs">
          <div className="spec-chip">
            <Users size={12} />
            <span>{event.teamSize}</span>
          </div>
          <div className="spec-chip">
            <Clock size={12} />
            <span>{event.duration}</span>
          </div>
        </div>

        {/* Dedicated Event Coordinator Box */}
        <div className="event-coordinator-box">
          <div className="coordinator-profile">
            <div className="coordinator-avatar" style={{ borderColor: event.color }}>
              {event.coordinator.photo ? (
                <img
                  src={event.coordinator.photo}
                  alt={event.coordinator.name}
                  className="coord-avatar-img"
                  loading="lazy"
                />
              ) : (
                <span>EC{event.number}</span>
              )}
            </div>

            <div className="coordinator-info">
              <span className="coordinator-role-label">Event Coordinator</span>
              <span className="coordinator-name">{event.coordinator.name}</span>
              <a
                href={`tel:${event.coordinator.phone}`}
                className="coordinator-phone-link"
                title={`Call ${event.coordinator.name}`}
              >
                <Phone size={12} />
                <span>{event.coordinator.phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Card Action Buttons */}
        <div className="event-actions">
          {/* Direct 1-tap call button */}
          <a
            href={`tel:${event.coordinator.phone}`}
            className="btn btn-phone"
            aria-label={`Call coordinator for ${event.title}`}
          >
            <Phone size={14} />
            <span>☎ Call Coordinator</span>
          </a>

          {/* Modal trigger button */}
          <button
            type="button"
            className="btn-details"
            onClick={() => onOpenDetails(event)}
            aria-label={`View full details and rules for ${event.title}`}
          >
            <Info size={14} />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </article>
  );
}
