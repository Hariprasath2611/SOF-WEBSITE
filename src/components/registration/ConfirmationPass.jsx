import React, { useState } from 'react';
import { CheckCircle, Printer, ArrowLeft, Calendar, MapPin, Building, Users, ShieldCheck, Copy, Check, Receipt } from 'lucide-react';
import { calculateEventFee } from '../../utils/feeCalculator';

export default function ConfirmationPass({ registration, onReset, onBackToHome }) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(false);

  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const isTeam = registration.teamSize > 1;

  // Guarantee accurate non-zero amount paid
  const calculatedFee = calculateEventFee(registration.eventKey, registration.teamLeader?.college).totalAmount;
  const paidAmount = Number(registration.paymentAmount) > 0 ? Number(registration.paymentAmount) : calculatedFee;
  const utrDisplay = (registration.paymentUtr && registration.paymentUtr !== 'N/A') ? registration.paymentUtr : 'SUBMITTED';

  const handleCopyId = () => {
    navigator.clipboard.writeText(registration.registrationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyUtr = () => {
    navigator.clipboard.writeText(utrDisplay);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  return (
    <div className="confirmation-step">
      <div className="confirmation-card">
        {/* Top Header */}
        <div className="conf-header">
          <div className="conf-success-icon">
            <CheckCircle size={32} />
          </div>

          <div className="payment-status-pill">
            <ShieldCheck size={14} />
            <span>PAYMENT RECORDED • SLOT RESERVED</span>
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginTop: '10px', marginBottom: '6px' }}>
            Official Event Registration Pass
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '580px', margin: '0 auto' }}>
            Software Freedom Day 2026 • Department of Computer Science & Engineering, Jaya Engineering College.
          </p>

          {/* Registration Pass ID Badge */}
          <div style={{ marginTop: '18px' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registration Pass ID
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '8px 0 4px' }}>
              <div className="reg-id-display">{registration.registrationId}</div>
              <button
                type="button"
                onClick={handleCopyId}
                className="btn-copy-id no-print"
                title="Copy Registration ID"
              >
                {copiedId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              </button>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)', display: 'block' }}>
              Present this Pass ID at the reception desk on event day.
            </span>
          </div>
        </div>

        {/* PAYMENT RECEIPT HIGHLIGHT BOX */}
        <div className="conf-receipt-box">
          <div className="conf-receipt-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={18} color="#10b981" />
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                UPI Payment & Fee Receipt
              </span>
            </div>
            <span className="conf-receipt-verified">
              <CheckCircle size={13} />
              <span>Payment Recorded</span>
            </span>
          </div>

          <div className="conf-receipt-grid">
            <div>
              <span className="conf-receipt-lbl">Amount Paid</span>
              <span className="conf-receipt-val amount">₹{paidAmount}</span>
              <span className="conf-receipt-sub">
                (₹{paidAmount / (registration.teamSize || 1)} per head × {registration.teamSize || 1} {registration.teamSize > 1 ? 'members' : 'participant'})
              </span>
            </div>

            <div>
              <span className="conf-receipt-lbl">UPI Transaction ID (UTR)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span className="conf-receipt-val utr">{utrDisplay}</span>
                {utrDisplay !== 'SUBMITTED' && (
                  <button
                    type="button"
                    onClick={handleCopyUtr}
                    className="btn-copy-mini no-print"
                    title="Copy UTR Number"
                  >
                    {copiedUtr ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
              <span className="conf-receipt-sub">12-Digit Reference</span>
            </div>

            {registration.payerName && (
              <div>
                <span className="conf-receipt-lbl">Payer Name</span>
                <span className="conf-receipt-val" style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>
                  {registration.payerName}
                </span>
                <span className="conf-receipt-sub">GPay / PhonePe Account</span>
              </div>
            )}

            <div>
              <span className="conf-receipt-lbl">Payment Status</span>
              <span className="conf-receipt-val" style={{ fontSize: '0.92rem', color: '#10b981' }}>
                Verified & Confirmed
              </span>
              <span className="conf-receipt-sub">{registration.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="conf-specs-grid">
          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Event Track
            </span>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginTop: '2px' }}>{registration.eventName}</h4>
          </div>

          {isTeam && (
            <div>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
                Team Name & Size
              </span>
              <h4 style={{ fontSize: '1rem', color: '#38bdf8', marginTop: '2px' }}>
                {registration.teamName} ({registration.teamSize} Members)
              </h4>
            </div>
          )}

          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Registration Timestamp
            </span>
            <h4 style={{ fontSize: '0.92rem', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {registration.timestamp}
            </h4>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Institution / College
            </span>
            <h4 style={{ fontSize: '0.92rem', color: '#fff', marginTop: '2px' }}>
              {registration.teamLeader?.college}
            </h4>
          </div>
        </div>

        {/* Team Roster */}
        <div className="conf-team-roster">
          <h4 style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '10px', fontFamily: 'var(--font-mono)' }}>
            REGISTERED PARTICIPANT DETAILS
          </h4>

          <div style={{ background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', overflow: 'hidden' }}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Participant Name</th>
                  <th>Role / Designation</th>
                  <th>Institution</th>
                </tr>
              </thead>
              <tbody>
                {(registration.members || [registration.teamLeader]).map((m, idx) => (
                  <tr key={idx}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{idx + 1}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                    <td style={{ fontSize: '0.82rem', color: idx === 0 && isTeam ? '#10b981' : '#94a3b8' }}>
                      {idx === 0 && isTeam ? 'Team Leader (Primary Contact)' : (isTeam ? `Team Member ${idx + 1}` : 'Participant')}
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      {m.college || registration.teamLeader?.college}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes for Printout */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>🏛️ Department of CSE, Jaya Engineering College, Thirunindravur, Chennai</div>
          <div>Fee Paid: <strong style={{ color: '#10b981' }}>₹{paidAmount}</strong> • UTR: <strong style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>{utrDisplay}</strong></div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="reg-actions-row no-print" style={{ justifyContent: 'center', gap: '16px' }}>
        <button type="button" className="btn-wizard-next" onClick={handlePrint} style={{ padding: '13px 28px' }}>
          <Printer size={16} />
          <span>Print / Download Official Pass</span>
        </button>

        <button type="button" className="btn-wizard-back" onClick={onReset}>
          <span>Register Another Track</span>
        </button>

        {onBackToHome && (
          <button type="button" className="btn-wizard-back" onClick={onBackToHome}>
            <ArrowLeft size={16} />
            <span>Return to SFD 2026 Home</span>
          </button>
        )}
      </div>
    </div>
  );
}
