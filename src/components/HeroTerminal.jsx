import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle2, Award, Users, Phone, ArrowUpRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { events } from '../data/events';

export default function HeroTerminal() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'terminal'
  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);

  // Terminal state
  const [history, setHistory] = useState([
    { type: 'input', text: 'sfd --status' },
    { type: 'success', text: 'Software Freedom Day 2026 · Jaya Engineering College' },
    { type: 'info', text: 'Tracks: 5 Competitions | Status: Registrations Active' },
    { type: 'info', text: 'Type "help" or click any command chip below.' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalBodyRef = useRef(null);

  const activeEvent = events[selectedTrackIdx] || events[0];

  useEffect(() => {
    if (activeTab === 'terminal' && terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history, activeTab]);

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const newEntry = [{ type: 'input', text: trimmed }];

    if (lower === 'help') {
      newEntry.push({
        type: 'info',
        text: 'Available commands: events, coordinators, venue, register, clear, date'
      });
    } else if (lower === 'events' || lower === 'ls') {
      newEntry.push({
        type: 'info',
        text: '01. Demo Stall | 02. Mini Hackathon | 03. Poster Design | 04. Workshop | 05. Debate'
      });
    } else if (lower === 'coordinators') {
      newEntry.push({
        type: 'info',
        text: 'Overall Student Coordinators & Event Leads available in the Coordinators section below.'
      });
    } else if (lower === 'venue') {
      newEntry.push({
        type: 'info',
        text: 'Jaya Engineering College, Thirunindravur, Tamil Nadu. Main Auditorium & CSE Labs.'
      });
    } else if (lower === 'register') {
      newEntry.push({
        type: 'success',
        text: 'Navigating to Registration form...'
      });
      window.location.href = '/register';
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'date') {
      newEntry.push({
        type: 'info',
        text: 'Event Schedule: March 2026'
      });
    } else {
      newEntry.push({
        type: 'error',
        text: `Command not found: ${trimmed}. Type "help" for available commands.`
      });
    }

    setHistory((prev) => [...prev, ...newEntry]);
    setInputVal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(inputVal);
  };

  return (
    <div className="terminal-wrapper">
      <div className="terminal-container">
        {/* Modern Window Header with Tab Switcher */}
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
          </div>

          <div className="showcase-nav-tabs">
            <button
              type="button"
              className={`showcase-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <Award size={13} />
              <span>Event Showcase</span>
            </button>
            <button
              type="button"
              className={`showcase-tab ${activeTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              <Terminal size={13} />
              <span>Terminal CLI</span>
            </button>
          </div>

          <span className="terminal-status-badge">
            <span className="badge-live-dot" />
            LIVE
          </span>
        </div>

        {/* TAB 1: Human-Crafted Event Showcase */}
        {activeTab === 'overview' && (
          <div className="showcase-body">
            {/* Track Selector Pills */}
            <div className="showcase-pills-bar">
              {events.map((ev, idx) => (
                <button
                  key={ev.id}
                  type="button"
                  className={`track-pill ${selectedTrackIdx === idx ? 'active' : ''}`}
                  onClick={() => setSelectedTrackIdx(idx)}
                >
                  <span className="pill-num">{ev.number}</span>
                  <span className="pill-name">{ev.title}</span>
                </button>
              ))}
            </div>

            {/* Active Track Highlight Details */}
            <div className="showcase-active-track">
              <div className="showcase-track-header">
                <div>
                  <div className="showcase-track-meta">
                    <span className="track-tag">{activeEvent.code}</span>
                    <span className="track-team-pill">
                      <Users size={12} />
                      {activeEvent.teamSize}
                    </span>
                  </div>
                  <h3 className="showcase-track-title">{activeEvent.title}</h3>
                  <p className="showcase-track-tagline">{activeEvent.tagline}</p>
                </div>
              </div>

              <p className="showcase-track-summary">{activeEvent.summary}</p>

              {/* Dedicated Lead & Direct Action */}
              <div className="showcase-footer-row">
                <div className="showcase-lead-info">
                  <div className="showcase-lead-avatar">
                    {activeEvent.coordinator?.photo ? (
                      <img src={activeEvent.coordinator.photo} alt={activeEvent.coordinator.name} />
                    ) : (
                      activeEvent.coordinator?.name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div className="showcase-lead-text">
                    <span className="lead-role-lbl">Event Coordinator</span>
                    <span className="lead-name">{activeEvent.coordinator?.name}</span>
                  </div>
                  {activeEvent.coordinator?.phone && (
                    <a
                      href={`tel:${activeEvent.coordinator.phone}`}
                      className="showcase-call-chip"
                      title={`Call ${activeEvent.coordinator.name}`}
                    >
                      <Phone size={11} />
                      <span>{activeEvent.coordinator.phone}</span>
                    </a>
                  )}
                </div>

                <a href="#events" className="showcase-details-btn">
                  <span>View Full Details</span>
                  <ArrowUpRight size={14} />
                </a>
              </div>
            </div>

            {/* Bottom Key Value Bar */}
            <div className="showcase-value-strip">
              <div className="value-item">
                <Calendar size={13} className="value-icon" />
                <span>March 2026</span>
              </div>
              <div className="value-item">
                <MapPin size={13} className="value-icon" />
                <span>Jaya Engg College</span>
              </div>
              <div className="value-item">
                <Award size={13} className="value-icon" />
                <span>Merit Certificates & Prizes</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Clean Terminal CLI */}
        {activeTab === 'terminal' && (
          <div className="terminal-cli-wrap">
            <div className="terminal-body" ref={terminalBodyRef} aria-live="polite">
              {history.map((item, index) => {
                if (!item) return null;
                if (item.type === 'input') {
                  return (
                    <div key={index} className="term-line">
                      <span className="term-prompt">sfd@jaya:~$</span>
                      <span className="term-cmd">{item.text}</span>
                    </div>
                  );
                }
                if (item.type === 'info') {
                  return (
                    <div key={index} className="term-line term-info">
                      {item.text}
                    </div>
                  );
                }
                if (item.type === 'success') {
                  return (
                    <div key={index} className="term-line term-success">
                      <CheckCircle2 size={13} />
                      <span>{item.text}</span>
                    </div>
                  );
                }
                if (item.type === 'error') {
                  return (
                    <div key={index} className="term-line term-error">
                      {item.text}
                    </div>
                  );
                }
                return null;
              })}

              <form onSubmit={handleSubmit} className="terminal-input-row">
                <span className="term-prompt">sfd@jaya:~$</span>
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="type 'help' or command..."
                  className="terminal-input"
                  autoFocus
                />
              </form>
            </div>

            <div className="terminal-chips-bar">
              <span className="terminal-chips-label">Commands:</span>
              <button type="button" className="cmd-chip" onClick={() => handleCommand('events')}>
                events
              </button>
              <button type="button" className="cmd-chip" onClick={() => handleCommand('coordinators')}>
                coordinators
              </button>
              <button type="button" className="cmd-chip" onClick={() => handleCommand('venue')}>
                venue
              </button>
              <button type="button" className="cmd-chip" onClick={() => handleCommand('clear')}>
                clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
