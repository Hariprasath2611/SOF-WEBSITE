import React, { useState, useEffect } from 'react';
import { fetchEvents, submitRegistration } from '../services/api';
import EventSelector from '../components/registration/EventSelector';
import DynamicRegistrationForm from '../components/registration/DynamicRegistrationForm';
import RegistrationSummary from '../components/registration/RegistrationSummary';
import ConfirmationPass from '../components/registration/ConfirmationPass';
import { ArrowLeft, Shield, Sparkles, Check } from 'lucide-react';

const STEPS = [
  { step: 1, label: 'Choose Track' },
  { step: 2, label: 'Participant Info' },
  { step: 3, label: 'Review & Confirm' },
  { step: 4, label: 'Pass Issued' }
];

export default function RegistrationPage({ onBackToHome, preselectedTrack = null }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedEventKey, setSelectedEventKey] = useState(preselectedTrack || '');
  const [eventsStats, setEventsStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmedRegistration, setConfirmedRegistration] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    teamName: '',
    teamLeader: {
      name: '',
      email: '',
      college: '',
      department: '',
      year: ''
    },
    members: []
  });

  // Load live slot statistics
  const refreshSlots = async () => {
    try {
      setLoadingStats(true);
      const data = await fetchEvents();
      setEventsStats(data);
    } catch (err) {
      console.warn('Failed to fetch live slots from backend:', err.message);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    refreshSlots();
  }, []);

  // When preselected track is passed from home event card
  useEffect(() => {
    if (preselectedTrack) {
      setSelectedEventKey(preselectedTrack);
      setCurrentStep(2);
    }
  }, [preselectedTrack]);

  // Handle final submission
  const handleSubmitRegistration = async (paymentData = {}) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        eventKey: selectedEventKey,
        teamName: formData.teamName,
        teamLeader: formData.teamLeader,
        members: formData.members,
        paymentAmount: paymentData.paymentAmount,
        paymentUtr: paymentData.paymentUtr,
        payerName: paymentData.payerName,
        paymentStatus: paymentData.paymentStatus || 'SUBMITTED'
      };

      const result = await submitRegistration(payload);
      setConfirmedRegistration(result);
      setCurrentStep(4);
      // Refresh slot counts in background
      refreshSlots();
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please check your network or try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset for another registration
  const handleReset = () => {
    setSelectedEventKey('');
    setFormData({
      teamName: '',
      teamLeader: { name: '', email: '', college: '', department: '', year: '' },
      members: []
    });
    setConfirmedRegistration(null);
    setCurrentStep(1);
    refreshSlots();
  };

  // Calculate progress width
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="reg-page-container">
      <div className="reg-inner-wrapper">
        {/* Navigation Bar / Return to Home */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          {onBackToHome && (
            <button
              type="button"
              className="btn-wizard-back"
              onClick={onBackToHome}
              style={{ padding: '8px 16px', fontSize: '0.82rem' }}
            >
              <ArrowLeft size={14} />
              <span>SFD 2026 Home</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            <Shield size={14} color="#00f0ff" />
            <span className="hide-on-mobile">Secure Verification System</span>
          </div>
        </div>

        {/* Header Branding */}
        <header className="reg-portal-header no-print">
          <div className="reg-brand-tag">
            <Sparkles size={14} />
            <span>Official Event Portal • SFD 2026</span>
          </div>
          <h1 className="reg-portal-title">JEC EVENT REGISTRATION</h1>
          <p className="reg-portal-subtitle">
            Department of Computer Science and Engineering, Jaya Engineering College.
            Register your team or reserve your individual masterclass seat below.
          </p>
        </header>

        {/* Stepper Progress Bar */}
        <div className="reg-stepper no-print">
          <div className="reg-stepper-progress" style={{ width: `calc(${progressPercent}% * 0.9)` }} />
          {STEPS.map((s) => {
            const isCompleted = currentStep > s.step;
            const isActive = currentStep === s.step;

            return (
              <div key={s.step} className={`reg-step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="reg-step-circle">
                  {isCompleted ? <Check size={16} /> : s.step}
                </div>
                <span className="reg-step-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Main Content Panel */}
        <div className="reg-card-panel">
          {currentStep === 1 && (
            <EventSelector
              eventsStats={eventsStats}
              selectedEventKey={selectedEventKey}
              onSelectEvent={(key) => setSelectedEventKey(key)}
              onProceed={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <DynamicRegistrationForm
              selectedEventKey={selectedEventKey}
              formData={formData}
              onUpdateFormData={setFormData}
              onBack={() => setCurrentStep(1)}
              onProceed={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <RegistrationSummary
              selectedEventKey={selectedEventKey}
              formData={formData}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleSubmitRegistration}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}

          {currentStep === 4 && (
            <ConfirmationPass
              registration={confirmedRegistration}
              onReset={handleReset}
              onBackToHome={onBackToHome}
            />
          )}
        </div>
      </div>
    </div>
  );
}
