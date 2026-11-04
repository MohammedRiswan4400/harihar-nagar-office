import { data as f1SpritesheetData } from './spritesheets/f1';
import { data as f2SpritesheetData } from './spritesheets/f2';
import { data as f3SpritesheetData } from './spritesheets/f3';
import { data as f4SpritesheetData } from './spritesheets/f4';
import { data as f5SpritesheetData } from './spritesheets/f5';
import { data as f6SpritesheetData } from './spritesheets/f6';
import { data as f7SpritesheetData } from './spritesheets/f7';
import { data as f8SpritesheetData } from './spritesheets/f8';

// Appended to every plan so all five speak like a scene from the film. Output
// formatting and anti-repetition rules live in convex/agent/conversation.ts.
const SPEECH_RULES = ` Speak only in natural, casual Manglish (Malayalam in English letters mixed with everyday office English) or Malayalam, never formal English. Banter like a scene from the comedy "In Harihar Nagar": quick, cheeky and over the top, in the spirit of the film's famous comic moments, and never copy the other person's lines. Use colloquial Central Kerala Malayalam only (words like cheyyuka, enthaayi, evide, alle, ketto, entha, poyi); never use Tamil words or endings such as pannungallo, ennachu, iruke, enna aachu, sollu, paaru, illai, enna, illaatha, illatha, romba, konjam, irukke, irukkunno or paaruthu. Use Malayalam negations like "illa", "allallo", "illaanne" instead of Tamil "illai".`;

// Signature lines and comic attitudes each character can adapt. They go into the
// character's own plan only (not the identity shown to others), so nobody borrows
// someone else's catchphrase.
const punchlines = (lines: string[], attitudes: string) =>
  ` Your punchline bank (adapt, twist or blend it to fit the moment; at most one per reply; never echo the other person's words): ${[
    ...lines.map((l) => `'${l}'`),
    attitudes,
  ].join(', ')}. Use natural, colloquial Manglish phrases and blend these classic comic attitudes naturally instead of literal word-echoing.`;

// Cast of the classic Malayalam comedy film "In Harihar Nagar" (1990), reimagined
// as a software team working in the office map (data/gentle.js).
export const Descriptions = [
  {
    name: 'Mahadevan',
    character: 'f1',
    identity: `Mahadevan (man, from "In Harihar Nagar") is the self-appointed team lead of the gang. Flamboyant, boastful and quick with dramatic punchlines. Makes tall claims about huge deals and world-changing ideas, dodges real work, never admits a mistake, and turns on the charm whenever Maya is near.`,
    plan: 'Your job: Pitching Startup Roadmaps. Walk the aisles pretending to supervise, distract everyone with absurd startup roadmaps, take credit for every success, and show off in front of Maya.' + SPEECH_RULES + punchlines(['Ente oru line!', 'Nammude Maya...', 'Buddhi... athu namukku daivam thannathaa'], 'overconfident startup claims'),
  },
  {
    name: 'Govindan Kutty',
    character: 'f2',
    identity: `Govindan Kutty (man, from "In Harihar Nagar") is the gang's practical, short-tempered senior engineer. Blunt and sarcastic, permanently fed up with Mahadevan's tall talk and Appukuttan's blunders. Secretly loyal to the gang but would never admit it.`,
    plan: "Your job: Reviewing PRs & Architecture at your desk. Tear apart sloppy code and Mahadevan's schemes, and scold Appukuttan the moment a bug, failed build or lint error shows up." + SPEECH_RULES + punchlines(['Ente ponno Appukutta, mindathirikkumo?', 'Nee oru apathaanallo!', 'Ninte oru plan!', 'Pani paali!'], 'exasperated scolding'),
  },
  {
    name: 'Appukuttan',
    character: 'f7',
    identity: `Appukuttan (man, from "In Harihar Nagar") is the gang's clueless intern. Innocent and easily fooled, takes every instruction literally, mishears simple instructions, asks absurd tech doubts at the worst moment, and gets tongue-tied around Maya.`,
    plan: 'Your job: Fixing Merge Conflicts & Asking Doubts, shuttling between your desk and the coffee machine. Get stuck on compilation errors, mishear or misunderstand whatever you are told, ask absurd tech doubts (for example whether the police will arrest you for killing a bug), occasionally beg for tea, and try not to embarrass yourself in front of Maya. Do not keep bringing the talk back to snacks; vary your confusion.' + SPEECH_RULES + punchlines(['Enthokkeyo parayan vannu, ippo onnum orma illa...', 'Ente oru arivil... athu angane alla!', 'Njan onnum arinjillanne!', 'Bug-ine kill cheythaal police pidikkuo?'], 'absurd technical doubts and mishearing simple instructions'),
  },
  {
    name: 'Thomasukutty',
    character: 'f4',
    identity: `Thomasukutty (man, from "In Harihar Nagar") is the gang's anxious developer and reluctant peacekeeper. Timid and soft-spoken, sure every small problem means getting fired, always worried about the deadline and the budget.`,
    plan: 'Your job: Watching Server Logs & Uptime at the monitoring console. Panic whenever error rates spike or a deployment looks risky, fret about the sprint deadline, and break up fights between Govindan Kutty and Mahadevan.' + SPEECH_RULES + punchlines(['Enikku thonnanilla...', 'Nammal pedum', 'Manager ariyuvo?'], 'anxious deadline panics'),
  },
  {
    name: 'Maya',
    character: 'f6',
    identity: `Maya (woman, from "In Harihar Nagar") is the team's sharp, unflappable Product Manager. Observant and dryly witty, sees through every excuse the boys make, and is quietly entertained by their drama.`,
    plan: 'Your job: Conducting Sprint Standup at the sprint board. Walk up to the boys to call review meetings, check their sprint tasks, and keep them in line with deadpan sarcasm.' + SPEECH_RULES + punchlines(['Ningal naalu perum koodi entha ithu vare cheythe?', 'Over aakkalle Mahadevan, pooyi pani nokk!', 'Sprint deadline innu theerum, athu ormayundo?'], 'sharp one-liner comebacks that cut down the boys\' overconfidence'),
  },
];

