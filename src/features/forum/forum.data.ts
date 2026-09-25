import type { IconType } from "react-icons";
import {
  FiGlobe,
  FiMessageCircle,
  FiHome,
  FiActivity,
  FiBookOpen,
  FiBriefcase,
  FiZap,
  FiUsers,
  FiHeart,
  FiLifeBuoy,
} from "react-icons/fi";
import { LuPalette, LuScale } from "react-icons/lu";
import { FaHandFist } from "react-icons/fa6";
import type { AvatarTint } from "../../shared/components/ui/Avatar";
import { tintForSlug, initialsOf } from "../../shared/api/refs";
import { MEMBERS, fullName, currentUser } from "../members/data/members";
import type { ReplySort } from "./api/forum.api";

/**
 * i18n Pattern A + label-key indirection: `id` is the canonical value the rest
 * of the app filters/routes/persists on (never translated); `nameKey` is the
 * only thing that changes with language.
 */
export const CATS: { id: string; nameKey: string; icon: IconType }[] = [
  { id: "all", nameKey: "forum:cat.all", icon: FiGlobe },
  { id: "general", nameKey: "forum:cat.general", icon: FiMessageCircle },
  { id: "housing", nameKey: "forum:cat.housing", icon: FiHome },
  { id: "health", nameKey: "forum:cat.health", icon: FiActivity },
  { id: "arts", nameKey: "forum:cat.arts", icon: LuPalette },
  { id: "activism", nameKey: "forum:cat.activism", icon: FaHandFist },
  { id: "guides", nameKey: "forum:cat.guides", icon: FiBookOpen },
  { id: "jobs", nameKey: "forum:cat.jobs", icon: FiBriefcase },
  { id: "trans", nameKey: "forum:cat.trans", icon: FiZap },
  { id: "meetups", nameKey: "forum:cat.meetups", icon: FiUsers },
  { id: "legal", nameKey: "forum:cat.legal", icon: LuScale },
  { id: "relationships", nameKey: "forum:cat.relationships", icon: FiHeart },
  { id: "platform", nameKey: "forum:cat.platform", icon: FiLifeBuoy },
];

/**
 * The colour family a category reads in (DES-120). SEMANTIC only: the real
 * values live in the consuming stylesheet, so a category badge is styled by a
 * CSS Module class rather than an inline `style` object built from literals.
 *
 * The washes used to be hardcoded `rgba()` triples here. `rgba(45,27,61,.08)`
 * is plum, and neither `--plum` nor `--plum-rgb` flips in dark mode, so the
 * "general" badge sat as a light smudge carrying near-black text on a dark
 * card. `neutral` now resolves to the line/ink channels, which do flip.
 */
export type CategoryTone = "neutral" | "jade" | "violet" | "coral" | "danger";

export const CAT_TONE: Record<string, CategoryTone> = {
  general: "neutral",
  housing: "jade",
  health: "violet",
  arts: "coral",
  activism: "danger",
  guides: "jade",
  jobs: "coral",
  trans: "violet",
  meetups: "jade",
  legal: "violet",
  relationships: "coral",
  platform: "neutral",
};

/**
 * The category label's TEXT colour, for the surfaces that tint a category name
 * without the badge chrome around it (the thread page's OP card). Tokens only,
 * and every one of them flips in dark mode: `--text-strong` is the plum-for-text
 * token, `--jade-ink` is the jade tuned to carry small text on a jade tint, and
 * `--violet` / `--accent-ink` / `--danger` each get a dark-mode override.
 *
 * The badge itself no longer reads this: it takes its whole appearance from the
 * `CAT_TONE` class in the stylesheet.
 */
export const CAT_STYLE: Record<string, { color: string }> = {
  general: { color: "var(--text-strong)" },
  housing: { color: "var(--jade-ink)" },
  health: { color: "var(--violet)" },
  arts: { color: "var(--accent-ink)" },
  activism: { color: "var(--danger)" },
  guides: { color: "var(--jade-ink)" },
  jobs: { color: "var(--accent-ink)" },
  trans: { color: "var(--violet)" },
  meetups: { color: "var(--jade-ink)" },
  legal: { color: "var(--violet)" },
  relationships: { color: "var(--accent-ink)" },
  platform: { color: "var(--text-strong)" },
};

/**
 * One photo on a published post, already resolved to a URL the browser can
 * fetch. Mirrors the backend's `ForumPostPhotoView` one field for one field.
 *
 * `id` is null for a post that still carries the LEGACY single `image` column:
 * the backend reconciles the old column and the newer photo rows into this one
 * gallery, so a render site consumes the gallery and never branches on which
 * of the two a post was written with.
 */
export interface ThreadPhoto {
  /** Row id, or null for a legacy single `image` shown as a one-photo gallery. */
  id: string | null;
  url: string;
  /** The author's own description, or null when they wrote none. NEVER
   *  replaced with an invented sentence: a guess read aloud as fact is worse
   *  for a screen reader than a generic label saying what the thing is. */
  alt: string | null;
}

/** One answer on a thread's poll, with the viewer's own position on it. */
export interface ThreadPollOption {
  id: string;
  label: string;
  /** The author's display order, 0-based. */
  position: number;
  /**
   * How many members picked this option, or NULL while the server is
   * withholding the tally from this viewer.
   *
   * NULL IS NOT ZERO, and the difference is the whole point: `null` is the
   * server declining to say until the viewer has voted (or the poll has
   * closed), while `0` is a real count on a poll nobody has answered yet. A
   * bar drawn from a null at 0% would tell a member "no votes" about a poll
   * that may hold hundreds. Branch on `ThreadPoll.resultsVisible`, never on
   * this being falsy.
   */
  voteCount: number | null;
  /** Whether THIS viewer picked it. Never withheld: it is their own ballot. */
  selected: boolean;
  /**
   * DEMO CORPUS ONLY: the tally the prototype reveals once the demo visitor
   * votes. Demo has no server to release a count, so the scripted number lives
   * here and `useThreadPoll` moves it into `voteCount` at the same moment a
   * live vote response would carry the real one. Always undefined on a live
   * poll, which gets its counts from the API and nowhere else.
   */
  demoTally?: number;
}

/**
 * The ballot attached to a thread.
 *
 * The counts are withheld by the SERVER rather than hidden here: a poll on this
 * platform can ask something that is nobody else's business, and a member who
 * reads the tally before answering is being invited to answer with the majority
 * instead of with the truth. `hasVoted` and each option's `selected` are always
 * truthful, because they are facts about the viewer's own ballot.
 */
