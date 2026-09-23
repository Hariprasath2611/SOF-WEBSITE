/**
 * Software Freedom Day 2026 - Events Configuration
 * Hosted by Department of Computer Science and Engineering, Jaya Engineering College.
 * All event and coordinator information is data-driven and easily configurable.
 */

export const events = [
  {
    id: 1,
    number: "01",
    code: "DEMO-STALL",
    repo: "sfd-2026/demo-stall",
    title: "Demo Stall",
    tagline: "Build. Demonstrate. Inspire.",
    icon: "Layers",
    color: "#10b981", // Terminal green
    summary: "Showcase your working software projects, open-source contributions, developer tools, AI applications, and prototypes to peers and industry juries.",
    description: "The Demo Stall provides an interactive stage for student creators and open-source enthusiasts to exhibit live working applications, prototypes, developer utilities, and AI innovations. Engage in real-time demonstrations, receive critical technical feedback, and inspire the open-source community.",
    teamSize: "1 - 3 Members per team",
    duration: "Full Day Exhibition & Jury Evaluation",
    venue: "CSE Department Innovation Lab / Main Quadrangle",
    registrationLink: "#register?track=demo-stall",
    topics: [
      "Open Source Software & Tools",
      "Web & Mobile Applications",
      "AI / Machine Learning Projects",
      "Developer Tools & CLI Utilities",
      "IoT & Embedded Linux Systems"
    ],
    rules: [
      "All projects must feature working demonstrations running on laptops, mobile, or hardware kits.",
      "Open-source projects with public repositories (GitHub/GitLab) are highly encouraged and awarded bonus points.",
      "Participants must carry their own laptops, test devices, and required adapters.",
      "Each team will be provided with power supply and Wi-Fi access.",
      "Evaluation is based on innovation, open-source relevance, technical architecture, and demonstration clarity."
    ],
    coordinator: {
      name: "D Hariprasath",
      role: "Demo Stall Coordinator",
      department: "Dept of CSE",
      photo: "/coordinators/d-hariprasath.jpg",
      phone: "+919790851329",
      email: "demostall.sfd2026@gmail.com"
    }
  },
  {
    id: 2,
    number: "02",
    code: "MINI-HACKATHON",
    repo: "sfd-2026/mini-hackathon",
    title: "Mini Hackathon",
    tagline: "Code. Collaborate. Create.",
    icon: "Terminal",
    color: "#3b82f6", // Electric blue
    summary: "A high-intensity rapid prototyping sprint to solve real-world problems using free and open-source software stacks.",
    description: "The Mini Hackathon is a time-boxed sprint challenging engineering minds to ideate, architect, and ship functional open-source solutions under rapid constraints. Teams collaborate dynamically, leveraging modern FOSS libraries, APIs, and frameworks to crack problem statements.",
    eligibility: "Open to solo coders and teams up to 4 members from ANY engineering discipline.",
    teamSize: "1 - 4 Members per team (Solo or Squad)",
    duration: "4 - 5 Hours Intensive Sprint",
    venue: "Computing Center Lab 2 & 3",
    registrationLink: "#register?track=mini-hackathon",
    topics: [
      "Open Source Developer Productivity",
      "Campus Automation & Student Utilities",
      "Decentralized & Community Tech",
      "Accessibility & Digital Inclusivity",
      "Eco-Tech & Smart Sustainability"
    ],
    rules: [
      "Participants have the complete freedom to build any project of their choice. You can build your prototype beforehand and bring it to the hackathon.",
      "Solutions must be published to a public Git repository with an open-source license (MIT, Apache 2.0, GPL, etc.).",
      "Use of open-source frameworks, libraries, and boilerplates is highly encouraged.",
      "Final submissions must include a README.md and a 3-minute live pitch to the panel.",
      "Judging criteria: Problem-solution fit, code quality, open-source spirit, and functional demo."
    ],
    coordinator: {
      name: "Nishanth",
      role: "Mini Hackathon Coordinator",
      department: "Dept of CSE",
      photo: "/coordinators/nishanth.jpg",
      phone: "+919025877663",
      email: "hackathon.sfd2026@gmail.com"
    }
  },
  {
    id: 3,
    number: "03",
    code: "POSTER-DESIGNING",
    repo: "sfd-2026/poster-design",
    title: "Poster Designing",
    tagline: "Design Ideas. Visualize Freedom.",
    icon: "Palette",
    color: "#a855f7", // Violet
    summary: "Express the philosophy of open source, digital rights, and technology freedom through compelling visual design.",
    description: "Visual communication is vital to championing developer rights, software autonomy, and open-source philosophy. In this design track, participants produce impactful visual posters, infocraft, or UI concept art advocating digital freedom and technology democratization.",
    eligibility: "Open to creative engineering students from all departments and years.",
    teamSize: "Individual or 2 Members per team",
    duration: "2.5 Hours",
    venue: "Design Studio / Multimedia Lab",
    registrationLink: "#register?track=poster-design",
    topics: [
      "Philosophy of Software Freedom & FOSS",
      "Open Source vs Proprietary Monopolies",
      "Decentralization & Data Sovereignty",
      "The Evolution of Linux & Community Power",
      "Open Science, Open Data, Open Future"
    ],
    rules: [
      "You should use Canva only.",
      "Posters must be original work created during the designated event timeframe.",
      "Plagiarism or uncredited asset usage leads to immediate disqualification.",
      "Designers must explain the visual storytelling and concept during jury inspection.",
      "Judged on creativity, visual impact, thematic relevance to Software Freedom, and typography."
    ],
    coordinator: {
      name: "Rajeshwari",
      role: "Poster Design Coordinator",
      department: "Dept of CSE",
      photo: "/coordinators/Rajeshwari.jpeg",
      phone: "+919884256512",
      email: "poster.sfd2026@gmail.com"
    }
  },
  {
    id: 4,
    number: "04",
    code: "FOSS-WORKSHOP",
    repo: "sfd-2026/workshop",
    title: "Workshop",
    tagline: "Learn. Build. Explore.",
    icon: "Cpu",
    color: "#06b6d4", // Cyan
    summary: "Hands-on technical workshop deep-diving into modern Linux, Git workflows, FOSS tooling, and open-source contribution.",
    description: "An intensive masterclass designed to take students from command-line novices to confident open-source contributors. Participants will master Git branching strategies, modern Linux terminal environments, open development pipelines, and collaborative workflows used by world-class software teams.",
    eligibility: "Open to all engineering students wanting practical developer superpowers.",
    teamSize: "Individual Participation",
    duration: "2 Hours Interactive Session",
    venue: "CSE Seminar Hall & Hands-on Terminal Lab",
    registrationLink: "#register?track=workshop",
    topics: [
      "Linux Command Line Mastery & Bash Scripting",
      "Git Internals, Rebase, Branching & Pull Requests",
      "Navigating & Contributing to GitHub / GitLab Repos",
      "Docker & Containerization for Open Development",
      "Open Source AI Models & Local Tooling"
    ],
    rules: [
      "Participants are encouraged to bring laptops with Linux installed or WSL2 / Terminal ready.",
      "Interactive coding exercises will be conducted with real-time peer mentorship.",
      "Participation certificates awarded upon completion of hands-on challenge modules.",
      "Seats are allocated on a first-come, first-served basis."
    ],
    coordinator: {
      name: "Ram siva Sundara Karthikeyan",
      role: "Workshop Coordinator",
      department: "Dept of CSE",
      photo: "/coordinators/Ram-siva-sundara-Karthikeyan.jpeg",
      phone: "+917305077196",
      email: "workshop.sfd2026@gmail.com"
    }
  },
  {
    id: 5,
    number: "05",
    code: "TECH-DEBATE",
    repo: "sfd-2026/debate",
    title: "Debate & Discussion Panel",
    tagline: "Think. Question. Defend.",
    icon: "MessageSquareCode",
    color: "#f59e0b", // Amber
    summary: "Spirited battle of intellect debating pivotal technology ethics, open vs closed AI, software patents, and digital privacy.",
    description: "Step into the arena of critical thought. The Debate event pits articulate technical minds against one another in structured parliamentary-style rounds, deconstructing the most urgent ethical, philosophical, and systemic dilemmas confronting modern technology and developer freedom.",
    eligibility: "Open to all engineering students passionate about tech discourse and policy.",
    teamSize: "1 - 5 Members per team",
    duration: "3 Rounds (Preliminary, Semi-Finals, Finals)",
    venue: "Auditorium Annex / Conference Hall",
    registrationLink: "#register?track=panel-discussion",
    topics: [
      "Open Weights vs Closed Gatekeepers: The Future of Frontier AI",
      "Right to Repair & Hardware Sovereignty in the IoT Age",
      "Software Patents: Innovation Engine or Monopoly Defense?",
      "Can Open Source Remain Truly Sustainable Without Commercialization?",
      "Privacy as a Fundamental Right vs National Security Surveillance"
    ],
    rules: [
      "Topics and stances (proposition or opposition) will be assigned via draw of lots before each round.",
      "Each team receives preparation time, opening argument time, rebuttal time, and concluding remark slots.",
      "Decorum must be maintained at all times; ad hominem arguments will forfeit points.",
      "Judged on factual knowledge, logical structure, clarity of articulation, rebuttal precision, and poise."
    ],
    coordinator: {
      name: "Rahul Raj",
      role: "Discussion Panel Coordinator",
      department: "Dept of CSE",
      photo: "/coordinators/Rahul Raj.jpeg",
      phone: "+918925529539",
      email: "debate.sfd2026@gmail.com"
    }
  }
];
