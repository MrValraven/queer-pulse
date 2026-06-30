import type { ReactNode } from "react";

export type Privacy = "private" | "shared" | "public";
export type Thumb = "a" | "b" | "c" | "d" | "e";

export interface Collection {
  id: string;
  count: string;
  name: ReactNode;
  meta: string;
  thumbs: Thumb[];
  more: string;
  privacy: Privacy;
  privacyLabel: string;
  updated: string;
  featured?: boolean;
}

export const COLLECTIONS: Collection[] = [
  {
    id: "therapy",
    count: "14",
    name: (
      <>
        Bring to <em>therapy</em>
      </>
    ),
    meta: "Articles & threads I want to talk through with Inês",
    thumbs: ["a", "b", "c", "d"],
    more: "+ 10 more",
    privacy: "private",
    privacyLabel: "Private",
    updated: "Updated 2 days ago",
    featured: true,
  },
  {
    id: "lisbon",
    count: "22",
    name: (
      <>
        Lisbon <em>recs</em>
      </>
    ),
    meta: "Businesses, safe spaces, & therapists I'd send a friend to",
    thumbs: ["b", "e", "a", "d"],
    more: "+ 18 more",
    privacy: "shared",
    privacyLabel: "Shared with 4",
    updated: "Updated today",
  },
  {
    id: "issue10",
    count: "8",
    name: (
      <>
        Issue 10 <em>research</em>
      </>
    ),
    meta: "For the Rui-the-pharmacist piece I'm writing",
    thumbs: ["c", "d", "a"],
    more: "+ 5 more",
    privacy: "private",
    privacyLabel: "Private",
    updated: "Updated 5 hours ago",
  },
  {
    id: "reading",
    count: "32",
    name: <>Reading list</>,
    meta: "Long-form pieces I'll get to eventually",
    thumbs: ["c", "c", "b"],
    more: "+ 29 more",
    privacy: "public",
    privacyLabel: "Public",
    updated: "Updated last week",
  },
  {
    id: "mum",
    count: "5",
    name: (
      <>
        Send to <em>mum</em>
      </>
    ),
    meta: "When she's ready · printed-out version",
    thumbs: ["c", "a", "d"],
    more: "+ 2 more",
    privacy: "private",
    privacyLabel: "Private",
    updated: "Updated 3 weeks ago",
  },
];

export interface RecentSave {
  id: string;
  kind: string;
  kindVariant: "therapist" | "article" | "business";
  title: string;
  saved: string;
}

export const RECENT_SAVES: RecentSave[] = [
  {
    id: "r1",
    kind: "THE",
    kindVariant: "therapist",
    title: "Dr. Inês Pereira · therapist",
    saved: "Saved 12 minutes ago",
  },
  {
    id: "r2",
    kind: "ART",
    kindVariant: "article",
    title: '"Five things I learned navigating Lisbon\'s trans health system"',
    saved: "Saved yesterday",
  },
  {
    id: "r3",
    kind: "BIZ",
    kindVariant: "business",
    title: "Café Beirão · pastelaria + community room",
    saved: "Saved 3 days ago",
  },
];