export interface ThreadPoll {
  id: string;
  /** Whether a voter may pick more than one option. Fixed at creation. */
  allowMultiple: boolean;
  /** Ordered by `position`. */
  options: ThreadPollOption[];
  /** Sum of every option's count, or null while the results are withheld. On a
   *  multi-choice poll this counts SELECTIONS rather than voters, which is what
   *  the bars are drawn against. */
  totalVotes: number | null;
  /** When voting shuts (ISO), or null when it stays open as long as the thread
   *  does. Independent of the thread's own `closesAt`. */
  closesAt: string | null;
  /** Voting has shut. A closed poll still READS, and still refuses votes. */
  isClosed: boolean;
  /** Whether this viewer has cast a ballot. */
  hasVoted: boolean;
  /** Whether the counts above are populated rather than withheld. THE flag to
   *  branch on before rendering any number or bar. */
  resultsVisible: boolean;
}

export interface Reply {
  /** Stable identity for tree assembly. Live = backend post id; demo = seeded/generated id. */
  id: string;
  /** Parent comment id, or null for a top-level comment (reply to the thread/OP). */
  parentPostId: string | null;
  avatar: string;
  background: string;
  color: string;
  name: string;
  /** Member slug, when the author is a real member (links to their profile). */
  slug?: string;
  /** Member profile photo, when available. */
  photo?: string;
  /** True for the institutional QueerPulse account (links to governance, not a profile). */
  official?: boolean;
  /** Slug of the moderator posting on the platform's behalf (for an official byline). */
  mod?: string;
  /** The viewer authored this reply. Set on an optimistic reply the member
   *  just posted, so ownership checks key on a FLAG rather than on the
   *  display string "You" — which broke the moment the UI was translated. */
  isMine?: boolean;
  time: string;
  isOP?: boolean;
  helpful?: boolean;
  /** This reply is the thread's accepted answer (SOC-13). Live-provided
   *  (`ForumPostResponse.isAccepted`); demo threads set it locally. */
  accepted?: boolean;
  /** A passage this reply quotes. `cite` is the quoted author's display name,
   *  absent when the quoted post is not in the loaded page. Live quotes are
   *  written as `>`-prefixed leading lines of the reply body (see
   *  `splitLeadingQuote`); demo threads carry curated ones. */
  quote?: { cite?: string; text: string };
  body: string[];
  /** Resolved URL of a photo attached to this reply (live), or a local blob
   *  preview (demo / an optimistic just-posted reply). */
  image?: string;
  /** Every photo on this reply, resolved and ordered (up to four).
   *
   *  THE gallery: the backend has already reconciled the legacy single `image`
   *  above into it (a legacy photo arrives as one entry with `id: null`), so a
   *  render site consumes this and never branches on the old column. Undefined
   *  on a demo reply that carries none and on an optimistic just-posted one,
   *  which still falls back to `image`. */
  photos?: ThreadPhoto[];
  reactions: number;
  // ── Live edit/delete/restore metadata (backend-provided; absent in demo) ──
  /** Backend post id — the edit/delete/restore/history target. */
  postId?: string;
  /** ISO timestamp of the last edit, when the post has been edited. */
  editedAt?: string | null;
  /** True when the post is a soft-tombstone ("[deleted]"). */
  deleted?: boolean;
  /** True when the tombstone is a moderator `remove_content` takedown (as
   *  opposed to an author's own delete) — renders a distinct tombstone line. */
  removedByModerator?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
  /** Viewer's vote on this reply (0 or 1) — live only; demo keeps like state
   *  local. Optional so demo seed data still typechecks. */
  myVote?: number;
}

