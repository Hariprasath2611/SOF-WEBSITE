/**
 * Central Event Configuration for Software Freedom Day 2026
 * Defines the 5 distinct events, team sizes, max slots, and Google Sheet mappings.
 */

export const EVENTS = [
  {
    key: 'demo-stall',
    name: 'Demo Stall – 1 to 3 Members',
    title: 'Demo Stall',
    tagline: 'Build. Demonstrate. Inspire.',
    teamSize: 3,
    minTeamSize: 1,
    maxTeamSize: 3,
    maxSlots: 999999,
    isTeam: true,
    sheetEnvKey: 'DEMO_STALL_SHEET_ID',
    sheetName: 'Demo_Stall_Registrations',
    description: 'Exhibition of working open-source software, prototypes, AI utilities, and developer tools.'
  },
  {
    key: 'mini-hackathon',
    name: 'Mini Hackathon – 1 to 4 Members',
    title: 'Mini Hackathon',
    tagline: 'Code. Collaborate. Create.',
    teamSize: 4,
    minTeamSize: 1,
    maxTeamSize: 4,
    maxSlots: 999999,
    isTeam: true,
    isClosed: true,
    sheetEnvKey: 'MINI_HACKATHON_SHEET_ID',
    sheetName: 'Mini_Hackathon_Registrations',
    description: 'Rapid open-source problem-solving sprint under competitive time constraints.'
  },
  {
    key: 'poster-design',
    name: 'Poster Design – 1 to 2 Members',
    title: 'Poster Design',
    tagline: 'Design Ideas. Visualize Freedom.',
    teamSize: 2,
    minTeamSize: 1,
    maxTeamSize: 2,
    maxSlots: 999999,
    isTeam: true,
    isClosed: true,
    sheetEnvKey: 'POSTER_DESIGN_SHEET_ID',
    sheetName: 'Poster_Design_Registrations',
    description: 'Visual advocacy and digital storytelling on technology freedom, FOSS, and data sovereignty.'
  },
  {
    key: 'panel-discussion',
    name: 'Panel of Discussion – 1 to 5 Members',
    title: 'Panel of Discussion',
    tagline: 'Think. Question. Defend.',
    teamSize: 5,
    minTeamSize: 1,
    maxTeamSize: 5,
    maxSlots: 999999,
    isTeam: true,
    sheetEnvKey: 'PANEL_DISCUSSION_SHEET_ID',
    sheetName: 'Panel_of_Discussion_Registrations',
    description: 'Structured parliamentary debate and discussion exploring ethics, open AI, and digital privacy.'
  },
  {
    key: 'workshop',
    name: 'Workshop – Individual',
    title: 'Workshop',
    tagline: 'Learn. Build. Explore.',
    teamSize: 1,
    maxSlots: 999999,
    isTeam: false,
    sheetEnvKey: 'WORKSHOP_SHEET_ID',
    sheetName: 'Workshop_Registrations',
    description: 'Interactive masterclass covering Linux command line, Git branching, and GitHub workflows.'
  }
];

export function getEventByKey(key) {
  return EVENTS.find((e) => e.key === key);
}
