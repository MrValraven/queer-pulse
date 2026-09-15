import { safeStorage } from "../../shared/storage/safeStorage";
import type { ForumDraftMeta } from "./api/forumDrafts.api";

// ── The composer fields that ride beside the body ───────────────────────────
// PRD-165: the new-thread autosave used to persist the BODY and nothing else,
// so a member who had typed a title, chosen a category and a community, added
// tags and attached a photo came back to a body alone.
//
// The first fix kept those fields in this browser, because `CreateDraftDto` ran
// under `forbidNonWhitelisted` and had no field to put them in. That made a
// SERVER feature quietly device-local: a post started on a phone and reopened
// on a laptop still came back as title and body, with the category, community,
// tags and photo silently gone. A saved draft is not something a member thinks
// of as belonging to a browser.
//
// The draft row now carries a `meta` bag for exactly this (see the backend's
// `DraftMeta` and `@IsDraftMeta`), so the snapshot below is written in TWO
// places on every save:
//
//   - the draft row, which is the SOURCE OF TRUTH and follows the member
//     across devices;
//   - this browser, under the same per-member bucket convention every other
//     local cache uses (`useStorageScope` / `useScopedLocalStorage`), as the
//     same-session fallback. It is what demo mode has instead of a server, and
//     what answers the composer before the network does.
//
// A live member id gets its own key suffix, demo keeps the base key, and a
// signed-out visitor gets no bucket at all, so a shared browser never hands one
// member's unsent post to the next.

/**
 * The stored shape's version. Bump it whenever a field is added, removed or
 * changes meaning.
 *
 * A snapshot written by a different version is DISCARDED, never migrated: an
 * unsent draft is worth far less than a composer that opens without crashing,
 * and a half-understood old payload is exactly how a composer crashes. The same
 * rule applies to the server's copy, which carries the same version key: a
 * client that has not shipped yet must not try to read a shape it predates.
 *
 * Version 2 is the full-page composer at `/forum/new`: the kind, the audience
 * cross-post, the byline switches, the co-author, the content warnings, the
 * poll, the language, the neighbourhood, the auto-close, and up to four photos
 * instead of one. A version-1 payload is dropped on the next read, which costs
 * whoever had a draft open across the deploy their unsent post and nobody
 * else anything.
 */
export const FORUM_DRAFT_SNAPSHOT_VERSION = 2;

const BASE_KEY = "qp.forum.draft.fields";

/** The composer state persisted beside the body. */
export interface ForumThreadDraftSnapshot {
  /** Post title. Also sent to the server as the drafts-list row title; kept
   *  here too so a title typed with no body still survives. */
  title: string;
  /** Selected category id. */
  category: string;
  /** Selected community slug, or "" for a global post. */
  communitySlug: string;
  tags: string[];
  /**
   * The uploaded photo's REFERENCE — a storage key in live mode, a local blob
   * URL in demo (see `usePostImageAttach`). Never the image bytes: a base64
   * photo would blow the 5MB localStorage quota and take every other draft
   * down with it, and on the server it would turn an autosaving column into
   * free object storage.
   */
  imageKey: string | null;
  /** The local preview URL for that photo, when one is still renderable. */
  imagePreviewUrl: string | null;

  // ── The full-page composer's fields (`/forum/new`) ─────────────────────────
  // All OPTIONAL, because the older modal composer writes the same snapshot
  // shape with none of them and must keep working unchanged. Absent reads as
  // "this draft was written by a composer that has no such field", which is
  // exactly right.
  //
  // Every one of them is FLAT AND SCALAR, which is the contract `@IsDraftMeta`
  // enforces on the draft row's `meta` bag (see `api/forumDrafts.api.ts`): a
  // string, a number, a boolean, null, or an array of strings. Two fields of
  // the composer's state are neither, and both are taken apart here rather
  // than nested. See `photoKeys` and `pollOptions` below.