export interface Thread {
  id: number;
  /** Backend slug — the live detail/reply route param. Undefined for demo mock
   *  threads, which route by their numeric `id` instead. */
  slug?: string;
  category: string;
  pinned?: boolean;
  title: string;
  excerpt: string;
  author: {
    initials: string;
    name: string;
    background: string;
    color: string;
    slug?: string;
    photo?: string;
    official?: boolean;
    mod?: string;
    /** The viewer authored this thread (optimistic just-published card). A
     *  flag rather than the display string "You", which is translated. */
    isMine?: boolean;
  };
  posted: string;
  /** View count. OPTIONAL because the backend's `ForumThreadResponse` carries
   *  none: live threads leave it undefined and the OP card hides the stat
   *  rather than printing a permanent, untrue "0 views". Demo threads carry
   *  the mock's curated numbers. */
  views?: number;
  upvotes: number;
  comments: number;
  tags: string[];
  /** Full opening-post paragraphs shown on the thread page. */
  body: string[];
  replies: Reply[];
  /** Backend id of the opening post (edit/delete/restore/history target). */
  opPostId?: string;
  /** Whether replies are closed. Live-provided; demo threads are unlocked.
   *  Optional so demo seed data still typechecks. */
  isLocked?: boolean;
  /** Optional moderator note explaining why the thread was locked, shown on
   *  the locked banner. Live-only; absent/null in demo (curated demo threads
   *  are never locked). */
  lockReason?: string | null;
  /** Viewer's vote on the opening post (0 or 1) — live only. Optional so demo
   *  seed data still typechecks. */
  myVote?: number;
  editedAt?: string | null;
  deleted?: boolean;
  removedByModerator?: boolean;
  canEdit?: boolean;
  /** The THREAD's own author permission (`ForumThreadResponse.canEdit`), kept
   *  under its own name because `canEdit` on a thread DETAIL view-model is the
   *  OPENING POST's permission instead (see `threadDetail`). The post one goes
   *  false as soon as that post is tombstoned; the author's right to withdraw
   *  or refile the thread does not, so `canDeleteThread` and
   *  `canMoveThreadCategory` read this. Live-provided; absent in demo. */
  canEditTitle?: boolean;
  canDelete?: boolean;
  canRestore?: boolean;
  canViewHistory?: boolean;
  /** Whether the viewer may lock/unlock this thread (moderator permission).
   *  Live-provided; absent on demo threads, so the lock control is live-only. */
  canLock?: boolean;
  /** Whether the viewer may pin/unpin this thread (moderator permission).
   *  Live-provided; absent on demo threads, so the row menu's Pin item is
   *  live-only (demo threads already carry a fixed `pinned` badge instead). */
  canPin?: boolean;
  /** Is the viewer following this thread (SOC-13)? Live-provided; demo keeps
   *  its own local toggle. */
  isSubscribed?: boolean;
  /** The reply marked as this thread's answer, or null while it is open. */
  acceptedPostId?: string | null;
  /** Whether the viewer may set/clear the accepted answer (thread author or
   *  moderator). Live-provided. */
  canAcceptAnswer?: boolean;
  /** Whether the viewer may replace the tag set (author or moderator).
   *  Deliberately wider than `canEdit`, which is the author-only title
   *  permission. Live-provided. */
  canEditTags?: boolean;
  /** Resolved URL of a photo attached to the opening post, when there is one. */
  opImage?: string;
  /** When the thread was opened (ISO). Live-provided; absent on demo threads.
   *  Drives the author's 24-hour category-move window (PRD-163). There is no
   *  server flag for it, so it is computed from this. */
  createdAt?: string;
  /** The WHOLE thread has been withdrawn (PRD-160). Only ever true in a
   *  platform moderator's view; every other read path filters these out. */
  isDeleted?: boolean;
  /** How many replies have landed since the member last opened this thread
   *  (PRD-170), capped at 99 by the server.
   *
   *  `null` means there is no watermark to compare against: an anonymous
   *  visitor, a thread they have never opened, or a write echo from
   *  follow/lock/pin/delete/create/update. `0` means they are caught up. Only
   *  `1..99` earns a badge; `null` and `0` render nothing. Undefined on demo
   *  threads, which have no server. */
  unreadReplyCount?: number | null;
  /** The author's own warnings about what is inside (`CONTENT_WARNINGS` ids,
   *  or free text a member typed). Drives the CW pill and the obscured excerpt
   *  on the row and the opening-post card. Absent/empty means no warning, and
   *  nothing is ever obscured without one. */
  contentWarnings?: string[];
  /** The byline above is MASKED. Absent means an ordinary named thread.
   *
   *  The masking has already happened server-side by the time this arrives, so
   *  it leaks nothing, and a MODERATOR sees `true` beside the real author's
   *  name — which is the honest pair rather than a contradiction. Render what
   *  the response gives: `author.slug` is empty exactly when the name is
   *  withheld, so that, and never a re-derived rule, decides whether a byline
   *  links anywhere. */
  isAnonymous?: boolean;
  /** A second member credited on the thread. Absent for the ordinary
   *  single-author case, and absent whenever the byline is masked: an
   *  "anonymous" thread co-credited to a named member is not anonymous. */
  coAuthor?: {
    name: string;
    /** Member slug, when the co-author links to a profile. */
    slug?: string;
  };
  /** The ballot attached to this thread, or null/absent when it carries none. */
  poll?: ThreadPoll | null;
  /** The opening post's photos, resolved and ordered (up to four). The backend
   *  has already folded the legacy single `opImage` into this gallery, so the
   *  card renders THIS and leaves the old field to the surfaces that predate
   *  it. Empty on an unshowable OP: a takedown blanks the photos exactly as it
   *  blanks the excerpt, because a photo is content. */
  opPhotos?: ThreadPhoto[];
  /** The part of the city the thread is about, printed verbatim (these are
   *  proper nouns), or null/absent for nowhere in particular. */
  neighbourhood?: string | null;
  /** Which language the thread is written in: 'pt', 'en' or 'both'. Null or
   *  absent is "unstated", which renders as nothing rather than a guess. */
  language?: string | null;
  /** When the thread stops taking new replies (ISO), or null when it never
   *  does. The AUTHOR's deadline, which is a different fact from a moderator's
   *  `isLocked`, so a banner can say which of the two closed the thread. */
  closesAt?: string | null;
  /** `closesAt` is set and has passed: the thread is closed to new replies.
   *  Server-derived — never recomputed from the clock here. */
  isClosed?: boolean;
  /** Whether the thread is live to the forum RIGHT NOW. `false` reaches only
   *  its author (by link) and a moderator, and splits into two states with
   *  `reviewState`/`publishedAt`: scheduled, or awaiting review. */
  isPublished?: boolean;
  /** 'pending' / 'approved' / 'rejected', or null for the threads nobody ever
   *  submitted for review, which is most of them. */
  reviewState?: string | null;
  /** When the thread became visible (ISO). A FUTURE value is a scheduled
   *  thread, and only its author or a moderator ever receives one. */
  publishedAt?: string;
  /** Whether the OPENING POST is readable by this viewer (ENG-130).
   *
   *  Undefined while the posts page is still in flight and on demo threads.
   *  `false` is the server saying this thread carries no OP anyone here can
   *  see (its author is muted/blocked for this viewer, a moderator hid it, or
   *  the thread genuinely has no `is_op` post): the OP card says so plainly
   *  and every post that DID come back is rendered as a reply. */
  isOpAvailable?: boolean;
}

// ── Author / reply identity, driven by the member registry ──────────────────
// Every human who posts or comments on the forum is a real member from the
// canonical registry, so their name, initials and avatar tint stay consistent
// with their profile, directory card and activity everywhere else. The only
// non-member voice is the institutional QueerPulse account.

// Solid avatar (thread authors) by member tint.
const SOLID: Partial<
  Record<AvatarTint, { background: string; color: string }>
> = {
  coral: { background: "var(--accent)", color: "var(--paper)" },
  jade: { background: "var(--jade)", color: "var(--paper)" },
  plum: { background: "var(--plum)", color: "rgb(var(--cream-rgb))" },
};
// Soft avatar (reply authors) by member tint.
const SOFT: Partial<Record<AvatarTint, { background: string; color: string }>> =
  {
    coral: { background: "rgba(232,119,90,.14)", color: "var(--accent-ink)" },
    jade: { background: "rgba(74,140,111,.15)", color: "var(--jade)" },
    plum: { background: "rgba(45,27,61,.1)", color: "var(--plum)" },
  };
const solid = (tint: AvatarTint) => SOLID[tint] ?? SOLID.plum!;
const soft = (tint: AvatarTint) => SOFT[tint] ?? SOFT.plum!;

/** Thread-author block built from a member slug. */
function author(slug: string): Thread["author"] {
  const m = MEMBERS[slug]!;
  const s = solid(m.tint);
  return {
    initials: m.initials,
    name: fullName(m),
    background: s.background,
    color: s.color,
    slug,
    photo: m.photo,
  };
}

/** Reply block built from a member slug, plus the per-reply content. */
function reply(
  slug: string,
  rest: Omit<
    Reply,
    | "avatar"
    | "background"
    | "color"
    | "name"
    | "slug"
    | "photo"
    | "official"
    | "mod"
  >,
): Reply {
  const m = MEMBERS[slug]!;
  const s = soft(m.tint);
  return {
    avatar: m.initials,
    background: s.background,
    color: s.color,
    name: fullName(m),
    slug,
    photo: m.photo,
    ...rest,
  };
}

// The institutional QueerPulse account — the one non-member voice. Each official
// post is published by a named moderator on the platform's behalf (the `mod`
// slug), and links to the governance page rather than a personal profile.
const qpAuthor = (mod: string): Thread["author"] => ({
  initials: "QP",
  name: "QueerPulse",
  background: "var(--accent)",
  color: "var(--paper)",
  official: true,
  mod,
});
const qpReply = (
  mod: string,
  rest: Omit<
    Reply,
    | "avatar"
    | "background"
    | "color"
    | "name"
    | "slug"
    | "photo"
    | "official"
    | "mod"
  >,
): Reply => ({
  avatar: "QP",
  background: "rgba(232,119,90,.14)",
  color: "var(--accent-ink)",
  name: "QueerPulse",
  official: true,
  mod,
  ...rest,
});

// ── Demo photos, polls and masked bylines ───────────────────────────────────
// DEMO CORPUS ONLY. Live galleries and ballots are resolved by the backend and
// arrive through `forum.adapters`; nothing below can reach a live render.

