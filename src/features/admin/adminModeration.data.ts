import type { AdminTone } from "./ui";

export type Severity = "emergency" | "high" | "medium" | "low";

/** i18n Pattern A. `labelKey` resolves the severity name shown on the AdminCat
 *  stripe; `stripe`/`cat` are styling tokens, not language. */
export interface SeverityMeta {
  labelKey: string;
  stripe: string;
  cat: "danger" | "coral" | "jade";
}

export const SEVERITY: Record<Severity, SeverityMeta> = {
  emergency: {
    labelKey: "admin:moderation.severity.emergency",
    stripe: "var(--danger)",
    cat: "danger",
  },
  high: {
    labelKey: "admin:moderation.severity.high",
    stripe: "var(--danger)",
    cat: "coral",
  },
  medium: {
    labelKey: "admin:moderation.severity.medium",
    stripe: "var(--amber)",
    cat: "coral",
  },
  low: {
    labelKey: "admin:moderation.severity.low",
    stripe: "var(--jade)",
    cat: "jade",
  },
};

/**
 * i18n note: most chips are one of a small fixed set of platform-defined
 * report categories (repeated verbatim across many report/appeal entries) —
 * chrome, resolved through `labelKey`. A few chips instead carry real content
 * (a community name) — those use `text` verbatim, never translated.
 */
export type ReportChip =
  | {
      tone: AdminTone;
      labelKey: string;
      /** `{token}` interpolation values for `labelKey`, e.g. a plural `count`. */
      values?: Record<string, string | number>;
      dot?: boolean;
    }
  | { tone: AdminTone; text: string; dot?: boolean };

export interface ThreadMsg {
  author: string;
  initials: string;
  tone: "plum" | "coral" | "jade" | "violet" | "amber" | "anon";
  time: string;
  body: string;
  flagged?: boolean;
}

export interface DrawerPerson {
  role: string;
  name: string;
  initials: string;
  tone: "plum" | "coral" | "jade" | "violet" | "amber" | "anon";
  meta: string;
  verified?: boolean;
  anon?: boolean;
  chips?: ReportChip[];
  pronoun?: string;
}

export interface ReportDetail {
  /** Author byline for the reported content. */
  contentAuthor: string;
  /** Reported content excerpt shown verbatim in the drawer. */
  excerpt: string;
  /** Transparency note about deadname redaction, shown under the excerpt. */
  redactionNote?: string;
  thread: ThreadMsg[];
  people: DrawerPerson[];
}

/** Real per-member counts, resolved via `admin:moderation.priorReports.*` at
 *  render — never a baked "N prior reports" string. */
export type PriorReports =
  | { kind: "count"; count: number }
  | { kind: "newAccount"; vouches: number };

export interface ModReport {
  id: string;
  severity: Severity;
  /** Stronger square category label (AdminCat). Not currently rendered in the
   *  demo UI (ReportCard shows the severity label instead) but kept to mirror
   *  the live DTO shape (see api/moderation.adapters.ts). */
  category: string;
  chips: ReportChip[];
  title: string;
  /** Optional coral-emphasised tail of the title. */
  titleEm?: string;
  /** Optional plain tail of the title after the emphasised part. */
  titleAfter?: string;
  preview: string;
  reporterName: string;
  reportedName: string;
  community?: string;
  priorReports?: PriorReports;
  age: string;
  risk: { tone: AdminTone; key: string };
  detail?: ReportDetail;
}

export interface AppealSupporter {
  initials: string;
  name: string;
  tone: "plum" | "coral" | "jade" | "violet" | "amber";
}

export interface AppealOriginal {
  action: string;
  by: string;
  when: string;
  reason: string;
  cat: "danger" | "coral" | "jade";
}

export interface Appeal {
  id: string;
  severity: Severity;
  chips: ReportChip[];
  title: string;
  preview: string;
  appealBy: string;
  /** Pronoun shown beside the member handle in the drawer. */
  pronoun: string;
  /** Avatar tint + initials for the appealing member. */
  initials: string;
  tone: "plum" | "coral" | "jade" | "violet" | "amber";
  community?: string;
  age: string;
  status: { tone: AdminTone; key: string };
  original: AppealOriginal;
  /** The member's own argument, shown as a coral-bordered serif quote. */
  argument: string;
  supporters: AppealSupporter[];
}

