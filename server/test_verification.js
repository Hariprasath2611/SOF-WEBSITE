import { registrationService } from './services/registrationService.js';
import { getEventByKey } from './config/events.js';

async function runTests() {
  console.log('--- Starting Backend & Service Verification Tests ---');

  // Test 1: Successful Registration with 12-digit UTR and fee calculation
  const uniqueUtr = '4256' + String(Date.now()).slice(-8);
  console.log(`Test 1: Submitting registration with unique UTR: ${uniqueUtr}...`);

  const reg1 = await registrationService.register({
    eventKey: 'mini-hackathon',
    teamName: 'Cyber Hackers',
    teamLeader: {
      name: 'Praveen K',
      email: `praveen_${Date.now()}@gmail.com`,
      college: 'Jaya Engineering College',
      department: 'CSE',
      year: '3rd Year'
    },
    members: [
      { name: 'Member Two' },
      { name: 'Member Three' },
      { name: 'Member Four' }
    ],
    paymentUtr: uniqueUtr,
    payerName: 'Praveen K',
    paymentStatus: 'SUBMITTED'
  });

  console.log(`✓ Registration created: ID=${reg1.registrationId}`);
  console.log(`✓ Payment Amount: ₹${reg1.paymentAmount} (Expected: ₹400 for 4 members JEC)`);
  console.log(`✓ Payment UTR: ${reg1.paymentUtr}`);

  if (reg1.paymentAmount !== 400) {
    throw new Error(`Test 1 Failed: Expected paymentAmount 400, got ${reg1.paymentAmount}`);
  }
  if (reg1.paymentUtr !== uniqueUtr) {
    throw new Error(`Test 1 Failed: Expected paymentUtr ${uniqueUtr}, got ${reg1.paymentUtr}`);
  }

  // Test 2: Attempt duplicate registration with the EXACT SAME UTR
  console.log('\nTest 2: Attempting duplicate registration with the SAME UTR...');
  try {
    await registrationService.register({
      eventKey: 'poster-design',
      teamName: 'Design Duo',
      teamLeader: {
        name: 'Another Student',
        email: `another_${Date.now()}@gmail.com`,
        college: 'Some Other College',
        department: 'IT',
        year: '2nd Year'
      },
      members: [{ name: 'Partner One' }],
      paymentUtr: uniqueUtr, // REUSING SAME UTR!
      payerName: 'Cheater',
      paymentStatus: 'SUBMITTED'
    });
    throw new Error('Test 2 Failed: Expected DUPLICATE_UTR error, but registration succeeded!');
  } catch (err) {
    if (err.code === 'DUPLICATE_UTR') {
      console.log(`✓ Correctly rejected duplicate UTR: ${err.message}`);
    } else {
      throw err;
    }
  }

  // Test 3: Attempt registration with missing/empty UTR
  console.log('\nTest 3: Attempting registration with empty UTR...');
  try {
    await registrationService.register({
      eventKey: 'workshop',
      teamName: 'N/A',
      teamLeader: {
        name: 'No UTR Student',
        email: `noutr_${Date.now()}@gmail.com`,
        college: 'Jaya Engineering College',
        department: 'CSE',
        year: '1st Year'
      },
      members: [],
      paymentUtr: '',
      paymentStatus: 'SUBMITTED'
    });
    throw new Error('Test 3 Failed: Expected MISSING_UTR error, but registration succeeded!');
  } catch (err) {
    if (err.code === 'MISSING_UTR') {
      console.log(`✓ Correctly rejected missing UTR: ${err.message}`);
    } else {
      throw err;
    }
  }

  // Cleanup: Delete the test registration created in Test 1
  await registrationService.deleteRegistration(reg1.registrationId);
  console.log(`\n✓ Cleaned up test registration ${reg1.registrationId}.`);

  console.log('\n=============================================');
  console.log('🎉 ALL BACKEND VERIFICATION TESTS PASSED 100%!');
  console.log('=============================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
