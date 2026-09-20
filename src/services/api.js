/**
 * Client API Client for SFD 2026 Event Registration
 * Includes resilient client-side storage fallback so the website functions 100%
 * even when deployed on static hosts like Vercel without a separate backend server.
 */

import { EVENT_TRACKS, getTrackConfig } from '../config/events';
import { calculateEventFee } from '../utils/feeCalculator';
import * as XLSX from 'xlsx';

const RENDER_BACKEND_URL = 'https://sof-website-vhai.onrender.com/api';
const DEFAULT_API_BASE = import.meta.env.VITE_API_URL || RENDER_BACKEND_URL;

export function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL || '';
  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sfd_backend_url') || '' : '';
  const base = storedUrl || envUrl || DEFAULT_API_BASE;
  return base.replace(/\/+$/, '');
}

export function setCustomBackendUrl(url) {
  if (typeof localStorage !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('sfd_backend_url');
    } else {
      localStorage.setItem('sfd_backend_url', url.trim());
    }
  }
}

const LOCAL_STORAGE_KEY = 'sfd_registrations_v1';
const LOCAL_COUNTER_KEY = 'sfd_registration_counter_v1';
const LOCAL_DELETED_KEY = 'sfd_deleted_ids_v1';
const ADMIN_PASSWORD_FALLBACK = '12345';

export function getDeletedIds() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL_DELETED_KEY) : null;
    const list = raw ? JSON.parse(raw) : [];
    if (!list.includes('REG-2026-00001')) list.push('REG-2026-00001');
    if (!list.includes('REG-2026-00002')) list.push('REG-2026-00002');
    return list;
  } catch {
    return ['REG-2026-00001', 'REG-2026-00002'];
  }
}

export function addDeletedId(id) {
  try {
    const list = getDeletedIds();
    if (!list.includes(id)) {
      list.push(id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(LOCAL_DELETED_KEY, JSON.stringify(list));
      }
    }
  } catch (err) {
    console.error('Failed to add deleted ID:', err);
  }
}

// -------------------------------------------------------------
// LOCAL CLIENT STORE (Offline / Vercel Serverless Fallback)
// -------------------------------------------------------------
function getLocalRegistrations() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    let list = JSON.parse(raw);
    if (Array.isArray(list)) {
      const filtered = list.filter(
        (r) => r.registrationId !== 'REG-2026-00001' && r.registrationId !== 'REG-2026-00002'
      );
      if (filtered.length !== list.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      }
      return filtered;
    }
    return [];
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

/**
 * Category detection for Demo Stall 3-tier quota allocation:
 * 1. jec_cse: Jaya Engineering College CSE (30 stalls)
 * 2. jec_other: Other departments of Jaya Engineering College (10 stalls)
 * 3. external: Any department from any other college (10 stalls)
 */
export function getDemoStallCategory(college = '', department = '') {
  const isJaya = /(jaya|\bjec\b)/i.test((college || '').trim());
  if (isJaya) {
    const dept = (department || '').trim();
    const isCse = /\b(cse|cs|computer\s*science)\b/i.test(dept);
    if (isCse) {
      return 'jec_cse';
    }
    return 'jec_other';
  }
  return 'external';
}

