/**
 * Client API Client for SFD 2026 Event Registration
 */

const API_BASE = '/api';

export async function fetchEvents() {
  const res = await fetch(`${API_BASE}/events`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to load event slots');
  return json.events;
}

export async function submitRegistration(payload) {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.error || 'Registration failed');
    err.code = json.code;
    throw err;
  }
  return json.registration;
}

export async function fetchRegistrationById(id) {
  const res = await fetch(`${API_BASE}/registrations/${encodeURIComponent(id)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Registration not found');
  return json.registration;
}

// Admin API
export async function adminLogin(password) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Invalid password');
  return json.token;
}

export async function fetchAdminOverview(token) {
  const res = await fetch(`${API_BASE}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Unauthorized');
  return json;
}

export async function fetchAdminRegistrations(token, { search = '', event = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (event) params.set('event', event);
  if (status) params.set('status', status);

  const res = await fetch(`${API_BASE}/admin/registrations?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch registrations');
  return json.registrations;
}

export async function updateRegistrationStatus(token, id, status) {
  const res = await fetch(`${API_BASE}/admin/registrations/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update status');
  return json.registration;
}

export function getExportUrl(token, { event = '', status = '' } = {}) {
  const params = new URLSearchParams();
  if (event) params.set('event', event);
  if (status) params.set('status', status);
  return `${API_BASE}/admin/export?${params.toString()}`;
}
