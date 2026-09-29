import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { logError } from "../../shared/observability/logger";
import {
  deleteForumDraft,
  forumDraftQueryKey,
  type ForumDraftInput,
  type ForumDraftPreview,
} from "./api/forumDrafts.api";
import {
  clearThreadDraftSnapshot,
  isEmptyThreadDraftSnapshot,
  writeThreadDraftSnapshot,
  type ForumThreadDraftSnapshot,
} from "./forumDraftSnapshot";
import {
  draftPayload,
  isPermanentSaveFailure,
  readStoredForumDraft,
  removeStoredForumDraft,
  useDraftSaveQueue,
  writeDemoDraftBody,
  writeDraftWithConflictRetry,
} from "./forumDraftPersistence";

/** What the composer shows about its own saving. `restored` means text was
 *  recovered from a previous session, which is worth saying once. `unsaved`
 *  means the last save failed even after its one conflict retry; another
 *  attempt follows on its own, or with the next edit when the server refused
 *  the save outright. */
export type ForumDraftStatus =
  "idle" | "saving" | "saved" | "restored" | "unsaved";

/** The catalog key for every status that says something. One map for every
 *  status line, as an explicit record so each key stays greppable and the
 *  en/pt parity check can see it. */
export const FORUM_DRAFT_STATUS_LABEL_KEY: Record<
  Exclude<ForumDraftStatus, "idle">,
  string
> = {
  saving: "forum:draft.saving",
  saved: "forum:draft.saved",
  restored: "forum:draft.restored",
  unsaved: "forum:draft.unsaved",
};

/** What the forum page's resume notice reads about a stored draft. */
function toPreview(
  input: ForumDraftInput,
  hasExtraFields: boolean,
  snapshot: ForumThreadDraftSnapshot | null,
): ForumDraftPreview {
  return { body: input.body, title: input.title, hasExtraFields, snapshot };
}

interface ForumComposerDraftOptions {
  /** Stable, member-scoped draft id (see `NEW_THREAD_DRAFT_ID`/`replyDraftId`). */
  draftId: string;
  /** The composer's current body text. */
  body: string;
  /** Called once, on mount, when a stored draft is recovered. */
  onRestore: (body: string) => void;
  /** Row title on the member's drafts list. Never empty: the server requires
   *  one, and an untitled row is unfindable. */
  title: string;
  /** Where the drafts list's "Resume" navigates. App-relative path. */
  href: string;
  /** Free-form display label ("POST", "REPLY"). */
  kind: string;
  /** False parks the whole hook: no read, no write, no timer. Used while a
   *  composer has no thread to belong to yet. */
  isEnabled?: boolean;
  /** Row title to fall back on when the member has typed none. Defaults to the
   *  `kind` label, which reads as shouting ("POST") on the drafts list. */
  fallbackTitle?: string;
  /** The composer fields beyond the body (category, community, tags, photo
   *  reference). Saved on the same debounce, to the draft row's `meta` bag AND
   *  to this browser's member-scoped bucket. Omitted by composers that have no
   *  such fields. */
  snapshot?: ForumThreadDraftSnapshot;
  /** Called once, on mount, with a recovered snapshot (the draft row's copy
   *  when there is one, this browser's otherwise). The caller decides field by
   *  field what to apply, so a deep link that seeded the composer (a topic's
   *  "Write a post" CTA) is never overwritten. */
  onRestoreSnapshot?: (snapshot: ForumThreadDraftSnapshot) => void;
}

