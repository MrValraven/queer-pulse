/**
 * Static content for the co-host invitation's "roles" and "commitments"
 * cards — organizer-authored narrative held as data (single source, and it
 * keeps this un-keyed chrome out of inline JSX).
 */

export interface CoHostRole {
  ic: string;
  title: string;
  description: string;
  permKey: string;
  permCls: "permYes" | "permNo";
}

export const ROLES: CoHostRole[] = [
  {
    ic: "G",
    title: "Greet at the door, 18:30 — 19:30",
    description: "Check names against the RSVP list. Anika will join you by 19:00.",
    permKey: "gatherings:cohostInvite.permRequired",
    permCls: "permYes",
  },
  {
    ic: "R",
    title: "Manage the room flow",
    description: "Walk between Dr. Pereira and the pharmacist's tables so neither gets a queue.",
    permKey: "gatherings:cohostInvite.permRequired",
    permCls: "permYes",
  },
  {
    ic: "M",
    title: "Co-moderate questions",
    description: "If a public Q&A breaks out, you and Anika tag-team it.",
    permKey: "gatherings:cohostInvite.permRequired",
    permCls: "permYes",
  },
  {
    ic: "P",
    title: "Edit the event page",
    description: "Add/remove RSVPs, change time, send updates, post a recap after.",
    permKey: "gatherings:cohostInvite.permGranted",
    permCls: "permYes",
  },
  {
    ic: "F",
    title: "Access the host fund",
    description: "€60 spending budget for tea/coffee, small first-aid kit, and after-snacks.",
    permKey: "gatherings:cohostInvite.permHostOnly",
    permCls: "permNo",
  },
  {
    ic: "C",
    title: "Cancel the event",
    description: "This stays with Anika as the lead host.",
    permKey: "gatherings:cohostInvite.permHostOnly",
    permCls: "permNo",
  },
];

export interface CoHostCommitment {
  b: string;
  s: string;
}

export const COMMITMENTS: CoHostCommitment[] = [
  {
    b: "~ 30 min prep",
    s: "Read the runbook, message Anika once before. That's it.",
  },
  {
    b: "2.5 hours on the night",
    s: "Arrive 30 min early, stay 15 min after for tidy-up.",
  },
  { b: "~ 15 min after", s: "Write a short recap. Anika handles the post." },
  {
    b: "One ask post-event",
    s: "If a follow-up question comes in, you'll see it & can reply.",
  },
];

export const OUTCLAUSE_REST =
  "— no shame, no penalty, just send Anika a one-line message. We've all had a Thursday go sideways.";
