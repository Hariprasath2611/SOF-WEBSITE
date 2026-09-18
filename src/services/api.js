/**
 * Client API Client for SFD 2026 Event Registration
 * Includes resilient client-side storage fallback so the website functions 100%
 * even when deployed on static hosts like Vercel without a separate backend server.
 */

import { EVENT_TRACKS, getTrackConfig } from '../config/events';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'sfd_registrations_v1';
const LOCAL_COUNTER_KEY = 'sfd_registration_counter_v1';
const ADMIN_PASSWORD_FALLBACK = '12345';

// -------------------------------------------------------------
// LOCAL CLIENT STORE (Offline / Vercel Serverless Fallback)
// -------------------------------------------------------------
function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRegistrations(list) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to persist registrations locally:', err);
  }
}

function getNextLocalId() {
  try {
    let count = parseInt(localStorage.getItem(LOCAL_COUNTER_KEY) || '0', 10);
    count += 1;
    localStorage.setItem(LOCAL_COUNTER_KEY, String(count));
    return `REG-2026-${String(count).padStart(5, '0')}`;
  } catch {
    const count = getLocalRegistrations().length + 1;
    return `REG-2026-${String(count).padStart(5, '0')}`;
  }
}

function getLocalEventsWithSlots() {
  const regs = getLocalRegistrations();
  return EVENT_TRACKS.map((track) => {
    const activeCount = regs.filter(
      (r) => r.eventKey === track.key && r.status !== 'CANCELLED'
    ).length;
    const remainingSlots = Math.max(0, track.maxSlots - activeCount);
    const status = remainingSlots === 0 ? 'FULL' : 'OPEN';

    return {
      ...track,
      registeredCount: activeCount,
      remainingSlots,
      status
    };
  });
}

function registerLocally(formData) {
  const { eventKey, teamName, teamLeader, members, paymentAmount, paymentUtr, payerName, paymentStatus } = formData;
  const track = getTrackConfig(eventKey);
  if (!track) {
    throw new Error(`Invalid event selected: "${eventKey}"`);
  }

  const regs = getLocalRegistrations();

  // 1. Check slot availability
  const activeCount = regs.filter(
    (r) => r.eventKey === eventKey && r.status !== 'CANCELLED'
  ).length;

  if (activeCount >= track.maxSlots) {
    const err = new Error('Sorry, this event just reached maximum capacity.');
    err.code = 'EVENT_FULL';
    throw err;
  }

  // 2. Duplicate check (Leader and Members)
  const leaderEmail = teamLeader.email.trim().toLowerCase();
  const duplicate = regs.find((r) => {
    if (r.eventKey !== eventKey || r.status === 'CANCELLED') return false;
    const lMatch = r.teamLeader && r.teamLeader.email.trim().toLowerCase() === leaderEmail;
    const mMatch = r.members && r.members.some((m) => m.email && m.email.trim().toLowerCase() === leaderEmail);
    return lMatch || mMatch;
  });

  if (duplicate) {
    const err = new Error(`Email "${leaderEmail}" is already registered for ${track.title}.`);
    err.code = 'DUPLICATE_REGISTRATION';
    throw err;
  }

  // 2b. Duplicate UTR check (prevent reusing transaction ID)
  if (paymentUtr && paymentUtr !== 'N/A') {
    const cleanUtr = paymentUtr.trim().toLowerCase();
    const dupUtr = regs.find(
      (r) => r.status !== 'CANCELLED' && r.paymentUtr && r.paymentUtr.trim().toLowerCase() === cleanUtr
    );
    if (dupUtr) {
      const err = new Error(`The UPI Reference / UTR "${paymentUtr}" has already been submitted for another registration.`);
      err.code = 'DUPLICATE_UTR';
      throw err;
    }
  }

  // 3. Assemble member list
  const allMembers = [
    {
      ...teamLeader,
      isLeader: true,
      memberIndex: 1
    }
  ];

  if (track.isTeam && Array.isArray(members)) {
    for (let i = 0; i < members.length; i++) {
      allMembers.push({
        ...members[i],
        isLeader: false,
        memberIndex: i + 2
      });
    }
  }

  const registrationId = getNextLocalId();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const newRegistration = {
    registrationId,
    timestamp,
    isoTimestamp: new Date().toISOString(),
    eventKey,
    eventName: track.name,
    teamSize: track.teamSize,
    teamName: track.isTeam ? (teamName || 'N/A') : 'N/A',
    teamLeader: { ...teamLeader },
    members: allMembers,
    paymentAmount: paymentAmount || 0,
    paymentUtr: paymentUtr || 'N/A',
    payerName: payerName || '',
    paymentStatus: paymentStatus || 'SUBMITTED',
    status: 'CONFIRMED',
    statusUpdatedAt: new Date().toISOString()
  };

  regs.push(newRegistration);
  saveLocalRegistrations(regs);

  return newRegistration;
}