/** One photo on a demo post. `alt` is the description a demo author wrote, and
 *  `null` where one deliberately wrote none, so the published surfaces get
 *  exercised on both. */
function demoPhoto(unsplashId: string, alt: string | null): ThreadPhoto {
  return {
    id: `demo-photo-${unsplashId}`,
    url: `https://images.unsplash.com/${unsplashId}?q=80&w=900&auto=format&fit=crop`,
    alt,
  };
}

/** One answer on a demo ballot. `tally` is the count the demo RELEASES once the
 *  visitor has voted (see `useThreadPoll`); `voteCount` stays whatever the
 *  poll's own `resultsVisible` says it should be, which for a withheld poll is
 *  null and never zero. */
function demoPollOption(
  pollId: string,
  index: number,
  label: string,
  tally: number,
  isReleased: boolean,
): ThreadPollOption {
  return {
    id: `${pollId}-opt-${index}`,
    label,
    position: index,
    voteCount: isReleased ? tally : null,
    selected: false,
    demoTally: tally,
  };
}

/** The byline a MASKED thread wears in demo. Live never builds one of these:
 *  the server sends the masked author block itself, carrying an empty handle,
 *  which is what makes the name link nowhere. Same here: no slug, no photo. */
const maskedAuthor: Thread["author"] = {
  initials: "",
  name: "",
  background: "rgba(var(--plum-rgb), .1)",
  color: "var(--text-strong)",
};

/** Author block for the logged-in member, shown when they publish a thread —
 *  DEMO ONLY. It is built from the mock `currentUser` (the "Tiago Costa"
 *  persona), so it must never author a live post. Live mode uses
 *  `selfAuthorFromProfile` with the real session identity instead.
 *
 *  `name` is a PLACEHOLDER: the caller overwrites it with `t("forum:author.you")`
 *  (this module has no translator). Ownership is read off `isMine`, never off
 *  the display string. */
export const SELF_AUTHOR: Thread["author"] = {
  initials: currentUser.initials,
  name: "",
  isMine: true,
  background: solid(currentUser.tint).background,
  color: solid(currentUser.tint).color,
  slug: currentUser.slug,
  photo: currentUser.photo,
};

/**
 * Neutral, non-persona author for an optimistic LIVE thread when the session
 * profile isn't available. Compose is auth-gated, so this is a defensive
 * fallback only — it exists so live can NEVER borrow the demo `SELF_AUTHOR`
 * ("Tiago Costa") persona. It carries no slug/photo (links nowhere) and reads as
 * the viewer's own post until the create response reconciles the card.
 *
 * `name` is a PLACEHOLDER the caller fills with `t("forum:author.you")`.
 */
export const NEUTRAL_AUTHOR: Thread["author"] = {
  initials: "",
  name: "",
  isMine: true,
  background: "var(--plum)",
  color: "rgb(var(--cream-rgb))",
};

/**
 * Author block for a REAL authenticated member publishing in live mode, built
 * entirely from the session profile (`useAuth().user.profile`) — never the mock
 * registry — so the demo "Tiago Costa" persona can never appear on a production
 * post. Avatar tint is derived deterministically from the real slug, matching
 * how `threadToCard` colours the same member's server-persisted copy.
 */
export function selfAuthorFromProfile(profile: {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}): Thread["author"] {
  const tone = solid(tintForSlug(profile.slug));
  return {
    initials: initialsOf(profile.firstName, profile.lastName),
    name: `${profile.firstName} ${profile.lastName}`.trim(),
    background: tone.background,
    color: tone.color,
    slug: profile.slug,
    photo: profile.avatarUrl ?? undefined,
  };
}

/**
 * Scripted demo threads. Each carries a SYNTHETIC `opPostId` (`demo-op-<id>`) so
 * the demo upvote button toggles: the demo thread list is cached via
 * `useThreads`' `queryFn`, and `useVotePost`'s optimistic `onMutate` finds the
 * card by `opPostId` and flips `myVote`/`upvotes` in place (demo makes no API
 * call). These ids are demo-only — live never reads `THREADS` for the list — so
 * they cannot reach a production request. None of these threads is authored by
 * the demo persona, so the synthetic id never surfaces a moderation menu.
 */
