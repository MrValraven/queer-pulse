import type {
  CreateThreadDto,
  CreateThreadPhotoDto,
  CreateThreadPollDto,
} from "../api/forum.api";
import type {
  CloseAfter,
  ComposePhoto,
  ComposePoll,
  ComposeThreadState,
  PollCloses,
  PublishMode,
} from "./composeThread.types";

// ── The draft, as the wire sees it ──────────────────────────────────────────
// A PURE function, deliberately: the publish hook already owns a mutation, a
// toast and a demo branch, and folding "which of eighteen fields survive to
// the server" into it is how a composer ends up sending a field the member
// can no longer see. Nothing here reads React, i18n or the DOM.
//
// `POST /forum/threads` runs under `whitelist` + `forbidNonWhitelisted`, so a
// key the server has never heard of does not get quietly dropped — it 400s the
// whole publish and the member loses the post. Two rules follow from that and
// are enforced here rather than hoped for:
//
//  - A photo's description is capped at `WIRE_ALT_MAX_LENGTH`, which is the
//    column's width. The composer allows a longer one (`COMPOSE_ALT_MAX_LENGTH`
//    is sized for the draft row's meta bag), so one long description would
//    otherwise refuse the publish rather than the description.
//  - `image` and `photos` are two spellings of the same thing and the server
//    refuses both at once. Staged photos therefore always travel as `photos`,
//    and the legacy single field is never sent from this page.

/** How many days each `closeAfter` answer is worth. */
const CLOSE_AFTER_DAYS: Partial<Record<CloseAfter, number>> = {
  "2w": 14,
  "30d": 30,
  "90d": 90,
};

/** How many days each poll deadline is worth. */
const POLL_CLOSES_DAYS: Partial<Record<PollCloses, number>> = {
  "3d": 3,
  "1w": 7,
  "2w": 14,
};

/** Longest alt text `forum_post_photo.alt` holds. */
const WIRE_ALT_MAX_LENGTH = 280;

/** Most options the ballot accepts. */
const WIRE_POLL_MAX_OPTIONS = 6;

/** The fewest it accepts. Under this the poll is not sent at all: the composer
 *  already refuses to publish one (`pollNeedsTwoOptions`), so this is the
 *  belt to that brace rather than a second opinion. */
const WIRE_POLL_MIN_OPTIONS = 2;

/** The chosen auto-close as an absolute instant, or null for "never".
 *
 *  `poll` defers to the attached poll's own deadline, so a thread tied to a
 *  poll and the poll itself can never close on two different days. A poll that
 *  never closes closes nothing. */
export function closesAtFor(
  closeAfter: CloseAfter,
  poll: ComposePoll | null,
  now: Date = new Date(),
): string | null {
  if (closeAfter === "poll") {
    const days = poll ? POLL_CLOSES_DAYS[poll.closes] : undefined;
    return days ? addDays(now, days) : null;
  }
  const days = CLOSE_AFTER_DAYS[closeAfter];
  return days ? addDays(now, days) : null;
}

function addDays(from: Date, days: number): string {
  const when = new Date(from.getTime());
  when.setDate(when.getDate() + days);
  return when.toISOString();
}

export interface ComposePublishInput {
  state: ComposeThreadState;
  mode: PublishMode;
  /**
   * The local `"yyyy-mm-ddThh:mm"` moment the schedule overlay handed back.
   * Read only in `schedule` mode, and converted to a real instant here so the
   * server is never sent a wall-clock string with no timezone on it.
   */
  scheduledAtLocal?: string | null;
  /** May this member publish under the QueerPulse byline? The server coerces
   *  the flag away for anyone else, and sending it anyway would ask a question
   *  the composer already knows the answer to. */
  canPostAsOfficial: boolean;
  /** Injectable clock, so the deadline arithmetic is testable. */
  now?: Date;
}

/**
 * The draft as `POST /forum/threads` wants it.
 *
 * Every optional field is spread in only when it carries something, because
 * the server tells NULL ("unstated", which is honest for most threads) apart
 * from a value, and an explicit `undefined` would serialize away anyway.
 */