function getLocalEventsWithSlots() {
  const regs = getLocalRegistrations();
  return EVENT_TRACKS.map((track) => {
    const activeRegistrations = regs.filter(
      (r) => r.eventKey === track.key && r.status !== 'CANCELLED'
    );
    const activeCount = activeRegistrations.length;
    const remainingSlots = Math.max(0, track.maxSlots - activeCount);
    const status = remainingSlots === 0 ? 'FULL' : 'OPEN';

    let quotasStats = null;
    if (track.key === 'demo-stall') {
      const jecCseCount = activeRegistrations.filter(
        (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'jec_cse'
      ).length;
      const jecOtherCount = activeRegistrations.filter(
        (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'jec_other'
      ).length;
      const externalCount = activeRegistrations.filter(
        (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'external'
      ).length;

      quotasStats = {
        jecCse: {
          registered: jecCseCount,
          remaining: Math.max(0, track.maxSlots - activeCount)
        },
        jecOther: {
          registered: jecOtherCount,
          remaining: Math.max(0, track.maxSlots - activeCount)
        },
        external: {
          registered: externalCount,
          remaining: Math.max(0, track.maxSlots - activeCount)
        }
      };
    }

    return {
      ...track,
      registeredCount: activeCount,
      remainingSlots,
      quotasStats,
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
  const activeRegistrations = regs.filter(
    (r) => r.eventKey === eventKey && r.status !== 'CANCELLED'
  );
  const activeCount = activeRegistrations.length;

  if (activeCount >= track.maxSlots) {
    const err = new Error(`Sorry, this event just reached maximum capacity (${track.maxSlots}/${track.maxSlots} slots).`);
    err.code = 'EVENT_FULL';
    throw err;
  }

  // Category classification for Demo Stall (Open 60-team capacity, no sub-bucket rejection)
  let demoStallCategory = null;
  if (eventKey === 'demo-stall') {
    demoStallCategory = getDemoStallCategory(teamLeader.college, teamLeader.department);
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
      const err = new Error(`This UPI Transaction ID / UTR "${paymentUtr}" has already been submitted for registration ${dupUtr.registrationId} (${dupUtr.eventName}). Reusing transaction IDs is strictly prohibited.`);
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
      if (members[i] && members[i].name && members[i].name.trim().length > 0) {
        allMembers.push({
          ...members[i],
          isLeader: false,
          memberIndex: allMembers.length + 1
        });
      }
    }
  }

  const actualMembersCount = allMembers.length;
  const registrationId = getNextLocalId();
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const calculatedFee = calculateEventFee(eventKey, teamLeader.college, actualMembersCount).totalAmount;
  const finalPaidAmount = Number(paymentAmount) > 0 ? Number(paymentAmount) : calculatedFee;

  const newRegistration = {
    registrationId,
    timestamp,
    isoTimestamp: new Date().toISOString(),
    eventKey,
    eventName: track.name,
    teamSize: actualMembersCount,
    teamName: track.isTeam ? (teamName && teamName.trim() ? teamName.trim() : (actualMembersCount === 1 ? `${teamLeader.name.trim()} (Solo)` : 'Unnamed Team')) : 'N/A',
    teamLeader: { ...teamLeader },
    members: allMembers,
    paymentAmount: finalPaidAmount,
    paymentUtr: paymentUtr || 'N/A',
    payerName: payerName || '',
    paymentStatus: paymentStatus || 'SUBMITTED',
    demoStallCategory: demoStallCategory || (eventKey === 'demo-stall' ? getDemoStallCategory(teamLeader.college, teamLeader.department) : null),
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

function enrichEventData(ev) {
  if (!ev || !ev.key) return ev;
  const localTrack = getTrackConfig(ev.key);
  if (!localTrack) return ev;

  // Authoritative maxSlots from configuration (e.g. 60 for demo-stall)
  const maxSlots = ev.key === 'demo-stall' ? 60 : (localTrack.maxSlots || ev.maxSlots || 1);
  const registeredCount = typeof ev.registeredCount === 'number' ? ev.registeredCount : 0;
  const remainingSlots = Math.max(0, maxSlots - registeredCount);
  const status = remainingSlots === 0 ? 'FULL' : (ev.status === 'FULL' && remainingSlots > 0 ? 'OPEN' : (ev.status || 'OPEN'));
  const teamSize = ev.key === 'mini-hackathon' ? '1 - 4' : (localTrack.teamSize || ev.teamSize);

  return {
    ...localTrack,
    ...ev,
    maxSlots,
    registeredCount,
    remainingSlots,
    status,
    teamSize
  };
}

export async function fetchEvents() {
  try {
    const res = await fetch(`${getApiBase()}/events`);
    if (res.ok) {
      const json = await res.json();
      if (json.events && Array.isArray(json.events)) {
        return json.events.map(enrichEventData);
      }
    }
  } catch {
    // Network or server error -> use client storage
  }
  return getLocalEventsWithSlots().map(enrichEventData);
}

export async function submitRegistration(payload) {
  // Compute safe non-zero fee based on event, college, and member count
  const actualCount = ((payload.members && Array.isArray(payload.members)) ? payload.members.filter(m => m && m.name && m.name.trim().length > 0).length : 0) + 1;
  const expectedFee = calculateEventFee(payload.eventKey, payload.teamLeader?.college, actualCount).totalAmount;
  const safePaymentAmount = Number(payload.paymentAmount) > 0 ? Number(payload.paymentAmount) : expectedFee;
  const safeUtr = (payload.paymentUtr || '').trim();

  const preparedPayload = {
    ...payload,
    paymentAmount: safePaymentAmount,
    paymentUtr: safeUtr
  };

  try {
    const res = await fetch(`${getApiBase()}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preparedPayload)
    });
    const json = await res.json();
    if (res.ok && json.registration) {
      const reg = json.registration;
      const finalAmount = (Number(reg.paymentAmount) > 0)
        ? Number(reg.paymentAmount)
        : safePaymentAmount;
      const finalUtr = (reg.paymentUtr && reg.paymentUtr !== 'N/A' && reg.paymentUtr.trim().length > 0)
        ? reg.paymentUtr
        : safeUtr;
      const finalPayer = (reg.payerName && reg.payerName.trim().length > 0)
        ? reg.payerName
        : (preparedPayload.payerName || '');

      const mergedRegistration = {
        ...reg,
        paymentAmount: finalAmount,
        paymentUtr: finalUtr,
        payerName: finalPayer
      };

      // Also mirror into local client storage for offline pass retrieval
      const localRegs = getLocalRegistrations();
      const existingIdx = localRegs.findIndex((r) => r.registrationId === mergedRegistration.registrationId);
      if (existingIdx >= 0) {
        localRegs[existingIdx] = mergedRegistration;
      } else {
        localRegs.unshift(mergedRegistration);
      }
      saveLocalRegistrations(localRegs);

      return mergedRegistration;
    }
    if (res.status === 409 || res.status === 400) {
      const err = new Error(json.error || 'Registration failed');
      err.code = json.code;
      throw err;
    }
  } catch (err) {
    if (err.code) throw err; // Re-throw validation/duplicate error
    // If backend isn't reachable, use local fallback
  }

  return registerLocally(preparedPayload);
}

export async function fetchRegistrationById(id) {
  try {
    const res = await fetch(`${getApiBase()}/registrations/${encodeURIComponent(id)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.registration) {
        const reg = json.registration;
        const memCount = reg.members ? reg.members.length : (reg.teamSize || 1);
        const fee = calculateEventFee(reg.eventKey, reg.teamLeader?.college, memCount).totalAmount;
        return {
          ...reg,
          paymentAmount: Number(reg.paymentAmount) > 0 ? Number(reg.paymentAmount) : fee
        };
      }
    }
  } catch {
    // Fallback to local store
  }

  const regs = getLocalRegistrations();
  const match = regs.find((r) => r.registrationId === id);
  if (!match) throw new Error(`Registration pass ${id} not found.`);
  const matchCount = match.members ? match.members.length : (match.teamSize || 1);
  const fee = calculateEventFee(match.eventKey, match.teamLeader?.college, matchCount).totalAmount;
  return {
    ...match,
    paymentAmount: Number(match.paymentAmount) > 0 ? Number(match.paymentAmount) : fee
  };
}

// -------------------------------------------------------------
// ADMIN API FUNCTIONS
// -------------------------------------------------------------

export async function adminLogin(password) {
  try {
    const res = await fetch(`${getApiBase()}/admin/login`, {
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
    const res = await fetch(`${getApiBase()}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success) {
        if (json.events && Array.isArray(json.events)) {
          json.events = json.events.map(enrichEventData);
        }
        return json;
      }
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
    events: getLocalEventsWithSlots().map(enrichEventData),
    recentRegistrations: [...regs].reverse().slice(0, 10),
    isLocalFallback: true
  };
}

export async function fetchAdminRegistrations(token, { search = '', event = '', status = '' } = {}) {
  const deletedIds = getDeletedIds();
  try {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (event) params.set('event', event);
    if (status) params.set('status', status);

    const res = await fetch(`${getApiBase()}/admin/registrations?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const json = await res.json();
      if (json.registrations) {
        return json.registrations.filter((r) => !deletedIds.includes(r.registrationId));
      }
    }
    if (res.status === 401) throw new Error('Unauthorized');
  } catch (err) {
    if (err.message === 'Unauthorized') throw err;
  }

  let regs = getLocalRegistrations().filter((r) => !deletedIds.includes(r.registrationId));

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
    const res = await fetch(`${getApiBase()}/admin/registrations/${encodeURIComponent(id)}/status`, {
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

export async function deleteRegistration(token, id) {
  // 1. Permanently blacklist and remove from local client storage immediately
  addDeletedId(id);
  const regs = getLocalRegistrations().filter((r) => r.registrationId !== id);
  saveLocalRegistrations(regs);

  // 2. Also send request to backend if available
  try {
    const res = await fetch(`${getApiBase()}/admin/registrations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (res.ok) {
      const json = await res.json();
      return json.registration || { registrationId: id, success: true };
    }
  } catch (err) {
    console.warn('Backend delete network error (client blacklist applied):', err.message);
  }

  return { registrationId: id, success: true };
}

export function getExportUrl(token, { event = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (event) params.set('event', event);
  if (status) params.set('status', status);
  return `${getApiBase()}/admin/export?${params.toString()}`;
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

/**
 * Direct Browser Microsoft Excel (.xlsx) Download
 * Uses SheetJS to generate a native .xlsx spreadsheet with formatted columns
 */
export function exportRegistrationsToExcel(registrations, filename = 'SFD_2026_Registrations.xlsx') {
  if (!registrations || registrations.length === 0) {
    alert('No registrations to export.');
    return;
  }

  const data = registrations.map((r, index) => {
    const leader = r.teamLeader || {};
    const mems = r.members || [];
    const m2 = mems[1] || {};
    const m3 = mems[2] || {};
    const m4 = mems[3] || {};
    const m5 = mems[4] || {};

    return {
      'S.No': index + 1,
      'Registration ID': r.registrationId,
      'Timestamp': r.timestamp,
      'Event Track': r.eventName,
      'Demo Stall Category': r.eventKey === 'demo-stall' ? (
        (r.demoStallCategory || getDemoStallCategory(leader.college, leader.department)) === 'jec_cse' ? 'Jaya CSE' :
        (r.demoStallCategory || getDemoStallCategory(leader.college, leader.department)) === 'jec_other' ? 'Jaya Other Dept' :
        'External College'
      ) : 'N/A',
      'Status': r.status,
      'Fee (INR)': r.paymentAmount || 0,
      'UPI UTR / Ref No': r.paymentUtr || 'N/A',
      'Payer Name': r.payerName || 'N/A',
      'Team Name': r.teamName || 'N/A',
      'Total Members': mems.length || 1,
      'Leader Name': leader.name || '',
      'Leader Email': leader.email || '',
      'Leader Phone': leader.phone || '',
      'Leader College': leader.college || '',
      'Leader Department': leader.department || '',
      'Leader Year': leader.year || '',
      'Member 2 Name': m2.name || '',
      'Member 3 Name': m3.name || '',
      'Member 4 Name': m4.name || '',
      'Member 5 Name': m5.name || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths based on cell content
  const colKeys = Object.keys(data[0] || {});
  worksheet['!cols'] = colKeys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Registrations');

  XLSX.writeFile(workbook, filename);
}

