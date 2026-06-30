import type { ReactNode } from "react";

export const DRAFT_TABS: { label: string; count: number }[] = [
  { label: "All", count: 8 },
  { label: "Posts & replies", count: 3 },
  { label: "Articles & pitches", count: 2 },
  { label: "Applications", count: 2 },
  { label: "Grant applications", count: 1 },
];

export type MetaVariant = "deadline" | "pulse" | "stale";
export interface DraftMeta {
  label: ReactNode;
  variant?: MetaVariant;
}

export interface DraftAction {
  label: string;
  variant?: "primary" | "danger";
  deletes?: boolean;
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
}

export const DRAFTS: Draft[] = [
  {
    id: "d1",
    kind: "JOB",
    kindVariant: "job",
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
      { label: "Stale", variant: "stale" },
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
      { label: "Deletes in 3 days · 90-day rule", variant: "deadline" },
    ],
    progress: 34,
    actions: [
      { label: "Resume", variant: "primary" },
      { label: "Keep 30 more days" },
      { label: "Delete now", variant: "danger", deletes: true },
    ],
  },
  {
    id: "d8",
    kind: "JOB",
    kindVariant: "job",
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