export function toCreateThreadDto({
  state,
  mode,
  scheduledAtLocal,
  canPostAsOfficial,
  now = new Date(),
}: ComposePublishInput): CreateThreadDto {
  const communitySlug = state.communitySlug.trim();
  const closesAt = closesAtFor(state.closeAfter, state.poll, now);
  const scheduledAt =
    mode === "schedule" && scheduledAtLocal
      ? new Date(scheduledAtLocal).toISOString()
      : null;
  const isOfficial = canPostAsOfficial && state.isOfficial;
  const pollDto = toPollDto(state.poll, now);

  return {
    title: state.title.trim(),
    body: state.body.trim(),
    // Guarded by `canPublish`, which refuses to publish without one. The
    // fallback keeps the type honest rather than describing a reachable state.
    category: state.category ?? "",
    ...(state.tags.length ? { tags: state.tags } : {}),
    ...(communitySlug ? { communitySlug } : {}),
    ...(isOfficial ? { isOfficial: true } : {}),
    ...(state.photos.length ? { photos: toPhotoDtos(state.photos) } : {}),
    ...(pollDto ? { poll: pollDto } : {}),
    ...(state.kind ? { kind: state.kind } : {}),
    ...(state.contentWarnings.length
      ? // The catalog IDS, never the rendered labels: a warning flagged in
        // English has to read as the same warning in Portuguese, which is
        // exactly what `CONTENT_WARNINGS` says its `id` is for.
        { contentWarnings: state.contentWarnings }
      : {}),
    // Anonymity outside the categories that offer it is already cleared by
    // `setCategory`, so a true here is always one the member can still see.
    ...(state.isAnonymous ? { isAnonymous: true } : {}),
    ...(state.coAuthorSlug ? { coAuthorHandle: state.coAuthorSlug } : {}),
    ...(state.neighbourhood ? { neighbourhood: state.neighbourhood } : {}),
    // `auto` is a composer state, not an answer: it means the member never
    // said, and NULL is what the server stores for that.
    ...(state.language === "auto" ? {} : { language: state.language }),
    // Meaningless without a community, and coerced away server-side anyway.
    ...(communitySlug && state.crossPost ? { crossPosted: true } : {}),
    ...(closesAt ? { closesAt } : {}),
    ...(scheduledAt ? { publishAt: scheduledAt } : {}),
    ...(mode === "review" ? { submitForReview: true } : {}),
  };
}

/**
 * The staged photos as the wire wants them: a storage key each, in the order
 * the member arranged them. There is no `position` field — the array IS the
 * ordering, and a second source of truth for it is how a gallery ends up in an
 * order nobody chose.
 */
function toPhotoDtos(photos: readonly ComposePhoto[]): CreateThreadPhotoDto[] {
  return photos.map((photo) => {
    const alt = photo.alt.trim().slice(0, WIRE_ALT_MAX_LENGTH);
    return { image: photo.key, ...(alt ? { alt } : {}) };
  });
}

/**
 * The attached poll, or null when there is nothing publishable.
 *
 * Blank rows are dropped rather than sent: an empty row is how the member adds
 * the next one, and the server refuses a label with no visible characters. A
 * poll left with fewer than two real answers asks nothing, so it goes nowhere.
 *
 * Duplicate labels are deliberately NOT collapsed here. The server refuses
 * them, which is a refusal the member can read and fix; quietly merging two
 * options would publish a ballot they did not write.
 */
function toPollDto(
  poll: ComposePoll | null,
  now: Date,
): CreateThreadPollDto | null {
  if (!poll) return null;
  const options = poll.options
    .map((option) => option.trim())
    .filter(Boolean)
    .slice(0, WIRE_POLL_MAX_OPTIONS)
    .map((label) => ({ label }));
  if (options.length < WIRE_POLL_MIN_OPTIONS) return null;
  const days = POLL_CLOSES_DAYS[poll.closes];
  return {
    options,
    ...(poll.allowMultiple ? { allowMultiple: true } : {}),
    ...(days ? { closesAt: addDays(now, days) } : {}),
  };
}
