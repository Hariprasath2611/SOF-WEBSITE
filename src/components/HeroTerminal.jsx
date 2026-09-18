import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, CheckCircle2, CornerDownLeft } from 'lucide-react';

const INITIAL_LINES = [
  { type: 'input', text: './software-freedom-day' },
  { type: 'info', text: '> Initializing...' },
  { type: 'info', text: '> Loading Open Source Community...' },
  { type: 'info', text: '> Loading Events [5 Modules]...' },
  { type: 'info', text: '> Loading Developers & Engineers across all disciplines...' },
  { type: 'success', text: '> Freedom Mode: ENABLED [100% Free & Open Source]' },
  {
    type: 'banner',
    title: 'Software Freedom Day 2026',
    sub: 'Jaya Engineering College · Department of CSE',
    tags: ['5 Events', 'Open Source', 'Innovation', 'Collaboration', 'Digital Freedom']
  },
  { type: 'input', text: './join.sh' },
  { type: 'granted', text: 'ACCESS GRANTED · WELCOME TO SFD 2026' }
];

export default function HeroTerminal() {
  const [history, setHistory] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTypingInitial, setIsTypingInitial] = useState(true);
  const terminalBodyRef = useRef(null);

  // Auto-typing initial boot sequence
  useEffect(() => {
    let currentIdx = 0;
    const timer = setInterval(() => {
      if (currentIdx < INITIAL_LINES.length) {
        const nextLine = INITIAL_LINES[currentIdx];
        if (nextLine) {
          setHistory((prev) => [...prev, nextLine]);
        }
        currentIdx++;
      } else {
        setIsTypingInitial(false);
        clearInterval(timer);
      }
    }, 420);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to bottom of terminal when history changes
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const newEntry = [{ type: 'input', text: trimmed }];

    if (lower === 'help') {
      newEntry.push({
        type: 'info',
        text: 'Available commands: events, coordinators, about, venue, register, clear, date, whoami, sudo freedom'
      });
    } else if (lower === 'events' || lower === 'ls events') {
      newEntry.push({
        type: 'info',
        text: '5 Tracks: 01.Demo Stall | 02.Mini Hackathon | 03.Poster Design | 04.Workshop | 05.Debate'
      });
    } else if (lower === 'coordinators') {
      newEntry.push({
        type: 'info',
        text: '10 Overall Event Coordinators + 5 Dedicated Event Leads available with direct 1-tap call support.'
      });
    } else if (lower === 'about') {
      newEntry.push({
        type: 'info',
        text: 'Software Freedom Day 2026 celebrates Free & Open Source Software at Jaya Engineering College. Open to all engineering students!'
      });
    } else if (lower === 'venue' || lower === 'location') {
      newEntry.push({
        type: 'info',
        text: 'Jaya Engineering College, Thirunindravur Road, Tamil Nadu. Main Auditorium & CSE Innovation Labs.'
      });
    } else if (lower === 'register') {
      newEntry.push({
        type: 'success',
        text: 'Redirecting to events registration matrix... Scroll down or choose an event card!'
      });
    } else if (lower === 'clear') {
      setHistory([]);
      setInputVal('');
      return;
    } else if (lower === 'whoami') {
      newEntry.push({
        type: 'success',
        text: 'root@open-source-engineer:~$ You are the future of free technology.'
      });
    } else if (lower.includes('sudo freedom') || lower === 'sudo') {
      newEntry.push({
        type: 'success',
        text: 'FREEDOM GRANTED: Freedom to Build. Freedom to Learn. Freedom to Share. Freedom to Create.'
      });
    } else if (lower === 'date') {
      newEntry.push({
        type: 'info',
        text: `Local System Time: ${new Date().toLocaleString()}`
      });
    } else {
      newEntry.push({
        type: 'error',
        text: `bash: ${trimmed}: command not found. Type "help" for a list of commands.`
      });
    }

    setHistory((prev) => [...prev, ...newEntry]);
    setInputVal('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCommand(inputVal);
  };

  const executeChip = (cmd) => {
    handleCommand(cmd);
  };

  return (
    <div className="terminal-wrapper">
      <div className="terminal-glow-bg" aria-hidden="true" />
      <div className="terminal-container">
        {/* Terminal Header */}
        <div className="terminal-header">
          <div className="terminal-controls">
            <span className="terminal-dot red" title="Close Window" />
            <span className="terminal-dot yellow" title="Minimize Window" />
            <span
              className="terminal-dot green"
              title="Clear Terminal"
              onClick={() => setHistory([])}
            />
          </div>
          <div className="terminal-tab-title">
            <Terminal size={14} color="#10b981" />
            <span>bash: ~/sfd-2026</span>
          </div>
          <span className="terminal-status-badge">LIVE CLI</span>
        </div>

        {/* Terminal Body */}
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
                  {item.text}
                </div>
              );
            }
            if (item.type === 'granted') {
              return (
                <div
                  key={index}
                  className="term-line"
                  style={{
                    color: '#10b981',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '4px 0'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>{item.text}</span>
                  <span className="term-cursor" />
                </div>
              );
            }
            if (item.type === 'banner') {
              return (
                <div key={index} className="term-box">
                  <div className="term-box-title">{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.sub}</div>
                  <div className="term-badge-list">
                    {item.tags.map((tag) => (
                      <span key={tag} className="term-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }
            if (item.type === 'error') {
              return (
                <div key={index} className="term-line" style={{ color: '#f87171' }}>
                  {item.text}
                </div>
              );
            }
            return null;
          })}

          {/* Interactive Prompt Line */}
          {!isTypingInitial && (
            <form onSubmit={handleSubmit} className="terminal-input-row">
              <span className="term-prompt">sfd@jaya:~$</span>
              <div className="terminal-input-form">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="type 'help' or command..."
                  className="terminal-input"
                  autoFocus
                  aria-label="Terminal command prompt"
                />
              </div>
            </form>
          )}
        </div>

        {/* Quick Command Chips */}
        <div className="terminal-chips-bar">
          <span className="terminal-chips-label">Quick cmds:</span>
          <button type="button" className="cmd-chip" onClick={() => executeChip('events')}>
            events
          </button>
          <button type="button" className="cmd-chip" onClick={() => executeChip('whoami')}>
            whoami
          </button>
          <button type="button" className="cmd-chip" onClick={() => executeChip('coordinators')}>
            coordinators
          </button>
          <button type="button" className="cmd-chip" onClick={() => executeChip('venue')}>
            venue
          </button>
          <button type="button" className="cmd-chip" onClick={() => executeChip('clear')}>
            clear
          </button>
        </div>
      </div>
    </div>
  );
}
