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
      const activeCount = this.registrations.filter(
        (r) => r.eventKey === ev.key && r.status !== 'CANCELLED'
      ).length;

      const remainingSlots = Math.max(0, ev.maxSlots - activeCount);
      const status = remainingSlots === 0 ? 'FULL' : 'OPEN';

      return {
        ...ev,
        registeredCount: activeCount,
        remainingSlots,
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
      const activeCount = this.registrations.filter(
        (r) => r.eventKey === eventKey && r.status !== 'CANCELLED'
      ).length;

      if (activeCount >= eventConfig.maxSlots) {
        const err = new Error(`Sorry, this event just became full. Please select another event.`);
        err.statusCode = 409;
        err.code = 'EVENT_FULL';
        throw err;
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
        paymentAmount: formData.paymentAmount || 0,
        paymentUtr: formData.paymentUtr || 'N/A',
        payerName: formData.payerName || '',
        paymentStatus: formData.paymentStatus || 'SUBMITTED',
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
