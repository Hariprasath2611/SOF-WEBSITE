import React, { useState } from 'react';
import { ArrowLeft, Check, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { getTrackConfig } from '../../config/events';

export default function RegistrationSummary({
  selectedEventKey,
  formData,
  onBack,
  onSubmit,
  isSubmitting,
  submitError
}) {
  const [agreed, setAgreed] = useState(true);
  const eventConfig = getTrackConfig(selectedEventKey);

  if (!eventConfig) return null;

  return (
    <div className="summary-step">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Review Registration Details
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Please verify your information before final submission. Once registered, a unique Registration ID will be assigned.
        </p>
      </div>

      {submitError && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            padding: '14px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem'
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Event Overview Card */}
      <div className="summary-spec-list">
        <div className="summary-row">
          <span className="summary-key">Event Track</span>
          <span className="summary-val highlight">{eventConfig.name}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Category</span>
          <span className="summary-val">{eventConfig.isTeam ? `Team Event (${eventConfig.teamSize} Members)` : 'Individual Masterclass'}</span>
        </div>
        {eventConfig.isTeam && (
          <div className="summary-row">
            <span className="summary-key">Team Name</span>
            <span className="summary-val" style={{ color: '#38bdf8' }}>{formData.teamName}</span>
          </div>
        )}
        <div className="summary-row">
          <span className="summary-key">Primary Contact</span>
          <span className="summary-val">{formData.teamLeader?.name} ({formData.teamLeader?.email})</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Institution</span>
          <span className="summary-val">{formData.teamLeader?.college}</span>
        </div>
        <div className="summary-row">
          <span className="summary-key">Department & Year</span>
          <span className="summary-val">{formData.teamLeader?.department} — {formData.teamLeader?.year}</span>
        </div>
      </div>

      {/* Complete Roster Table (For Team Events) */}
      {eventConfig.isTeam && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
            CONFIRMED TEAM ROSTER ({eventConfig.teamSize} PARTICIPANTS)
          </h4>

          <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="card-track-number" style={{ fontSize: '0.68rem' }}>LEADER</span></td>
                  <td style={{ fontWeight: 600 }}>{formData.teamLeader?.name}</td>
                  <td>{formData.teamLeader?.email}</td>
                  <td>{formData.teamLeader?.department}</td>
                  <td>{formData.teamLeader?.year}</td>
                </tr>
                {(formData.members || []).map((m, idx) => (
                  <tr key={idx}>
                    <td><span style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>MEMBER {idx + 2}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td>{m.email}</td>
                    <td>{m.department}</td>
                    <td>{m.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Notice */}
      <div className="fee-notice-banner">
        <ShieldCheck size={22} color="#38bdf8" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#fff', display: 'block', marginBottom: '2px' }}>Registration Fee: ₹100</strong>
          <span>Registration fee is collected per entry unit. Please ensure your payment has been completed and college ID card is ready on event day.</span>
        </div>
      </div>

      {/* Declaration */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', margin: '20px 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ marginTop: '3px', accentColor: '#10b981' }}
        />
        <span>
          I confirm that the submitted participant information is accurate, and all registered participants will carry their physical College ID card for entry into Jaya Engineering College.
        </span>
      </label>

      {/* Actions */}
      <div className="reg-actions-row">
        <button type="button" className="btn-wizard-back" onClick={onBack} disabled={isSubmitting}>
          <ArrowLeft size={16} />
          <span>Edit Details</span>
        </button>

        <button
          type="button"
          className="btn-wizard-next"
          onClick={onSubmit}
          disabled={!agreed || isSubmitting}
          style={{ minWidth: '180px', justifyContent: 'center' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Reserving Slot...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Confirm & Submit</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
