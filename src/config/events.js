/**
 * Client-Side Events Configuration for Software Freedom Day 2026
 * Pure data structure for event selection, dynamic team rendering, and slot tracking.
 */

export const EVENT_TRACKS = [
  {
    key: 'demo-stall',
    name: 'Demo Stall – Team of 3',
    title: 'Demo Stall',
    tagline: 'Build. Demonstrate. Inspire.',
    trackNumber: '01',
    teamSize: 3,
    maxSlots: 60,
    isTeam: true,
    accentColor: '#10b981', // Terminal emerald
    badge: 'TEAM OF 3',
    icon: 'Layers',
    summary: 'Showcase working software projects, open-source utilities, and AI prototypes to industry juries.',
    requirements: [
      'Team of exactly 3 members (1 Team Leader + 2 Members)',
      'Capacity: 60 Project Stalls (Open to Jaya CSE, Other Depts & External Colleges)',
      'Live working prototype or application demonstration',
      'Open-source repository (GitHub/GitLab) recommended'
    ]
  },
  {
    key: 'mini-hackathon',
    name: 'Mini Hackathon – 1 to 4 Members',
    title: 'Mini Hackathon',
    tagline: 'Code. Collaborate. Create.',
    trackNumber: '02',
    teamSize: 4,
    minTeamSize: 1,
    maxTeamSize: 4,
    maxSlots: 25,
    isTeam: true,
    accentColor: '#3b82f6', // Electric blue
    badge: '1 - 4 MEMBERS',
    icon: 'Terminal',
    summary: 'High-intensity rapid prototyping sprint solving real-world challenges using FOSS stacks.',
    requirements: [
      'Flexible Team Size: 1 to 4 Members (Solo coders to 4-member teams)',
      'Fee: Calculated per member (₹100/head for Jaya, ₹200/head for External)',
      '4-5 hours intensive sprint in computing labs',
      'Code hosted in public open-source Git repo'
    ]
  },
  {
    key: 'poster-design',
    name: 'Poster Design – Team of 2',
    title: 'Poster Design',
    tagline: 'Design Ideas. Visualize Freedom.',
    trackNumber: '03',
    teamSize: 2,
    maxSlots: 25,
    isTeam: true,
    accentColor: '#a855f7', // Violet
    badge: 'TEAM OF 2',
    icon: 'Palette',
    summary: 'Express the philosophy of open source, digital rights, and tech freedom through creative visual design.',
    requirements: [
      'Team of exactly 2 members (1 Team Leader + 1 Member)',
      'Original visual composition or infocraft',
      'Open-source design tools (GIMP, Inkscape, Penpot) welcomed'
    ]
  },
  {
    key: 'panel-discussion',
    name: 'Panel of Discussion – Team of 5',
    title: 'Panel of Discussion',
    tagline: 'Think. Question. Defend.',
    trackNumber: '04',
    teamSize: 5,
    maxSlots: 10,
    isTeam: true,
    accentColor: '#f59e0b', // Amber
    badge: 'TEAM OF 5',
    icon: 'MessageSquareCode',
    summary: 'Spirited debate deconstructing modern technology ethics, open AI vs closed gatekeepers, and privacy.',
    requirements: [
      'Team of exactly 5 members (1 Team Leader + 4 Members)',
      'Structured rounds exploring ethics and tech sovereignty',
      'Decorum and factual articulation evaluated by jury'
    ]
  },
  {
    key: 'workshop',
    name: 'Workshop – Individual',
    title: 'Hands-on Workshop',
    tagline: 'Learn. Build. Explore.',
    trackNumber: '05',
    teamSize: 1,
    maxSlots: 50,
    isTeam: false,
    accentColor: '#06b6d4', // Cyan
    badge: 'INDIVIDUAL',
    icon: 'Cpu',
    summary: 'Hands-on technical masterclass on Linux command line, Git internals, and open-source contribution.',
    requirements: [
      'Individual registration only (No team fields)',
      'Hands-on interactive lab sessions & mentorship',
      'Participation certificate upon module completion'
    ]
  }
];

export function getTrackConfig(key) {
  return EVENT_TRACKS.find((t) => t.key === key);
}
