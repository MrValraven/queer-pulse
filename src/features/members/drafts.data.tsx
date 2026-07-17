import type { ReactNode } from "react";
import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";
import { routes } from "../../app/routeMap";

/**
 * Relative "time ago" from a minute count, through `fmt.relativeTime` —
 * previously every draft hand-baked its own "2 days ago" text, which never
 * localized for pt-PT (the fused-mock-string trap; mirrors
 * `features/topics/api/topics.adapters.tsx`'s `relative()`).
 */
export function relativeAgo(minutesAgo: number, fmt: Formatters): string {
  if (minutesAgo < 1) return fmt.relativeTime(0, "second");
  if (minutesAgo < 60) return fmt.relativeTime(-minutesAgo, "minute");
  const hours = Math.round(minutesAgo / 60);
  if (hours < 24) return fmt.relativeTime(-hours, "hour");
  const days = Math.round(hours / 24);
  return fmt.relativeTime(-days, "day");
}

export type DraftCategory = "posts" | "articles" | "applications" | "grants";
export type DraftStatus = "draft" | "ready" | "stale" | "atrisk";
export type DraftSortKey = "edited" | "deadline" | "progress" | "title";

/** Tabs: "all" plus one per category. Counts are derived live from the list.
 *  `labelKey` is a catalog key — a small, platform-defined tab vocabulary
 *  (chrome), resolved through `t()` by the consuming component. */
export const DRAFT_TABS: { key: "all" | DraftCategory; labelKey: string }[] = [
  { key: "all", labelKey: "members:drafts.tabs.all" },
  { key: "posts", labelKey: "members:drafts.tabs.posts" },
  { key: "articles", labelKey: "members:drafts.tabs.articles" },
  { key: "applications", labelKey: "members:drafts.tabs.applications" },
  { key: "grants", labelKey: "members:drafts.tabs.grants" },
];

export const DRAFT_SORTS: { value: DraftSortKey; labelKey: string }[] = [
  { value: "edited", labelKey: "members:drafts.sort.edited" },
  { value: "deadline", labelKey: "members:drafts.sort.deadline" },
  { value: "progress", labelKey: "members:drafts.sort.progress" },
  { value: "title", labelKey: "members:drafts.sort.title" },
];

/** Status-chip label per status — chrome, resolved through `t()`. */
export const STATUS_LABEL_KEY: Record<DraftStatus, string> = {
  draft: "members:drafts.status.draft",
  ready: "members:drafts.status.ready",
  stale: "members:drafts.status.stale",
  atrisk: "members:drafts.status.atrisk",
};

/**
 * Draft-row action buttons are a small, closed, platform-defined set of verbs
 * (chrome) reused across every draft record below — keyed here by the
 * English label already baked into each `DRAFTS` entry's `actions[].label`,
 * so consumers resolve the on-screen text via
 * `t(DRAFT_ACTION_LABEL_KEY[action.label] ?? action.label)` without having to
 * touch every record's `actions` array individually.
 */
export const DRAFT_ACTION_LABEL_KEY: Record<string, string> = {
  Resume: "members:drafts.action.resume",
  Delete: "members:drafts.action.delete",
  Send: "members:drafts.action.send",
  Review: "members:drafts.action.review",
  "Keep 30 more days": "members:drafts.action.keep30",
  "Delete now": "members:drafts.action.deleteNow",
  "Send reply": "members:drafts.action.sendReply",
  Edit: "members:drafts.action.edit",
};

/** Items in the "Start something" create menu on the drafts header. `badge`
 *  stays an untranslated short code — it mirrors the same visual short-code
 *  badges used for `Draft.kind` (POST/PITCH/JOB), a terse icon-like label
 *  rather than a sentence. `labelKey`/`subKey` are chrome, translated. */
