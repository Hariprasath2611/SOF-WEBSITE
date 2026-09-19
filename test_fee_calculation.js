import { calculateEventFee } from './src/utils/feeCalculator.js';

console.log('--- Testing Dynamic Mini Hackathon Fee Calculation ---');

// Test Cases for Mini Hackathon
const tests = [
  // Jaya Engineering College (₹100/head)
  { event: 'mini-hackathon', college: 'Jaya Engineering College', count: 1, expected: 100, label: 'JEC Solo Hacker (1)' },
  { event: 'mini-hackathon', college: 'JEC CSE', count: 2, expected: 200, label: 'JEC 2-Member Team' },
  { event: 'mini-hackathon', college: 'Jaya Engg', count: 3, expected: 300, label: 'JEC 3-Member Team' },
  { event: 'mini-hackathon', college: 'JEC', count: 4, expected: 400, label: 'JEC Full Squad (4)' },

  // External Colleges (₹200/head)
  { event: 'mini-hackathon', college: 'Anna University', count: 1, expected: 200, label: 'External Solo Hacker (1)' },
  { event: 'mini-hackathon', college: 'SRM Institute', count: 2, expected: 400, label: 'External 2-Member Team' },
  { event: 'mini-hackathon', college: 'SSN College of Engg', count: 3, expected: 600, label: 'External 3-Member Team' },
  { event: 'mini-hackathon', college: 'PSG Tech', count: 4, expected: 800, label: 'External Full Squad (4)' },

  // Other Events (Default Static Team Size Fallback)
  { event: 'demo-stall', college: 'Jaya College', count: null, expected: 300, label: 'Demo Stall (3 members JEC)' },
  { event: 'poster-design', college: 'External College', count: null, expected: 400, label: 'Poster Design (2 members Ext)' },
  { event: 'workshop', college: 'JEC', count: null, expected: 100, label: 'Workshop (1 member JEC)' }
];

let allPassed = true;
for (const t of tests) {
  const clientFee = calculateEventFee(t.event, t.college, t.count);
  const clientMatch = clientFee.totalAmount === t.expected;

  if (clientMatch) {
    console.log(`✓ [PASS] ${t.label}: ₹${clientFee.totalAmount}`);
  } else {
    console.error(`✗ [FAIL] ${t.label}: Expected ₹${t.expected}, got Client=₹${clientFee.totalAmount}`);
    allPassed = false;
  }
}

if (!allPassed) {
  process.exit(1);
}

console.log('\n🎉 ALL DYNAMIC FEE CALCULATION TESTS PASSED 100%!');
