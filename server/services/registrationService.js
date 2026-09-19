import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { EVENTS, getEventByKey } from '../config/events.js';
import { googleSheetsService } from './googleSheetsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const STORE_PATH = path.join(DATA_DIR, 'local_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Simple asynchronous mutex queue per event to prevent race conditions
class AsyncLock {
  constructor() {
    this.locks = new Map();
  }

  async acquire(key) {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }
    let resolver;
    const promise = new Promise((resolve) => {
      resolver = resolve;
    });
    this.locks.set(key, promise);
    return () => {
      this.locks.delete(key);
      resolver();
    };
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

export function calculateServerFee(eventKey, collegeName = '') {
  const isJaya = /(jaya|\bjec\b)/i.test((collegeName || '').trim());
  const perHeadFee = isJaya ? 100 : 200;
  const teamSizes = {
    'demo-stall': 3,
    'mini-hackathon': 4,
    'poster-design': 2,
    'panel-discussion': 5,
    'workshop': 1
  };
  const membersCount = teamSizes[eventKey] || 1;
  return perHeadFee * membersCount;
}

class RegistrationService {
  constructor() {
    this.lock = new AsyncLock();
    this.registrations = [];
    this.counter = 0;
    this.loadFromDisk();
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const data = JSON.parse(raw);
        this.registrations = data.registrations || [];
        this.counter = data.counter || this.registrations.length;
        console.log(`Loaded ${this.registrations.length} registrations from local persistent store.`);
      } else {
        this.saveToDisk();
      }
    } catch (err) {
      console.error('Error loading local store, initializing empty store:', err.message);
      this.registrations = [];
      this.counter = 0;
      this.saveToDisk();
    }
  }

  saveToDisk() {
    try {
      const data = {
        counter: this.counter,
        lastUpdated: new Date().toISOString(),
        registrations: this.registrations
      };
      fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write to local store:', err.message);
    }
  }

  /**
   * Generates next sequential unique registration ID, e.g. REG-2026-00001
   */
  generateRegistrationId() {
    this.counter += 1;
    const padded = String(this.counter).padStart(5, '0');
    return `REG-2026-${padded}`;
  }

  /**
   * Calculates real-time slot statistics for all events
   */
  getEventsWithSlots() {
    return EVENTS.map((ev) => {
      // Active registrations (CONFIRMED) count towards slot capacity
      const activeRegistrations = this.registrations.filter(
        (r) => r.eventKey === ev.key && r.status !== 'CANCELLED'
      );
      const activeCount = activeRegistrations.length;
      const remainingSlots = Math.max(0, ev.maxSlots - activeCount);
      const status = remainingSlots === 0 ? 'FULL' : 'OPEN';

      let quotasStats = null;
      if (ev.key === 'demo-stall' && ev.quotas) {
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
            quota: ev.quotas.jecCse,
            registered: jecCseCount,
            remaining: Math.max(0, ev.quotas.jecCse - jecCseCount)
          },
          jecOther: {
            quota: ev.quotas.jecOther,
            registered: jecOtherCount,
            remaining: Math.max(0, ev.quotas.jecOther - jecOtherCount)
          },
          external: {
            quota: ev.quotas.external,
            registered: externalCount,
            remaining: Math.max(0, ev.quotas.external - externalCount)
          }
        };
      }

      return {
        ...ev,
        registeredCount: activeCount,
        remainingSlots,
        quotasStats,
        status
      };
    });
  }

  /**
   * Atomic registration processor with concurrency lock and strict slot verification
   */
  async register(formData) {
    const { eventKey, teamName, teamLeader, members } = formData;

    const eventConfig = getEventByKey(eventKey);
    if (!eventConfig) {
      throw new Error(`Invalid event selected: "${eventKey}"`);
    }

    // Acquire event lock to guarantee atomic slot reservation
    const releaseLock = await this.lock.acquire(eventKey);

    try {
      // 1. Check current slots under lock
      const activeRegistrations = this.registrations.filter(
        (r) => r.eventKey === eventKey && r.status !== 'CANCELLED'
      );
      const activeCount = activeRegistrations.length;

      if (activeCount >= eventConfig.maxSlots) {
        const err = new Error(`Sorry, this event just became full (${eventConfig.maxSlots}/${eventConfig.maxSlots} slots). Please select another event.`);
        err.statusCode = 409;
        err.code = 'EVENT_FULL';
        throw err;
      }

      // Check Demo Stall 3-tier quota criteria
      let demoStallCategory = null;
      if (eventKey === 'demo-stall' && eventConfig.quotas) {
        demoStallCategory = getDemoStallCategory(teamLeader.college, teamLeader.department);
        if (demoStallCategory === 'jec_cse') {
          const jecCseCount = activeRegistrations.filter(
            (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'jec_cse'
          ).length;
          if (jecCseCount >= eventConfig.quotas.jecCse) {
            const err = new Error(`Demo Stall slots for Jaya Engineering College CSE (${eventConfig.quotas.jecCse}/${eventConfig.quotas.jecCse}) are completely filled.`);
            err.statusCode = 409;
            err.code = 'QUOTA_FULL';
            throw err;
          }
        } else if (demoStallCategory === 'jec_other') {
          const jecOtherCount = activeRegistrations.filter(
            (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'jec_other'
          ).length;
          if (jecOtherCount >= eventConfig.quotas.jecOther) {
            const err = new Error(`Demo Stall slots for Other Jaya Engineering College Departments (${eventConfig.quotas.jecOther}/${eventConfig.quotas.jecOther}) are completely filled.`);
            err.statusCode = 409;
            err.code = 'QUOTA_FULL';
            throw err;
          }
        } else {
          const externalCount = activeRegistrations.filter(
            (r) => getDemoStallCategory(r.teamLeader?.college, r.teamLeader?.department) === 'external'
          ).length;
          if (externalCount >= eventConfig.quotas.external) {
            const err = new Error(`Demo Stall slots for External Colleges (${eventConfig.quotas.external}/${eventConfig.quotas.external}) are completely filled.`);
            err.statusCode = 409;
            err.code = 'QUOTA_FULL';
            throw err;
          }
        }
      }

      // 2. Duplicate check: Team Leader Email per event (and all members' emails)
      const leaderEmail = teamLeader.email.trim().toLowerCase();
      const existingRegistration = this.registrations.find((r) => {
        if (r.eventKey !== eventKey || r.status === 'CANCELLED') return false;
        const leaderMatch = r.teamLeader.email.trim().toLowerCase() === leaderEmail;
        const memberMatch = r.members && r.members.some((m) => m.email && m.email.trim().toLowerCase() === leaderEmail);
        return leaderMatch || memberMatch;
      });

      if (existingRegistration) {
        const err = new Error(`A registration with email "${leaderEmail}" already exists for ${eventConfig.name}.`);
        err.statusCode = 409;
        err.code = 'DUPLICATE_REGISTRATION';
        throw err;
      }

      // 2b. Strict Duplicate UTR / Transaction ID check across all active registrations
      const rawUtr = (formData.paymentUtr || '').trim();
      if (!rawUtr || rawUtr === 'N/A') {
        const err = new Error('UPI Transaction ID / 12-digit UTR is required to confirm registration.');
        err.statusCode = 400;
        err.code = 'MISSING_UTR';
        throw err;
      }

      const cleanUtr = rawUtr.toLowerCase();
      const existingUtr = this.registrations.find(
        (r) => r.status !== 'CANCELLED' && r.paymentUtr && r.paymentUtr.trim().toLowerCase() === cleanUtr
      );

      if (existingUtr) {
        const err = new Error(`This UPI Transaction ID / UTR "${rawUtr}" has already been submitted for registration ${existingUtr.registrationId} (${existingUtr.eventName}). Reusing transaction IDs is strictly prohibited.`);
        err.statusCode = 409;
        err.code = 'DUPLICATE_UTR';
        throw err;
      }

      // Calculate guaranteed fee so paymentAmount is never 0
      const expectedAmount = calculateServerFee(eventKey, teamLeader.college);
      const paymentAmount = Number(formData.paymentAmount) > 0 ? Number(formData.paymentAmount) : expectedAmount;

      // 3. Assemble validated members list
      const allMembers = [];
      // Member 1 is Team Leader
      allMembers.push({
        ...teamLeader,
        isLeader: true,
        memberIndex: 1
      });

      if (eventConfig.isTeam && Array.isArray(members)) {
        for (let i = 0; i < members.length; i++) {
          allMembers.push({
            ...members[i],
            isLeader: false,
            memberIndex: i + 2
          });
        }
      }

      // 4. Generate Unique Registration ID
      const registrationId = this.generateRegistrationId();
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      const newRegistration = {
        registrationId,
        timestamp,
        isoTimestamp: new Date().toISOString(),
        eventKey,
        eventName: eventConfig.name,
        teamSize: eventConfig.teamSize,
        teamName: eventConfig.isTeam ? (teamName ? teamName.trim() : 'Unnamed Team') : 'N/A',
        teamLeader: {
          name: teamLeader.name.trim(),
          email: leaderEmail,
          college: teamLeader.college.trim(),
          department: teamLeader.department.trim(),
          year: teamLeader.year
        },
        members: allMembers,
        paymentAmount,
        paymentUtr: rawUtr,
        payerName: (formData.payerName || '').trim(),
        paymentStatus: formData.paymentStatus || 'SUBMITTED',
        demoStallCategory: demoStallCategory || (eventKey === 'demo-stall' ? getDemoStallCategory(teamLeader.college, teamLeader.department) : null),
        status: 'CONFIRMED'
      };

      // 5. Store registration locally
      this.registrations.unshift(newRegistration);
      this.saveToDisk();

      // 6. Write asynchronously to Google Sheets without blocking response
      (async () => {
        try {
          await googleSheetsService.appendRegistration(newRegistration, eventConfig);
          // Sync settings tab with updated counts
          const statsMap = {};
          this.getEventsWithSlots().forEach((e) => {
            statsMap[e.key] = {
              registeredCount: e.registeredCount,
              remainingSlots: e.remainingSlots,
              status: e.status
            };
          });
          await googleSheetsService.updateEventSettings(statsMap);
        } catch (err) {
          console.error('Background Google Sheets sync error:', err.message);
        }
      })();

      return newRegistration;
    } finally {
      // Release lock so next concurrent registration can proceed
      releaseLock();
    }
  }

  getRegistrationById(id) {
    return this.registrations.find((r) => r.registrationId === id);
  }

  /**
   * Admin: Get filtered/searched list of registrations
   */
  getAllRegistrations({ search = '', event = '', status = '' }) {
    let list = [...this.registrations];

    if (event) {
      list = list.filter((r) => r.eventKey === event);
    }

    if (status) {
      list = list.filter((r) => r.status === status);
    }

    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => {
        const inId = r.registrationId.toLowerCase().includes(q);
        const inLeader = r.teamLeader.name.toLowerCase().includes(q);
        const inEmail = r.teamLeader.email.toLowerCase().includes(q);
        const inTeam = r.teamName && r.teamName.toLowerCase().includes(q);
        const inCollege = r.teamLeader.college && r.teamLeader.college.toLowerCase().includes(q);
        const inMembers = r.members && r.members.some((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
        return inId || inLeader || inEmail || inTeam || inCollege || inMembers;
      });
    }

    return list;
  }

  /**
   * Admin: Toggle / Update registration status (CONFIRMED vs CANCELLED)
   * If CANCELLED, the slot is automatically restored for other participants!
   */
  async updateStatus(registrationId, newStatus) {
    const reg = this.registrations.find((r) => r.registrationId === registrationId);
    if (!reg) {
      throw new Error(`Registration with ID "${registrationId}" not found.`);
    }

    const validStatuses = ['CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status "${newStatus}". Allowed: ${validStatuses.join(', ')}`);
    }

    reg.status = newStatus;
    reg.statusUpdatedAt = new Date().toISOString();
    this.saveToDisk();

    // Async sync to Google Sheets
    (async () => {
      try {
        await googleSheetsService.updateRegistrationStatus(registrationId, newStatus);
        const statsMap = {};
        this.getEventsWithSlots().forEach((e) => {
          statsMap[e.key] = {
            registeredCount: e.registeredCount,
            remainingSlots: e.remainingSlots,
            status: e.status
          };
        });
        await googleSheetsService.updateEventSettings(statsMap);
      } catch (err) {
        console.error('Google Sheets status sync error:', err.message);
      }
    })();

    return reg;
  }

  /**
   * Admin: Permanently delete a registration
   */
  async deleteRegistration(registrationId) {
    const idx = this.registrations.findIndex((r) => r.registrationId === registrationId);
    if (idx === -1) {
      throw new Error(`Registration with ID "${registrationId}" not found.`);
    }

    const removed = this.registrations.splice(idx, 1)[0];
    this.saveToDisk();

    // Async sync to Google Sheets if configured
    (async () => {
      try {
        await googleSheetsService.updateRegistrationStatus(registrationId, 'DELETED');
        const statsMap = {};
        this.getEventsWithSlots().forEach((e) => {
          statsMap[e.key] = {
            registeredCount: e.registeredCount,
            remainingSlots: e.remainingSlots,
            status: e.status
          };
        });
        await googleSheetsService.updateEventSettings(statsMap);
      } catch (err) {
        console.error('Google Sheets delete sync error:', err.message);
      }
    })();

    return removed;
  }

  /**
   * Admin: Overview KPI Metrics
   */
  getAdminOverview() {
    const events = this.getEventsWithSlots();
    const totalRegistrations = this.registrations.length;
    const confirmedRegistrations = this.registrations.filter((r) => r.status === 'CONFIRMED').length;
    const cancelledRegistrations = this.registrations.filter((r) => r.status === 'CANCELLED').length;

    // Total participants across all teams
    const totalParticipants = this.registrations
      .filter((r) => r.status === 'CONFIRMED')
      .reduce((acc, curr) => acc + (curr.members ? curr.members.length : 1), 0);

    return {
      totalRegistrations,
      confirmedRegistrations,
      cancelledRegistrations,
      totalParticipants,
      events,
      recentRegistrations: this.registrations.slice(0, 8)
    };
  }
}

export const registrationService = new RegistrationService();