export const CREATE_ITEMS: {
  badge: string;
  tint: "jade" | "plum";
  labelKey: string;
  subKey: string;
  to: string;
}[] = [
  {
    badge: "POST",
    tint: "jade",
    labelKey: "members:drafts.create.newPost.label",
    subKey: "members:drafts.create.newPost.sub",
    to: routes.communitiesHome,
  },
  {
    badge: "PITCH",
    tint: "plum",
    labelKey: "members:drafts.create.pitchStory.label",
    subKey: "members:drafts.create.pitchStory.sub",
    to: routes.submitStory,
  },
  {
    badge: "JOB",
    tint: "jade",
    labelKey: "members:drafts.create.startApplication.label",
    subKey: "members:drafts.create.startApplication.sub",
    to: routes.jobs,
  },
];

export type MetaVariant = "deadline" | "pulse" | "stale" | "warn";

/**
 * A draft-row meta line. The relative-time/deadline kinds carry only the
 * numeric datum (or nothing, reading `Draft.editedMinutes`/`createdMinutes`/
 * `deadlineDays` instead) — `DraftRow.tsx` resolves the phrase via `t()` +
 * `fmt.relativeTime()`/`fmt.date()` at render, so it localizes correctly.
 * `custom` is the escape hatch for a handful of one-off resolved lines
 * (`buildKeptMeta`).
 */
export type DraftMeta =
  | { kind: "startedAgo"; variant?: MetaVariant }
  | { kind: "lastEditedAgo"; variant?: MetaVariant }
  | { kind: "savedAgo"; variant?: MetaVariant }
  | { kind: "closesOn"; date: Date; variant?: MetaVariant }
  | { kind: "deletesIn"; variant?: MetaVariant }
  | { kind: "custom"; label: ReactNode; variant?: MetaVariant };

export interface DraftAction {
  label: string;
  variant?: "primary" | "danger";
  /** Deletes the draft (with undo). */
  deletes?: boolean;
  /** Extends the draft's 90-day timer by 30 days. */
  keeps?: boolean;
}

export interface Draft {
  id: string;
  kind: string;
  kindVariant: "job" | "pitch" | "grant" | "post";
  title: ReactNode;
  desc: ReactNode;
  meta: DraftMeta[];
  progress: number;
  ready?: boolean;
  actions: DraftAction[];
  /** Tab bucket. Falls back to a mapping from `kindVariant` when omitted. */
  category?: DraftCategory;
  /** Drives the status chip + at-risk pinning. Defaults to draft/ready. */
  status?: DraftStatus;
  /** Where "Resume"/open navigates. */
  href?: string;
  /** Minutes since last edit (sort: recently edited — smaller is newer). */
  editedMinutes?: number;
  /** Minutes since the draft was first created — feeds a `startedAgo` meta line. */
  createdMinutes?: number;
  /** Days until the deadline / 90-day deletion (sort: closest deadline). */
  deadlineDays?: number | null;
  /** Plain-text title for alphabetical sort. */
  sortTitle?: string;
  /** Plain-text haystack for search. */
  searchText?: string;
}

const KEPT_DRAFT_CREATED_MINUTES = 87 * 24 * 60; // 87 days

/**
 * Meta shown after a draft has been kept 30 more days. A function of `t`/`fmt`
 * (Pattern B): both lines are platform chrome, resolved eagerly since this
 * replaces a kept draft's own `meta` wholesale (losing its original
 * `createdMinutes` — pre-existing behaviour, not introduced by this sweep).
 * Memoize with `useMemo(() => buildKeptMeta(t, fmt), [t, fmt])` in the consumer.
 */
export function buildKeptMeta(t: TFunction, fmt: Formatters): DraftMeta[] {
  return [
    {
      kind: "custom",
      label: t("members:drafts.meta.startedAgo", {
        time: relativeAgo(KEPT_DRAFT_CREATED_MINUTES, fmt),
      }),
    },
    { kind: "custom", label: t("members:drafts.keptMeta.resetNote") },
  ];
}