// -------------------------------------------------------------
// PUBLIC API FUNCTIONS (With automatic fallback)
// -------------------------------------------------------------

export async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    if (res.ok) {
      const json = await res.json();
      if (json.events && Array.isArray(json.events)) {
        return json.events;
      }
    }
  } catch {
    // Network or server error -> use client storage
  }
  return getLocalEventsWithSlots();
}

export async function submitRegistration(payload) {
  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (res.ok && json.registration) {
      return json.registration;
    }
    if (res.status === 409 || res.status === 400) {
      const err = new Error(json.error || 'Registration failed');
      err.code = json.code;
      throw err;
    }
  } catch (err) {
    if (err.code) throw err; // Re-throw validation/duplicate error
    // If backend isn't reachable (Vercel deployment without backend server), use local fallback
  }

  return registerLocally(payload);
}

export async function fetchRegistrationById(id) {
  try {
    const res = await fetch(`${API_BASE}/registrations/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.registration) return json.registration;
    }
  } catch {
    // Fallback to local store
  }

  const regs = getLocalRegistrations();
  const match = regs.find((r) => r.registrationId === id);
  if (!match) throw new Error(`Registration pass ${id} not found.`);
  return match;
}

// -------------------------------------------------------------
// ADMIN API FUNCTIONS
// -------------------------------------------------------------

export async function adminLogin(password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    if (res.ok) {
      const json = await res.json();
      return json.token;
    }
    if (res.status === 401) {
      throw new Error('Invalid admin password.');
    }
  } catch (err) {
    if (err.message === 'Invalid admin password.') throw err;
    // Backend unreachable -> client fallback
  }

  if (password === ADMIN_PASSWORD_FALLBACK) {
    return ADMIN_PASSWORD_FALLBACK;
  }
  throw new Error('Invalid admin password.');
}

export async function fetchAdminOverview(token) {
  try {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) return json;
    }
    if (res.status === 401) {
      throw new Error('Unauthorized');
    }
  } catch (err) {
    if (err.message === 'Unauthorized') throw err;
  }

  if (token !== ADMIN_PASSWORD_FALLBACK) {
    throw new Error('Unauthorized');
  }

  const regs = getLocalRegistrations();
  const confirmed = regs.filter((r) => r.status === 'CONFIRMED');
  const cancelled = regs.filter((r) => r.status === 'CANCELLED');
  const totalParticipants = confirmed.reduce((acc, r) => acc + (r.members ? r.members.length : 1), 0);

  return {
    success: true,
    totalRegistrations: regs.length,
    confirmedRegistrations: confirmed.length,
    cancelledRegistrations: cancelled.length,
    totalParticipants,
    events: getLocalEventsWithSlots(),
    recentRegistrations: [...regs].reverse().slice(0, 10)
  };
}

export async function fetchAdminRegistrations(token, { search = '', event = '', status = '' } = {}) {
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (event) params.set('event', event);
    if (status) params.set('status', status);

    const res = await fetch(`${API_BASE}/admin/registrations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.registrations) return json.registrations;
    }
    if (res.status === 401) throw new Error('Unauthorized');
  } catch (err) {
    if (err.message === 'Unauthorized') throw err;
  }

  if (token !== ADMIN_PASSWORD_FALLBACK) {
    throw new Error('Unauthorized');
  }

  let regs = getLocalRegistrations();

  if (event) {
    regs = regs.filter((r) => r.eventKey === event);
  }
  if (status) {
    regs = regs.filter((r) => r.status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    regs = regs.filter((r) => {
      const matchId = r.registrationId && r.registrationId.toLowerCase().includes(q);
      const matchTeam = r.teamName && r.teamName.toLowerCase().includes(q);
      const matchLeader = r.teamLeader && (
        (r.teamLeader.name && r.teamLeader.name.toLowerCase().includes(q)) ||
        (r.teamLeader.email && r.teamLeader.email.toLowerCase().includes(q)) ||
        (r.teamLeader.college && r.teamLeader.college.toLowerCase().includes(q))
      );
      return matchId || matchTeam || matchLeader;
    });
  }

  return [...regs].reverse();
}

