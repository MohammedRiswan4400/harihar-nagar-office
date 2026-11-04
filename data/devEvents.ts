// How the office reacts to real development events posted to the /dev-event hook
// (convex/devEvents.ts). Each reaction gives:
// - badges: status badges shown immediately on the named characters,
// - confront: [initiator, target], a conversation the initiator starts right away,
// - hints: what each character should say about it in their next conversations.

export const DEV_EVENT_TYPES = [
  'git_commit',
  'build_failure',
  'build_success',
  'lint_error',
  'test_failure',
  'error_spike',
  'deployment_success',
  'deployment_failure',
] as const;

type Badge = { description: string; emoji: string };
export type DevEventReaction = {
  label: string;
  badges: Record<string, Badge>;
  confront?: [string, string];
  hints: Record<string, string>;
};

const BUILD_BROKE: DevEventReaction = {
  label: 'The build failed',
  badges: {
    Thomasukutty: { description: 'Build failed! Panicking', emoji: '🚨' },
    'Govindan Kutty': { description: 'Hunting the culprit', emoji: '😡' },
    Appukuttan: { description: 'Is it my fault?', emoji: '😰' },
  },
  confront: ['Govindan Kutty', 'Appukuttan'],
  hints: {
    'Govindan Kutty': 'Scold Appukuttan furiously for breaking the build.',
    Thomasukutty: 'Panic that the broken build will get everyone fired.',
    Appukuttan: 'Nervously ask whether the broken build is your fault.',
    Mahadevan: 'Claim you saw this coming and blame anyone but yourself.',
    Maya: 'Demand to know who broke the build and when it will be fixed.',
  },
};

export const DEV_EVENT_REACTIONS: Record<string, DevEventReaction> = {
  build_failure: BUILD_BROKE,
  test_failure: { ...BUILD_BROKE, label: 'The tests failed' },
  lint_error: {
    label: 'Lint errors were found',
    badges: {
      'Govindan Kutty': { description: 'Lint errors?! Scolding', emoji: '😤' },
      Appukuttan: { description: 'What is a linter?', emoji: '🤔' },
    },
    confront: ['Govindan Kutty', 'Appukuttan'],
    hints: {
      'Govindan Kutty': 'Scold Appukuttan for pushing code full of lint errors.',
      Appukuttan: 'Ask a silly doubt about what lint is and whether it is a kind of dust.',
      Thomasukutty: 'Worry that the lint errors will delay the release.',
      Mahadevan: 'Dismiss the lint errors as small details for small minds.',
      Maya: 'Remind everyone that clean code is part of the definition of done.',
    },
  },
  error_spike: {
    label: 'Production error rates are spiking',
    badges: {
      Thomasukutty: { description: 'Error rate spiking!', emoji: '🔥' },
      Maya: { description: 'Calling an incident review', emoji: '📣' },
    },
    confront: ['Thomasukutty', 'Mahadevan'],
    hints: {
      Thomasukutty: 'Panic loudly about the error spike on the dashboards.',
      Mahadevan: 'Insist the error spike is actually a sign of growth.',
      'Govindan Kutty': 'Grumble that this is what happens when nobody reviews code.',
      Appukuttan: 'Ask whether you can fix the errors by restarting your laptop.',
      Maya: 'Call an incident review and ask for facts, not drama.',
    },
  },
  deployment_failure: {
    label: 'The deployment failed',
    badges: {
      Thomasukutty: { description: 'Deploy failed! Rolling back', emoji: '🧯' },
      'Govindan Kutty': { description: 'Reading deploy logs', emoji: '🧐' },
    },
    confront: ['Thomasukutty', 'Govindan Kutty'],
    hints: {
      Thomasukutty: 'Panic and beg Govindan Kutty to help roll back the failed deployment.',
      'Govindan Kutty': 'Grimly read the deploy logs and blame the rushed release.',
      Mahadevan: 'Pretend the failed deployment was part of your master plan.',
      Appukuttan: 'Ask whether deployment is the same as going on a trip.',
      Maya: 'Ask for a rollback plan and a root cause before lunch.',
    },
  },
  deployment_success: {
    label: 'The deployment succeeded',
    badges: {
      Mahadevan: { description: 'Taking credit for the deploy', emoji: '😎' },
      Thomasukutty: { description: 'Deploy succeeded, relieved', emoji: '😮‍💨' },
    },
    confront: ['Mahadevan', 'Maya'],
    hints: {
      Mahadevan: 'Take full credit for the successful deployment and show off to Maya.',
      Maya: 'Point out dryly that Mahadevan did none of the work for this deployment.',
      Thomasukutty: 'Be hugely relieved the deployment worked, but worry it will break later.',
      'Govindan Kutty': 'Grudgingly admit the deployment went fine.',
      Appukuttan: 'Ask if a successful deployment means there will be cake.',
    },
  },
  build_success: {
    label: 'The build passed',
    badges: { Appukuttan: { description: 'Build is green! Celebrating', emoji: '🥳' } },
    hints: {
      Appukuttan: 'Celebrate the green build as if you personally fixed everything.',
      'Govindan Kutty': 'Warn that a green build does not mean the code is good.',
      Mahadevan: 'Use the green build to pitch an even bigger roadmap.',
      Thomasukutty: 'Be relieved about the green build for exactly one second.',
      Maya: 'Move the ticket to done and ask what is next.',
    },
  },
  git_commit: {
    label: 'New code was committed',
    badges: { 'Govindan Kutty': { description: 'Reviewing a new commit', emoji: '🔍' } },
    confront: ['Mahadevan', 'Maya'],
    hints: {
      'Govindan Kutty': 'Grumble about the new commit and promise a harsh code review.',
      Mahadevan: 'Brag to Maya about the new commit as if it changes the world.',
      Maya: 'Ask whether the new commit is actually on the sprint board.',
      Appukuttan: 'Ask what a commit is and whether you have to sign something.',
      Thomasukutty: 'Worry that the new commit will break production.',
    },
  },
};

// Unknown event types still get a generic reaction.
export const DEFAULT_DEV_EVENT_REACTION: DevEventReaction = {
  label: 'Something happened in the project',
  badges: { Maya: { description: 'Checking the new update', emoji: '👀' } },
  hints: {
    Maya: 'Ask the team what this update means for the sprint.',
    Mahadevan: 'Spin the update into a grand opportunity.',
    'Govindan Kutty': 'Be suspicious of the update.',
    Thomasukutty: 'Worry about what the update could break.',
    Appukuttan: 'Be confused about the update.',
  },
};

export function devEventReaction(type: string): DevEventReaction {
  return DEV_EVENT_REACTIONS[type] ?? DEFAULT_DEV_EVENT_REACTION;
}

// How long reaction badges stay up, and how long an event stays in conversation context.
export const DEV_EVENT_BADGE_MS = 90_000;
export const DEV_EVENT_CONTEXT_MS = 15 * 60_000;