export interface ResolvedItem {
  id: string;
  severity: Severity;
  chips: ReportChip[];
  /** Stronger square outcome label (AdminCat). */
  outcome: string;
  outcomeTone: "danger" | "coral" | "jade";
  title: string;
  preview: string;
  closed: string;
  /** One or two "X notified" lines, depending on who was informed. */
  notified: string[];
  status: { tone: AdminTone; key: string };
}

/* ── Open queue: 2 emergencies first, then everything else ──────────────── */

export const EMERGENCY_REPORTS: ModReport[] = [
  {
    id: "r-emerg-1",
    severity: "emergency",
    category: "Emergency",
    chips: [{ tone: "danger", labelKey: "admin:moderation.chip.outingDoxxing" }],
    title: "A member's",
    titleEm: "private trans status",
    titleAfter: "was posted in a public thread",
    preview:
      '"Everyone should know that [name] used to go by…" — reported as deliberate outing in the Lisbon Queers open forum.',
    reporterName: "anonymous",
    reportedName: "@reblanco",
    priorReports: "1 prior report",
    age: "26m",
    risk: { tone: "danger", key: "admin:moderation.risk.atRisk" },
    detail: {
      contentAuthor: "RB · @reblanco · in Lisbon Queers · public thread",
      excerpt:
        '"Everyone should know that @[redacted name] used to go by a different name before transitioning — just so you all have the full picture of who you’re dealing with."',
      redactionNote:
        "A deadname has been automatically redacted from this view. The affected member’s legacy identity is never shown to moderators.",
      thread: [
        {
          author: "Ana L.",
          initials: "AL",
          tone: "jade",
          time: "2:14pm",
          body: "does anyone have a recommendation for a trans-friendly GP near Arroios?",
        },
        {
          author: "@reblanco",
          initials: "RB",
          tone: "coral",
          time: "2:21pm · reported",
          flagged: true,
          body: "Everyone should know that @[redacted] used to go by…",
        },
        {
          author: "Théo M.",
          initials: "TM",
          tone: "violet",
          time: "2:23pm",
          body: "this is completely out of line — please take this down",
        },
      ],
      people: [
        {
          role: "Reporter",
          name: "Anonymous reporter",
          initials: "?",
          tone: "anon",
          anon: true,
          meta: "Reporting is anonymous by design. Their identity is protected from you and from the reported member.",
          chips: [{ tone: "ghost", labelKey: "admin:moderation.chip.identityShielded" }],
        },
        {
          role: "Reported",
          name: "@reblanco",
          initials: "RB",
          tone: "coral",
          pronoun: "he/him",
          meta: "Member since Mar 2024 · 6 vouches · 1 prior report (resolved: warned for hostile tone, Jan 2026).",
          chips: [
            {
              tone: "coral",
              labelKey: "admin:moderation.priorReports.count",
              values: { count: 1 },
            },
            { tone: "ghost", text: "Lisbon Queers" },
          ],
        },
      ],
    },
  },
  {
    id: "r-emerg-2",
    severity: "emergency",
    category: "Emergency",
    chips: [{ tone: "danger", labelKey: "admin:moderation.chip.outingDoxxing" }],
    title: "Home address shared in a DM screenshot",
    preview:
      'A throwaway account posted what appears to be a member’s home address with a threat to "show up." Reporter fears for physical safety.',
    reporterName: "Mara L.",
    reportedName: "@anon_4471",
    priorReports: "New account · 0 vouches",
    age: "1h",
    risk: { tone: "danger", key: "admin:moderation.risk.atRisk" },
  },
];