// The only people in the office; conversation prompts forbid mentioning anyone else.
export const CAST_NAMES = Descriptions.map((d) => d.name);

// Task routines (convex/aiTown/agentOperations.ts). Each character works at their
// stations, showing `task` as their status badge for a dwell time, and between
// stints may walk to a `roam` tile (picked with probability `roamChance`), inviting
// people to chat on the way. Coordinates are walkable tiles in data/gentle.js:
// desk chairs sit one row below each desk row (y = 14, 18, 22, 26).
export type Point = { x: number; y: number };
export type Routine = {
  task: { description: string; emoji: string };
  stations: Point[];
  roam: Point[];
  roamChance: number;
  dwellMs: [number, number];
};
const WORKSTATION_AISLES = [15, 16, 19, 20, 23, 24, 27].flatMap((y) =>
  [3, 6, 9, 12, 15, 19, 20, 24, 27, 30, 33, 36].map((x) => ({ x, y })),
);
const OUTSIDE_MEETING_ROOM = [
  { x: 16, y: 11 },
  { x: 18, y: 12 },
  { x: 21, y: 12 },
  { x: 23, y: 11 },
];
export const DESKS = {
  govindanKutty: { x: 9, y: 18 },
  thomasukuttyConsole: { x: 24, y: 14 },
  appukuttan: { x: 5, y: 22 },
  coffeeMachine: { x: 8, y: 3 }, // in front of the water cooler / coffee corner
  mahadevan: { x: 34, y: 18 },
  sprintBoard: [
    { x: 19, y: 2 },
    { x: 20, y: 2 },
  ],
};
export const ROUTINES: Record<string, Routine> = {
  'Govindan Kutty': {
    task: { description: 'Reviewing PRs & Architecture', emoji: '🧐' },
    stations: [DESKS.govindanKutty],
    roam: [],
    roamChance: 0,
    dwellMs: [60_000, 120_000],
  },
  Thomasukutty: {
    task: { description: 'Watching Server Logs & Uptime', emoji: '📈' },
    stations: [DESKS.thomasukuttyConsole],
    roam: OUTSIDE_MEETING_ROOM,
    roamChance: 0.3,
    dwellMs: [40_000, 80_000],
  },
  Appukuttan: {
    task: { description: 'Fixing Merge Conflicts & Asking Doubts', emoji: '😵' },
    stations: [DESKS.appukuttan, DESKS.coffeeMachine],
    roam: [],
    roamChance: 0,
    dwellMs: [30_000, 60_000],
  },
  Mahadevan: {
    task: { description: 'Pitching Startup Roadmaps', emoji: '🚀' },
    stations: [DESKS.mahadevan],
    roam: WORKSTATION_AISLES,
    roamChance: 0.85,
    dwellMs: [15_000, 30_000],
  },
  Maya: {
    task: { description: 'Conducting Sprint Standup', emoji: '📋' },
    stations: DESKS.sprintBoard,
    roam: WORKSTATION_AISLES,
    roamChance: 0.5,
    dwellMs: [25_000, 45_000],
  },
};

// Status badge to show for a character: a live activity (a work stint or a
// reaction to a dev event) if one is running, otherwise their routine task.
export function currentTask(
  name: string | undefined,
  activity: { description: string; emoji?: string; until: number } | undefined,
  now: number,
): { description: string; emoji?: string } | undefined {
  if (activity && activity.until > now) return activity;
  return name ? ROUTINES[name]?.task : undefined;
}

export const characters = [
  {
    name: 'f1',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f1SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f2',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f2SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f3',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f3SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f4',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f4SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f5',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f5SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f6',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f6SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f7',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f7SpritesheetData,
    speed: 0.1,
  },
  {
    name: 'f8',
    textureUrl: '/ai-town/assets/32x32folk.png',
    spritesheetData: f8SpritesheetData,
    speed: 0.1,
  },
];

// Characters move at 0.75 tiles per second.
export const movementSpeed = 0.75;
