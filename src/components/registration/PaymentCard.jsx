import React, { useState } from 'react';
import { QrCode, Copy, Check, Smartphone, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { calculateEventFee } from '../../utils/feeCalculator';

export default function PaymentCard({
  eventKey,
  collegeName,
  membersCount = null,
  utrNumber,
  setUtrNumber,
  payerName,
  setPayerName,
  utrError
}) {
  const [copied, setCopied] = useState(false);
  const [showUtrHelp, setShowUtrHelp] = useState(false);
  const feeInfo = calculateEventFee(eventKey, collegeName, membersCount);
  const upiId = 'nishanth7326@oksbi';
  const payeeName = 'Nishanth .I';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleUtrChange = (e) => {
    // Only accept numeric digits, exactly 12 digits max
    const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
    setUtrNumber(val);
  };

  const isUtrComplete = utrNumber.length === 12;

  return (
    <div className="payment-card-box">
      {/* Header with Amount Banner */}
      <div className="payment-header-row">
        <div className="payment-title-group">
          <h4>
            <QrCode size={22} color="#10b981" />
            <span>Registration Fee & UPI Payment Gateway</span>
          </h4>
          <p>Complete the UPI transfer and submit your 12-digit transaction ID (UTR) to reserve your slot</p>
        </div>

        <div className="payment-amount-badge">
          <span className="payment-amount-val">₹{feeInfo.totalAmount}</span>
          <span className="payment-amount-calc">
            ₹{feeInfo.perHeadFee} × {feeInfo.membersCount} {feeInfo.membersCount > 1 ? 'Participants' : 'Participant'}
          </span>
        </div>
      </div>

      {/* Guided 3-Step Payment Flow */}
      <div className="payment-grid-layout">
        {/* Left Column: Official QR Code & Mobile UPI Action */}
        <div className="payment-qr-wrap">
          <div className="qr-code-frame">
            <img
              src="/payment-qr.png"
              alt="SFD 2026 GPay Payment QR Code"
              loading="eager"
            />
          </div>

          <div className="qr-scan-label">
            <Smartphone size={14} color="#10b981" />
            <span>Scan via GPay / PhonePe / Paytm</span>
          </div>


        </div>

        {/* Right Column: UPI Details & Step-by-Step Instructions */}
        <div>
          {/* UPI ID Copy Card */}
          <div className="upi-info-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.84rem' }}>
              <span style={{ color: '#94a3b8' }}>Official Payee:</span>
              <strong style={{ color: '#fff', fontWeight: 700 }}>{payeeName}</strong>
            </div>

            <div className="upi-id-copy-row">
              <div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  UPI ID (VPA)
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.96rem', color: '#38bdf8', fontWeight: 700 }}>
                  {upiId}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="btn-copy-upi"
                title="Copy UPI ID to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={14} color="#10b981" />
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy UPI ID</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Instructions List */}
          <div className="payment-steps-container">
            <div className="payment-step-item">
              <span className="payment-step-num">1</span>
              <span>Scan QR above or open your preferred UPI App (Google Pay, PhonePe, Paytm, BHIM).</span>
            </div>
            <div className="payment-step-item">
              <span className="payment-step-num">2</span>
              <span>
                Transfer exactly <strong style={{ color: '#10b981' }}>₹{feeInfo.totalAmount}</strong> to complete registration.
              </span>
            </div>
            <div className="payment-step-item">
              <span className="payment-step-num">3</span>
              <span>
                Copy the <strong>12-digit UPI Reference / UTR Number</strong> from your payment receipt and paste below.
              </span>
            </div>
          </div>

          {/* UTR Input Section */}
          <div className="utr-field-box">
            <div className="utr-input-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>12-Digit UPI Transaction ID / UTR Number <strong style={{ color: '#ef4444' }}>*</strong></span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontFamily: 'var(--font-mono)',
                    color: isUtrComplete ? '#10b981' : (utrNumber.length > 0 ? '#f59e0b' : '#94a3b8'),
                    fontWeight: 600
                  }}
                >
                  {utrNumber.length}/12 Digits
                </span>

                <button
                  type="button"
                  onClick={() => setShowUtrHelp(!showUtrHelp)}
                  className="btn-utr-help"
                  title="Where to find UTR number"
                >
                  <HelpCircle size={13} />
                  <span>Where to find?</span>
                </button>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className={`utr-input-field ${isUtrComplete ? 'valid-utr' : ''} ${utrError ? 'error-utr' : ''}`}
                placeholder="Enter 12-digit UTR (e.g. 425612345678)"
                maxLength={12}
                value={utrNumber}
                onChange={handleUtrChange}
                inputMode="numeric"
                required
              />

              {isUtrComplete && (
                <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.78rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  <span>Ready</span>
                </div>
              )}
            </div>

            {/* Helper guidance below input */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem' }}>
              {utrNumber.length > 0 && utrNumber.length < 12 ? (
                <span style={{ color: '#f59e0b' }}>
                  Please enter all 12 digits from your receipt ({12 - utrNumber.length} more remaining).
                </span>
              ) : isUtrComplete ? (
                <span style={{ color: '#10b981' }}>
                  ✓ 12-digit reference entered. Verified on final submission.
                </span>
              ) : (
                <span style={{ color: '#94a3b8' }}>
                  Each transaction ID can only be used once. Reusing IDs is prohibited.
                </span>
              )}
            </div>

            {/* Error Message */}
            {utrError && (
              <div className="utr-error-banner">
                <AlertCircle size={15} style={{ flexShrink: 0 }} />
                <span>{utrError}</span>
              </div>
            )}

            {/* Expandable UTR Help Guide */}
            {showUtrHelp && (
              <div className="utr-guide-card">
                <div style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', fontSize: '0.82rem' }}>
                  📍 Where to locate your 12-digit UTR in UPI Apps:
                </div>
                <div className="utr-guide-grid">
                  <div className="utr-guide-item">
                    <strong>Google Pay:</strong>
                    <span>Open payment details → look for <em>"UPI transaction ID"</em> (12 digits).</span>
                  </div>
                  <div className="utr-guide-item">
                    <strong>PhonePe:</strong>
                    <span>View Transaction History → tap payment → check <em>"UTR"</em> (12 digits).</span>
                  </div>
                  <div className="utr-guide-item">
                    <strong>Paytm:</strong>
                    <span>Passbook / Payment Details → look for <em>"UPI Ref No."</em> (12 digits).</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payer Account Name (Optional) */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>
              GPay / PhonePe Account Holder Name (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
              placeholder="Name of person who made the UPI payment"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
