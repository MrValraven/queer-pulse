import type { ReactNode } from "react";
import type { TFunction } from "../../shared/i18n/types";

export type Privacy = "private" | "shared" | "public";
export type Thumb = "a" | "b" | "c" | "d" | "e";

/** Catalog key per base privacy state — chrome, resolved through `t()`. */
export const PRIVACY_LABEL_KEY: Record<Privacy, string> = {
  private: "members:collections.privacy.private",
  shared: "members:collections.privacy.shared",
  public: "members:collections.privacy.public",
};

/** Display label for a collection's privacy state. When `privacy` is
 *  "shared" and `sharedWithCount` is known, shows the count instead of the
 *  bare "Shared" word — still entirely chrome (the phrasing), with the count
 *  as the only interpolated datum. */
export function privacyLabel(
  privacy: Privacy,
  sharedWithCount: number | undefined,
  t: TFunction,
): string {
  if (privacy === "shared" && sharedWithCount) {
    return t("members:collections.privacy.sharedWithCount", {
      count: sharedWithCount,
    });
  }
  return t(PRIVACY_LABEL_KEY[privacy]);
}

export interface Collection {
  id: string;
  count: string;
  name: ReactNode;
  /** Plain-text version of `name` (no embedded `<em>`), for use as an i18n
   *  interpolation token — `Translation`/`t()` values must be string|number. */
  plainName: string;
  meta: string;
  thumbs: Thumb[];
  more: string;
  privacy: Privacy;
  /** Only meaningful when `privacy === "shared"` — how many people it's shared with. */
  sharedWithCount?: number;
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
    plainName: "Bring to therapy",
    meta: "Articles & threads I want to talk through with Inês",
    thumbs: ["a", "b", "c", "d"],
    more: "+ 10 more",
    privacy: "private",
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
    plainName: "Lisbon recs",
    meta: "Businesses, safe spaces, & therapists I'd send a friend to",
    thumbs: ["b", "e", "a", "d"],
    more: "+ 18 more",
    privacy: "shared",
    sharedWithCount: 4,
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
    plainName: "Issue 10 research",
    meta: "For the Rui-the-pharmacist piece I'm writing",
    thumbs: ["c", "d", "a"],
    more: "+ 5 more",
    privacy: "private",
    updated: "Updated 5 hours ago",
  },
  {
    id: "reading",
    count: "32",
    name: <>Reading list</>,
    plainName: "Reading list",
    meta: "Long-form pieces I'll get to eventually",
    thumbs: ["c", "c", "b"],
    more: "+ 29 more",
    privacy: "public",
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
    plainName: "Send to mum",
    meta: "When she's ready · printed-out version",
    thumbs: ["c", "a", "d"],
    more: "+ 2 more",
    privacy: "private",
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
