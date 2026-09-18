import React from 'react';
import { CheckCircle, Printer, ArrowLeft, Calendar, MapPin, Building, Users, ShieldCheck } from 'lucide-react';

export default function ConfirmationPass({ registration, onReset, onBackToHome }) {
  if (!registration) return null;

  const handlePrint = () => {
    window.print();
  };

  const isTeam = registration.teamSize > 1;

  return (
    <div className="confirmation-step">
      <div className="confirmation-card">
        <div className="conf-header">
          <div className="conf-success-icon">
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
            Registration Confirmed!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.92rem' }}>
            Your slot has been reserved for Software Freedom Day 2026 at Jaya Engineering College.
          </p>

          <div style={{ marginTop: '16px' }}>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'block', textTransform: 'uppercase' }}>
              Official Registration Pass ID
            </span>
            <div className="reg-id-display">{registration.registrationId}</div>
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              Please save or print this Registration ID for venue entrance.
            </span>
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

          <div>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              Fee & UPI Ref (UTR)
            </span>
            <h4 style={{ fontSize: '0.92rem', color: '#10b981', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              ₹{registration.paymentAmount || 0} • {registration.paymentUtr || 'VERIFIED'}
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
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Year</th>
                </tr>
              </thead>
              <tbody>
                {(registration.members || [registration.teamLeader]).map((m, idx) => (
                  <tr key={idx}>
                    <td><span style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>{idx + 1}</span></td>
                    <td style={{ fontWeight: 600 }}>{m.name} {idx === 0 && isTeam ? '(Leader)' : ''}</td>
                    <td>{m.email}</td>
                    <td>{m.department}</td>
                    <td>{m.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes for Printout */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>🏛️ Department of CSE, Jaya Engineering College, Thirunindravur, Chennai</div>
          <div>Payment: <strong style={{ color: '#10b981' }}>₹{registration.paymentAmount || 0} (UTR: {registration.paymentUtr || 'VERIFIED'})</strong></div>
        </div>
      </div>

      {/* Action Buttons (Hidden when printing) */}
      <div className="reg-actions-row no-print" style={{ justifyContent: 'center', gap: '16px' }}>
        <button type="button" className="btn-wizard-next" onClick={handlePrint} style={{ padding: '13px 28px' }}>
          <Printer size={16} />
          <span>Print / Download Confirmation</span>
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