export const DRAFTS: Draft[] = [
  {
    id: "d1",
    kind: "JOB",
    kindVariant: "job",
    category: "applications",
    status: "draft",
    href: routes.jobs,
    editedMinutes: 300,
    createdMinutes: 2880,
    deadlineDays: 9,
    sortTitle: "Application · Communications Manager",
    searchText:
      "application communications manager clube das letras hybrid lisbon job",
    title: (
      <>
        Application · <em>Communications Manager</em>
      </>
    ),
    desc: (
      <>
        For <em>Clube das Letras</em> · Hybrid, Lisbon · €32–38k
      </>
    ),
    meta: [
      { kind: "startedAgo" },
      { kind: "lastEditedAgo" },
      { kind: "closesOn", date: new Date(2026, 5, 18), variant: "deadline" },
    ],
    progress: 60,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Delete", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d2",
    kind: "PITCH",
    kindVariant: "pitch",
    category: "articles",
    status: "draft",
    href: routes.submitStory,
    editedMinutes: 2,
    createdMinutes: 10080,
    deadlineDays: null,
    sortTitle: "Pitch · The pharmacist who fills every prescription",
    searchText:
      "pitch the pharmacist who fills every prescription queerpulse magazine issue 10 profile rui",
    title: (
      <>
        Pitch · <em>"The pharmacist who fills every prescription"</em>
      </>
    ),
    desc: "For QueerPulse Magazine · Issue 10 · 1,200-word profile · talked with Rui yesterday",
    meta: [{ kind: "startedAgo" }, { kind: "savedAgo", variant: "pulse" }],
    progress: 85,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Delete", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d3",
    kind: "€",
    kindVariant: "grant",
    category: "grants",
    status: "ready",
    href: routes.grants,
    editedMinutes: 1440,
    createdMinutes: 4320,
    deadlineDays: null,
    sortTitle: "Grant application · €150",
    searchText: "grant application 150 replacement t prescription",
    title: <>Grant application · €150</>,
    desc: "Replacement T prescription · drafted earlier this week",
    meta: [{ kind: "startedAgo" }, { kind: "lastEditedAgo" }],
    progress: 100,
    ready: true,
    actions: [{ label: "Send", variant: "primary" }, { label: "Review" }],
  },
  {
    id: "d4",
    kind: "POST",
    kindVariant: "post",
    category: "posts",
    status: "draft",
    href: routes.communitiesHome,
    editedMinutes: 2880,
    createdMinutes: 5760,
    deadlineDays: null,
    sortTitle: "Post in Creatives",
    searchText: "post creatives portfolio night café beirão wednesday",
    title: (
      <>
        Post in <em>Creatives</em>
      </>
    ),
    desc: '"Hosting a portfolio night the first Wednesday of every month, at Café Beirão. 12 spots, drop a link…"',
    meta: [{ kind: "startedAgo" }, { kind: "lastEditedAgo" }],
    progress: 78,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Delete", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d5",
    kind: "REPLY",
    kindVariant: "post",
    category: "posts",
    status: "draft",
    href: routes.forum,
    editedMinutes: 0,
    createdMinutes: 120,
    deadlineDays: null,
    sortTitle: "Reply to Anika Kovač's post about queer-friendly GPs",
    searchText:
      "reply anika kovač queer-friendly gps inês pereira clínica do largo",
    title: (
      <>
        Reply to <em>Anika Kovač's post about queer-friendly GPs</em>
      </>
    ),
    desc: '"Dr. Inês Pereira at Clínica do Largo, third Rita\'s vouch — go. Worth knowing that her phone is the one on the door, not the website…"',
    meta: [{ kind: "startedAgo" }, { kind: "savedAgo", variant: "pulse" }],
    progress: 92,
    actions: [{ label: "Send reply", variant: "primary" }, { label: "Edit" }],
  },
  {
    id: "d6",
    kind: "POST",
    kindVariant: "post",
    category: "posts",
    status: "stale",
    href: routes.communitiesHome,
    editedMinutes: 18720,
    createdMinutes: 20160,
    deadlineDays: null,
    sortTitle: "Post in Trans Hub",
    searchText:
      "post trans hub sns continuity of care lisbon porto question group",
    title: (
      <>
        Post in <em>Trans Hub</em>
      </>
    ),
    desc: '"Question for the group: anyone navigated SNS continuity-of-care when moving between Lisbon and Porto…"',
    meta: [{ kind: "startedAgo" }, { kind: "lastEditedAgo" }],
    progress: 42,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Delete", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d7",
    kind: "PITCH",
    kindVariant: "pitch",
    category: "articles",
    status: "atrisk",
    href: routes.submitStory,
    editedMinutes: 125280,
    createdMinutes: 125280,
    deadlineDays: 3,
    sortTitle: "Pitch · Six months on a four-day week — the sequel",
    searchText:
      "pitch six months four-day week sequel issue 05 editorial revision",
    title: (
      <>
        Pitch · <em>"Six months on a four-day week — the sequel"</em>
      </>
    ),
    desc: "Follow-up to my Issue 05 piece · sent to editorial in March, never finished revision",
    meta: [{ kind: "startedAgo" }, { kind: "deletesIn", variant: "warn" }],
    progress: 34,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Keep 30 more days", keeps: true },
      { label: "Delete now", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d8",
    kind: "JOB",
    kindVariant: "job",
    category: "applications",
    status: "draft",
    href: routes.jobs,
    editedMinutes: 7200,
    createdMinutes: 7200,
    deadlineDays: null,
    sortTitle: "Application · Editorial Lead, Magazine",
    searchText: "application editorial lead magazine equip editions",
    title: (
      <>
        Application · <em>Editorial Lead, Magazine</em>
      </>
    ),
    desc: (
      <>
        For Equip Editions · barely started · saved by accident?{" "}
        <em>Probably delete.</em>
      </>
    ),
    meta: [{ kind: "startedAgo" }, { kind: "lastEditedAgo" }],
    progress: 8,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Delete", variant: "danger", deletes: true },
    ],
  },
];