export const THREADS: Thread[] = [
  {
    id: 1,
    opPostId: "demo-op-1",
    category: "guides",
    pinned: true,
    title: "Master resource guide: LGBTQ+ in Lisbon",
    excerpt:
      "Everything you need to navigate Lisbon as a queer person: organisations, healthcare, housing, legal rights, and community. Updated monthly.",
    author: qpAuthor("mariana"),
    posted: "2 months ago",
    views: 4120,
    upvotes: 201,
    comments: 12,
    tags: ["guide", "resources"],
    body: [
      "This is the living index we point every new arrival to. It pulls together the organisations, healthcare routes, housing boards, legal contacts, and community spaces that members have vouched for, and we update it at the start of every month.",
      "Each section links out to a dedicated guide: trans-affirming healthcare, the housing board, emergency and legal resources, and the events calendar. If a contact has gone cold or a link is dead, reply here and a moderator will fix it within a day or two.",
      "Bookmark this thread. If you only read one thing on the forum, read this one first.",
    ],
    replies: [
      reply("rita", {
        id: "reply-thread1-rita",
        parentPostId: null,
        time: "6 weeks ago",
        helpful: true,
        body: [
          "Saving this. The healthcare section alone saved me weeks of guesswork when I moved over from Porto. The note about which SNS centres actually follow the trans pathway is gold.",
          "One addition: the AMPLOS parents-and-families group runs a monthly drop-in that isn't listed yet. Worth adding under community.",
        ],
        reactions: 14,
      }),
      qpReply("mariana", {
        id: "reply-thread1-mariana",
        parentPostId: null,
        time: "6 weeks ago",
        isOP: true,
        quote: {
          cite: fullName(MEMBERS.rita!),
          text: "the AMPLOS parents-and-families group runs a monthly drop-in…",
        },
        body: [
          `Added AMPLOS to the community section. Thank you ${MEMBERS.rita!.first}. Keep them coming.`,
        ],
        reactions: 5,
      }),
      reply("tomas", {
        id: "reply-thread1-tomas",
        parentPostId: null,
        time: "3 weeks ago",
        body: [
          "Could we get a Portuguese translation of the legal-rights section? Happy to draft it if someone can review.",
        ],
        reactions: 9,
      }),
    ],
  },
  {
    id: 2,
    opPostId: "demo-op-2",
    // A guide that walks through hormones, surgery routes and gatekeeping.
    // The warning is the author's own, and the taste of it stays covered on
    // the list until a reader asks for it.
    contentWarnings: ["medical"],
    language: "en",
    category: "health",
    pinned: true,
    title: "Trans-affirming healthcare in Lisbon: the full guide",
    excerpt:
      "How to find a GP who will treat you with respect, how the SNS system handles trans healthcare, and who to call when it goes wrong.",
    author: author("jonas"),
    posted: "5 weeks ago",
    views: 2870,
    upvotes: 87,
    comments: 31,
    tags: ["health", "trans", "guide"],
    body: [
      "I put this together after three years of navigating the system myself and helping a dozen other people through it. The short version: it is possible to get respectful, competent care on the SNS, but which centro de saúde you land at matters enormously.",
      "The guide covers how to register, how to request a referral to the gender team at the Hospital de Santa Maria, what documentation actually speeds things up, and, importantly, what to do when a GP stalls or misgenders you. There are escalation routes that work.",
      "I will keep this updated as the 2026 protocol changes land. If your experience differs from what is written here, please reply so the picture stays honest.",
    ],
    replies: [
      reply("daniel-oliveira", {
        id: "reply-thread2-daniel-oliveira",
        parentPostId: null,
        time: "5 weeks ago",
        helpful: true,
        body: [
          'The escalation section is the part nobody tells you about. I spent eight months stuck because my GP "forgot" to send the referral twice. The patient-ombudsman letter template here got it moving in a fortnight.',
        ],
        reactions: 19,
      }),
      reply("mariana", {
        id: "reply-thread2-mariana",
        parentPostId: null,
        time: "4 weeks ago",
        body: [
          "Adding a data point: the Lapa centro de saúde was genuinely good for me. The GP had clearly worked with trans patients before and didn't make me explain the basics.",
        ],
        reactions: 11,
      }),
      reply("jonas", {
        id: "reply-thread2-jonas",
        parentPostId: null,
        time: "4 weeks ago",
        isOP: true,
        body: [
          "Noted Lapa as a recommended centre. Thank you both. This is exactly the kind of ground-truth that makes the guide useful.",
        ],
        reactions: 6,
      }),
    ],
  },
  {
    id: 3,
    opPostId: "demo-op-3",
    category: "general",
    pinned: true,
    title: "Welcome thread: introduce yourself",
    excerpt:
      "Say hello. Tell us who you are, where you're from, what you make, and what brought you to QueerPulse. We read every one.",
    author: qpAuthor("rui"),
    posted: "3 weeks ago",
    views: 3340,
    upvotes: 156,
    comments: 89,
    tags: ["welcome"],
    body: [
      "New here? This is the place to land. Tell us your name (or what you go by), where you came from, what you make or do, and what brought you to QueerPulse.",
      "No pressure to write an essay. A single line is welcome. The only rule is the one that runs through the whole forum: be kind, be useful.",
    ],
    replies: [
      reply("carla", {
        id: "reply-thread3-carla",
        parentPostId: null,
        time: "3 weeks ago",
        body: [
          "Hi all. Carla, illustrator, moved here from Madrid in January. Still figuring out the city but the welcome here has been real. Looking for studio-share leads and people to draw with.",
        ],
        reactions: 12,
      }),
      reply("diogo", {
        id: "reply-thread3-diogo",
        parentPostId: null,
        time: "3 weeks ago",
        body: [
          "Diogo, sound engineer, Lisbon born and back after six years in Berlin. Here for the music thread and to find collaborators. Say hi if you make anything noisy.",
        ],
        reactions: 8,
      }),
      reply("bilal-kaya", {
        id: "reply-thread3-bilal-kaya",
        parentPostId: null,
        time: "2 weeks ago",
        body: [
          "Bilal, they/them, just arrived from Beirut. Nervous and excited. Grateful this exists.",
        ],
        reactions: 21,
      }),
    ],
  },
  {
    id: 5,
    opPostId: "demo-op-5",
    category: "activism",
    title: "Proposal: Monthly queer film night at Cinema São Jorge",
    excerpt:
      "Sofia is proposing a monthly queer film screening at Cinema São Jorge. She has a relationship with their programming team. Upvote if you'd come.",
    author: author("sofia"),
    posted: "4 days ago",
    views: 612,
    upvotes: 38,
    comments: 24,
    tags: ["proposal", "film"],
    body: [
      "I have been talking to the programming team at Cinema São Jorge and they are genuinely open to a recurring queer film night: one Tuesday a month, the small room, ticketed at cost so it stays affordable.",
      "Before I commit us, I want to know two things: would you actually come, and would you help? I can handle the cinema relationship and programming, but I would need a couple of people on the door and one on social.",
      "Upvote if you would come. Reply if you want to help make it happen.",
    ],
    replies: [
      reply("ines", {
        id: "reply-thread5-ines",
        parentPostId: null,
        time: "4 days ago",
        helpful: true,
        body: [
          "Yes, and yes. I can do the door and bring the bookshop in as a small sponsor. A monthly anchor like this is exactly what the scene is missing.",
        ],
        reactions: 13,
      }),
      reply("rui-fernandes", {
        id: "reply-thread5-rui-fernandes",
        parentPostId: null,
        time: "3 days ago",
        body: [
          "Would absolutely come. Suggestion: keep one slot a quarter for Portuguese-language queer cinema specifically. There is more of it than people think and it never gets screened.",
        ],
        reactions: 7,
      }),
      reply("sofia", {
        id: "reply-thread5-sofia",
        parentPostId: null,
        time: "3 days ago",
        isOP: true,
        quote: {
          cite: fullName(MEMBERS.ines!),
          text: "I can do the door and bring the bookshop in as a small sponsor.",
        },
        body: [
          `Amazing. That covers door and a sponsor in one go. ${MEMBERS["rui-fernandes"]!.first}, the Portuguese-cinema slot is a great idea, locking it in. I will draft a first season and post it next week.`,
        ],
        reactions: 9,
      }),
    ],
  },
  {
    id: 6,
    opPostId: "demo-op-6",
    // The author gave the question a deadline and it has passed. Replies are
    // shut, the conversation stays readable, and the ballot below shows its
    // final tally: a closed poll still READS, it just refuses new votes.
    closesAt: "2026-09-01T18:00:00.000Z",
    isClosed: true,
    language: "both",
    poll: {
      id: "demo-poll-6",
      allowMultiple: true,
      options: [
        demoPollOption("demo-poll-6", 0, "A quiet daytime cafe", 148, true),
        demoPollOption("demo-poll-6", 1, "A lesbian bar", 211, true),
        demoPollOption(
          "demo-poll-6",
          2,
          "A bookshop with a back room for readings",
          96,
          true,
        ),
        demoPollOption(
          "demo-poll-6",
          3,
          "A sober night that runs past midnight",
          134,
          true,
        ),
      ],
      totalVotes: 589,
      closesAt: "2026-09-01T18:00:00.000Z",
      isClosed: true,
      hasVoted: false,
      // Released because the poll has CLOSED: there is no longer a ballot for
      // the tally to influence, and the results are the point of a finished
      // question.
      resultsVisible: true,
    },
    category: "general",
    title: "What queer spaces in Lisbon do you miss or want to see return?",
    excerpt:
      "Bars, clubs, bookshops, community centres: what's been lost, what never existed but should, and what we could build. Share yours.",
    author: author("diogo"),
    posted: "6 days ago",
    views: 980,
    upvotes: 44,
    comments: 28,
    tags: ["spaces", "culture"],
    body: [
      "I keep hearing people talk about places that used to exist: a bar in Príncipe Real, a women's night that ran for years, a bookshop that doubled as a meeting room. Some of it before my time.",
      "So: what do you miss, what never existed but should have, and, the real question, what could we actually build now, together? I am asking partly out of nostalgia and partly because I think a list like this is the start of a plan.",
    ],
    replies: [
      reply("catarina-vaz", {
        id: "reply-thread6-catarina-vaz",
        parentPostId: null,
        time: "5 days ago",
        body: [
          "A daytime space. Everything queer here is nocturnal and built around drinking. I want somewhere to sit with a coffee and a laptop at 3pm and not be the only one.",
        ],
        reactions: 17,
      }),
      // Nested demo seed (Task 4): jordan is a direct reply to catarina-vaz's
      // daytime-space idea ("Seconding the daytime idea…"), and diogo's closing
      // OP reply is a direct reply to jordan's café-library suggestion — a
      // natural depth-2 chain (catarina-vaz -> jordan -> diogo) with no copy
      // changes needed.
      reply("jordan", {
        id: "reply-thread6-jordan",
        parentPostId: "reply-thread6-catarina-vaz",
        time: "5 days ago",
        helpful: true,
        body: [
          "Seconding the daytime idea. The old Lisbon women's collective ran a café-library model in the 90s and it worked because it was useful, not just social. We could do a modern version with the micro-grants fund seeding it.",
        ],
        reactions: 15,
      }),
      reply("diogo", {
        id: "reply-thread6-diogo",
        parentPostId: "reply-thread6-jordan",
        time: "4 days ago",
        isOP: true,
        body: [
          "The café-library keeps coming up in DMs too. I am going to pull these into a proper proposal and tag the governance thread. Keep them coming.",
        ],
        reactions: 6,
      }),
    ],
  },
  {
    id: 8,
    opPostId: "demo-op-8",
    neighbourhood: "Arroios",
    language: "en",
    opPhotos: [
      demoPhoto(
        "photo-1560448204-e02f11c3d0e2",
        "A viewing queue on a Lisbon stairwell, a dozen people waiting on the landing",
      ),
      demoPhoto(
        "photo-1502672260266-1c1ef2d93688",
        "A rental listing photo of a small kitchen with a window onto a light well",
      ),
      // Nobody wrote a description for this one, and none is invented on their
      // behalf: the gallery says what it is and no more.
      demoPhoto("photo-1493809842364-78817add7ffb", null),
    ],
    category: "housing",
    title: "Honest guide to finding a flat in Lisbon as a newcomer",
    excerpt:
      "Carla wrote this after three weeks on the rental market. Not encouraging. But useful, and more honest than anything you'll find on a portal.",
    author: author("carla"),
    posted: "2 weeks ago",
    views: 1740,
    upvotes: 41,
    comments: 22,
    tags: ["housing", "guide"],
    body: [
      "Three weeks, forty-something viewings, two scams narrowly avoided. Here is what I wish someone had told me before I started looking.",
      'Budget for the deposit-plus-two-months reality, assume the photos are two years old, and never transfer anything before seeing a place in person. The "I am abroad, here are the keys by courier" message is always a scam. The fiador (guarantor) requirement is the wall most newcomers hit; I get into the workarounds below.',
      "This is not meant to discourage you. People do find homes here. It just takes longer and costs more than the portals admit, and going in clear-eyed helps.",
    ],
    replies: [
      reply("catarina-melo", {
        id: "reply-thread8-catarina-melo",
        parentPostId: null,
        time: "2 weeks ago",
        helpful: true,
        body: [
          "The fiador workaround section is the most useful thing I have read on this forum. For anyone stuck: some landlords accept a larger deposit in lieu of a guarantor if you ask directly. It is negotiable more often than you think.",
        ],
        reactions: 16,
      }),
      reply("luisa", {
        id: "reply-thread8-luisa",
        parentPostId: null,
        time: "12 days ago",
        photos: [
          demoPhoto(
            "photo-1522708323590-d24dbb6b0267",
            "A shared living room with two sofas and a bookcase, taken from the doorway",
          ),
        ],
        body: [
          "Adding the obvious one people forget: the QueerPulse housing board has flatshares that never touch the public portals. I found my room there in a week after a month of portal misery.",
        ],
        reactions: 10,
      }),
    ],
  },
  {
    id: 16,
    opPostId: "demo-op-16",
    language: "en",
    contentWarnings: ["medical"],
    // Two people wrote it, and the byline says both.
    coAuthor: { name: fullName(MEMBERS.rita!), slug: "rita" },
    category: "trans",
    pinned: true,
    title: "Trans healthcare in Portugal 2026: the complete SNS guide",
    excerpt:
      "How the SNS pathway works, which gender clinics in Lisbon are actually welcoming, and what to do when the system pushes back.",
    author: author("jonas"),
    posted: "2 weeks ago",
    views: 2210,
    upvotes: 92,
    comments: 26,
    tags: ["trans", "healthcare"],
    body: [
      "A companion to the Lisbon healthcare guide, this one focuses specifically on the 2026 SNS pathway end to end: registration, the gender-team referral, the assessment process, and what HRT access actually looks like once you are in the system.",
      "I have tried to be precise about timelines, what is realistic versus what the protocol promises, and to name the points where people most often get stuck. There is also a section on private routes for those who can afford them and want to bridge the wait.",
      "If the protocol shifts mid-year, I will flag the change here with a date so you can tell old advice from current.",
    ],
    replies: [
      reply("sara-pinheiro", {
        id: "reply-thread16-sara-pinheiro",
        parentPostId: null,
        time: "11 days ago",
        helpful: true,
        body: [
          "The realistic-timeline section deserves to be pinned on its own. I went in expecting the protocol numbers and the honest version here stopped me spiralling when month four came and went with no appointment.",
        ],
        reactions: 18,
      }),
      reply("daniel-oliveira", {
        id: "reply-thread16-daniel-oliveira",
        parentPostId: null,
        time: "9 days ago",
        body: [
          "For the private-bridge section: worth noting a couple of the endocrinologists listed will coordinate with your SNS team so you are not running two parallel records. Ask before booking.",
        ],
        reactions: 7,
      }),
    ],
  },
  {
    id: 11,
    opPostId: "demo-op-11",
    language: "both",
    poll: {
      id: "demo-poll-11",
      allowMultiple: false,
      options: [
        demoPollOption(
          "demo-poll-11",
          0,
          "Tchindas (Cabo Verde, 2015)",
          42,
          false,
        ),
        demoPollOption(
          "demo-poll-11",
          1,
          "Madame Satã (Brazil, 2002)",
          37,
          false,
        ),
        demoPollOption(
          "demo-poll-11",
          2,
          "Morrer Como Um Homem (Portugal, 2009)",
          55,
          false,
        ),
      ],
      // WITHHELD, not zero. Nobody has voted from this browser yet, so the
      // server would decline to say — and the card shows choosable options
      // with no numbers and no bars rather than a tally of nothing.
      totalVotes: null,
      closesAt: "2026-10-03T21:00:00.000Z",
      isClosed: false,
      hasVoted: false,
      resultsVisible: false,
    },
    category: "arts",
    title: "Vote: Queer film series, what do we watch in July?",
    excerpt:
      "We're doing our first proper screening. Submit and upvote films below. Foreign language films very welcome.",
    author: author("sofia"),
    posted: "2 days ago",
    views: 430,
    upvotes: 18,
    comments: 12,
    tags: ["film", "vote"],
    body: [
      "Following on from the São Jorge proposal. Our first screening is happening in July and you get to pick it. Drop a film in the replies and upvote the ones you would turn up for.",
      "Two asks: foreign-language and Portuguese cinema very welcome, and try to keep it to things we can actually licence for a small one-off screening. I will tally the top three next Friday.",
    ],
    replies: [
      reply("kai", {
        id: "reply-thread11-kai",
        parentPostId: null,
        time: "2 days ago",
        body: [
          '"Tchindas", a documentary from Cabo Verde, warm, funny, and almost never screened here. Would be a perfect opener.',
        ],
        reactions: 9,
      }),
      reply("mariana-costa", {
        id: "reply-thread11-mariana-costa",
        parentPostId: null,
        time: "1 day ago",
        helpful: true,
        body: [
          'Seconding a Lusophone opener. If we want something with a bit of weight after, "Madame Satã" still holds up and gets people talking afterwards, which is half the point of a screening.',
        ],
        reactions: 11,
      }),
      reply("sofia", {
        id: "reply-thread11-sofia",
        parentPostId: null,
        time: "22h ago",
        isOP: true,
        body: [
          "Both on the shortlist. Keep voting. I will post the final three on Friday and we will run the top one as the July night.",
        ],
        reactions: 4,
      }),
    ],
  },
  {
    id: 13,
    opPostId: "demo-op-13",
    category: "general",
    title: "Should QueerPulse be more accessible to non-professionals?",
    excerpt:
      "The invite-only + 'professional network' framing might be excluding people who need community most. Thoughts?",
    author: author("catarina-vaz"),
    posted: "1 week ago",
    views: 1120,
    upvotes: 41,
    comments: 23,
    tags: ["platform", "inclusion"],
    body: [
      'I want to raise something carefully. The invite-only model and the "professional network" language keep the quality high, but I worry they quietly select for people who already have stability, and screen out the ones who need community most.',
      "I am not arguing for throwing the doors open overnight. I am asking whether there is a middle path: a sponsored-membership route, an open resources tier, something. What would we lose, and what would we gain?",
    ],
    replies: [
      reply("andre", {
        id: "reply-thread13-andre",
        parentPostId: null,
        time: "7 days ago",
        body: [
          'I came in through a member sponsor with zero "professional" credentials and it changed my year. So I am living proof the middle path works. It just currently depends on knowing the right person, which is the problem you are naming.',
        ],
        reactions: 14,
      }),
      reply("fatima", {
        id: "reply-thread13-fatima",
        parentPostId: null,
        time: "7 days ago",
        helpful: true,
        body: [
          "A two-tier idea worth costing: keep the curated network as-is, but make the resources, housing board, and emergency contacts fully open with no invite. The stuff that saves lives should not be behind a gate. The social layer can stay curated.",
        ],
        reactions: 22,
      }),
      reply("catarina-vaz", {
        id: "reply-thread13-catarina-vaz",
        parentPostId: null,
        time: "6 days ago",
        isOP: true,
        quote: {
          cite: fullName(MEMBERS.fatima!),
          text: "make the resources, housing board, and emergency contacts fully open…",
        },
        body: [
          `This is the sharpest version of what I was reaching for. I am going to write it up as a governance proposal: open safety layer, curated social layer. Thank you ${MEMBERS.fatima!.first}.`,
        ],
        reactions: 8,
      }),
    ],
  },
  {
    id: 18,
    opPostId: "demo-op-18",
    // A proposal its author sent to the council. Invisible to the forum until
    // somebody approves it, and reachable by its author in the meantime.
    isPublished: false,
    reviewState: "pending",
    category: "activism",
    title: "Micro-grants: Q3 2026 applications now open",
    excerpt:
      "The community fund has €840 available this quarter for projects, events, and emergencies. €50–200 grants, no bureaucracy.",
    author: qpAuthor("ana"),
    posted: "4 days ago",
    views: 760,
    upvotes: 22,
    comments: 9,
    tags: ["grants", "fund"],
    body: [
      "The community fund stands at €840 for Q3. Grants run €50–200 and are meant to be quick: a paragraph on what you need it for, no forms, no jury theatre.",
      "Priority goes to three things: small queer-led projects and events, skills and equipment that pay forward, and genuine emergencies. Decisions are made by a rotating panel of three members and announced openly in the governance thread.",
      "Reply here or DM a moderator to apply. If you have benefited before, consider topping the fund up. It only exists because members keep it alive.",
    ],
    replies: [
      reply("ines-fonseca", {
        id: "reply-thread18-ines-fonseca",
        parentPostId: null,
        time: "3 days ago",
        body: [
          "Applied for €120 toward materials for a binder-sewing workshop. Whatever the panel decides, thank you for making the process this painless. The no-forms part is why I actually applied.",
        ],
        reactions: 10,
      }),
      reply("nuno", {
        id: "reply-thread18-nuno",
        parentPostId: null,
        time: "2 days ago",
        body: [
          "Topped up €30. Got a €150 emergency grant in February that covered a locksmith when I was locked out the week I arrived. Paying it forward.",
        ],
        reactions: 13,
      }),
    ],
  },
  {
    id: 15,
    opPostId: "demo-op-15",
    neighbourhood: "Anjos",
    language: "pt",
    // Written now, going live when the shop opens applications. Only its author
    // and a moderator can reach it until then, so the page says which state it
    // is in rather than leaving that silence unexplained.
    isPublished: false,
    publishedAt: "2026-12-01T09:00:00.000Z",
    category: "jobs",
    title: "Queer-run bookshop in Anjos: hiring a bookseller",
    excerpt:
      "The bookshop we've been building is opening in September. Looking for a part-time bookseller with a love of queer literature.",
    author: author("ines"),
    posted: "1 day ago",
    views: 540,
    upvotes: 31,
    comments: 14,
    tags: ["jobs", "bookshop"],
    body: [
      "It is really happening. The bookshop opens in Anjos in September, and we are hiring our first part-time bookseller. Three days a week to start, fair pay on the solidarity scale, with room to grow as we do.",
      "What we are looking for: someone who genuinely loves queer literature, is comfortable on a till and talking to strangers, and wants to help shape a space rather than just staff it. Portuguese and English both needed; other languages a bonus.",
      "No formal CV required. Tell me about a book that changed you and why you want this. Reply here or DM me.",
    ],
    replies: [
      reply("anika", {
        id: "reply-thread15-anika",
        parentPostId: null,
        time: "22h ago",
        helpful: true,
        body: [
          'The book that changed me was "Stone Butch Blues" at nineteen, in a library copy I renewed four times because I couldn\'t afford my own. I have run a till for six years and I would love this. Sending a DM.',
        ],
        reactions: 15,
      }),
      reply("tomas-mendes", {
        id: "reply-thread15-tomas-mendes",
        parentPostId: null,
        time: "18h ago",
        body: [
          "Not applying, but if you need someone to build a few shelves before September, I do carpentry and I will trade it for a launch-night invite. Serious offer.",
        ],
        reactions: 8,
      }),
      reply("ines", {
        id: "reply-thread15-ines",
        parentPostId: null,
        time: "15h ago",
        isOP: true,
        body: [
          `${MEMBERS.anika!.first}, that is exactly the energy. Replied to your DM. ${MEMBERS["tomas-mendes"]!.first}, yes please, the shelves are genuinely on the critical path. Let us talk.`,
        ],
        reactions: 6,
      }),
    ],
  },
  {
    id: 19,
    opPostId: "demo-op-19",
    category: "trans",
    title: "Legal name change in Portugal: sharing experiences and tips",
    excerpt:
      "Possible since 2018, but in practice it depends heavily on which conservatória and official you see. Share your story.",
    author: author("catarina-vaz"),
    posted: "1 week ago",
    views: 1340,
    upvotes: 34,
    comments: 18,
    tags: ["trans", "legal"],
    body: [
      "Self-determination of name and gender marker has been law since 2018, no medical report required. On paper it is one of the better frameworks in Europe. In practice, whether it goes smoothly depends a frustrating amount on which conservatória you walk into and who is behind the desk.",
      "I went through it last year and want to build a shared map: which offices were respectful, which dragged their feet, what documents actually got asked for, and how long it really took. The more data points, the less of a lottery it is for the next person.",
      "Share your experience below, good or bad. Anonymised is fine; just say the area, not your name.",
    ],
    replies: [
      reply("raquel-baptista", {
        id: "reply-thread19-raquel-baptista",
        parentPostId: null,
        time: "6 days ago",
        helpful: true,
        body: [
          "Conservatória dos Registos Centrais (Lisbon) was straightforward for me: booked online, brought citizen card and the standard declaration, done in one visit and the new card arrived in about two weeks. The official was completely matter-of-fact about it.",
        ],
        reactions: 16,
      }),
      reply("sofia-castano", {
        id: "reply-thread19-sofia-castano",
        parentPostId: null,
        time: "5 days ago",
        body: [
          'Less smooth at a smaller office outside the city: got asked for a "medical document" that the law explicitly does not require. I printed the statute, brought it back, and they processed it without comment. Know the law before you go.',
        ],
        reactions: 12,
      }),
      reply("catarina-vaz", {
        id: "reply-thread19-catarina-vaz",
        parentPostId: null,
        time: "5 days ago",
        isOP: true,
        body: [
          `Both logged into the map: Registos Centrais green, the smaller office flagged with ${MEMBERS["sofia-castano"]!.first}'s tip about bringing the statute. This is exactly the ground-truth I hoped for.`,
        ],
        reactions: 7,
      }),
    ],
  },
  {
    id: 21,
    opPostId: "demo-op-21",
    category: "health",
    // The byline is masked, which is exactly why this question got asked at
    // all. No slug and no photo, so nothing on the card links to a person.
    isAnonymous: true,
    contentWarnings: ["medical", "family-rejection"],
    language: "pt",
    title:
      "Asking without my name on it: coming out to a GP who knows my family",
    excerpt:
      "My family doctor has looked after my parents for twenty years. I need to talk to someone about hormones and I do not know how to start.",
    author: maskedAuthor,
    posted: "3 days ago",
    views: 890,
    upvotes: 57,
    comments: 9,
    tags: ["healthcare", "coming-out"],
    body: [
      "My family doctor has looked after my parents for twenty years and is the only person in the health centre who knows my history. I want to start talking about hormones and I keep putting the appointment off, because the part I cannot get past is what happens after I leave the room.",
      "I know confidentiality is the law. I am asking about the everyday reality of it in a small centre where everybody knows everybody, and about what people actually said when they opened that conversation. If changing doctors is the honest answer, say so.",
    ],
    replies: [
      reply("jonas", {
        id: "reply-thread21-jonas",
        parentPostId: null,
        time: "3 days ago",
        helpful: true,
        body: [
          "Confidentiality holds, including from your parents, and you can say at the start of the appointment that you want it noted. If that still does not feel like enough, asking to be transferred to another GP inside the same centre is a normal request and needs no reason.",
          "You can also go straight to a gender team referral without opening any of it with your family doctor first. That route exists precisely for this.",
        ],
        reactions: 31,
      }),
      reply("rita", {
        id: "reply-thread21-rita",
        parentPostId: null,
        time: "2 days ago",
        body: [
          "I changed GP before I started, for the same reason, and I have never regretted it. The new one had no history with anyone in my family and the first appointment was simply a medical appointment. That was worth more to me than the twenty years of continuity.",
        ],
        reactions: 18,
      }),
    ],
  },
];

