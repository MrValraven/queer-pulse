import type { ReactNode } from "react";
import { routes } from "../../app/routeMap";

export type DraftCategory = "posts" | "articles" | "applications" | "grants";
export type DraftStatus = "draft" | "ready" | "stale" | "atrisk";
export type DraftSortKey = "edited" | "deadline" | "progress" | "title";

/** Tabs: "all" plus one per category. Counts are derived live from the list. */
export const DRAFT_TABS: { key: "all" | DraftCategory; label: string }[] = [
  { key: "all", label: "All" },
  { key: "posts", label: "Posts & replies" },
  { key: "articles", label: "Articles & pitches" },
  { key: "applications", label: "Applications" },
  { key: "grants", label: "Grant applications" },
];

export const DRAFT_SORTS: { value: DraftSortKey; label: string }[] = [
  { value: "edited", label: "Recently edited" },
  { value: "deadline", label: "Closest deadline" },
  { value: "progress", label: "Least complete" },
  { value: "title", label: "Alphabetical" },
];

export const STATUS_LABEL: Record<DraftStatus, string> = {
  draft: "Draft",
  ready: "Ready",
  stale: "Stale",
  atrisk: "At risk",
};

/** Items in the "Start something" create menu on the drafts header. */
export const CREATE_ITEMS: {
  badge: string;
  tint: "jade" | "plum";
  label: string;
  sub: string;
  to: string;
}[] = [
  {
    badge: "POST",
    tint: "jade",
    label: "New post",
    sub: "Share to a community",
    to: routes.communitiesHome,
  },
  {
    badge: "PITCH",
    tint: "plum",
    label: "Pitch a story",
    sub: "To QueerPulse Magazine",
    to: routes.submitStory,
  },
  {
    badge: "JOB",
    tint: "jade",
    label: "Start an application",
    sub: "From a saved job",
    to: routes.jobs,
  },
];

export type MetaVariant = "deadline" | "pulse" | "stale" | "warn";
export interface DraftMeta {
  label: ReactNode;
  variant?: MetaVariant;
}

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
  /** Days until the deadline / 90-day deletion (sort: closest deadline). */
  deadlineDays?: number | null;
  /** Plain-text title for alphabetical sort. */
  sortTitle?: string;
  /** Plain-text haystack for search. */
  searchText?: string;
}

/** Meta shown after a draft has been kept 30 more days. */
export const KEPT_META: DraftMeta[] = [
  {
    label: (
      <>
        Started <b>87 days ago</b>
      </>
    ),
  },
  { label: "Kept · resets 90-day timer" },
];

export const DRAFTS: Draft[] = [
  {
    id: "d1",
    kind: "JOB",
    kindVariant: "job",
    category: "applications",
    status: "draft",
    href: routes.jobs,
    editedMinutes: 300,
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
      {
        label: (
          <>
            Started <b>2 days ago</b>
          </>
        ),
      },
      {
        label: (
          <>
            Last edited <b>this morning</b>
          </>
        ),
      },
      { label: "Closes 18 Jun · 9 days", variant: "deadline" },
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
    meta: [
      {
        label: (
          <>
            Started <b>last week</b>
          </>
        ),
      },
      { label: "Saved 2 min ago", variant: "pulse" },
    ],
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
    deadlineDays: null,
    sortTitle: "Grant application · €150",
    searchText: "grant application 150 replacement t prescription",
    title: <>Grant application · €150</>,
    desc: "Replacement T prescription · drafted earlier this week",
    meta: [
      {
        label: (
          <>
            Started <b>3 days ago</b>
          </>
        ),
      },
      {
        label: (
          <>
            Last edited <b>yesterday</b>
          </>
        ),
      },
    ],
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
    deadlineDays: null,
    sortTitle: "Post in Creatives",
    searchText: "post creatives portfolio night café beirão wednesday",
    title: (
      <>
        Post in <em>Creatives</em>
      </>
    ),
    desc: '"Hosting a portfolio night the first Wednesday of every month, at Café Beirão. 12 spots, drop a link…"',
    meta: [
      {
        label: (
          <>
            Started <b>4 days ago</b>
          </>
        ),
      },
      {
        label: (
          <>
            Last edited <b>2 days ago</b>
          </>
        ),
      },
    ],
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
    meta: [
      {
        label: (
          <>
            Started <b>2 hours ago</b>
          </>
        ),
      },
      { label: "Saved just now", variant: "pulse" },
    ],
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
    meta: [
      {
        label: (
          <>
            Started <b>14 days ago</b>
          </>
        ),
      },
      {
        label: (
          <>
            Last edited <b>13 days ago</b>
          </>
        ),
      },
    ],
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
    meta: [
      {
        label: (
          <>
            Started <b>87 days ago</b>
          </>
        ),
      },
      { label: "Deletes in 3 days · 90-day rule", variant: "warn" },
    ],
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
    meta: [
      {
        label: (
          <>
            Started <b>5 days ago</b>
          </>
        ),
      },
      {
        label: (
          <>
            Last edited <b>5 days ago</b>
          </>
        ),
      },
    ],
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