/**
 * Autosaves a forum composer, and restores it on the next visit.
 *
 * Connects the EXISTING generic drafts module, with no forum-only copy of
 * it: every write goes to `/me/drafts` under a stable client-minted id (see
 * `forumDrafts.api.ts`). Live mode round-trips the optimistic-concurrency
 * `version`; demo mode keeps the identical behaviour against `localStorage`,
 * since demo has no session to own a server draft.
 *
 * ENG-421: on a version conflict the tab being typed in wins. A 409 means
 * another tab (or an earlier session whose restore failed) wrote the row since
 * this one last read it. The hook adopts the server's current version (from
 * the 409's `currentVersion`, or a fresh read when the body lacks it, and
 * always a fresh read after a create collides with an existing row) and
 * writes once more, built from the composer's latest text. The words the
 * member is typing right now are the ones they can see, so those are the ones
 * kept. A save that still fails shows `unsaved`, keeps the text marked as
 * unwritten, and tries again after `AUTOSAVE_RETRY_MS` (or with the next edit,
 * when the server refused the save outright). Saves from this tab run one at
 * a time, so an older save can never overwrite newer text.
 *
 * ENG-422: a save still waiting on its debounce is written straight away when
 * the composer unmounts, so leaving the composer inside the debounce window
 * loses nothing. A tab close (`pagehide`) starts the same write, as a best
 * effort the browser may cut short (see `useDraftSaveQueue`). `clearDraft`
 * cancels everything waiting, and a save already on the network when it runs
 * leaves the hook alone and deletes any row it wrote, so Discard and Publish
 * never bring a draft back.
 *
 * PRD-165: the body was once the ONLY thing saved, so a member came back to
 * their words with the title, category, community, tags and photo gone. Those
 * fields now ride along in `snapshot` (see `forumDraftSnapshot.ts`), written on
 * the same debounce and cleared with the same `clearDraft`.
 *
 * They go to the draft ROW, in its `meta` bag, so the draft follows the member
 * the way `/me/drafts` always promised: a post started on a phone reopens whole
 * on a laptop. This browser keeps the same snapshot as a same-session fallback
 * (and as demo mode's only store), and restore prefers the server's copy
 * whenever there is one.
 *
 * A draft whose body is empty but whose other fields are not is still a draft.
 * It is saved and kept, so tags picked on one device are there on
 * the next, and only a composer emptied of everything discards its row.
 *
 * Restore never overwrites: a stored draft is applied only when the composer is
 * still empty, so recovering an old draft cannot eat text the member has
 * already started typing in this session.
 *
 * Every save also writes a small `ForumDraftPreview` through react-query, so a
 * surface outside the composer (the forum page's resume notice) can tell that
 * an unsent draft exists without a request of its own.
 *
 * Every failure is logged and surfaces only as the quiet `unsaved` status line.
 * Autosave is a safety net, and a net that interrupts the writing it exists to
 * protect is worse than no net.
 */
