import type { TFunction } from "../../shared/i18n/types";
import type { ReportSubjectType } from "../safety/reportReasons";
import type { AdminTone } from "./ui";

export type Severity = "emergency" | "high" | "medium" | "low";

/** i18n Pattern A. `labelKey` resolves the severity name shown on the AdminCat
 *  stripe; `stripe`/`category` are styling tokens, not language. */
export interface SeverityMeta {
  labelKey: string;
  stripe: string;
  category: "danger" | "coral" | "jade";
}

export const SEVERITY: Record<Severity, SeverityMeta> = {
  emergency: {
    labelKey: "admin:moderation.severity.emergency",
    stripe: "var(--danger)",
    category: "danger",
  },
  high: {
    labelKey: "admin:moderation.severity.high",
    stripe: "var(--danger)",
    category: "coral",
  },
  medium: {
    labelKey: "admin:moderation.severity.medium",
    stripe: "var(--amber)",
    category: "coral",
  },
  low: {
    labelKey: "admin:moderation.severity.low",
    stripe: "var(--jade)",
    category: "jade",
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

/** Renders a chip's label: verbatim content chips pass through, chrome chips
 *  resolve through the catalog. Narrows the `ReportChip` union for consumers. */
export function chipLabel(chip: ReportChip, t: TFunction): string {
  return "text" in chip ? chip.text : t(chip.labelKey, chip.values);
}

/** Stable React `key` for a chip — the catalog key, or the verbatim text. */
export function chipKey(chip: ReportChip): string {
  return "text" in chip ? chip.text : chip.labelKey;
}

/** Real counts resolved at render, so the plural form follows the language. */
export function priorReportsText(prior: PriorReports, t: TFunction): string {
  return prior.kind === "count"
    ? t("admin:moderation.priorReports.count", { count: prior.count })
    : t("admin:moderation.priorReports.newAccount", { vouches: prior.vouches });
}

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
  /** Listing-dispute enrichment (listing subjects only): the disputer's
   *  free-text reason for challenging the listing. Rendered when non-empty. */
  disputeReason?: string;
  /** Listing-dispute enrichment (listing subjects only): the ownership/claim
   *  evidence the lister pasted into the listing. Rendered when non-empty. */
  listingEvidence?: string;
  /** Listing-dispute enrichment (listing subjects only): an off-account contact
   *  address the disputer left, so a moderator can reach them. Non-empty only. */
  contactEmail?: string;
}

/** Real per-member counts, resolved via `admin:moderation.priorReports.*` at
 *  render — never a baked "N prior reports" string. */
export type PriorReports =
  { kind: "count"; count: number } | { kind: "newAccount"; vouches: number };

export interface ModReport {
  id: string;
  /** What kind of thing the report is about (member, post, listing, …) — gates
   *  which drawer actions apply (see `modActionsFor`): account-level actions
   *  like restrict/ban only make sense, and only succeed server-side, for a
   *  `"member"` report. */
  subjectType: ReportSubjectType;
  /** The exact server-side `subjectId` string this report carries — the same
   *  literal value "prior reports" are counted against. Powers the "view this
   *  member's report history" click-through (COM-6). In demo mode this is a
   *  stand-in id, not a real backend key. */
  subjectId: string;
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
  /** Server-computed SLA deadline (severity-tiered), ISO timestamp (COM-8). */
  slaDueAt?: string;
  /** Null/undefined = unassigned. Populated once a moderator self-assigns
   *  the report (COM-5). */
  assignedModeratorId?: string | null;
  assignedModeratorName?: string;
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
  category: "danger" | "coral" | "jade";
}

export interface Appeal {
  id: string;
  /** The original report this appeal contests, when resolvable (COM-11) —
   *  lets the review drawer fetch and show the ORIGINAL reported content, not
   *  just the moderator's self-reported reason. Absent for a "cold" appeal
   *  with no linked report, and in the demo seed (no backing report data to
   *  fetch). */
  reportId?: string;
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
    subjectType: "member",
    subjectId: "reblanco",
    severity: "emergency",
    category: "Emergency",
    chips: [
      { tone: "danger", labelKey: "admin:moderation.chip.outingDoxxing" },
    ],
    title: "A member's",
    titleEm: "private trans status",
    titleAfter: "was posted in a public thread",
    preview:
      '"Everyone should know that [name] used to go by…" Reported as deliberate outing in the Lisbon Queers open forum.',
    reporterName: "anonymous",
    reportedName: "@reblanco",
    priorReports: { kind: "count", count: 1 },
    age: "26m",
    risk: { tone: "danger", key: "admin:moderation.risk.atRisk" },
    slaDueAt: new Date(Date.now() - 5 * 60_000).toISOString(),
    detail: {
      contentAuthor: "RB · @reblanco · in Lisbon Queers · public thread",
      excerpt:
        '"Everyone should know that @[redacted name] used to go by a different name before transitioning, just so you all have the full picture of who you’re dealing with."',
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
          body: "this is completely out of line, please take this down",
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
          chips: [
            {
              tone: "ghost",
              labelKey: "admin:moderation.chip.identityShielded",
            },
          ],
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
    subjectType: "member",
    subjectId: "anon_4471",
    severity: "emergency",
    category: "Emergency",
    chips: [
      { tone: "danger", labelKey: "admin:moderation.chip.outingDoxxing" },
    ],
    title: "Home address shared in a DM screenshot",
    preview:
      'A throwaway account posted what appears to be a member’s home address with a threat to "show up." Reporter fears for physical safety.',
    reporterName: "Mara L.",
    reportedName: "@anon_4471",
    priorReports: { kind: "newAccount", vouches: 0 },
    age: "1h",
    risk: { tone: "danger", key: "admin:moderation.risk.atRisk" },
    slaDueAt: new Date(Date.now() + 40 * 60_000).toISOString(),
  },
];

export const OTHER_REPORTS: ModReport[] = [
  {
    id: "r-harass",
    subjectType: "member",
    subjectId: "nightowl",
    severity: "high",
    category: "Harassment",
    chips: [{ tone: "coral", labelKey: "admin:moderation.chip.harassment" }],
    title: "Repeated unwanted DMs after being asked to stop",
    preview:
      "Member reports 14 messages in 2 days from the same person despite blocking. Pattern of escalation.",
    reporterName: "Tomás R.",
    reportedName: "@nightowl",
    priorReports: { kind: "count", count: 4 },
    age: "3h",
    risk: { tone: "coral", key: "admin:moderation.risk.high" },
    slaDueAt: new Date(Date.now() - 90 * 60_000).toISOString(),
  },
  {
    id: "r-vouch",
    subjectType: "member",
    subjectId: "vouch-ring-5",
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
    subjectType: "member",
    subjectId: "coin_daily",
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
    id: "r-listing-dispute",
    subjectType: "listing",
    subjectId: "rosa-amarga-cafe",
    severity: "medium",
    category: "Listing dispute",
    chips: [
      { tone: "amber", labelKey: "admin:moderation.chip.listingDispute" },
    ],
    title: "Ownership of a café listing is being disputed",
    preview:
      'A member says the "Rosa Amarga" café listing was claimed by someone who does not run it, and has offered proof they are the actual owner.',
    reporterName: "Bruna T.",
    reportedName: "rosa-amarga-cafe",
    community: "Porto Queers",
    age: "11h",
    risk: { tone: "amber", key: "admin:moderation.risk.medium" },
    detail: {
      contentAuthor: "rosa-amarga-cafe · listed by @lreis",
      excerpt:
        '"Rosa Amarga, a queer-owned café in Cedofeita. Coffee, zines and a small library. Open Wed–Sun."',
      disputeReason:
        "I've run Rosa Amarga since we opened in 2022. This listing was created by someone who used to work a few shifts here and left last year. They've listed themselves as the owner and set the contact to their own number. I'd like the listing corrected and the ownership handed back to the café.",
      listingEvidence:
        "Business registration (NIF 5xx xxx xxx) in my name, the lease for the Rua de Cedofeita space, and the café's verified Instagram (@rosaamarga) which links back to this profile. Happy to send scans to the safety team.",
      contactEmail: "ines@rosaamarga.pt",
      thread: [],
      people: [
        {
          role: "Reporter",
          name: "Bruna T.",
          initials: "BT",
          tone: "plum",
          meta: "Member since 2022 · says she is the café's actual owner.",
        },
        {
          role: "Lister",
          name: "@lreis",
          initials: "LR",
          tone: "coral",
          meta: "Created the listing 3 weeks ago · former staff member.",
        },
      ],
    },
  },
  {
    id: "r-offtopic",
    subjectType: "post",
    subjectId: "post-trans-friends-logistics",
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
    chips: [
      { tone: "amber", labelKey: "admin:moderation.chip.appealRestriction" },
    ],
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
        '"Hostile comment in a public thread: restricted for a week after a prior warning."',
      category: "coral",
    },
    argument:
      '"That thread was three close friends roasting each other. We do it constantly. Whoever reported it doesn\'t know us. I get how it looked from outside, but muting me for a week feels heavy for an in-joke. Ask Théo or Sofia, they were there."',
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
      category: "danger",
    },
    argument:
      "\"The person who reported me started it. They'd been needling me for days. I snapped once and got removed; they're still posting. I'm not asking for them to be punished, just for someone to read the whole thread, not only my last message.\"",
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
      category: "coral",
    },
    argument:
      "\"It was a GoFundMe for a member's top surgery, posted because someone asked how to help. I should've added context, that's on me, but calling it spam stings. Happy to repost it properly.\"",
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
      'Resolved by Inês M., "Repeated DMs after a clear no. Restricted for 7 days; member notified with the policy excerpt."',
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
      'Dismissed by Júlia S., "Genuine community gathering, not promotion. No action; reporter thanked for caution."',
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
      'Resolved by Júlia S., "Address + threat. Content removed within 9 minutes, account banned, member offered safety resources."',
    closed: "Closed yesterday",
    notified: ["Affected member supported"],
    status: { tone: "jade", key: "admin:moderation.status.logged" },
  },
];

