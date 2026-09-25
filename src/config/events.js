/**
 * Client-Side Events Configuration for Software Freedom Day 2026
 * Pure data structure for event selection, dynamic team rendering, and slot tracking.
 */

export const EVENT_TRACKS = [
  {
    key: 'demo-stall',
    name: 'Demo Stall – 1 to 3 Members',
    title: 'Demo Stall',
    tagline: 'Build. Demonstrate. Inspire.',
    trackNumber: '01',
    teamSize: 3,
    minTeamSize: 1,
    maxTeamSize: 3,
    maxSlots: 999999,
    isTeam: true,
    accentColor: '#10b981', // Terminal emerald
    badge: '1 - 3 MEMBERS',
    icon: 'Layers',
    summary: 'Showcase working software projects, open-source utilities, and AI prototypes to industry juries.',
    requirements: [
      'Flexible Team Size: 1 to 3 Members (Solo creators to 3-member teams)',
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
    maxSlots: 999999,
    isTeam: true,
    isClosed: true,
    accentColor: '#3b82f6', // Electric blue
    badge: '1 - 4 MEMBERS',
    icon: 'Terminal',
    summary: 'High-intensity rapid prototyping sprint solving real-world challenges using FOSS stacks.',
    requirements: [
      'Flexible Team Size: 1 to 4 Members (Solo coders to 4-member teams)',
      'Fee: Calculated per member (₹100/head for all colleges)',
      '4-5 hours intensive sprint in computing labs',
      'Code hosted in public open-source Git repo'
    ]
  },
  {
    key: 'poster-design',
    name: 'Poster Design – 1 to 2 Members',
    title: 'Poster Design',
    tagline: 'Design Ideas. Visualize Freedom.',
    trackNumber: '03',
    teamSize: 2,
    minTeamSize: 1,
    maxTeamSize: 2,
    maxSlots: 999999,
    isTeam: true,
    isClosed: true,
    accentColor: '#a855f7', // Violet
    badge: '1 - 2 MEMBERS',
    icon: 'Palette',
    summary: 'Express the philosophy of open source, digital rights, and tech freedom through creative visual design.',
    requirements: [
      'Flexible Team Size: 1 to 2 Members (Solo or 2-member team)',
      'Original visual composition or infocraft',
      'You should use Canva only'
    ]
  },
  {
    key: 'panel-discussion',
    name: 'Panel of Discussion – 1 to 5 Members',
    title: 'Panel of Discussion',
    tagline: 'Think. Question. Defend.',
    trackNumber: '04',
    teamSize: 5,
    minTeamSize: 1,
    maxTeamSize: 5,
    maxSlots: 999999,
    isTeam: true,
    accentColor: '#f59e0b', // Amber
    badge: '1 - 5 MEMBERS',
    icon: 'MessageSquareCode',
    summary: 'Spirited debate deconstructing modern technology ethics, open AI vs closed gatekeepers, and privacy.',
    requirements: [
      'Flexible Team Size: 1 to 5 Members (Solo to 5-member team)',
      'Structured rounds exploring ethics and tech sovereignty',
      'Decorum and factual articulation evaluated by jury'
    ]
  },
  {
    key: 'workshop',
    name: 'Workshop – Individual',
    title: 'Workshop',
    tagline: 'Learn. Build. Explore.',
    trackNumber: '05',
    teamSize: 1,
    maxSlots: 999999,
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
