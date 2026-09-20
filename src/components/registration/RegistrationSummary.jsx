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

  const actualMembersCount = (formData.members ? formData.members.filter(m => m && m.name && m.name.trim().length > 0).length : 0) + 1;
  const feeInfo = calculateEventFee(selectedEventKey, formData.teamLeader?.college, actualMembersCount);

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    setUtrError('');

    const cleanUtr = (utrNumber || '').trim();

    if (!cleanUtr || cleanUtr.length !== 12) {
      setUtrError(`Please enter the complete 12-digit UPI Transaction ID / UTR (${cleanUtr.length}/12 entered).`);
      return;
    }

    // Client-side quick duplicate pre-check
    try {
      const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('sfd_registrations_v1') : null;
      if (raw) {
        const localList = JSON.parse(raw);
        if (Array.isArray(localList)) {
          const dup = localList.find(
            (r) => r.status !== 'CANCELLED' && r.paymentUtr && r.paymentUtr.trim().toLowerCase() === cleanUtr.toLowerCase()
          );
          if (dup) {
            setUtrError(`This UPI Transaction ID / UTR "${cleanUtr}" has already been submitted for registration ${dup.registrationId}. Each transaction ID can only be used once.`);
            return;
          }
        }
      }
    } catch {
      // non-blocking
    }

    onSubmit({
      paymentAmount: feeInfo.totalAmount,
      paymentUtr: cleanUtr,
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
          <AlertCircle size={20} style={{ flexShrink: 0, color: '#f87171' }} />
          <div>
            <strong style={{ display: 'block', color: '#fff', marginBottom: '2px' }}>Registration Incomplete</strong>
            <span>{submitError}</span>
          </div>
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
          <span className="summary-val">{eventConfig.isTeam ? `Team Event (${actualMembersCount} ${actualMembersCount > 1 ? 'Members' : 'Member'})` : 'Individual Masterclass'}</span>
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
            CONFIRMED TEAM ROSTER ({actualMembersCount} {actualMembersCount > 1 ? 'PARTICIPANTS' : 'PARTICIPANT'})
          </h4>

          <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', overflow: 'hidden' }}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Participant Name</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="card-track-number" style={{ fontSize: '0.68rem' }}>LEADER</span></td>
                  <td style={{ fontWeight: 600 }}>{formData.teamLeader?.name}</td>
                  <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {formData.teamLeader?.email} • {formData.teamLeader?.phone} ({formData.teamLeader?.department}, {formData.teamLeader?.year})
                  </td>
                </tr>
                {(formData.members || []).map((m, idx) => (
                  <tr key={idx}>
                    <td><span style={{ color: '#94a3b8', fontSize: '0.74rem', fontFamily: 'var(--font-mono)' }}>MEMBER {idx + 2}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      (Institution & contact tagged to Leader)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Payment Card with GPay QR, Mobile Pay, and UTR Entry */}
      <PaymentCard
        eventKey={selectedEventKey}
        collegeName={formData.teamLeader?.college}
        membersCount={actualMembersCount}
        utrNumber={utrNumber}
        setUtrNumber={(val) => {
          setUtrNumber(val);
          if (utrError) setUtrError('');
        }}
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
          I confirm that the payment of <strong>₹{feeInfo.totalAmount}</strong> has been transferred via UPI, the entered 12-digit UTR is authentic and unused, and all participants will bring their college ID cards on event day.
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
          disabled={!agreed || isSubmitting || utrNumber.length !== 12}
          style={{ minWidth: '220px', justifyContent: 'center' }}
          title={utrNumber.length !== 12 ? 'Please enter all 12 digits of the UTR number' : ''}
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
