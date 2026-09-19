import React, { useState } from 'react';
import { QrCode, Copy, Check, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import { calculateEventFee } from '../../utils/feeCalculator';

export default function PaymentCard({
  eventKey,
  collegeName,
  utrNumber,
  setUtrNumber,
  payerName,
  setPayerName,
  utrError
}) {
  const [copied, setCopied] = useState(false);
  const feeInfo = calculateEventFee(eventKey, collegeName);
  const upiId = 'nishanth7326@oksbi';
  const payeeName = 'Nishanth .I';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Removed &am=${feeInfo.totalAmount} to prevent GPay "limit exceeded" error for personal VPAs
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR&tn=SFD2026_${eventKey}`;

  return (
    <div className="payment-card-box">
      {/* Header */}
      <div className="payment-header-row">
        <div className="payment-title-group">
          <h4>
            <QrCode size={20} color="#10b981" />
            <span>Registration Fee & UPI Payment</span>
          </h4>
          <p>Scan the GPay QR code or transfer directly to complete slot reservation</p>
        </div>

        <div className="payment-amount-badge">
          <span className="payment-amount-val">₹{feeInfo.totalAmount}</span>
          <span className="payment-amount-calc">
            ₹{feeInfo.perHeadFee} × {feeInfo.membersCount} {feeInfo.membersCount > 1 ? 'Participants' : 'Participant'}
          </span>
        </div>
      </div>

      {/* Grid: QR Code + Payment Instructions */}
      <div className="payment-grid-layout">
        {/* Left: Official QR Code */}
        <div className="payment-qr-wrap">
          <div className="qr-code-frame">
            <img
              src="/payment-qr.png"
              alt="SFD 2026 GPay Payment QR Code"
              loading="eager"
            />
          </div>
          <div className="qr-scan-label">
            <Smartphone size={13} color="#10b981" />
            <span>Scan via GPay / Any UPI App</span>
          </div>
        </div>

        {/* Right: UPI Details & Step-by-Step Instructions */}
        <div>
          <div className="upi-info-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8' }}>
              <span>Payee Name:</span>
              <strong style={{ color: '#fff' }}>{payeeName}</strong>
            </div>

            <div className="upi-id-copy-row">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#38bdf8', fontWeight: 600 }}>
                {upiId}
              </span>
              <button type="button" onClick={handleCopyUPI} className="btn-copy-upi">
                {copied ? (
                  <>
                    <Check size={13} color="#10b981" />
                    <span style={{ color: '#10b981' }}>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile 1-Tap UPI Launch */}
            <a href={upiDeepLink} className="btn-pay-upi-mobile">
              <Smartphone size={16} />
              <span>Pay ₹{feeInfo.totalAmount} via GPay / UPI App</span>
            </a>
          </div>

          <ol className="payment-instructions-list">
            <li>Scan the QR code with <strong>Google Pay, PhonePe, Paytm</strong>, or any UPI app.</li>
            <li>Pay exactly <strong>₹{feeInfo.totalAmount}</strong> to complete registration for your team.</li>
            <li>After successful payment, copy the <strong>12-digit UPI Reference / UTR Number</strong> from your payment receipt.</li>
            <li>Paste the UTR number below to confirm and generate your official pass.</li>
          </ol>

          {/* UTR Input Section */}
          <div className="utr-field-box">
            <div className="utr-input-label">
              <span>UPI Transaction ID / UTR Number *</span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                12-digit reference number
              </span>
            </div>

            <input
              type="text"
              className="utr-input-field"
              placeholder="e.g. 425612345678"
              maxLength={18}
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
              required
            />

            {utrError && (
              <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <AlertCircle size={13} />
                <span>{utrError}</span>
              </div>
            )}
          </div>

          {/* Payer Account Name (Optional) */}
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>
              Payer Account Name / GPay Name (Optional)
            </label>
            <input
              type="text"
              className="form-input"
              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
              placeholder="Name as displayed in your GPay"
              value={payerName}
              onChange={(e) => setPayerName(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
