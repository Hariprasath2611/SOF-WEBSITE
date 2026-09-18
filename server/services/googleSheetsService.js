import { google } from 'googleapis';
import dotenv from 'dotenv';
import { EVENTS } from '../config/events.js';

dotenv.config();

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
    this.authError = null;
    this.initAuth();
  }

  initAuth() {
    try {
      const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      let privateKey = process.env.GOOGLE_PRIVATE_KEY;

      if (!email || !privateKey) {
        this.authError = 'Google Sheets credentials not configured in environment variables.';
        return;
      }

      // Handle escaped newlines in private key string
      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
      }

      const auth = new google.auth.JWT({
        email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      this.authError = null;
      console.log('✅ Google Sheets API initialized successfully.');
    } catch (err) {
      this.authError = err.message;
      console.warn('⚠️ Google Sheets API initialization warning:', err.message);
    }
  }

  isConfigured() {
    return Boolean(this.initialized && this.sheets && process.env.GOOGLE_SHEETS_MASTER_ID);
  }

  /**
   * Initializes the Master Spreadsheet sheets and headers
   */
  async initMasterSpreadsheet() {
    if (!this.isConfigured()) return;
    const masterId = process.env.GOOGLE_SHEETS_MASTER_ID;

    try {
      // 1. All_Registrations headers
      const allRegHeader = [
        'Registration ID',
        'Timestamp',
        'Event Key',
        'Event Name',
        'Team Name',
        'Team Size',
        'Team Leader / Participant Name',
        'Email',
        'College',
        'Department',
        'Year',
        'Team Members Summary',
        'Registration Status'
      ];
      await this.ensureSheetWithHeaders(masterId, 'All_Registrations', allRegHeader);

      // 2. Event_Settings headers
      const settingsHeader = [
        'Event Key',
        'Event Name',
        'Maximum Slots',
        'Registered Count',
        'Remaining Slots',
        'Status'
      ];
      await this.ensureSheetWithHeaders(masterId, 'Event_Settings', settingsHeader);

      // 3. Dashboard header
      const dashHeader = ['Metric', 'Value', 'Last Updated'];
      await this.ensureSheetWithHeaders(masterId, 'Dashboard', dashHeader);
    } catch (err) {
      console.error('Error initializing Master Spreadsheet:', err.message);
    }
  }

  /**
   * Initializes headers on an event-specific sheet
   */
  async initEventSpreadsheet(eventConfig) {
    if (!this.isConfigured()) return;
    const sheetId = process.env[eventConfig.sheetEnvKey];
    if (!sheetId) return;

    try {
      const headers = this.buildEventHeaders(eventConfig);
      await this.ensureSheetWithHeaders(sheetId, eventConfig.sheetName, headers);
    } catch (err) {
      console.error(`Error initializing sheet for ${eventConfig.name}:`, err.message);
    }
  }

  buildEventHeaders(eventConfig) {
    if (!eventConfig.isTeam) {
      return [
        'Registration ID',
        'Timestamp',
        'Participant Name',
        'Email',
        'College',
        'Department',
        'Year',
        'Registration Status'
      ];
    }

    const headers = [
      'Registration ID',
      'Timestamp',
      'Team Name',
      'Team Leader Name',
      'Team Leader Email',
      'Team Leader College',
      'Team Leader Department',
      'Team Leader Year'
    ];

    for (let i = 2; i <= eventConfig.teamSize; i++) {
      headers.push(
        `Member ${i} Name`,
        `Member ${i} Email`,
        `Member ${i} College`,
        `Member ${i} Department`,
        `Member ${i} Year`
      );
    }

    headers.push('Registration Status');
    return headers;
  }

  /**
   * Helper: Ensure sheet exists with specified headers and frozen top row
   */
  async ensureSheetWithHeaders(spreadsheetId, sheetTitle, headers) {
    if (!this.isConfigured()) return;

    try {
      const meta = await this.sheets.spreadsheets.get({ spreadsheetId });
      const sheetExists = meta.data.sheets.some((s) => s.properties.title === sheetTitle);

      if (!sheetExists) {
        // Add new sheet tab
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                addSheet: {
                  properties: { title: sheetTitle }
                }
              }
            ]
          }
        });
      }

      // Check if header row exists
      const existing = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetTitle}!A1:Z1`
      });

      if (!existing.data.values || existing.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${sheetTitle}!A1`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [headers] }
        });

        // Freeze row 1 and format header
        const updatedMeta = await this.sheets.spreadsheets.get({ spreadsheetId });
        const targetSheet = updatedMeta.data.sheets.find((s) => s.properties.title === sheetTitle);
        const sheetIdInt = targetSheet ? targetSheet.properties.sheetId : 0;

        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                updateSheetProperties: {
                  properties: {
                    sheetId: sheetIdInt,
                    gridProperties: { frozenRowCount: 1 }
                  },
                  fields: 'gridProperties.frozenRowCount'
                }
              },
              {
                repeatCell: {
                  range: {
                    sheetId: sheetIdInt,
                    startRowIndex: 0,
                    endRowIndex: 1
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.05, green: 0.12, blue: 0.18 },
                      textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
                    }
                  },
                  fields: 'userEnteredFormat(backgroundColor,textFormat)'
                }
              }
            ]
          }
        });
      }
    } catch (err) {
      console.error(`ensureSheetWithHeaders error for ${sheetTitle}:`, err.message);
    }
  }

  /**
   * Appends registration record to Master Sheet and event-specific Sheet
   */
  async appendRegistration(registration, eventConfig) {
    if (!this.isConfigured()) return;

    try {
      // 1. Append to Master Sheet -> All_Registrations
      const masterId = process.env.GOOGLE_SHEETS_MASTER_ID;
      const membersSummary = registration.members
        .map((m, idx) => `${idx === 0 ? 'Leader' : `Member ${idx + 1}`}: ${m.name} (${m.email}, ${m.dept})`)
        .join(' | ');

      const masterRow = [
        registration.registrationId,
        registration.timestamp,
        eventConfig.key,
        eventConfig.name,
        registration.teamName || 'N/A',
        eventConfig.teamSize,
        registration.teamLeader.name,
        registration.teamLeader.email,
        registration.teamLeader.college,
        registration.teamLeader.department,
        registration.teamLeader.year,
        membersSummary,
        registration.status || 'CONFIRMED'
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: masterId,
        range: 'All_Registrations!A:M',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [masterRow] }
      });

      // 2. Append to event-specific spreadsheet
      const eventSheetId = process.env[eventConfig.sheetEnvKey];
      if (eventSheetId) {
        const eventRow = [
          registration.registrationId,
          registration.timestamp
        ];

        if (eventConfig.isTeam) {
          eventRow.push(registration.teamName || '');
        }

        // Add all members in order (Team Leader is member 0)
        for (let i = 0; i < eventConfig.teamSize; i++) {
          const m = registration.members[i] || {};
          eventRow.push(
            m.name || '',
            m.email || '',
            m.college || '',
            m.department || '',
            m.year || ''
          );
        }

        eventRow.push(registration.status || 'CONFIRMED');

        await this.sheets.spreadsheets.values.append({
          spreadsheetId: eventSheetId,
          range: `${eventConfig.sheetName}!A:Z`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [eventRow] }
        });
      }
    } catch (err) {
      console.error('Error writing registration to Google Sheets:', err.message);
      // Fail gracefully so user's registration still succeeds in local store
    }
  }

  /**
   * Syncs the Event_Settings tab on the Master Sheet with current availability stats
   */
  async updateEventSettings(statsMap) {
    if (!this.isConfigured()) return;
    const masterId = process.env.GOOGLE_SHEETS_MASTER_ID;

    try {
      const rows = EVENTS.map((ev) => {
        const stats = statsMap[ev.key] || { registeredCount: 0, remainingSlots: ev.maxSlots, status: 'OPEN' };
        return [
          ev.key,
          ev.name,
          ev.maxSlots,
          stats.registeredCount,
          stats.remainingSlots,
          stats.status
        ];
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId: masterId,
        range: 'Event_Settings!A2:F6',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: rows }
      });
    } catch (err) {
      console.error('Error updating Event_Settings tab in Google Sheets:', err.message);
    }
  }

  /**
   * Update registration status (CONFIRMED / CANCELLED) in Master Sheet
   */
  async updateRegistrationStatus(registrationId, newStatus) {
    if (!this.isConfigured()) return;
    const masterId = process.env.GOOGLE_SHEETS_MASTER_ID;

    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: masterId,
        range: 'All_Registrations!A:A'
      });

      const rows = res.data.values || [];
      const rowIndex = rows.findIndex((r) => r[0] === registrationId);

      if (rowIndex !== -1) {
        // Status is in column M (13th column, 1-indexed) -> Row is rowIndex + 1
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: masterId,
          range: `All_Registrations!M${rowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [[newStatus]] }
        });
      }
    } catch (err) {
      console.error(`Error updating status for ${registrationId} in Google Sheets:`, err.message);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
