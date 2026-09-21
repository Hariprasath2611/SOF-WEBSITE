import React, { useState } from 'react';
import { Users, User, ArrowLeft, ArrowRight, AlertCircle, Building2, BookOpen, GraduationCap, Mail } from 'lucide-react';
import { getTrackConfig } from '../../config/events';

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Other'];

export default function DynamicRegistrationForm({
  selectedEventKey,
  formData,
  onUpdateFormData,
  onBack,
  onProceed
}) {
  const eventConfig = getTrackConfig(selectedEventKey);
  const [errors, setErrors] = useState({});

  if (!eventConfig) return null;

  const isHackathon = selectedEventKey === 'mini-hackathon';
  const isDemoStall = selectedEventKey === 'demo-stall';
  const isFlexible = isHackathon || isDemoStall;
  
  const defaultSize = isHackathon ? 4 : (isDemoStall ? 3 : eventConfig.teamSize);
  const effectiveTeamSize = isFlexible ? (Number(formData.teamSize) || (formData.members && formData.members.length > 0 ? formData.members.length + 1 : defaultSize)) : eventConfig.teamSize;
  const remainingMembersCount = isFlexible ? Math.max(0, effectiveTeamSize - 1) : Math.max(0, eventConfig.teamSize - 1);

  const handleFlexibleSizeChange = (newSize) => {
    const currentMembers = [...(formData.members || [])];
    const newMemberSlots = newSize - 1;
    const updatedMembers = currentMembers.slice(0, newMemberSlots);
    while (updatedMembers.length < newMemberSlots) {
      updatedMembers.push({ name: '' });
    }
    onUpdateFormData({
      ...formData,
      teamSize: newSize,
      members: updatedMembers
    });
  };

  // Validation helper
  const validateForm = () => {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 1. Team Name validation for team events (optional for solo hackathon)
    if (eventConfig.isTeam) {
      if (isFlexible && effectiveTeamSize === 1) {
        // Optional for solo participant
      } else {
        if (!formData.teamName || formData.teamName.trim().length < 2) {
          errs.teamName = 'Team Name is required (minimum 2 characters)';
        }
      }
    }

    // 2. Team Leader / Participant validation
    const leader = formData.teamLeader || {};
    if (!leader.name || leader.name.trim().length < 2) {
      errs['leader_name'] = 'Full Name is required (minimum 2 characters)';
    }
    if (!leader.email || !emailRegex.test(leader.email.trim())) {
      errs['leader_email'] = 'A valid email address is required';
    }
    if (!leader.phone || leader.phone.trim().length < 10) {
      errs['leader_phone'] = 'A valid 10-digit mobile number is required';
    }
    if (!leader.college || leader.college.trim().length < 2) {
      errs['leader_college'] = 'College / Institution name is required';
    }
    if (!leader.department || leader.department.trim().length < 2) {
      errs['leader_department'] = 'Department is required';
    }
    if (!leader.year) {
      errs['leader_year'] = 'Please select Year of Study';
    }

    // 3. Team Members validation: ONLY Full Name is required for active members
    if (eventConfig.isTeam && remainingMembersCount > 0) {
      for (let i = 0; i < remainingMembersCount; i++) {
        const m = (formData.members && formData.members[i]) || {};
        if (!m.name || m.name.trim().length < 2) {
          errs[`member_${i}_name`] = `Member ${i + 2}: Full Name is required`;
        }
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLeaderChange = (field, val) => {
    onUpdateFormData({
      ...formData,
      teamLeader: {
        ...formData.teamLeader,
        [field]: val
      }
    });
    if (errors[`leader_${field}`]) {
      setErrors((prev) => ({ ...prev, [`leader_${field}`]: null }));
    }
  };

  const handleMemberChange = (index, field, val) => {
    const updatedMembers = [...(formData.members || [])];
    updatedMembers[index] = {
      ...(updatedMembers[index] || {}),
      [field]: val
    };
    onUpdateFormData({
      ...formData,
      members: updatedMembers
    });
    if (errors[`member_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`member_${index}_${field}`]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // If solo participant and teamName is empty, auto-fill nicely
      if (isFlexible && effectiveTeamSize === 1 && (!formData.teamName || !formData.teamName.trim())) {
        const fallbackName = `${(formData.teamLeader?.name || 'Solo').trim()} (Solo)`;
        onUpdateFormData({
          ...formData,
          teamName: fallbackName,
          teamSize: 1,
          members: []
        });
      }
      onProceed();
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '24px' }}>
        <span className="card-track-number" style={{ marginRight: '8px' }}>
          TRACK {eventConfig.trackNumber}
        </span>
        <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', display: 'inline' }}>
          {eventConfig.name}
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
          {isFlexible
            ? `Flexible Team Track: You can compete solo (1 member) or form a team up to ${eventConfig.maxTeamSize} members. Pricing is calculated per member entered.`
            : eventConfig.isTeam
            ? `Please enter details for your team of ${eventConfig.teamSize}. All members will receive individual certificates.`
            : 'Please enter your participant details for the hands-on workshop.'}
        </p>
      </div>

      {/* FLEXIBLE TEAM SIZE SELECTOR */}
      {isFlexible && (
        <div style={{ background: 'rgba(59, 130, 246, 0.07)', border: '1px solid rgba(59, 130, 246, 0.28)', padding: '16px 20px', borderRadius: '12px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontWeight: 700, color: '#93c5fd', fontSize: '0.88rem', letterSpacing: '0.02em' }}>
              Select Number of Team Members:
            </span>
            <span style={{ fontSize: '0.76rem', color: '#cbd5e1', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              {isDemoStall ? '₹100/head (All Colleges)' : '₹100/head (All Colleges)'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${eventConfig.maxTeamSize}, 1fr)`, gap: '10px' }}>
            {Array.from({ length: eventConfig.maxTeamSize }, (_, i) => i + 1).map((size) => {
              const isSelected = effectiveTeamSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleFlexibleSizeChange(size)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isSelected ? 'rgba(59, 130, 246, 0.28)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.96rem', fontWeight: 800, color: isSelected ? '#60a5fa' : '#e2e8f0' }}>
                    {size === 1 ? '1 (Solo)' : `${size} Members`}
                  </span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>
                    {size === 1 ? 'Individual' : size === eventConfig.maxTeamSize ? 'Max Squad' : 'Team'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TEAM NAME FIELD (Team events only, optional if solo) */}
      {eventConfig.isTeam && (
        <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '20px', borderRadius: '12px', marginBottom: '24px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="teamName" className="form-label">
              <span>
                Team Name {(!isFlexible || effectiveTeamSize > 1) && <span className="required-asterisk">*</span>}
              </span>
              <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {isFlexible && effectiveTeamSize === 1 ? 'Optional for solo participant' : 'Unique identifier for your squad'}
              </span>
            </label>
            <input
              id="teamName"
              type="text"
              className={`form-input ${errors.teamName ? 'has-error' : ''}`}
              placeholder={isFlexible && effectiveTeamSize === 1 ? 'e.g. Solo Participant (Optional)' : 'e.g. Linux Wizards / Kernel Hackers'}
              value={formData.teamName || ''}
              onChange={(e) => {
                onUpdateFormData({ ...formData, teamName: e.target.value });
                if (errors.teamName) setErrors((prev) => ({ ...prev, teamName: null }));
              }}
            />
            {errors.teamName && (
              <span className="form-error-msg">
                <AlertCircle size={13} /> {errors.teamName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* TEAM LEADER / PARTICIPANT FORM */}
      <div className="form-section-title">
        <User size={18} color="var(--accent-green)" />
        <span>{eventConfig.isTeam ? 'Team Leader Information (Primary Contact)' : 'Participant Information'}</span>
      </div>

      <div className="form-grid-2col">
        <div className="form-group">
          <label className="form-label">
            <span>Full Name <span className="required-asterisk">*</span></span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.leader_name ? 'has-error' : ''}`}
            placeholder="e.g. D Hariprasath"
            value={formData.teamLeader?.name || ''}
            onChange={(e) => handleLeaderChange('name', e.target.value)}
          />
          {errors.leader_name && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_name}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Email Address <span className="required-asterisk">*</span></span>
          </label>
          <input
            type="email"
            className={`form-input ${errors.leader_email ? 'has-error' : ''}`}
            placeholder="e.g. hariprasath@gmail.com"
            value={formData.teamLeader?.email || ''}
            onChange={(e) => handleLeaderChange('email', e.target.value)}
          />
          {errors.leader_email && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_email}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Mobile Phone Number <span className="required-asterisk">*</span></span>
          </label>
          <input
            type="tel"
            className={`form-input ${errors.leader_phone ? 'has-error' : ''}`}
            placeholder="e.g. 9876543210"
            maxLength={14}
            value={formData.teamLeader?.phone || ''}
            onChange={(e) => handleLeaderChange('phone', e.target.value)}
          />
          {errors.leader_phone && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_phone}
            </span>
          )}
        </div>

        <div className="form-group full-width">
          <label className="form-label">
            <span>College / Institution <span className="required-asterisk">*</span></span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.leader_college ? 'has-error' : ''}`}
            placeholder="e.g. Jaya Engineering College"
            value={formData.teamLeader?.college || ''}
            onChange={(e) => handleLeaderChange('college', e.target.value)}
          />
          {errors.leader_college && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_college}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Department <span className="required-asterisk">*</span></span>
          </label>
          <input
            type="text"
            className={`form-input ${errors.leader_department ? 'has-error' : ''}`}
            placeholder="e.g. Computer Science and Engineering"
            value={formData.teamLeader?.department || ''}
            onChange={(e) => handleLeaderChange('department', e.target.value)}
          />
          {errors.leader_department && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_department}
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Year of Study <span className="required-asterisk">*</span></span>
          </label>
          <select
            className={`form-select ${errors.leader_year ? 'has-error' : ''}`}
            value={formData.teamLeader?.year || ''}
            onChange={(e) => handleLeaderChange('year', e.target.value)}
          >
            <option value="">Select Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {errors.leader_year && (
            <span className="form-error-msg">
              <AlertCircle size={13} /> {errors.leader_year}
            </span>
          )}
        </div>
      </div>

      {/* TEAM MEMBERS (MEMBER 2 to MEMBER N) - ONLY NAME REQUIRED */}
      {eventConfig.isTeam && remainingMembersCount > 0 && (
        <div style={{ marginTop: '28px' }}>
          <div className="form-section-title">
            <Users size={18} color="#38bdf8" />
            <span>Team Members ({remainingMembersCount} Additional {remainingMembersCount === 1 ? 'Member' : 'Members'})</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginTop: '-12px', marginBottom: '18px' }}>
            Only full names are required for team members. Contact, email, and college details are taken from the Team Leader.
          </p>

          {Array.from({ length: remainingMembersCount }).map((_, idx) => {
            const memberNumber = idx + 2;
            const currentMember = (formData.members && formData.members[idx]) || {};

            return (
              <div key={idx} className="member-subcard">
                <div className="member-subcard-header">
                  <span>TEAM MEMBER {memberNumber}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Participant #{memberNumber}</span>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">
                    <span>Full Name <span className="required-asterisk">*</span></span>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      As per College ID card
                    </span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors[`member_${idx}_name`] ? 'has-error' : ''}`}
                    placeholder={`e.g. Member ${memberNumber} full name`}
                    value={currentMember.name || ''}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                  />
                  {errors[`member_${idx}_name`] && (
                    <span className="form-error-msg">
                      <AlertCircle size={13} /> {errors[`member_${idx}_name`]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Row */}
      <div className="reg-actions-row">
        <button type="button" className="btn-wizard-back" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Events</span>
        </button>

        <button type="submit" className="btn-wizard-next">
          <span>Review Registration</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
