import express from 'express';
import { registrationService } from '../services/registrationService.js';
import { getEventByKey } from '../config/events.js';

const router = express.Router();

/**
 * Admin Authentication Middleware
 * Checks Bearer token or x-admin-key header against ADMIN_PASSWORD env var
 */
function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD || '12345';
  const authHeader = req.headers['authorization'] || '';
  const keyHeader = req.headers['x-admin-key'] || '';

  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : keyHeader;

  if (token === adminPassword) {
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Invalid admin password or token.'
  });
}

// ==========================================
// PUBLIC PARTICIPANT ENDPOINTS
// ==========================================

/**
 * GET /api/events
 * Returns current live slot availability for all 5 events
 */
router.get('/events', (req, res) => {
  try {
    const events = registrationService.getEventsWithSlots();
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/registrations
 * Submits a new registration with strict server-side validation and atomic slot locking
 */
router.post('/registrations', async (req, res) => {
  try {
    const { eventKey, teamName, teamLeader, members } = req.body;

    // 1. Basic validation
    if (!eventKey) {
      return res.status(400).json({ success: false, error: 'Please select an event.' });
    }

    const eventConfig = getEventByKey(eventKey);
    if (!eventConfig) {
      return res.status(400).json({ success: false, error: `Invalid event selected: "${eventKey}".` });
    }

    // 2. Validate Team Name for team events
    if (eventConfig.isTeam) {
      if (!teamName || teamName.trim().length < 2) {
        return res.status(400).json({ success: false, error: 'Team Name is required (min 2 characters).' });
      }
    }

    // 3. Validate Team Leader / Participant
    if (!teamLeader) {
      return res.status(400).json({ success: false, error: 'Participant / Team Leader details are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!teamLeader.name || teamLeader.name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name is required (minimum 2 characters).' });
    }

    if (!teamLeader.email || !emailRegex.test(teamLeader.email.trim())) {
      return res.status(400).json({ success: false, error: 'Please provide a valid email address.' });
    }

    if (!teamLeader.college || teamLeader.college.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'College / Institution name is required.' });
    }

    if (!teamLeader.department || teamLeader.department.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    if (!teamLeader.year) {
      return res.status(400).json({ success: false, error: 'Year of Study is required.' });
    }

    // 4. Validate Team Members (if team-based)
    const expectedMembersCount = eventConfig.teamSize - 1; // excluding leader
    if (eventConfig.isTeam) {
      if (!Array.isArray(members) || members.length !== expectedMembersCount) {
        return res.status(400).json({
          success: false,
          error: `${eventConfig.name} requires exactly ${eventConfig.teamSize} members (1 Leader + ${expectedMembersCount} Members).`
        });
      }

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        const num = i + 2;

        if (!m.name || m.name.trim().length < 2) {
          return res.status(400).json({ success: false, error: `Member ${num}: Name is required (minimum 2 characters).` });
        }
        if (!m.email || !emailRegex.test(m.email.trim())) {
          return res.status(400).json({ success: false, error: `Member ${num}: Valid email is required.` });
        }
        if (!m.college || m.college.trim().length < 2) {
          return res.status(400).json({ success: false, error: `Member ${num}: College is required.` });
        }
        if (!m.department || m.department.trim().length < 2) {
          return res.status(400).json({ success: false, error: `Member ${num}: Department is required.` });
        }
        if (!m.year) {
          return res.status(400).json({ success: false, error: `Member ${num}: Year of Study is required.` });
        }
      }
    }

    // 5. Execute Atomic Registration
    const registration = await registrationService.register({
      eventKey,
      teamName,
      teamLeader,
      members
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      registration
    });
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Registration failed. Please try again.',
      code: err.code || 'SERVER_ERROR'
    });
  }
});

/**
 * GET /api/registrations/:id
 * Retrieve confirmation details by Registration ID
 */
router.get('/registrations/:id', (req, res) => {
  const reg = registrationService.getRegistrationById(req.params.id);
  if (!reg) {
    return res.status(404).json({ success: false, error: `Registration "${req.params.id}" not found.` });
  }
  res.json({ success: true, registration: reg });
});

// ==========================================
// ADMIN DASHBOARD ENDPOINTS
// ==========================================

/**
 * POST /api/admin/login
 * Verify admin password
 */
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || '12345';

  if (password === adminPassword) {
    return res.json({
      success: true,
      token: adminPassword,
      message: 'Admin authenticated successfully.'
    });
  }

  res.status(401).json({ success: false, error: 'Invalid admin password.' });
});

/**
 * GET /api/admin/overview
 * KPI statistics, availability breakdown, recent submissions
 */
router.get('/admin/overview', requireAdmin, (req, res) => {
  try {
    const overview = registrationService.getAdminOverview();
    res.json({ success: true, ...overview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/registrations
 * Filtered & searched registration list
 */
router.get('/admin/registrations', requireAdmin, (req, res) => {
  try {
    const { search, event, status } = req.query;
    const registrations = registrationService.getAllRegistrations({ search, event, status });
    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/admin/registrations/:id/status
 * Update registration status (CONFIRMED / CANCELLED)
 * If CANCELLED, automatically recalculates and reopens slots!
 */
router.patch('/admin/registrations/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await registrationService.updateStatus(req.params.id, status);
    res.json({
      success: true,
      message: `Registration status updated to ${status}. Slots recalculated.`,
      registration: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/admin/registrations/:id
 * Permanently deletes a registration and releases capacity
 */
router.delete('/admin/registrations/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await registrationService.deleteRegistration(req.params.id);
    res.json({
      success: true,
      message: `Registration ${req.params.id} permanently deleted.`,
      registration: deleted
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/admin/export
 * Export registrations as CSV
 */
router.get('/admin/export', requireAdmin, (req, res) => {
  try {
    const { event, status } = req.query;
    const list = registrationService.getAllRegistrations({ event, status });

    // Build CSV content
    const headers = [
      'Registration ID',
      'Timestamp',
      'Event Name',
      'Team Name',
      'Team Size',
      'Leader Name',
      'Leader Email',
      'Leader College',
      'Leader Dept',
      'Leader Year',
      'Members Info',
      'Status'
    ];

    const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

    const rows = list.map((r) => {
      const membersText = r.members ? r.members.map((m) => `${m.name} (${m.email})`).join('; ') : '';
      return [
        escapeCsv(r.registrationId),
        escapeCsv(r.timestamp),
        escapeCsv(r.eventName),
        escapeCsv(r.teamName),
        escapeCsv(r.teamSize),
        escapeCsv(r.teamLeader.name),
        escapeCsv(r.teamLeader.email),
        escapeCsv(r.teamLeader.college),
        escapeCsv(r.teamLeader.department),
        escapeCsv(r.teamLeader.year),
        escapeCsv(membersText),
        escapeCsv(r.status)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="SFD2026_Registrations_${Date.now()}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
