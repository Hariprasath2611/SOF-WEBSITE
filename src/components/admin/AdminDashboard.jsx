import React, { useState, useEffect } from 'react';
import {
  adminLogin,
  fetchAdminOverview,
  fetchAdminRegistrations,
  updateRegistrationStatus,
  getExportUrl,
  exportRegistrationsToExcel,
  getApiBase,
  setCustomBackendUrl,
  getDemoStallCategory
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
  FileSpreadsheet,
  Server,
  Globe
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
  const [adminTab, setAdminTab] = useState('registrations'); // 'registrations' | 'slots'

  // Backend URL Configuration
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverUrlInput, setServerUrlInput] = useState(getApiBase());

  const handleSaveServerUrl = (e) => {
    e.preventDefault();
    setCustomBackendUrl(serverUrlInput);
    setShowServerModal(false);
    setActionMessage(`Backend API set to: ${getApiBase()}`);
    loadData();
  };

  const handleResetServerUrl = () => {
    setCustomBackendUrl('');
    setServerUrlInput('/api');
    setShowServerModal(false);
    setActionMessage('Backend API reset to default (/api)');
    loadData();
  };

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
              onClick={() => {
                setServerUrlInput(getApiBase());
                setShowServerModal(true);
              }}
              className="btn-wizard-back"
              style={{
                color: getApiBase().startsWith('http') ? '#38bdf8' : '#fbbf24',
                borderColor: getApiBase().startsWith('http') ? 'rgba(56, 189, 248, 0.35)' : 'rgba(251, 191, 36, 0.35)',
                cursor: 'pointer'
              }}
              title="Configure Live Cloud Backend URL (e.g. Render)"
            >
              <Server size={14} />
              <span>{getApiBase().startsWith('http') ? 'Live Cloud API' : 'Server Settings'}</span>
            </button>

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

        {/* Server Configuration Modal */}
        {showServerModal && (
          <div className="admin-login-overlay" style={{ zIndex: 1100 }}>
            <div className="admin-login-card" style={{ maxWidth: '520px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Server size={22} color="#38bdf8" />
                <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0 }}>Backend Server Settings</h3>
              </div>
              <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '18px' }}>
                Connect this Admin Dashboard and registration forms to your live cloud server (e.g. Render).
              </p>

              <form onSubmit={handleSaveServerUrl}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    Backend API URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://sof-backend.onrender.com/api"
                    value={serverUrlInput}
                    onChange={(e) => setServerUrlInput(e.target.value)}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}
                  />
                  <small style={{ display: 'block', marginTop: '6px', color: '#64748b', fontSize: '0.74rem' }}>
                    Example: https://sof-backend.onrender.com/api (or leave as /api for local dev)
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleResetServerUrl}
                    className="btn-wizard-back"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Reset to Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowServerModal(false)}
                    className="btn-wizard-back"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-wizard-next"
                    style={{ fontSize: '0.8rem' }}
                  >
                    Save & Reconnect
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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

            {/* Dashboard Tab Switcher & Quick Export */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-wizard-back"
                  onClick={() => setAdminTab('registrations')}
                  style={{
                    background: adminTab === 'registrations' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    color: adminTab === 'registrations' ? '#34d399' : '#94a3b8',
                    borderColor: adminTab === 'registrations' ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Users size={15} />
                  <span>Registrations List ({registrations.length})</span>
                </button>

                <button
                  type="button"
                  className="btn-wizard-back"
                  onClick={() => setAdminTab('slots')}
                  style={{
                    background: adminTab === 'slots' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    color: adminTab === 'slots' ? '#38bdf8' : '#94a3b8',
                    borderColor: adminTab === 'slots' ? '#38bdf8' : 'rgba(255, 255, 255, 0.15)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={15} />
                  <span>Slot Availability Matrix</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleExportExcel}
                className="btn-wizard-next"
                style={{ fontSize: '0.84rem', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                title="Download full registration spreadsheet in native Excel (.xlsx)"
              >
                <FileSpreadsheet size={16} />
                <span>Export to Excel (.xlsx)</span>
              </button>
            </div>

            {/* TAB 1: REGISTRATIONS LIST */}
            {adminTab === 'registrations' && (
              <>
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
                            const leader = r.teamLeader || {};

                            return (
                              <tr key={r.registrationId}>
                                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#38bdf8' }}>
                                  {r.registrationId}
                                </td>
                                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#94a3b8' }}>
                                  {r.timestamp}
                                </td>
                                <td style={{ fontWeight: 600 }}>
                                  <div>{r.eventName}</div>
                                  {r.eventKey === 'demo-stall' && (
                                    <div style={{ marginTop: '4px' }}>
                                      {(() => {
                                        const cat = r.demoStallCategory || getDemoStallCategory(leader.college, leader.department);
                                        if (cat === 'jec_cse') {
                                          return <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: '1px solid rgba(16, 185, 129, 0.3)' }}>JEC CSE (Quota: 30)</span>;
                                        } else if (cat === 'jec_other') {
                                          return <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#7dd3fc', border: '1px solid rgba(56, 189, 248, 0.3)' }}>JEC Other (Quota: 10)</span>;
                                        } else {
                                          return <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>External (Quota: 10)</span>;
                                        }
                                      })()}
                                    </div>
                                  )}
                                </td>
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
                                <td style={{ color: r.teamName && r.teamName !== 'N/A' ? '#38bdf8' : '#cbd5e1' }}>
                                  {r.teamName && r.teamName !== 'N/A' ? r.teamName : (leader.name || 'N/A')}
                                </td>
                                <td>
                                  <div><strong>{leader.name || 'N/A'}</strong></div>
                                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{leader.email || ''}</div>
                                </td>
                                <td>
                                  <div>{leader.college || 'N/A'}</div>
                                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                    {leader.department || ''} {leader.year ? `(${leader.year})` : ''}
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
              </>
            )}

            {/* TAB 2: SLOT AVAILABILITY MATRIX */}
            {adminTab === 'slots' && (
              <div style={{ marginTop: '10px' }}>
                <h3 style={{ fontSize: '1rem', color: '#cbd5e1', marginBottom: '14px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                  Live Event Slot Matrix
                </h3>

                <div className="admin-events-slots-grid">
                  {(overview.events || []).map((ev) => {
                    const percent = Math.min(100, Math.round((ev.registeredCount / (ev.maxSlots || 1)) * 100));
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

                        {ev.key === 'demo-stall' && (
                          <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              Quota Allocation Breakdown (50 Total)
                            </div>

                            {/* 1. Jaya CSE (30) */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                                <span style={{ color: '#6ee7b7' }}>Jaya CSE (Max 30)</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                                  {ev.quotasStats ? `${ev.quotasStats.jecCse.registered} / 30 (${ev.quotasStats.jecCse.remaining} left)` : '30 slots'}
                                </span>
                              </div>
                              <div className="event-slot-bar-bg" style={{ height: '4px' }}>
                                <div
                                  className="event-slot-bar-fill"
                                  style={{
                                    width: `${ev.quotasStats ? Math.min(100, Math.round((ev.quotasStats.jecCse.registered / 30) * 100)) : 0}%`,
                                    background: '#10b981'
                                  }}
                                />
                              </div>
                            </div>

                            {/* 2. Jaya Other Depts (10) */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                                <span style={{ color: '#7dd3fc' }}>Jaya Other Depts (Max 10)</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                                  {ev.quotasStats ? `${ev.quotasStats.jecOther.registered} / 10 (${ev.quotasStats.jecOther.remaining} left)` : '10 slots'}
                                </span>
                              </div>
                              <div className="event-slot-bar-bg" style={{ height: '4px' }}>
                                <div
                                  className="event-slot-bar-fill"
                                  style={{
                                    width: `${ev.quotasStats ? Math.min(100, Math.round((ev.quotasStats.jecOther.registered / 10) * 100)) : 0}%`,
                                    background: '#38bdf8'
                                  }}
                                />
                              </div>
                            </div>

                            {/* 3. External Colleges (10) */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                                <span style={{ color: '#c084fc' }}>External Colleges (Max 10)</span>
                                <span style={{ fontFamily: 'var(--font-mono)', color: '#cbd5e1' }}>
                                  {ev.quotasStats ? `${ev.quotasStats.external.registered} / 10 (${ev.quotasStats.external.remaining} left)` : '10 slots'}
                                </span>
                              </div>
                              <div className="event-slot-bar-bg" style={{ height: '4px' }}>
                                <div
                                  className="event-slot-bar-fill"
                                  style={{
                                    width: `${ev.quotasStats ? Math.min(100, Math.round((ev.quotasStats.external.registered / 10) * 100)) : 0}%`,
                                    background: '#a855f7'
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