/* ── Drawer action grid ──────────────────────────────────────────────────── */

export type ActionKind = "neutral" | "protect" | "destruct";

export interface ModAction {
  id: string;
  labelKey: string;
  descriptionKey: string;
  kind: ActionKind;
  /** Past-tense phrase catalog key, used in the confirmation toast. */
  doneKey: string;
  /** True for actions that land on a member's account (`restrict`/`ban`). The
   *  backend 400s these unless the report's `subjectType` is `"member"` (see
   *  `account-enforcement.service.ts`), so `modActionsFor` only offers them for
   *  member reports. */
  memberOnly?: boolean;
}

export const MOD_ACTIONS: ModAction[] = [
  {
    id: "dismiss",
    labelKey: "admin:moderation.actions.dismiss.label",
    descriptionKey: "admin:moderation.actions.dismiss.desc",
    kind: "neutral",
    doneKey: "admin:moderation.actions.dismiss.done",
  },
  {
    id: "hide",
    labelKey: "admin:moderation.actions.hide.label",
    descriptionKey: "admin:moderation.actions.hide.desc",
    kind: "protect",
    doneKey: "admin:moderation.actions.hide.done",
  },
  {
    id: "shield",
    labelKey: "admin:moderation.actions.shield.label",
    descriptionKey: "admin:moderation.actions.shield.desc",
    kind: "protect",
    doneKey: "admin:moderation.actions.shield.done",
  },
  {
    id: "warn",
    labelKey: "admin:moderation.actions.warn.label",
    descriptionKey: "admin:moderation.actions.warn.desc",
    kind: "neutral",
    doneKey: "admin:moderation.actions.warn.done",
  },
  {
    id: "restrict",
    labelKey: "admin:moderation.actions.restrict.label",
    descriptionKey: "admin:moderation.actions.restrict.desc",
    kind: "neutral",
    doneKey: "admin:moderation.actions.restrict.done",
    memberOnly: true,
  },
  {
    id: "remove",
    labelKey: "admin:moderation.actions.remove.label",
    descriptionKey: "admin:moderation.actions.remove.desc",
    kind: "destruct",
    doneKey: "admin:moderation.actions.remove.done",
  },
  {
    id: "ban",
    labelKey: "admin:moderation.actions.ban.label",
    descriptionKey: "admin:moderation.actions.ban.desc",
    kind: "destruct",
    doneKey: "admin:moderation.actions.ban.done",
    memberOnly: true,
  },
];

/**
 * The action tiles that actually apply to a report's subject (P0-14). Ban and
 * restrict land on a member's account — the backend rejects them with a 400
 * for any report whose `subjectType` isn't `"member"` (a post, reply, listing,
 * venue, …), so offering them there just sets the moderator up to fail. Every
 * other action (dismiss, hide, shield, warn, remove) has no such subject-type
 * restriction on the server and stays available everywhere.
 */
export function modActionsFor(subjectType: ReportSubjectType): ModAction[] {
  if (subjectType === "member") return MOD_ACTIONS;
  return MOD_ACTIONS.filter((action) => !action.memberOnly);
}

export interface ModReason {
  id: string;
  labelKey: string;
}

export const MOD_REASONS: ModReason[] = [
  { id: "outing", labelKey: "admin:moderation.reasons.outing" },
  { id: "doxxing", labelKey: "admin:moderation.reasons.doxxing" },
  { id: "harassment", labelKey: "admin:moderation.reasons.harassment" },
  { id: "other", labelKey: "admin:moderation.reasons.other" },
];