export const OTHER_REPORTS: ModReport[] = [
  {
    id: "r-harass",
    severity: "high",
    category: "Harassment",
    chips: [{ tone: "coral", labelKey: "admin:moderation.chip.harassment" }],
    title: "Repeated unwanted DMs after being asked to stop",
    preview:
      "Member reports 14 messages in 2 days from the same person despite blocking. Pattern of escalation.",
    reporterName: "Tomás R.",
    reportedName: "@nightowl",
    priorReports: "4 prior reports",
    age: "3h",
    risk: { tone: "coral", key: "admin:moderation.risk.high" },
  },
  {
    id: "r-vouch",
    severity: "medium",
    category: "Vouch-abuse",
    chips: [{ tone: "violet", labelKey: "admin:moderation.chip.vouchAbuse" }],
    title: "Cluster of accounts vouching for each other in a ring",
    preview:
      "Five new accounts created within an hour, each vouching for the others to fast-track verification. Possible coordinated entry.",
    reporterName: "system",
    reportedName: "5 accounts",
    community: "Queer Creatives",
    age: "5h",
    risk: { tone: "amber", key: "admin:moderation.risk.medium" },
  },
  {
    id: "r-spam",
    severity: "medium",
    category: "Spam",
    chips: [{ tone: "amber", labelKey: "admin:moderation.chip.spam" }],
    title: "Crypto promo links posted across 6 gathering threads",
    preview:
      "Same external link dropped into unrelated event discussions. Likely a compromised or bad-faith account.",
    reporterName: "3 members",
    reportedName: "@coin_daily",
    age: "8h",
    risk: { tone: "amber", key: "admin:moderation.risk.medium" },
  },
  {
    id: "r-offtopic",
    severity: "low",
    category: "Off-topic",
    chips: [{ tone: "jade", labelKey: "admin:moderation.chip.offTopic" }],
    title: "A heated but non-abusive disagreement was reported",
    preview:
      'Two members argued about event logistics. Reported as "hostile" but reads as a tense exchange, not a code-of-care breach.',
    reporterName: "Sofia D.",
    reportedName: "Trans & Friends",
    community: "Trans & Friends",
    age: "14h",
    risk: { tone: "jade", key: "admin:moderation.risk.low" },
  },
];

/* ── Appeals ─────────────────────────────────────────────────────────────── */

export const APPEALS: Appeal[] = [
  {
    id: "a-1",
    severity: "medium",
    chips: [{ tone: "amber", labelKey: "admin:moderation.chip.appealRestriction" }],
    title: '"I was muted for a joke my friends were in on"',
    preview:
      "Member restricted for 7 days asks for a second look, says context was missed. Two members have written in support.",
    appealBy: "@dovgrey",
    pronoun: "they/them",
    initials: "DG",
    tone: "coral",
    community: "Lisbon Queers",
    age: "2d",
    status: { tone: "amber", key: "admin:moderation.status.awaiting" },
    original: {
      action: "Restricted · 7 days",
      by: "Inês M.",
      when: "2 days ago",
      reason:
        '"Hostile comment in a public thread — restricted for a week after a prior warning."',
      cat: "coral",
    },
    argument:
      '"That thread was three close friends roasting each other — we do it constantly. Whoever reported it doesn\'t know us. I get how it looked from outside, but muting me for a week feels heavy for an in-joke. Ask Théo or Sofia, they were there."',
    supporters: [
      { initials: "TM", name: "Théo M.", tone: "violet" },
      { initials: "SA", name: "Sofia A.", tone: "jade" },
    ],
  },
  {
    id: "a-2",
    severity: "low",
    chips: [{ tone: "jade", labelKey: "admin:moderation.chip.appealRemoval" }],
    title: "Removed member says the report was retaliation",
    preview:
      "Claims the person who reported them was the original aggressor. Requests the full thread be re-read.",
    appealBy: "@marsh.k",
    pronoun: "she/her",
    initials: "MK",
    tone: "jade",
    community: "Newly Arrived",
    age: "3d",
    status: { tone: "jade", key: "admin:moderation.status.awaiting" },
    original: {
      action: "Removed content",
      by: "Júlia S.",
      when: "3 days ago",
      reason: '"Reported for an aggressive reply in a housing thread."',
      cat: "danger",
    },
    argument:
      "\"The person who reported me started it — they'd been needling me for days. I snapped once and got removed; they're still posting. I'm not asking for them to be punished, just for someone to read the whole thread, not only my last message.\"",
    supporters: [],
  },
  {
    id: "a-3",
    severity: "low",
    chips: [{ tone: "jade", labelKey: "admin:moderation.chip.appealWarning" }],
    title: '"The link I shared was a mutual-aid fund, not spam"',
    preview:
      "Member warned for spam says the link was a member fundraiser shared on request. Offers to repost with context.",
    appealBy: "@studio.vera",
    pronoun: "she/her",
    initials: "SV",
    tone: "amber",
    community: "Trans & Friends",
    age: "20h",
    status: { tone: "jade", key: "admin:moderation.status.awaiting" },
    original: {
      action: "Warned · spam",
      by: "Sofia A.",
      when: "20h ago",
      reason: '"Posted an external link in a support thread."',
      cat: "coral",
    },
    argument:
      "\"It was a GoFundMe for a member's top surgery, posted because someone asked how to help. I should've added context — that's on me — but calling it spam stings. Happy to repost it properly.\"",
    supporters: [{ initials: "KS", name: "Kai S.", tone: "plum" }],
  },
];