  /** The chosen `PostKind`, or null before one is picked. */
  kind?: string | null;
  /** Also surface a community post in the town square. */
  crossPost?: boolean;
  /** Publish under the "QueerPulse Official" byline. */
  isOfficial?: boolean;
  /** Hide the author's name from other members. */
  isAnonymous?: boolean;
  /** A second member credited on the post, by slug. */
  coAuthorSlug?: string | null;
  /** Ids from `CONTENT_WARNINGS`. */
  contentWarnings?: string[];
  /** The chosen `PostLanguage`. */
  language?: string;
  /** A neighbourhood value, or null. */
  neighbourhood?: string | null;
  /** The chosen `CloseAfter`. */
  closeAfter?: string;

  /**
   * The staged photos, TAKEN APART into three parallel arrays.
   *
   * `ComposePhoto[]` is an array of objects, which `@IsDraftMeta` refuses:
   * the bag is flat by contract, because it is rewritten on a typing debounce
   * by every active member and a free-form nested tree is a storage-abuse
   * vector. Three `string[]`s carry the same information inside the contract.
   * They are the same length and share an index; a payload where they are not
   * is read as far as the shortest one, so a truncated write costs a photo
   * rather than a mismatched description.
   *
   * Each entry is the photo's REFERENCE (a storage key live, a blob URL in
   * demo), never the bytes, for the same reason as `imageKey` above.
   */
  photoKeys?: string[];
  /** The local preview URLs for those photos, index-aligned with `photoKeys`. */
  photoPreviewUrls?: string[];
  /** Their descriptions, index-aligned with `photoKeys`. */
  photoAlts?: string[];

  /**
   * The poll's options, or null when there is no poll. Flattened for the same
   * reason as the photos: `ComposePoll` is an object, and the bag holds no
   * objects. Null distinguishes "no poll" from "a poll whose options are all
   * still blank", which is a state the composer allows while typing.
   */
  pollOptions?: string[] | null;
  pollAllowMultiple?: boolean;
  /** The chosen `PollCloses`. */
  pollCloses?: string;
}

/**
 * True when a snapshot carries nothing worth keeping.
 *
 * Only fields the member actively CHOSE count. The language, the cross-post
 * switch and the auto-close all have defaults the composer sets on its own, so
 * a composer that was merely opened would otherwise put a row on the member's
 * drafts list for a post they never wrote.
 */
export function isEmptyThreadDraftSnapshot(
  snapshot: ForumThreadDraftSnapshot,
): boolean {
  return (
    !snapshot.title.trim() &&
    !snapshot.communitySlug &&
    snapshot.tags.length === 0 &&
    !snapshot.imageKey &&
    !snapshot.kind &&
    !snapshot.coAuthorSlug &&
    !snapshot.neighbourhood &&
    !snapshot.pollOptions &&
    (snapshot.contentWarnings?.length ?? 0) === 0 &&
    (snapshot.photoKeys?.length ?? 0) === 0
  );
}

/**
 * This member's bucket for one draft id, or null when there is no bucket to
 * write to (signed out, or the session is still resolving). Mirrors
 * `useScopedLocalStorage`'s key derivation exactly.
 */
