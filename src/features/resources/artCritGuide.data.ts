export interface CritStep {
  n: string;
  title: string;
  body: string;
}

export interface CritExample {
  good: string;
  avoid: string;
}

export const PRINCIPLE = [
  "Honest, kind, specific — in that order. Vague praise helps no one and cruelty dressed as honesty is just cruelty. We critique the work in front of us, never the CV behind it and never the person who made it.",
];

export const FLOW: CritStep[] = [
  {
    n: "01",
    title: "Arrive and settle",
    body: "Coffee first. We start late on purpose so nobody is crit-ing before they have taken their coat off. Bring one work, finished or not.",
  },
  {
    n: "02",
    title: "The maker frames it",
    body: "You get two minutes to say what it is and — if you want — what you are stuck on. You can also say nothing and let the work speak. Both are allowed.",
  },
  {
    n: "03",
    title: "The room responds",
    body: "We go round. Specific observations, then questions, then suggestions if invited. We talk about what is on the wall, not what we would have made instead.",
  },
  {
    n: "04",
    title: "The maker keeps what fits",
    body: "You are never obliged to agree. Take what is useful, leave the rest, and we move to the next work. Long table and food after.",
  },
];

export const EXAMPLES: CritExample[] = [
  {
    good: '"The coral reads as the focal point but the eye keeps getting pulled to the bottom-left corner — is that intended?"',
    avoid:
      '"I love it!" (kind, but not specific — gives the maker nothing to work with.)',
  },
  {
    good: '"The half-finished edge feels alive; finishing it might kill the tension you have got here."',
    avoid:
      '"I would have used a different palette." (about the work you would have made, not theirs.)',
  },
  {
    good: '"What were you trying to do with the negative space? It might be doing more than you think."',
    avoid: '"This isn\'t really working." (a verdict with no door out of it.)',
  },
];
