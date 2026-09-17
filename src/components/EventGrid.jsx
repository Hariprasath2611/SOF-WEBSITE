import React, { useState } from 'react';
import { events } from '../data/events';
import EventCard from './EventCard';
import EventModal from './EventModal';
import { Terminal, Layers, ArrowUpRight } from 'lucide-react';

export default function EventGrid() {
  const [activeEvent, setActiveEvent] = useState(null);

  return (
    <section id="events" className="section events-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-tag">
            <Terminal size={14} />
            <span>Interactive Events Explorer</span>
          </div>
          <h2 className="section-title">5 Major Open-Source Challenges & Tracks</h2>
          <p className="section-subtitle">
            From rapid coding hackathons and live project demo stalls to creative visual advocacy and technical debates — explore all five event tracks with dedicated coordinators.
          </p>
        </div>

        {/* 5 Events Grid */}
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpenDetails={(ev) => setActiveEvent(ev)}
            />
          ))}
        </div>

        {/* Modal Dialog */}
        {activeEvent && (
          <EventModal
            event={activeEvent}
            onClose={() => setActiveEvent(null)}
          />
        )}
      </div>
    </section>
  );
}
