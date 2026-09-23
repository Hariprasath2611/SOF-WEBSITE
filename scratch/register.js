async function run() {
  const payload = {
    eventKey: "panel-discussion",
    teamName: "D hariprasath (Solo)", 
    teamLeader: {
      name: "D hariprasath",
      email: "hariprasath@example.com",
      phone: "9999999999",
      college: "Jaya Engineering College",
      department: "Computer Science and engineering",
      year: "3rd year"
    },
    members: [],
    paymentAmount: 100,
    paymentUtr: "626605346790",
    payerName: "D hariprasath"
  };

  try {
    const res = await fetch("http://localhost:5000/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", JSON.stringify(text, null, 2));
  } catch (err) {
    console.error(err);
  }
}

run();
