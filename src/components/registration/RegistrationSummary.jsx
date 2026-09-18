import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle, Loader2 } from 'lucide-react';
import { getTrackConfig } from '../../config/events';
import PaymentCard from './PaymentCard';
import { calculateEventFee } from '../../utils/feeCalculator';

export default function RegistrationSummary({
  selectedEventKey,
  formData,
  onBack,
  onSubmit,
  isSubmitting,
  submitError
}) {
  const [agreed, setAgreed] = useState(true);
  const [utrNumber, setUtrNumber] = useState('');
  const [payerName, setPayerName] = useState('');
  const [utrError, setUtrError] = useState('');

  const eventConfig = getTrackConfig(selectedEventKey);
  if (!eventConfig) return null;

  const feeInfo = calculateEventFee(selectedEventKey, formData.teamLeader?.college);

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setUtrError('');

    if (!utrNumber || utrNumber.trim().length < 8) {
      setUtrError('Please enter the 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }

    onSubmit({
      paymentAmount: feeInfo.totalAmount,
      paymentUtr: utrNumber.trim(),
      payerName: payerName.trim(),
      paymentStatus: 'SUBMITTED'
    });
  };

  return (
    <div className="summary-step">
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          Review Registration & Complete Payment
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Verify your details, scan the QR code to transfer the fee, and enter your 12-digit UPI transaction number.
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

      {/* Official Payment Card with GPay QR and UTR Entry */}
      <PaymentCard
        eventKey={selectedEventKey}
        collegeName={formData.teamLeader?.college}
        utrNumber={utrNumber}
        setUtrNumber={setUtrNumber}
        payerName={payerName}
        setPayerName={setPayerName}
        utrError={utrError}
      />

      {/* Declaration */}
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', margin: '20px 0', fontSize: '0.86rem', color: '#cbd5e1' }}>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          style={{ marginTop: '3px', accentColor: '#10b981' }}
        />
        <span>
          I confirm that the payment of <strong>₹{feeInfo.totalAmount}</strong> has been transferred via UPI, the entered UTR is authentic, and all participants will bring their college ID cards on event day.
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
          onClick={handleFinalSubmit}
          disabled={!agreed || isSubmitting}
          style={{ minWidth: '220px', justifyContent: 'center' }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              <span>Verifying & Reserving Slot...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Confirm & Generate Pass</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
