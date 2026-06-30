/** Decorative "unsealing" steps shown after the recipient taps Open invitation. */
export function loaderSteps(inviterFirst: string): string[] {
  return [
    "Verifying your invite code…",
    `Unsealing ${inviterFirst}'s invitation…`,
    "Preparing your welcome…",
  ];
}

/** The three "what this is" promises on the opened invitation card. */
export const WHAT_ITEMS: { strong: string; rest: string }[] = [
  {
    strong: "Private by design.",
    rest: "Invite-only. 247 members. Not trying to grow for growth's sake.",
  },
  {
    strong: "No ads. No algorithm.",
    rest: "A platform that works for you, not for advertisers.",
  },
  {
    strong: "Real community.",
    rest: "Forum, events, a monthly magazine, and a mental health fund.",
  },
];
