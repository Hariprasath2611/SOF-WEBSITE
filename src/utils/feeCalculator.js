/**
 * Dynamic Registration Fee Calculator for Software Freedom Day 2026
 * 
 * Fee Structure (Per Head):
 * - External Colleges: ₹200 per head
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

export function calculateEventFee(eventKey, collegeName = '') {
  const isJaya = /jaya/i.test(collegeName.trim());
  const perHeadFee = isJaya ? 100 : 200;
  const membersCount = TEAM_SIZES[eventKey] || 1;
  const totalAmount = perHeadFee * membersCount;

  return {
    perHeadFee,
    membersCount,
    totalAmount,
    isJaya,
    currency: 'INR'
  };
}