function keyFor(draftId: string, scopeId: string | null): string | null {
  if (scopeId === null) return null;
  if (scopeId === "demo") return `${BASE_KEY}.${draftId}`;
  return `${BASE_KEY}.${draftId}.u.${scopeId}`;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

/** An optional field: absent is always fine, present must type-check. */
function isAbsentOr<T>(
  value: unknown,
  check: (candidate: unknown) => candidate is T,
): value is T | undefined {
  return value === undefined || check(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNullableStringArray(value: unknown): value is string[] | null {
  return value === null || isStringArray(value);
}

/**
 * Whether every optional field of the full-page composer type-checks.
 *
 * Split out of `readSnapshotFields` purely for size: the two together run past
 * the 200-line function budget `max-lines-per-function` enforces.
 */
function areComposePageFieldsValid(
  candidate: Record<string, unknown>,
): boolean {
  return (
    isAbsentOr(candidate.kind, isNullableString) &&
    isAbsentOr(candidate.crossPost, isBoolean) &&
    isAbsentOr(candidate.isOfficial, isBoolean) &&
    isAbsentOr(candidate.isAnonymous, isBoolean) &&
    isAbsentOr(candidate.coAuthorSlug, isNullableString) &&
    isAbsentOr(candidate.contentWarnings, isStringArray) &&
    isAbsentOr(candidate.language, isString) &&
    isAbsentOr(candidate.neighbourhood, isNullableString) &&
    isAbsentOr(candidate.closeAfter, isString) &&
    isAbsentOr(candidate.photoKeys, isStringArray) &&
    isAbsentOr(candidate.photoPreviewUrls, isStringArray) &&
    isAbsentOr(candidate.photoAlts, isStringArray) &&
    isAbsentOr(candidate.pollOptions, isNullableStringArray) &&
    isAbsentOr(candidate.pollAllowMultiple, isBoolean) &&
    isAbsentOr(candidate.pollCloses, isString)
  );
}

/** The optional fields, copied across once they have all type-checked. */
function composePageFields(
  candidate: Record<string, unknown>,
): Partial<ForumThreadDraftSnapshot> {
  return {
    kind: candidate.kind as string | null | undefined,
    crossPost: candidate.crossPost as boolean | undefined,
    isOfficial: candidate.isOfficial as boolean | undefined,
    isAnonymous: candidate.isAnonymous as boolean | undefined,
    coAuthorSlug: candidate.coAuthorSlug as string | null | undefined,
    contentWarnings: candidate.contentWarnings as string[] | undefined,
    language: candidate.language as string | undefined,
    neighbourhood: candidate.neighbourhood as string | null | undefined,
    closeAfter: candidate.closeAfter as string | undefined,
    photoKeys: candidate.photoKeys as string[] | undefined,
    photoPreviewUrls: candidate.photoPreviewUrls as string[] | undefined,
    photoAlts: candidate.photoAlts as string[] | undefined,
    pollOptions: candidate.pollOptions as string[] | null | undefined,
    pollAllowMultiple: candidate.pollAllowMultiple as boolean | undefined,
    pollCloses: candidate.pollCloses as string | undefined,
  };
}

/**
 * Reads one already-parsed record into a snapshot, or null when it is not one.
 *
 * Every field is checked, not just the version: a payload can be at the right
 * version and still be corrupt (a half-written value, a hand-edited key, a
 * quota failure that truncated the JSON, a bag written by a build whose shape
 * has since moved). Anything that does not type-check is treated as absent.
 *
 * Shared by both stores on purpose. The browser's copy and the draft row's
 * `meta` hold the SAME shape, so a shape change has one place to be understood
 * and one place to be rejected.
 */
function readSnapshotFields(
  candidate: Record<string, unknown>,
): ForumThreadDraftSnapshot | null {
  if (candidate.version !== FORUM_DRAFT_SNAPSHOT_VERSION) return null;
  if (typeof candidate.title !== "string") return null;
  if (typeof candidate.category !== "string") return null;
  if (typeof candidate.communitySlug !== "string") return null;
  if (!isStringArray(candidate.tags)) return null;
  if (!isNullableString(candidate.imageKey)) return null;
  if (!isNullableString(candidate.imagePreviewUrl)) return null;
  if (!areComposePageFieldsValid(candidate)) return null;
  return {
    title: candidate.title,
    category: candidate.category,
    communitySlug: candidate.communitySlug,
    tags: candidate.tags,
    imageKey: candidate.imageKey,
    imagePreviewUrl: candidate.imagePreviewUrl,
    ...composePageFields(candidate),
  };
}

/** Parses one stored localStorage payload, or null when it is unreadable. */
function parseSnapshot(raw: string): ForumThreadDraftSnapshot | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  return readSnapshotFields(parsed as Record<string, unknown>);
}

/**
 * The snapshot the SERVER holds for this draft, or null when it holds none.
 *
 * `meta` is a flat, kind-agnostic bag the drafts module keeps for whichever
 * composer owns the draft (see the backend's `DraftMeta`), so a bag written by
 * a different surface, or by a build whose shape has since moved, simply reads
 * as "no snapshot" here. An unreadable one is never a reason to fail the
 * composer open.
 */
export function threadDraftSnapshotFromMeta(
  meta: ForumDraftMeta | null | undefined,
): ForumThreadDraftSnapshot | null {
  if (!meta) return null;
  return readSnapshotFields(meta);
}

/**
 * The snapshot as the flat bag the draft row stores.
 *
 * Flat and scalar because that is all `@IsDraftMeta` accepts: a nested,
 * free-form tree written on a typing debounce is a storage-abuse vector, so the
 * server refuses one. Nothing here needs nesting.
 */
export function threadDraftSnapshotToMeta(
  snapshot: ForumThreadDraftSnapshot,
): ForumDraftMeta {
  return {
    version: FORUM_DRAFT_SNAPSHOT_VERSION,
    title: snapshot.title,
    category: snapshot.category,
    communitySlug: snapshot.communitySlug,
    tags: snapshot.tags,
    imageKey: snapshot.imageKey,
    imagePreviewUrl: snapshot.imagePreviewUrl,
    // Normalized rather than spread: `meta` accepts null but not `undefined`,
    // and a composer that keeps none of these fields (the older modal) must
    // still produce a bag the server accepts. Twenty-two keys in total, well
    // inside the thirty-two `@IsDraftMeta` allows.
    kind: snapshot.kind ?? null,
    crossPost: snapshot.crossPost ?? false,
    isOfficial: snapshot.isOfficial ?? false,
    isAnonymous: snapshot.isAnonymous ?? false,
    coAuthorSlug: snapshot.coAuthorSlug ?? null,
    contentWarnings: snapshot.contentWarnings ?? [],
    language: snapshot.language ?? "auto",
    neighbourhood: snapshot.neighbourhood ?? null,
    closeAfter: snapshot.closeAfter ?? "never",
    photoKeys: snapshot.photoKeys ?? [],
    photoPreviewUrls: snapshot.photoPreviewUrls ?? [],
    photoAlts: snapshot.photoAlts ?? [],
    pollOptions: snapshot.pollOptions ?? null,
    pollAllowMultiple: snapshot.pollAllowMultiple ?? false,
    pollCloses: snapshot.pollCloses ?? "never",
  };
}

/**
 * The stored snapshot for this draft in THIS browser, or null when there is
 * none.
 *
 * An unreadable payload is dropped from storage on the way out, so a shape
 * change costs one silent discard rather than a permanent parse failure on
 * every composer open.
 */
export function readThreadDraftSnapshot(
  draftId: string,
  scopeId: string | null,
): ForumThreadDraftSnapshot | null {
  const key = keyFor(draftId, scopeId);
  if (!key) return null;
  const raw = safeStorage.get(key);
  if (!raw) return null;
  const snapshot = parseSnapshot(raw);
  if (!snapshot) {
    safeStorage.remove(key);
    return null;
  }
  return snapshot;
}

/** Persists the snapshot, or clears the key when it holds nothing. */
export function writeThreadDraftSnapshot(
  draftId: string,
  scopeId: string | null,
  snapshot: ForumThreadDraftSnapshot,
): void {
  const key = keyFor(draftId, scopeId);
  if (!key) return;
  if (isEmptyThreadDraftSnapshot(snapshot)) {
    safeStorage.remove(key);
    return;
  }
  safeStorage.set(
    key,
    JSON.stringify({ version: FORUM_DRAFT_SNAPSHOT_VERSION, ...snapshot }),
  );
}

/** Drops the snapshot — called once the post it belongs to has published. */
export function clearThreadDraftSnapshot(
  draftId: string,
  scopeId: string | null,
): void {
  const key = keyFor(draftId, scopeId);
  if (key) safeStorage.remove(key);
}