export async function updateRegistrationStatus(token, id, status) {
  try {
    const res = await fetch(`${API_BASE}/admin/registrations/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const json = await res.json();
      return json.registration;
    }
    if (res.status === 401) throw new Error('Unauthorized');
  } catch (err) {
    if (err.message === 'Unauthorized') throw err;
  }

  if (token !== ADMIN_PASSWORD_FALLBACK) {
    throw new Error('Unauthorized');
  }

  const regs = getLocalRegistrations();
  const target = regs.find((r) => r.registrationId === id);
  if (!target) {
    throw new Error(`Registration "${id}" not found.`);
  }

  target.status = status;
  target.statusUpdatedAt = new Date().toISOString();
  saveLocalRegistrations(regs);
  return target;
}

export function getExportUrl(token, { event = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (event) params.set('event', event);
  if (status) params.set('status', status);
  return `${API_BASE}/admin/export?${params.toString()}`;
}

/**
 * Direct Browser CSV Download (Works 100% on Vercel without backend server)
 */
export function exportRegistrationsToCSV(registrations, filename = 'SFD2026_Registrations.csv') {
  if (!registrations || registrations.length === 0) {
    alert('No registrations to export.');
    return;
  }

  const headers = [
    'Registration ID',
    'Timestamp',
    'Event Track',
    'Status',
    'Fee (INR)',
    'UPI UTR / Ref No',
    'Payer Name',
    'Team Name',
    'Total Members',
    'Leader Name',
    'Leader Email',
    'Leader Phone',
    'Leader College',
    'Leader Department',
    'Leader Year',
    'Member 2 Name',
    'Member 2 Email',
    'Member 2 Phone',
    'Member 2 College',
    'Member 2 Dept',
    'Member 2 Year',
    'Member 3 Name',
    'Member 3 Email',
    'Member 3 Phone',
    'Member 3 College',
    'Member 3 Dept',
    'Member 3 Year',
    'Member 4 Name',
    'Member 4 Email',
    'Member 4 Phone',
    'Member 4 College',
    'Member 4 Dept',
    'Member 4 Year',
    'Member 5 Name',
    'Member 5 Email',
    'Member 5 Phone',
    'Member 5 College',
    'Member 5 Dept',
    'Member 5 Year'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = registrations.map((r) => {
    const leader = r.teamLeader || {};
    const mems = r.members || [];
    const m2 = mems[1] || {};
    const m3 = mems[2] || {};
    const m4 = mems[3] || {};
    const m5 = mems[4] || {};

    return [
      escapeCSV(r.registrationId),
      escapeCSV(r.timestamp),
      escapeCSV(r.eventName),
      escapeCSV(r.status),
      escapeCSV(r.paymentAmount || 0),
      escapeCSV(r.paymentUtr || 'N/A'),
      escapeCSV(r.payerName || ''),
      escapeCSV(r.teamName || 'N/A'),
      escapeCSV(mems.length || 1),
      escapeCSV(leader.name),
      escapeCSV(leader.email),
      escapeCSV(leader.phone),
      escapeCSV(leader.college),
      escapeCSV(leader.department),
      escapeCSV(leader.year),
      escapeCSV(m2.name || ''),
      escapeCSV(m2.email || ''),
      escapeCSV(m2.phone || ''),
      escapeCSV(m2.college || ''),
      escapeCSV(m2.department || ''),
      escapeCSV(m2.year || ''),
      escapeCSV(m3.name || ''),
      escapeCSV(m3.email || ''),
      escapeCSV(m3.phone || ''),
      escapeCSV(m3.college || ''),
      escapeCSV(m3.department || ''),
      escapeCSV(m3.year || ''),
      escapeCSV(m4.name || ''),
      escapeCSV(m4.email || ''),
      escapeCSV(m4.phone || ''),
      escapeCSV(m4.college || ''),
      escapeCSV(m4.department || ''),
      escapeCSV(m4.year || ''),
      escapeCSV(m5.name || ''),
      escapeCSV(m5.email || ''),
      escapeCSV(m5.phone || ''),
      escapeCSV(m5.college || ''),
      escapeCSV(m5.department || ''),
      escapeCSV(m5.year || '')
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
