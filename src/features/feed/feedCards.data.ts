import type { AvatarTint } from "../../shared/components/ui";

/**
 * Scripted enrichment for the redesigned demo feed cards. English,
 * untranslated — this is prototype persona content (like `FEED_POST` in
 * `feed.data.ts`), NOT UI chrome. Live mode never reads this; its cards
 * render from the thin `FeedItem` instead (see `api/feed.adapters.ts`).
 *
 * Every slug below is real and routable, verified against the app's own
 * data files (not invented):
 *  - `DEMO_MEMBER.slug` = "kai" → `MEMBERS.kai` in
 *    `src/features/members/data/members.ts` (initials/tint/hood/role below
 *    match that record).
 *  - `DEMO_GATHERING.slug` = "queer-book-club" → `GATHERINGS["queer-book-club"]`
 *    in `src/features/gatherings/data.ts`; `gatheringPath(slug)` resolves it.
 *  - `DEMO_COMMUNITY.slug` = "trans-hub" → `communities` in
 *    `src/features/homepage/data/communities.ts` ("Trans & Non-Binary Hub",
 *    147 members) and `LIVING["trans-hub"]` in
 *    `src/features/communities/livingCommunities.data.ts`
 *    (`accessTier: "request"`, `stats.members: 147`); `/community/:slug`
 *    routes it directly.
 */

/** New-member card. Mirrors `MEMBERS.kai` (real member record) plus invented
 *  card-only flavor (quote, tags, common-communities chips). */
export const DEMO_MEMBER = {
  slug: "kai",
  name: "Kai Larsson",
  initials: "KL",
  tint: "plum" as AvatarTint,
  photo:
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=800&auto=format&fit=crop",
  pronouns: "they/them",
  hood: "Cais do Sodré",
  occupation: "Filmmaker",
  quote:
    "Shooting a documentary on queer nightlife across Lisbon, Barcelona and Naples. Here to find interviewees and people who still cook Sunday lunch.",
  tags: ["Film & Documentary", "Nightlife", "Archive"],
  commonCommunities: [
    { initials: "TN", tint: "coral" as AvatarTint },
    { initials: "SC", tint: "jade" as AvatarTint },
  ],
  vouched: false,
};

/** Gathering card. Day/month/title/venue/host match the real
 *  `GATHERINGS["queer-book-club"]` record; `going`/`capacity`/`price`/`tags`
 *  are scripted card enrichment. */
export const DEMO_GATHERING = {
  slug: "queer-book-club",
  day: "19",
  month: "JUL",
  title: "Queer Book Club: July",
  venue: "LX Factory, Alcântara",
  host: "QueerPulse",
  quote:
    "This month: a queer classic in the courtyard. Come even if you didn't finish. Nobody checks.",
  going: 12,
  capacity: 16,
  price: "Free",
  tags: [
    { label: "Step-free venue" },
    { label: "Sober-friendly" },
    { label: "Kai is going", accent: true },
  ],
};

/** Community card. Name/slug/memberCount/visibility match the real
 *  "Trans & Non-Binary Hub" record (`communities.ts` + `LIVING["trans-hub"]`,
 *  request-to-join tier); quote/tags/activity are scripted card enrichment. */
export const DEMO_COMMUNITY = {
  slug: "trans-hub",
  name: "Trans & Non-Binary Hub",
  initials: "TN",
  tint: "coral" as AvatarTint,
  memberCount: 147,
  visibility: "Request to join",
  city: "Lisbon",
  quote: "Healthcare navigation, mutual aid, and a monthly dinner nobody leaves early.",
  newThisWeek: 9,
  tags: ["Mutual aid", "Healthcare"],
  posts7d: 21,
  activity: "Active daily",
};

/** Feed sidebar/hero banner counts — invented, platform-voice social proof. */
export const DEMO_BANNER = { joined: 5, sharing: 2 };