const CATEGORY_BY_KIND: Record<Draft["kindVariant"], DraftCategory> = {
  job: "applications",
  pitch: "articles",
  grant: "grants",
  post: "posts",
};

export function draftCategory(d: Draft): DraftCategory {
  return d.category ?? CATEGORY_BY_KIND[d.kindVariant];
}

export function draftStatus(d: Draft): DraftStatus {
  return d.status ?? (d.ready ? "ready" : "draft");
}

function draftSearchText(d: Draft): string {
  if (d.searchText) return d.searchText.toLowerCase();
  return [
    d.sortTitle,
    typeof d.title === "string" ? d.title : "",
    typeof d.desc === "string" ? d.desc : "",
    d.kind,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function draftSortTitle(d: Draft): string {
  return (
    d.sortTitle ?? (typeof d.title === "string" ? d.title : "")
  ).toLowerCase();
}

/** Live per-category counts for the tab badges. */
export function countByCategory(
  list: Draft[],
): Record<"all" | DraftCategory, number> {
  const counts = {
    all: list.length,
    posts: 0,
    articles: 0,
    applications: 0,
    grants: 0,
  };
  for (const d of list) counts[draftCategory(d)]++;
  return counts;
}

/** Filter by tab + search, then sort — with at-risk drafts always pinned first. */
export function selectDrafts(
  list: Draft[],
  category: "all" | DraftCategory,
  query: string,
  sort: DraftSortKey,
): Draft[] {
  const q = query.trim().toLowerCase();
  const filtered = list.filter(
    (d) =>
      (category === "all" || draftCategory(d) === category) &&
      (!q || draftSearchText(d).includes(q)),
  );
  return filtered.sort((a, b) => {
    const aRisk = draftStatus(a) === "atrisk";
    const bRisk = draftStatus(b) === "atrisk";
    if (aRisk !== bRisk) return aRisk ? -1 : 1;
    if (sort === "edited")
      return (a.editedMinutes ?? 0) - (b.editedMinutes ?? 0);
    if (sort === "deadline")
      return (a.deadlineDays ?? 9999) - (b.deadlineDays ?? 9999);
    if (sort === "progress") return a.progress - b.progress;
    return draftSortTitle(a).localeCompare(draftSortTitle(b));
  });
}