/* ── Resolved ────────────────────────────────────────────────────────────── */

export const RESOLVED: ResolvedItem[] = [
  {
    id: "re-1",
    severity: "low",
    chips: [{ tone: "jade", labelKey: "admin:moderation.chip.resolved" }],
    outcome: "Restricted · 7 days",
    outcomeTone: "jade",
    title: "Harassment in Trans & Friends",
    preview:
      'Resolved by Inês M. — "Repeated DMs after a clear no. Restricted for 7 days; member notified with the policy excerpt."',
    closed: "Closed 2 min ago",
    notified: ["Member notified"],
    status: { tone: "jade", key: "admin:moderation.status.logged" },
  },
  {
    id: "re-2",
    severity: "low",
    chips: [{ tone: "jade", labelKey: "admin:moderation.chip.resolved" }],
    outcome: "Dismissed",
    outcomeTone: "coral",
    title: 'Reported "spam" was a member’s own event',
    preview:
      'Dismissed by Júlia S. — "Genuine community gathering, not promotion. No action; reporter thanked for caution."',
    closed: "Closed 1h ago",
    notified: ["Member notified", "Reporter notified"],
    status: { tone: "jade", key: "admin:moderation.status.logged" },
  },
  {
    id: "re-3",
    severity: "emergency",
    chips: [{ tone: "danger", labelKey: "admin:moderation.chip.resolved" }],
    outcome: "Removed + banned · 9 min response",
    outcomeTone: "danger",
    title: "Doxxing with intent to intimidate",
    preview:
      'Resolved by Júlia S. — "Address + threat. Content removed within 9 minutes, account banned, member offered safety resources."',
    closed: "Closed yesterday",
    notified: ["Affected member supported"],
    status: { tone: "jade", key: "admin:moderation.status.logged" },
  },
];

/* ── Drawer action grid ──────────────────────────────────────────────────── */

export type ActionKind = "neutral" | "protect" | "destruct";

export interface ModAction {
  id: string;
  label: string;
  desc: string;
  kind: ActionKind;
  /** Past-tense phrase used in the confirmation toast. */
  done: string;
}

export const MOD_ACTIONS: ModAction[] = [
  {
    id: "hide",
    label: "Hide content",
    desc: "Remove from view, keep for records",
    kind: "protect",
    done: "hidden",
  },
  {
    id: "shield",
    label: "Shield member",
    desc: "Protect the person reported about",
    kind: "protect",
    done: "shielded",
  },
  {
    id: "warn",
    label: "Warn",
    desc: "Send a formal warning",
    kind: "neutral",
    done: "warned",
  },
  {
    id: "restrict",
    label: "Restrict",
    desc: "Limit posting for a period",
    kind: "neutral",
    done: "restricted",
  },
  {
    id: "remove",
    label: "Remove",
    desc: "Delete the content permanently",
    kind: "destruct",
    done: "removed",
  },
  {
    id: "ban",
    label: "Ban",
    desc: "Remove the member from the network",
    kind: "destruct",
    done: "banned",
  },
];

export interface ModReason {
  id: string;
  label: string;
}

export const MOD_REASONS: ModReason[] = [
  { id: "outing", label: "Outing / sharing private identity without consent" },
  { id: "doxxing", label: "Sharing personal or location data (doxxing)" },
  { id: "harassment", label: "Targeted harassment of a member" },
  { id: "other", label: "Other — explain below" },
];
