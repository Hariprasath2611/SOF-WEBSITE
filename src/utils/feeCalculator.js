/**
 * Dynamic Registration Fee Calculator for Software Freedom Day 2026
 * 
 * Fee Structure (Per Head):
 * - External Colleges: ₹100 per head
 * - Jaya Engineering College (Internal): ₹100 per head
 * 
 * Note: Special rates are calculated discretely based on college detection
 * without marketing or advertising it on the website.
 */

export const TEAM_SIZES = {
  'demo-stall': 3,
  'mini-hackathon': 4,
  'poster-design': 2,
  'panel-discussion': 5,
  'workshop': 1
};

export function calculateEventFee(eventKey, collegeName = '', actualMembersCount = null) {
  const isJaya = /(jaya|\bjec\b)/i.test((collegeName || '').trim());
  const perHeadFee = 100;
  const count = Number(actualMembersCount) > 0 ? Number(actualMembersCount) : (TEAM_SIZES[eventKey] || 1);
  const totalAmount = perHeadFee * count;

  return {
    perHeadFee,
    membersCount: count,
    totalAmount,
    isJaya,
    currency: 'INR'
  };
}
