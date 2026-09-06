import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { logError } from "../../shared/observability/logger";
import {
  createForumDraft,
  deleteForumDraft,
  forumDraftQueryKey,
  getForumDraft,
  updateForumDraft,
  type ForumDraftInput,
  type ForumDraftMeta,
  type ForumDraftPreview,
} from "./api/forumDrafts.api";
import {
  clearThreadDraftSnapshot,
  isEmptyThreadDraftSnapshot,
  readThreadDraftSnapshot,
  threadDraftSnapshotFromMeta,
  threadDraftSnapshotToMeta,
  writeThreadDraftSnapshot,
  type ForumThreadDraftSnapshot,
} from "./forumDraftSnapshot";

/** How long the composer sits still before a save fires. Long enough that
 *  ordinary typing writes once per pause, short enough that a closed tab loses
 *  at most a sentence. */
const AUTOSAVE_DELAY_MS = 1500;

/** Where a demo-mode draft lives. Demo never reaches the network, so the
 *  member's own browser is the whole store. */
const demoStorageKey = (draftId: string) => `qp.forum.draft.${draftId}`;

/** What the composer shows about its own saving. `restored` means text was
 *  recovered from a previous session, which is worth saying once. */
export type ForumDraftStatus = "idle" | "saving" | "saved" | "restored";

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
  /** False parks the whole hook — no read, no write, no timer. Used while a
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
 * Connects the EXISTING generic drafts module rather than adding a forum-only
 * one: every write goes to `/me/drafts` under a stable client-minted id (see
 * `forumDrafts.api.ts`). Live mode round-trips the optimistic-concurrency
 * `version`, so the same composer open in two tabs cannot silently discard one
 * tab's text; demo mode keeps the identical behaviour against `localStorage`,
 * since demo has no session to own a server draft.
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
 * It is saved rather than deleted, so tags picked on one device are there on
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
 * Every failure is swallowed after logging. Autosave is a safety net, and a net
 * that interrupts the writing it exists to protect is worse than no net.
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
  const isMountedRef = useRef(true);
  // Which draft the bookkeeping above currently describes. The restore effect
  // also re-runs when the storage scope resolves (a session check landing turns
  // `null` into the member's id), and that must NOT null the version out: the
  // next save would then POST a create for a draft that already exists and 409
  // on every keystroke afterwards.
  const bookkeepingKeyRef = useRef<string | null>(null);

  // Both refs are synced in an effect rather than assigned during render:
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

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
      // Seeded with the fields the composer OPENED with rather than an
      // empty string, so a composer that was merely opened saves nothing. That matters now that a
      // body-less draft is kept rather than deleted: a topic page's "Write a
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
     *  old shape costs one silent drop rather than a composer that will not
     *  open. */
    function applySnapshot(stored: ForumThreadDraftSnapshot | null): boolean {
      if (!stored || isEmptyThreadDraftSnapshot(stored)) return false;
      savedSnapshotRef.current = JSON.stringify(stored);
      onRestoreSnapshotRef.current?.(stored);
      return true;
    }

    async function restore() {
      try {
        if (demoMode) {
          // Demo has no session to own a server draft, so this browser is the
          // whole store.
          const hasSnapshot = applySnapshot(
            readThreadDraftSnapshot(draftId, storageScope),
          );
          const stored = window.localStorage.getItem(demoStorageKey(draftId));
          if (isStale) return;
          if (stored) savedBodyRef.current = stored;
          const isBodyRestored = !!stored && !metaRef.current.body.trim();
          if (isBodyRestored) onRestoreRef.current(stored);
          if ((isBodyRestored || hasSnapshot) && isMountedRef.current)
            setStatus("restored");
          return;
        }
        const draft = await getForumDraft(draftId);
        if (isStale) return;
        const storedBody = draft?.desc ?? "";
        if (draft) {
          versionRef.current = draft.version;
          savedBodyRef.current = storedBody;
        }
        // The draft ROW is the source of truth, so a member who started on
        // another device gets their category, community, tags and photo back
        // here. This browser's copy answers only when the row carries none: a
        // draft saved before the `meta` bag existed, or a save whose network
        // leg failed after the local write.
        const hasSnapshot = applySnapshot(
          threadDraftSnapshotFromMeta(draft?.meta) ??
            readThreadDraftSnapshot(draftId, storageScope),
        );
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
  }, [draftId, demoMode, isEnabled, storageScope]);

  // ── Debounced save ────────────────────────────────────────────────────────
  const snapshotJson = snapshot ? JSON.stringify(snapshot) : "";
  useEffect(() => {
    if (!isEnabled) return;
    if (
      body === savedBodyRef.current &&
      snapshotJson === savedSnapshotRef.current
    )
      return;
    const timer = window.setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);

    /** Mirrors what was just stored into the shared preview cache, so the
     *  forum page's resume notice is right the moment the composer closes,
     *  without a read of its own. */
    function publishPreview(preview: ForumDraftPreview | null) {
      queryClient.setQueryData(forumDraftQueryKey(draftId), preview);
    }

    async function save() {
      const input = metaRef.current;
      const fields = snapshotRef.current;
      const trimmedBody = input.body.trim();
      const hasExtraFields = !!fields && !isEmptyThreadDraftSnapshot(fields);
      /** What goes in the draft row's `meta` bag. `undefined` for a composer
       *  that keeps no fields beyond its body (a reply box), so it never sends
       *  the key at all; `null` clears a bag the member has since emptied. */
      function composerMeta(): ForumDraftMeta | null | undefined {
        if (!fields) return undefined;
        return hasExtraFields ? threadDraftSnapshotToMeta(fields) : null;
      }
      if (isMountedRef.current) setStatus("saving");
      try {
        // Written to this browser too, always: it is what answers the composer
        // before the network does, and demo mode's only store.
        if (fields) writeThreadDraftSnapshot(draftId, storageScope, fields);
        savedSnapshotRef.current = fields ? JSON.stringify(fields) : "";
        if (demoMode) {
          const key = demoStorageKey(draftId);
          if (trimmedBody) window.localStorage.setItem(key, input.body);
          else window.localStorage.removeItem(key);
          savedBodyRef.current = input.body;
          publishPreview(
            trimmedBody || hasExtraFields
              ? { body: input.body, title: input.title, hasExtraFields }
              : null,
          );
          if (isMountedRef.current)
            setStatus(trimmedBody || hasExtraFields ? "saved" : "idle");
          return;
        }
        // A composer emptied of EVERYTHING discards its draft rather than
        // storing a blank row on the member's drafts list. A body-less draft
        // that still holds a community, tags or a photo is kept: those are
        // choices the member made, and the whole point of the row is that they
        // survive to the next device.
        if (!trimmedBody && !hasExtraFields) {
          if (versionRef.current !== null) {
            await deleteForumDraft(draftId);
            versionRef.current = null;
          }
          savedBodyRef.current = input.body;
          publishPreview(null);
          if (isMountedRef.current) setStatus("idle");
          return;
        }
        const payload: ForumDraftInput = {
          ...input,
          // The server requires a non-empty title, and an untitled row is
          // unfindable on the drafts list.
          title: input.title.trim() || fallbackTitleRef.current || input.kind,
          meta: composerMeta(),
        };
        const saved =
          versionRef.current === null
            ? await createForumDraft(draftId, payload)
            : await updateForumDraft(draftId, payload, versionRef.current);
        versionRef.current = saved.version;
        savedBodyRef.current = input.body;
        publishPreview({
          body: input.body,
          title: input.title,
          hasExtraFields,
        });
        if (isMountedRef.current) setStatus("saved");
      } catch (error) {
        logError(error, { scope: "forum.draft.save" });
        if (isMountedRef.current) setStatus("idle");
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
  ]);

  /** Discards the draft — call once the post it holds has really published. */
  const clearDraft = useCallback(async () => {
    savedBodyRef.current = "";
    savedSnapshotRef.current = "";
    setStatus("idle");
    clearThreadDraftSnapshot(draftId, storageScope);
    queryClient.setQueryData(forumDraftQueryKey(draftId), null);
    try {
      if (demoMode) {
        window.localStorage.removeItem(demoStorageKey(draftId));
        return;
      }
      if (versionRef.current === null) return;
      await deleteForumDraft(draftId);
      versionRef.current = null;
    } catch (error) {
      logError(error, { scope: "forum.draft.clear" });
    }
  }, [draftId, demoMode, storageScope, queryClient]);

  return { status, clearDraft };
}
