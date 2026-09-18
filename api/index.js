/**
 * VERCEL SERVERLESS API HANDLER FOR SFD 2026
 * Handles all /api/* routes natively on Vercel.
 * Supported Storage:
 *  1. Supabase PostgreSQL (via @supabase/supabase-js)
 *  2. Upstash Redis / Vercel KV
 *  3. In-memory / /tmp fallback (ensures 100% uptime with zero 502 Bad Gateway errors)
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Track configurations
const EVENT_TRACKS = [
  {
    key: 'demo-stall',
    name: 'Demo Stall – Team of 3',
    title: 'Demo Stall',
    tagline: 'Build. Demonstrate. Inspire.',
    trackNumber: '01',
    teamSize: 3,
    maxSlots: 30,
    isTeam: true
  },
  {
    key: 'mini-hackathon',
    name: 'Mini Hackathon – Team of 4',
    title: 'Mini Hackathon',
    tagline: 'Code. Collaborate. Create.',
    trackNumber: '02',
    teamSize: 4,
    maxSlots: 25,
    isTeam: true
  },
  {
    key: 'poster-design',
    name: 'Poster Design – Team of 2',
    title: 'Poster Design',
    tagline: 'Design Ideas. Visualize Freedom.',
    trackNumber: '03',
    teamSize: 2,
    maxSlots: 25,
    isTeam: true
  },
  {
    key: 'panel-discussion',
    name: 'Panel of Discussion – Team of 5',
    title: 'Panel of Discussion',
    tagline: 'Think. Question. Defend.',
    trackNumber: '04',
    teamSize: 5,
    maxSlots: 10,
    isTeam: true
  },
  {
    key: 'workshop',
    name: 'Hands-on Technical Workshop',
    title: 'Workshop',
    tagline: 'Learn. Code. Deploy.',
    trackNumber: '05',
    teamSize: 1,
    maxSlots: 50,
    isTeam: false
  }
];

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345';
const TMP_FILE = path.join('/tmp', 'sfd_registrations_store.json');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client initialized in serverless handler');
  } catch (err) {
    console.warn('Supabase initialization warning:', err.message);
  }
}

// Upstash / Vercel KV
const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory runtime cache
let memoryStore = {
  counter: 1,
  registrations: [
    {
      registrationId: 'REG-2026-00001',
      timestamp: '18/9/2026, 2:06:06 pm',
      isoTimestamp: '2026-09-18T08:36:06.547Z',
      eventKey: 'demo-stall',
      eventName: 'Demo Stall – Team of 3',
      teamSize: 3,
      teamName: 'Vynora',
      paymentAmount: 600,
      paymentUtr: 'UTR987654321012',
      payerName: 'Hariprasath D',
      paymentStatus: 'SUBMITTED',
      teamLeader: {
        name: 'Hariprasath D',
        email: 'hariprasathd26112006@gmail.com',
        phone: '+919790851329',
        college: 'Jaya Engineering College',
        department: 'CSE',
        year: '3rd Year'
      },
      members: [
        {
          name: 'Hariprasath D',
          email: 'hariprasathd26112006@gmail.com',
          phone: '+919790851329',
          college: 'Jaya Engineering College',
          department: 'CSE',
          year: '3rd Year',
          isLeader: true,
          memberIndex: 1
        },
        {
          name: 'Suma R',
          isLeader: false,
          memberIndex: 2
        },
        {
          name: 'Aashiq M',
          isLeader: false,
          memberIndex: 3
        }
      ],
      status: 'CONFIRMED',
      statusUpdatedAt: '2026-09-18T08:37:15.271Z'
    }
  ]
};

// -----------------------------------------------------------------------------
// CLOUD STORAGE READ / WRITE (Supabase -> Upstash -> /tmp -> Memory)
// -----------------------------------------------------------------------------
async function readStore() {
  // 1. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && Array.isArray(data)) {
        if (data.length > 0) {
          const list = data.map((row) => row.payload || row);
          memoryStore = {
            counter: list.length,
            registrations: list
          };
          return memoryStore;
        }
      } else if (error) {
        console.warn('Supabase query notice:', error.message);
      }
    } catch (err) {
      console.warn('Supabase read error:', err.message);
    }
  }

  // 2. Try Upstash / Vercel KV
  if (kvUrl && kvToken) {
    try {
      const res = await fetch(`${kvUrl}/get/sfd_store`, {
        headers: { Authorization: `Bearer ${kvToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          const parsed = typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
          if (parsed && Array.isArray(parsed.registrations)) {
            memoryStore = parsed;
            return memoryStore;
          }
        }
      }
    } catch (err) {
      console.warn('Upstash KV read error:', err.message);
    }
  }

  // 3. Try /tmp file in serverless lambda
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.registrations)) {
        memoryStore = parsed;
        return memoryStore;
      }
    }
  } catch (err) {
    console.warn('/tmp read warning:', err.message);
  }

  return memoryStore;
}

async function writeStore(data) {
  memoryStore = data;

  // 1. Save to Upstash / Vercel KV if configured
  if (kvUrl && kvToken) {
    try {
      await fetch(`${kvUrl}/set/sfd_store`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${kvToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(JSON.stringify(data))
      });
    } catch (err) {
      console.warn('Upstash KV write error:', err.message);
    }
  }

  // 2. Save to /tmp
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('/tmp write warning:', err.message);
  }
}

// Helper to save a single registration directly to Supabase
async function saveRegistrationToSupabase(reg) {
  if (!supabase) return;
  try {
    await supabase.from('registrations').upsert(
      {
        registration_id: reg.registrationId,
        event_key: reg.eventKey,
        event_name: reg.eventName,
        team_name: reg.teamName || 'N/A',
        team_size: reg.teamSize || 1,
        leader_name: reg.teamLeader?.name || '',
        leader_email: reg.teamLeader?.email || '',
        leader_phone: reg.teamLeader?.phone || '',
        leader_college: reg.teamLeader?.college || '',
        payment_amount: reg.paymentAmount || 0,
        payment_utr: reg.paymentUtr || 'N/A',
        status: reg.status || 'CONFIRMED',
        payload: reg
      },
      { onConflict: 'registration_id' }
    );
  } catch (err) {
    console.warn('Supabase single write error:', err.message);
  }
}

// -----------------------------------------------------------------------------
// EVENT SLOTS CALCULATION
// -----------------------------------------------------------------------------
function calculateEventSlots(registrations) {
  return EVENT_TRACKS.map((track) => {
    const activeCount = registrations.filter(
      (r) => r.eventKey === track.key && r.status !== 'CANCELLED'
    ).length;
    const remainingSlots = Math.max(0, track.maxSlots - activeCount);
    return {
      ...track,
      registeredCount: activeCount,
      remainingSlots,
      status: remainingSlots === 0 ? 'FULL' : 'OPEN'
    };
  });
}

// -----------------------------------------------------------------------------
// MAIN VERCEL SERVERLESS HANDLER
// -----------------------------------------------------------------------------
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Normalize URL Path
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = parsedUrl.pathname.replace(/^\/api/, '');
  if (!pathname.startsWith('/')) pathname = '/' + pathname;

  const store = await readStore();
  const registrations = store.registrations || [];

  try {
    // -------------------------------------------------------------
    // 1. GET /api/events
    // -------------------------------------------------------------
    if (pathname === '/events' && req.method === 'GET') {
      const eventsWithSlots = calculateEventSlots(registrations);
      return res.status(200).json({ success: true, events: eventsWithSlots });
    }

    // -------------------------------------------------------------
    // 2. POST /api/registrations
    // -------------------------------------------------------------
    if (pathname === '/registrations' && req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          return res.status(400).json({ success: false, error: 'Invalid JSON body' });
        }
      }

      const {
        eventKey,
        teamName,
        teamLeader,
        members,
        paymentAmount,
        paymentUtr,
        payerName,
        paymentStatus
      } = body || {};

      if (!eventKey) {
        return res.status(400).json({ success: false, error: 'Event key is required' });
      }

      const track = EVENT_TRACKS.find((t) => t.key === eventKey);
      if (!track) {
        return res.status(400).json({ success: false, error: `Invalid event track: ${eventKey}` });
      }

      // Check slot availability
      const activeCount = registrations.filter(
        (r) => r.eventKey === eventKey && r.status !== 'CANCELLED'
      ).length;

      if (activeCount >= track.maxSlots) {
        return res.status(409).json({
          success: false,
          code: 'EVENT_FULL',
          error: `Registration for ${track.title} is currently full.`
        });
      }

      // Duplicate check: Leader Email
      const leaderEmail = teamLeader?.email ? teamLeader.email.trim().toLowerCase() : '';
      if (leaderEmail) {
        const isDuplicate = registrations.some((r) => {
          if (r.eventKey !== eventKey || r.status === 'CANCELLED') return false;
          return r.teamLeader?.email?.trim()?.toLowerCase() === leaderEmail;
        });

        if (isDuplicate) {
          return res.status(409).json({
            success: false,
            code: 'DUPLICATE_REGISTRATION',
            error: `Email ${leaderEmail} has already been registered for this track.`
          });
        }
      }

      // Generate next registration ID
      const nextCount = (store.counter || registrations.length) + 1;
      const registrationId = `REG-2026-${String(nextCount).padStart(5, '0')}`;
      const now = new Date();
      const timestamp = now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // Assemble all members
      const allMembers = [
        {
          ...teamLeader,
          isLeader: true,
          memberIndex: 1
        }
      ];

      if (track.isTeam && Array.isArray(members)) {
        members.forEach((m, idx) => {
          allMembers.push({
            ...m,
            isLeader: false,
            memberIndex: idx + 2
          });
        });
      }

      const newRegistration = {
        registrationId,
        timestamp,
        isoTimestamp: now.toISOString(),
        eventKey,
        eventName: track.name,
        teamSize: track.teamSize,
        teamName: track.isTeam ? teamName || 'N/A' : 'N/A',
        teamLeader: { ...teamLeader },
        members: allMembers,
        paymentAmount: paymentAmount || 0,
        paymentUtr: paymentUtr || 'N/A',
        payerName: payerName || '',
        paymentStatus: paymentStatus || 'SUBMITTED',
        status: 'CONFIRMED',
        statusUpdatedAt: now.toISOString()
      };

      store.counter = nextCount;
      store.registrations.push(newRegistration);
      await writeStore(store);

      // Save to Supabase in parallel
      await saveRegistrationToSupabase(newRegistration);

      return res.status(200).json({ success: true, registration: newRegistration });
    }

    // -------------------------------------------------------------
    // 3. GET /api/registrations/:id
    // -------------------------------------------------------------
    if (pathname.startsWith('/registrations/') && req.method === 'GET') {
      const id = decodeURIComponent(pathname.replace('/registrations/', ''));
      const reg = registrations.find((r) => r.registrationId === id);
      if (!reg) {
        return res.status(404).json({ success: false, error: `Registration ${id} not found.` });
      }
      return res.status(200).json({ success: true, registration: reg });
    }

    // -------------------------------------------------------------
    // 4. POST /api/admin/login
    // -------------------------------------------------------------
    if (pathname === '/admin/login' && req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }
      const { password } = body || {};

      if (password === ADMIN_PASSWORD) {
        return res.status(200).json({ success: true, token: ADMIN_PASSWORD });
      }
      return res.status(401).json({ success: false, error: 'Invalid admin password.' });
    }

    // Check Admin Authentication for /api/admin/*
    if (pathname.startsWith('/admin/')) {
      const authHeader = req.headers['authorization'] || '';
      const keyHeader = req.headers['x-admin-key'] || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : keyHeader;

      if (token !== ADMIN_PASSWORD) {
        return res.status(401).json({ success: false, error: 'Unauthorized. Invalid admin password.' });
      }

      // -----------------------------------------------------------
      // 5. GET /api/admin/overview
      // -----------------------------------------------------------
      if (pathname === '/admin/overview' && req.method === 'GET') {
        const confirmed = registrations.filter((r) => r.status === 'CONFIRMED');
        const cancelled = registrations.filter((r) => r.status === 'CANCELLED');
        const totalParticipants = confirmed.reduce(
          (acc, r) => acc + (r.members ? r.members.length : 1),
          0
        );
        const eventsWithSlots = calculateEventSlots(registrations);

        return res.status(200).json({
          success: true,
          totalRegistrations: registrations.length,
          confirmedRegistrations: confirmed.length,
          cancelledRegistrations: cancelled.length,
          totalParticipants,
          events: eventsWithSlots,
          recentRegistrations: [...registrations].reverse().slice(0, 10),
          storageProvider: supabase ? 'Supabase PostgreSQL' : kvUrl ? 'Upstash KV' : 'Serverless Cache'
        });
      }

      // -----------------------------------------------------------
      // 6. GET /api/admin/registrations
      // -----------------------------------------------------------
      if (pathname === '/admin/registrations' && req.method === 'GET') {
        const search = (parsedUrl.searchParams.get('search') || '').trim().toLowerCase();
        const eventFilter = parsedUrl.searchParams.get('event') || '';
        const statusFilter = parsedUrl.searchParams.get('status') || '';

        let filtered = [...registrations];

        if (eventFilter) {
          filtered = filtered.filter((r) => r.eventKey === eventFilter);
        }

        if (statusFilter) {
          filtered = filtered.filter((r) => r.status === statusFilter);
        }

        if (search) {
          filtered = filtered.filter((r) => {
            const mId = r.registrationId?.toLowerCase().includes(search);
            const mTeam = r.teamName?.toLowerCase().includes(search);
            const mLeader =
              r.teamLeader &&
              (r.teamLeader.name?.toLowerCase().includes(search) ||
                r.teamLeader.email?.toLowerCase().includes(search) ||
                r.teamLeader.college?.toLowerCase().includes(search));
            return mId || mTeam || mLeader;
          });
        }

        return res.status(200).json({
          success: true,
          count: filtered.length,
          registrations: filtered.reverse()
        });
      }

      // -----------------------------------------------------------
      // 7. PATCH /api/admin/registrations/:id/status
      // -----------------------------------------------------------
      if (pathname.includes('/status') && (req.method === 'PATCH' || req.method === 'POST')) {
        let body = req.body;
        if (typeof body === 'string') {
          try {
            body = JSON.parse(body);
          } catch {
            body = {};
          }
        }
        const { status } = body || {};

        const parts = pathname.split('/');
        const idIdx = parts.indexOf('registrations') + 1;
        const targetId = idIdx > 0 && idIdx < parts.length ? decodeURIComponent(parts[idIdx]) : null;

        const target = registrations.find((r) => r.registrationId === targetId);
        if (!target) {
          return res.status(404).json({ success: false, error: `Registration ${targetId} not found.` });
        }

        target.status = status || 'CONFIRMED';
        target.statusUpdatedAt = new Date().toISOString();
        await writeStore(store);

        // Update in Supabase
        if (supabase) {
          try {
            await supabase
              .from('registrations')
              .update({ status: target.status, payload: target })
              .eq('registration_id', targetId);
          } catch (err) {
            console.warn('Supabase status update error:', err.message);
          }
        }

        return res.status(200).json({
          success: true,
          message: `Status updated to ${status}.`,
          registration: target
        });
      }

      // -----------------------------------------------------------
      // 8. GET /api/admin/export (CSV)
      // -----------------------------------------------------------
      if (pathname === '/admin/export' && req.method === 'GET') {
        const headers = [
          'Registration ID',
          'Timestamp',
          'Event Name',
          'Team Name',
          'Team Size',
          'Leader Name',
          'Leader Email',
          'Leader Phone',
          'Leader College',
          'Leader Dept',
          'Leader Year',
          'Status'
        ];

        const escapeCsv = (str) => `"${String(str || '').replace(/"/g, '""')}"`;

        const rows = registrations.map((r) => [
          escapeCsv(r.registrationId),
          escapeCsv(r.timestamp),
          escapeCsv(r.eventName),
          escapeCsv(r.teamName),
          escapeCsv(r.teamSize),
          escapeCsv(r.teamLeader?.name),
          escapeCsv(r.teamLeader?.email),
          escapeCsv(r.teamLeader?.phone),
          escapeCsv(r.teamLeader?.college),
          escapeCsv(r.teamLeader?.department),
          escapeCsv(r.teamLeader?.year),
          escapeCsv(r.status)
        ].join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="SFD_2026_Registrations_${Date.now()}.csv"`
        );
        return res.status(200).send(csv);
      }
    }

    // Default route response
    return res.status(404).json({
      success: false,
      error: `Route not found: ${req.method} ${pathname}`
    });
  } catch (err) {
    console.error('Serverless Handler Error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
}