/** Role label KEY for each moderator who posts under the official QueerPulse
 * account, mirroring the moderation team on the governance page. */
export const MOD_ROLE_KEY: Record<string, string> = {
  mariana: "forum:modRole.mariana",
  rui: "forum:modRole.rui",
  ana: "forum:modRole.ana",
};

/**
 * Label-key indirection: `id` is the canonical value `ThreadPage`'s `sort`
 * state holds and compares against (never translated); `labelKey` is the only
 * thing that changes with language.
 */
export const REPLY_SORTS: {
  id: ReplySort;
  labelKey: string;
}[] = [
  { id: "oldest", labelKey: "forum:replySort.oldest" },
  { id: "newest", labelKey: "forum:replySort.newest" },
  // "Most helpful" is the LABEL; `top` is the server's ordering
  // (`vote_count DESC`, oldest reply as the tie-break). The id is the value
  // that goes on the wire, so it has to be the server's word for it
  // (PRD-162) — it used to be a client-only `mostHelpful` that reordered
  // whichever twenty replies happened to be loaded.
  { id: "top", labelKey: "forum:replySort.mostHelpful" },
];
/** Alias kept for the components that already speak in `ReplySortId`; the
 *  canonical type is `ReplySort` in `api/forum.api.ts`, which is the exact set
 *  of values `GET /forum/threads/:slug/posts?sort=` accepts. */
export type ReplySortId = ReplySort;
