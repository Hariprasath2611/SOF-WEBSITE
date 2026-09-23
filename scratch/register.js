const fetch = require('node-fetch'); // Use native fetch in newer node or require node-fetch

async function run() {
  const payload = {
    eventKey: "panel-discussion",
    teamLeader: {
      name: "D hariprasath",
      email: "hariprasath@example.com",
      phone: "9999999999",
      college: "Jaya Engineering College",
      department: "Computer Science and engineering",
      year: "3rd year"
    },
    members: [],
    paymentAmount: 100, // Or whatever the fee is, the backend recalculates it.
    paymentUtr: "626605346790",
    payerName: "D hariprasath"
  };

  try {
    const res = await fetch("https://sof-website-vhai.onrender.com/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error(err);
  }
}

run();
