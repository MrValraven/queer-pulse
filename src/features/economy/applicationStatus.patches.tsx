import type { Application, NegotiationAngle } from "./applicationStatus.types";

/* ── Negotiation planner ─────────────────────────────────────────────────── */

/** Levers you can pull in a negotiation — selectable in the planner. */
export const NEGOTIATION_LEVERS = [
  "Base salary",
  "Holiday days",
  "Remote days",
  "Learning budget",
  "Start date",
  "Title & scope",
];

export const NEGOTIATION_PRINCIPLES = [
  "Anchor on the value you bring, never on what you need.",
  "Name one clear number, then go quiet — let them respond.",
  "If base won't move, trade: days, budget, title, flexibility.",
  "Stay warm. This is a relationship, not a transaction.",
];

/** Several ready-to-send counter-offers, each with a distinct strategy. */
export function negotiationAngles(app: Application): NegotiationAngle[] {
  const co = app.companyName;
  const recruiter = app.recruiter?.name.split(" ")[0] ?? "there";
  return [
    {
      id: "collaborative",
      name: "The collaborative ask",
      blurb: "Warm, partnership-first. Best when you already click with them.",
      draft: `Hi ${recruiter} — thank you, I'm genuinely thrilled about ${co} and the scope you've described. I'd love to find a package I can fully commit to, and I was hoping we could bring the base nearer €47k. I'm flexible on how we get there and happy to talk it through — I want this to feel right for both of us.`,
    },
    {
      id: "market",
      name: "The market case",
      blurb: "Data-led and confident. Best with the benchmarks on your side.",
      draft: `Hi ${recruiter} — thank you for the offer; I'm excited about the role. Looking at comparable roles in Lisbon, the mid-point sits noticeably higher, so I'd like to align the base to around €47–48k given the responsibility this position carries. I'm confident in the value I'll bring and happy to walk through my reasoning.`,
    },
    {
      id: "bundle",
      name: "The bundle",
      blurb: "Trade across levers. Best when the salary ceiling is firm.",
      draft: `Hi ${recruiter} — I'd really like to make this work. If there's limited room on base, could we look at the whole package — a few extra holiday days, a larger learning budget, or the four-day week protected in writing? I'm flexible, and I'd love to find the combination that gets us both to yes.`,
    },
    {
      id: "enthusiastic",
      name: "Lead with a yes",
      blurb: "Excitement first, number second. Disarming and effective.",
      draft: `Hi ${recruiter} — my honest answer is yes, I want to join ${co}. The one thing I'd love to revisit is the base: could we get to €47k? Everything else looks great, and if we can land that, I'm ready to sign and get started.`,
    },
    {
      id: "time",
      name: "Ask for time",
      blurb: "Buy space to decide — calmly, without pressure.",
      draft: `Hi ${recruiter} — thank you so much for this, it means a lot. It's an important decision and I'd like to give it the consideration it deserves; could I take until the end of the week to come back to you properly? I'm very enthusiastic and want to respond thoughtfully rather than quickly.`,
    },
  ];
}

/* ── State-transition patches (returned when a flow completes) ───────────── */

export function withdrawnPatch(): Partial<Application> {
  return {
    cat: "closed",
    badge: { kind: "rejected", label: "Withdrawn" },
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Withdrew · today", state: "rejected" },
      { label: "—", state: "" },
      { label: "—", state: "" },
    ],
    status: <>You withdrew this application just now. The company has been notified politely.</>,
    actions: [],
  };
}

export function followedUpPatch(): Partial<Application> {
  return {
    accent: undefined,
    badge: { kind: "in-review", label: "Followed up", pulse: true },
    status: (
      <>
        <b>Follow-up sent just now.</b> They've been nudged gently — you'll usually hear back within
        a couple of days.
      </>
    ),
    actions: [
      { label: "Message recruiter →", kind: "message" },
      { label: "Withdraw", kind: "withdraw", muted: true },
    ],
  };
}

export function submittedDraftPatch(): Partial<Application> {
  return {
    cat: "active",
    deadline: undefined,
    badge: { kind: "in-review", label: "Just sent", pulse: true },
    stages: [
      { label: "Submitted today", state: "done" },
      { label: "In review", state: "active" },
      { label: "Interview", state: "" },
      { label: "Decision", state: "" },
    ],
    status: <>Submitted just now. Their stated turnaround is 7 days — we'll watch the clock for you.</>,
    actions: [
      { label: "Message recruiter →", kind: "message" },
      { label: "View submission", kind: "submission", muted: true },
    ],
  };
}

export function acceptedOfferPatch(): Partial<Application> {
  return {
    accent: undefined,
    deadline: undefined,
    badge: { kind: "offer", label: "Accepted" },
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      { label: "Interview", state: "done" },
      { label: "Accepted", state: "done" },
    ],
    status: (
      <>
        <b>Offer accepted.</b> They'll send the contract to your email within two working days.
      </>
    ),
    actions: [{ label: "Open conversation", kind: "conversation" }],
  };
}

/** Snapshot of the fields an offer response mutates, so the action can be undone. */
export function offerRevertPatch(app: Application): Partial<Application> {
  return {
    cat: app.cat,
    accent: app.accent,
    deadline: app.deadline,
    badge: app.badge,
    stages: app.stages,
    status: app.status,
    actions: app.actions,
  };
}

export function declinedOfferPatch(): Partial<Application> {
  return {
    cat: "closed",
    accent: undefined,
    deadline: undefined,
    badge: { kind: "rejected", label: "Offer declined" },
    stages: [
      { label: "Submitted", state: "done" },
      { label: "Review", state: "done" },
      { label: "Interview", state: "done" },
      { label: "Declined", state: "rejected" },
    ],
    status: <>You declined this offer. They've been thanked warmly on your behalf.</>,
    actions: [],
  };
}
