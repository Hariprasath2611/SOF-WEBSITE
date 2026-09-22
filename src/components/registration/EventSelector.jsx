import React from 'react';
import { EVENT_TRACKS } from '../../config/events';
import { Layers, Terminal, Palette, MessageSquareCode, Cpu, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

const ICON_MAP = {
  Layers,
  Terminal,
  Palette,
  MessageSquareCode,
  Cpu
};

export default function EventSelector({ eventsStats, selectedEventKey, onSelectEvent, onProceed }) {
  // Merge static event track configuration with live slot data from server
  const enrichedTracks = EVENT_TRACKS.map((track) => {
    const live = (eventsStats || []).find((e) => e.key === track.key);
    const maxSlots = live ? live.maxSlots : track.maxSlots;
    const registeredCount = live ? live.registeredCount : 0;
    const remainingSlots = live ? live.remainingSlots : maxSlots;
    const quotasStats = live ? live.quotasStats : null;
    const isFull = remainingSlots <= 0;

    return {
      ...track,
      maxSlots,
      registeredCount,
      remainingSlots,
      quotasStats,
      isFull
    };
  });

  const selectedTrack = enrichedTracks.find((t) => t.key === selectedEventKey);

  return (
    <div className="event-selector-step">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Select Your Event Track
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
          Choose the track you wish to compete or participate in. Slot availability is updated in real time.
        </p>
      </div>

      <div className="event-selection-grid">
        {enrichedTracks.map((track) => {
          const Icon = ICON_MAP[track.icon] || Terminal;
          const isSelected = selectedEventKey === track.key;

          return (
            <div
              key={track.key}
              className={`event-select-card ${isSelected ? 'selected' : ''} ${track.isFull ? 'disabled' : ''}`}
              onClick={() => {
                if (!track.isFull) {
                  onSelectEvent(track.key);
                }
              }}
              role="button"
              tabIndex={track.isFull ? -1 : 0}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !track.isFull) {
                  onSelectEvent(track.key);
                }
              }}
            >
              <div className="card-top-row">
                <span className="card-track-number">TRACK {track.trackNumber}</span>
                <span className="card-team-badge">{track.badge}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: `${track.accentColor}18`,
                    border: `1px solid ${track.accentColor}44`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: track.accentColor
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="event-card-title">{track.title}</h4>
                  <div className="event-card-tagline">{track.tagline}</div>
                </div>
              </div>

              <p className="event-card-desc">{track.summary}</p>

              {/* Event Availability Status */}
              <div className="slot-badge-container">
                <span style={{ color: '#94a3b8' }}>
                  Registration Status
                </span>

                {track.isFull ? (
                  <span className="slot-count-badge full">
                    <AlertCircle size={13} />
                    <span>FULL</span>
                  </span>
                ) : (
                  <span className="slot-count-badge open">
                    <CheckCircle2 size={13} />
                    <span>OPEN (Unlimited Slots)</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue CTA */}
      <div className="reg-actions-row" style={{ justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn-wizard-next"
          disabled={!selectedEventKey || (selectedTrack && selectedTrack.isFull)}
          onClick={onProceed}
        >
          <span>Continue to Details</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
