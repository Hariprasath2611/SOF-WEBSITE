import React, { useState, useEffect } from 'react';
import {
  adminLogin,
  fetchAdminOverview,
  fetchAdminRegistrations,
  updateRegistrationStatus,
  getExportUrl,
  exportRegistrationsToExcel
} from '../../services/api';
import {
  Shield,
  Lock,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Users,
  Layers,
  Terminal,
  FileSpreadsheet
} from 'lucide-react';
import { EVENT_TRACKS } from '../../config/events';

export default function AdminDashboard({ onBackToHome }) {
  const [token, setToken] = useState(sessionStorage.getItem('sfd_admin_token') || '');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard Data
  const [overview, setOverview] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadData = async (activeToken) => {
    const t = activeToken || token;
    if (!t) return;

    try {
      setLoading(true);
      const [ovData, regData] = await Promise.all([
        fetchAdminOverview(t),
        fetchAdminRegistrations(t, { search: searchTerm, event: filterEvent, status: filterStatus })
      ]);
      setOverview(ovData);
      setRegistrations(regData);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('unauthorized')) {
        setToken('');
        sessionStorage.removeItem('sfd_admin_token');
        setAuthError('Session expired or unauthorized. Please re-enter password.');
      } else {
        setActionMessage(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadData(token);
    }
  }, [token, filterEvent, filterStatus]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setLoggingIn(true);

    try {
      const authToken = await adminLogin(passwordInput);
      setToken(authToken);
      sessionStorage.setItem('sfd_admin_token', authToken);
      loadData(authToken);
    } catch (err) {
      setAuthError(err.message || 'Incorrect admin password.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    sessionStorage.removeItem('sfd_admin_token');
    setOverview(null);
    setRegistrations([]);
  };

  const handleStatusToggle = async (regId, currentStatus) => {
    const newStatus = currentStatus === 'CONFIRMED' ? 'CANCELLED' : 'CONFIRMED';
    const confirmMsg =
      newStatus === 'CANCELLED'
        ? `Are you sure you want to cancel registration ${regId}? This will automatically restore 1 available slot for this event.`
        : `Re-confirm registration ${regId}? This will consume 1 slot for this event.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await updateRegistrationStatus(token, regId, newStatus);
      setActionMessage(`Updated ${regId} to ${newStatus}. Slots recalculated.`);
      loadData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleExportExcel = () => {
    const filename = `SFD_2026_Registrations_${filterEvent || 'all'}_${filterStatus || 'all'}.xlsx`;
    exportRegistrationsToExcel(registrations, filename);
  };

  // If not authenticated, show password prompt
  if (!token) {
    return (
      <div className="admin-page-container">
        <div className="admin-login-overlay">
          <div className="admin-login-card">
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                marginBottom: '16px'
              }}
            >
              <Lock size={24} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
              Admin Console Access
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '24px' }}>
              Enter administrator password to manage event slots, review registrations, and export data.
            </p>

            {authError && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  marginBottom: '16px'
                }}
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter Admin Password (e.g. sfd2026admin)"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="btn-wizard-next"
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
                disabled={loggingIn || !passwordInput}
              >
                <span>{loggingIn ? 'Authenticating...' : 'Unlock Admin Console'}</span>
              </button>
            </form>

            {onBackToHome && (
              <button
                type="button"
                className="btn-wizard-back"
                onClick={onBackToHome}
                style={{ marginTop: '16px', width: '100%', justifyContent: 'center' }}
              >
                <ArrowLeft size={14} />
                <span>Return to Home</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const exportUrl = getExportUrl(token, { event: filterEvent, status: filterStatus });

  return (
    <div className="admin-page-container">
      <div className="admin-wrapper">
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="admin-title-group">
            <h1>
              <Shield size={24} color="#10b981" />
              <span>SFD 2026 Registration Management</span>
            </h1>
            <p>Jaya Engineering College • Real-Time Slot Control & Google Sheets Gateway</p>
          </div>

          <div className="admin-top-actions">
            <button
              type="button"
              onClick={handleExportExcel}
              className="btn-wizard-back"
              style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', cursor: 'pointer' }}
              title="Export filtered registrations to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={15} />
              <span>Export Excel</span>
            </button>

            <button
              type="button"
              className="btn-wizard-back"
              onClick={() => loadData()}
              title="Refresh live data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button type="button" className="btn-wizard-back" onClick={handleLogout} style={{ color: '#f87171' }}>
              <span>Lock / Exit</span>
            </button>

            {onBackToHome && (
              <button type="button" className="btn-wizard-back" onClick={onBackToHome}>
                <ArrowLeft size={14} />
                <span>Home</span>
              </button>
            )}
          </div>
        </div>

        {actionMessage && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '12px 18px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '0.88rem'
            }}
          >
            {actionMessage}
          </div>
        )}

        {/* Overview KPI Cards */}
        {overview && (
          <>
            <div className="admin-metrics-grid">
              <div className="kpi-metric-card">
                <span className="kpi-title">Total Registrations</span>
                <span className="kpi-number">{overview.totalRegistrations}</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Units booked</span>
              </div>

              <div className="kpi-metric-card">
                <span className="kpi-title">Active Confirmed</span>
                <span className="kpi-number" style={{ color: '#10b981' }}>{overview.confirmedRegistrations}</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Consuming slots</span>
              </div>

              <div className="kpi-metric-card">
                <span className="kpi-title">Cancelled / Released</span>
                <span className="kpi-number" style={{ color: '#f87171' }}>{overview.cancelledRegistrations}</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Slots reopened</span>
              </div>

              <div className="kpi-metric-card">
                <span className="kpi-title">Total Headcount</span>
                <span className="kpi-number" style={{ color: '#38bdf8' }}>{overview.totalParticipants}</span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Total students attending</span>
              </div>
            </div>

            {/* Event Availability Breakdown Cards */}
            <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '14px', fontFamily: 'var(--font-mono)' }}>
              EVENT SLOTS STATUS (LIVE AVAILABILITY MATRIX)
            </h3>

            <div className="admin-events-slots-grid">
              {(overview.events || []).map((ev) => {
                const percent = Math.min(100, Math.round((ev.registeredCount / ev.maxSlots) * 100));
                const isFull = ev.status === 'FULL';

                return (
                  <div key={ev.key} className={`event-slot-card ${isFull ? 'full-border' : ''}`}>
                    <div className="event-slot-header">
                      <div>
                        <div className="event-slot-name">{ev.title}</div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                          Team Size: {ev.teamSize}
                        </span>
                      </div>
                      <span className={`status-badge ${isFull ? 'cancelled' : 'confirmed'}`}>
                        {ev.status}
                      </span>
                    </div>

                    <div className="event-slot-bar-bg">
                      <div
                        className={`event-slot-bar-fill ${isFull ? 'full' : ''}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: '#fff', fontWeight: 700 }}>
                        {ev.registeredCount} / {ev.maxSlots}
                      </span>
                      <span style={{ color: isFull ? '#f87171' : '#10b981' }}>
                        {ev.remainingSlots} Left
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Toolbar: Search and Filter */}
        <div className="admin-toolbar">
          <form onSubmit={handleSearchSubmit} className="admin-search-box">
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search by ID, Name, Email, Team, College..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div className="admin-filters-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} color="#94a3b8" />
              <select
                className="form-select"
                style={{ padding: '8px 12px', fontSize: '0.82rem', width: 'auto' }}
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
              >
                <option value="">All Events</option>
                {EVENT_TRACKS.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <select
              className="form-select"
              style={{ padding: '8px 12px', fontSize: '0.82rem', width: 'auto' }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="admin-table-panel">
          <div className="admin-table-scroll">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>Reg ID</th>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Fee & UTR</th>
                  <th>Team / Participant</th>
                  <th>Leader Name & Email</th>
                  <th>College & Dept</th>
                  <th>Members</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {registrations.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      {loading ? 'Loading registration data...' : 'No registrations found matching criteria.'}
                    </td>
                  </tr>
                ) : (
                  registrations.map((r) => {
                    const isConfirmed = r.status === 'CONFIRMED';

                    return (
                      <tr key={r.registrationId}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                          {r.registrationId}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#94a3b8' }}>
                          {r.timestamp}
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.eventName}</td>
                        <td>
                          <div style={{ color: '#10b981', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                            ₹{r.paymentAmount || 0}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }} title="UPI Transaction Reference">
                            UTR: {r.paymentUtr || 'N/A'}
                          </div>
                          {r.payerName && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              ({r.payerName})
                            </div>
                          )}
                        </td>
                        <td style={{ color: r.teamName !== 'N/A' ? '#38bdf8' : '#cbd5e1' }}>
                          {r.teamName !== 'N/A' ? r.teamName : r.teamLeader.name}
                        </td>
                        <td>
                          <div><strong>{r.teamLeader.name}</strong></div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{r.teamLeader.email}</div>
                        </td>
                        <td>
                          <div>{r.teamLeader.college}</div>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {r.teamLeader.department} ({r.teamLeader.year})
                          </div>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                          {r.members ? r.members.length : 1}
                        </td>
                        <td>
                          <span className={`status-badge ${isConfirmed ? 'confirmed' : 'cancelled'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-status-toggle"
                            onClick={() => handleStatusToggle(r.registrationId, r.status)}
                            title={isConfirmed ? 'Cancel registration (frees up 1 slot)' : 'Re-confirm registration'}
                          >
                            {isConfirmed ? 'Cancel Slot' : 'Re-confirm'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