export function useForumComposerDraft({
  draftId,
  body,
  onRestore,
  title,
  href,
  kind,
  isEnabled = true,
  fallbackTitle,
  snapshot,
  onRestoreSnapshot,
}: ForumComposerDraftOptions) {
  const { demoMode } = useDemoMode();
  // Which member's local bucket the snapshot belongs to. `null` (signed out, or
  // the session still resolving) means no bucket at all, so a shared browser
  // never hands one member's unsent post to the next.
  const storageScope = useStorageScope();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ForumDraftStatus>("idle");
  // The version the server last handed back, echoed as `expectedVersion` on the
  // next patch. Null means "not created yet" (or a create is still needed).
  const versionRef = useRef<number | null>(null);
  // The text the last successful save wrote, so an unchanged body never costs a
  // request.
  const savedBodyRef = useRef<string>("");
  // The same guard for the local fields, compared as serialized JSON so a
  // re-rendered but unchanged snapshot object costs nothing.
  const savedSnapshotRef = useRef<string>("");
  // The latest metadata, read inside the debounced save without making the
  // effect re-run (and so restart the timer) on every keystroke of the title.
  const metaRef = useRef<ForumDraftInput>({ title, body, href, kind });
  // Held in a ref for the same reason as the metadata above: it arrives from
  // `t()`, whose value changes once when the lazily-loaded catalog lands, and a
  // dependency that changes mid-typing would restart the debounce timer and
  // delay the save it exists to schedule.
  const fallbackTitleRef = useRef<string | undefined>(fallbackTitle);
  const snapshotRef = useRef<ForumThreadDraftSnapshot | undefined>(snapshot);
  // Held in a ref so the restore effect does not depend on the caller passing a
  // referentially stable callback: a composer that recreated it each render
  // would otherwise re-read (and re-announce) its draft on every keystroke.
  const onRestoreRef = useRef(onRestore);
  const onRestoreSnapshotRef = useRef(onRestoreSnapshot);
  // Which draft the bookkeeping above currently describes. The restore effect
  // also re-runs when the storage scope resolves (a session check landing turns
  // `null` into the member's id), and that must NOT null the version out: the
  // next save would then POST a create for a draft that already exists and 409
  // on every keystroke afterwards.
  const bookkeepingKeyRef = useRef<string | null>(null);
  // Bumped by every `clearDraft`. A save compares it after each wait, so one
  // that was on the network when the draft was cleared changes nothing.
  const clearEpochRef = useRef(0);

  // Both refs are synced in an effect, after render:
  // writing a ref while rendering is what `react-hooks/refs` forbids, because
  // a render React throws away (a Strict Mode double-invoke, or an abandoned
  // concurrent attempt) would still have mutated it.
  //
  // Declared FIRST and with no dependency array on purpose. Effects run in
  // declaration order after every commit, so both refs are current before the
  // restore and autosave effects below read them, and `useRef`'s initial value
  // already carries the first render's props, so the mount pass is covered
  // too. Both consumers read these long after paint (a debounce timer and an
  // async restore), so the one-commit lag is not observable.
  useEffect(() => {
    metaRef.current = { title, body, href, kind };
    fallbackTitleRef.current = fallbackTitle;
    snapshotRef.current = snapshot;
    onRestoreRef.current = onRestore;
    onRestoreSnapshotRef.current = onRestoreSnapshot;
  });

  // ── Debounce, retry and flush on leave ────────────────────────────────────
  const {
    isMountedRef,
    retryNonce,
    flushDraft,
    schedule,
    dropPending,
    scheduleRetry,
    cancelAll,
  } = useDraftSaveQueue();

  // ── Restore, once per draft id ────────────────────────────────────────────
  useEffect(() => {
    if (!isEnabled) return;
    let isStale = false;
    // Reset the per-draft bookkeeping when the draft itself changes (navigating
    // from one thread's reply composer to another's, or a demo-mode flip) and
    // only then.
    const bookkeepingKey = `${draftId}|${demoMode}`;
    if (bookkeepingKeyRef.current !== bookkeepingKey) {
      bookkeepingKeyRef.current = bookkeepingKey;
      versionRef.current = null;
      savedBodyRef.current = "";
      // Seeded with the fields the composer OPENED with, so a composer that
      // was merely opened saves nothing. That matters now that a body-less
      // draft is kept on the list: a topic page's "Write a
      // post" CTA pre-attaches its tag and the first-post prompt pre-fills a
      // title, and neither should put a row on the member's drafts list for a
      // post they never wrote. The first real edit still differs from this and
      // saves normally.
      savedSnapshotRef.current = snapshotRef.current
        ? JSON.stringify(snapshotRef.current)
        : "";
    }

    /** Hands the recovered fields to the composer, and reports whether they
     *  held anything. An unreadable payload has already been discarded, so an
     *  old shape costs one silent drop and the composer still opens. */
    function applySnapshot(stored: ForumThreadDraftSnapshot | null): boolean {
      if (!stored || isEmptyThreadDraftSnapshot(stored)) return false;
      savedSnapshotRef.current = JSON.stringify(stored);
      onRestoreSnapshotRef.current?.(stored);
      return true;
    }

    async function restore() {
      try {
        // Demo mode reads this browser alone; live mode reads the draft row
        // first (see `readStoredForumDraft`).
        const stored = await readStoredForumDraft(
          draftId,
          demoMode,
          storageScope,
        );
        if (isStale) return;
        if (stored.version !== null) versionRef.current = stored.version;
        if (stored.body !== null) savedBodyRef.current = stored.body;
        const hasSnapshot = applySnapshot(stored.snapshot);
        const storedBody = stored.body ?? "";
        // Never clobber text the member has already typed in this session.
        const isBodyRestored =
          !!storedBody.trim() && !metaRef.current.body.trim();
        if (isBodyRestored) onRestoreRef.current(storedBody);
        if ((isBodyRestored || hasSnapshot) && isMountedRef.current)
          setStatus("restored");
      } catch (error) {
        logError(error, { scope: "forum.draft.restore" });
      }
    }
    void restore();
    return () => {
      isStale = true;
    };
  }, [draftId, demoMode, isEnabled, storageScope, isMountedRef]);

  // ── Debounced save ────────────────────────────────────────────────────────
  const snapshotJson = snapshot ? JSON.stringify(snapshot) : "";
  useEffect(() => {
    if (!isEnabled) return;
    if (
      body === savedBodyRef.current &&
      snapshotJson === savedSnapshotRef.current
    ) {
      dropPending();
      // The text is back to what is stored, so a failure still on screen no
      // longer describes it.
      setStatus((current) => (current === "unsaved" ? "idle" : current));
      return;
    }
    return schedule(save);

    /** Mirrors what was just stored into the shared preview cache, so the
     *  forum page's resume notice is right the moment the composer closes,
     *  without a read of its own. */
    function publishPreview(preview: ForumDraftPreview | null) {
      queryClient.setQueryData(forumDraftQueryKey(draftId), preview);
    }

    async function save() {
      const clearEpoch = clearEpochRef.current;
      /** True once the draft was cleared, or the composer moved to another
       *  draft, while this save waited on the network. */
      const isStale = () =>
        clearEpochRef.current !== clearEpoch ||
        bookkeepingKeyRef.current !== `${draftId}|${demoMode}`;
      let input = metaRef.current;
      const fields = snapshotRef.current;
      const trimmedBody = input.body.trim();
      const hasExtraFields = !!fields && !isEmptyThreadDraftSnapshot(fields);
      // Restored when the save fails, so the retry still sees these fields as
      // unwritten and sends them again.
      const previousSnapshotJson = savedSnapshotRef.current;
      // The writes below move this copy; it reaches `versionRef` only while
      // the save is still current.
      const version = { current: versionRef.current };
      // A retry keeps saying `unsaved` until it lands, so a screen reader
      // hears about a failure once.
      if (isMountedRef.current)
        setStatus((current) => (current === "unsaved" ? current : "saving"));
      try {
        // Written to this browser too, always: it is what answers the composer
        // before the network does, and demo mode's only store.
        if (fields) writeThreadDraftSnapshot(draftId, storageScope, fields);
        savedSnapshotRef.current = fields ? JSON.stringify(fields) : "";
        if (demoMode) {
          writeDemoDraftBody(draftId, input.body);
          savedBodyRef.current = input.body;
          const isKept = !!trimmedBody || hasExtraFields;
          publishPreview(
            isKept ? toPreview(input, hasExtraFields, fields ?? null) : null,
          );
          if (isMountedRef.current) setStatus(isKept ? "saved" : "idle");
          return;
        }
        // A composer emptied of EVERYTHING discards its draft, so the
        // member's drafts list never holds a blank row. A body-less draft
        // that still holds a community, tags or a photo is kept: those are
        // choices the member made, and the whole point of the row is that they
        // survive to the next device.
        if (!trimmedBody && !hasExtraFields) {
          if (version.current !== null) await deleteForumDraft(draftId);
          if (isStale()) return;
          versionRef.current = null;
          savedBodyRef.current = input.body;
          publishPreview(null);
          if (isMountedRef.current) setStatus("idle");
          return;
        }
        const saved = await writeDraftWithConflictRetry(
          draftId,
          // Rebuilt for a conflict retry, so that write carries the latest
          // text, and `input` names whatever was last sent.
          () => {
            input = metaRef.current;
            return draftPayload(
              input,
              snapshotRef.current,
              fallbackTitleRef.current,
            );
          },
          version,
        );
        if (isStale()) {
          // The draft was cleared while this write travelled: the row it
          // made or updated must go too.
          if (clearEpochRef.current !== clearEpoch)
            await removeStoredForumDraft(draftId, false, saved.version);
          return;
        }
        versionRef.current = saved.version;
        savedBodyRef.current = input.body;
        publishPreview(toPreview(input, hasExtraFields, fields ?? null));
        if (isMountedRef.current) setStatus("saved");
      } catch (error) {
        logError(error, { scope: "forum.draft.save" });
        if (isStale()) return;
        // Keeps what the failure taught (a second 409's version, a vanished
        // row), so the next attempt starts from it. `savedBodyRef` is left as
        // it was, so the text still counts as unwritten.
        versionRef.current = version.current;
        savedSnapshotRef.current = previousSnapshotJson;
        if (!isMountedRef.current) return;
        setStatus("unsaved");
        // A request the server refused outright would be refused again: it
        // waits for the next edit. Anything else retries on its own.
        if (!isPermanentSaveFailure(error)) scheduleRetry(save);
      }
    }
  }, [
    body,
    snapshotJson,
    draftId,
    demoMode,
    isEnabled,
    storageScope,
    queryClient,
    retryNonce,
    schedule,
    dropPending,
    scheduleRetry,
    isMountedRef,
  ]);

  /** Discards the draft. Call once the post it holds has really published, or
   *  when the member discards it. */
  const clearDraft = useCallback(async () => {
    // Cancelled first, so neither a waiting save nor a scheduled retry can
    // write the draft back after it is gone, and a save already on the
    // network sees the new epoch and leaves everything alone.
    cancelAll();
    clearEpochRef.current += 1;
    savedBodyRef.current = "";
    savedSnapshotRef.current = "";
    setStatus("idle");
    clearThreadDraftSnapshot(draftId, storageScope);
    queryClient.setQueryData(forumDraftQueryKey(draftId), null);
    const version = versionRef.current;
    if (await removeStoredForumDraft(draftId, demoMode, version))
      versionRef.current = null;
  }, [draftId, demoMode, storageScope, queryClient, cancelAll]);

  return { status, clearDraft, flushDraft };
}
