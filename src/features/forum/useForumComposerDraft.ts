import { useCallback, useEffect, useRef, useState } from "react";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { logError } from "../../shared/observability/logger";
import {
  createForumDraft,
  deleteForumDraft,
  getForumDraft,
  updateForumDraft,
  type ForumDraftInput,
} from "./api/forumDrafts.api";

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
}

/**
 * Autosaves a forum composer's body, and restores it on the next visit.
 *
 * Connects the EXISTING generic drafts module rather than adding a forum-only
 * one: every write goes to `/me/drafts` under a stable client-minted id (see
 * `forumDrafts.api.ts`). Live mode round-trips the optimistic-concurrency
 * `version`, so the same composer open in two tabs cannot silently discard one
 * tab's text; demo mode keeps the identical behaviour against `localStorage`,
 * since demo has no session to own a server draft.
 *
 * Restore never overwrites: a stored draft is applied only when the composer is
 * still empty, so recovering an old draft cannot eat text the member has
 * already started typing in this session.
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
}: ForumComposerDraftOptions) {
  const { demoMode } = useDemoMode();
  const [status, setStatus] = useState<ForumDraftStatus>("idle");
  // The version the server last handed back, echoed as `expectedVersion` on the
  // next patch. Null means "not created yet" (or a create is still needed).
  const versionRef = useRef<number | null>(null);
  // The text the last successful save wrote, so an unchanged body never costs a
  // request.
  const savedBodyRef = useRef<string>("");
  // The latest metadata, read inside the debounced save without making the
  // effect re-run (and so restart the timer) on every keystroke of the title.
  const metaRef = useRef<ForumDraftInput>({ title, body, href, kind });
  // Held in a ref so the restore effect does not depend on the caller passing a
  // referentially stable callback: a composer that recreated it each render
  // would otherwise re-read (and re-announce) its draft on every keystroke.
  const onRestoreRef = useRef(onRestore);
  const isMountedRef = useRef(true);

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
    onRestoreRef.current = onRestore;
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
    // Reset the per-draft bookkeeping when the id changes (navigating from one
    // thread's reply composer to another's).
    versionRef.current = null;
    savedBodyRef.current = "";

    async function restore() {
      try {
        if (demoMode) {
          const stored = window.localStorage.getItem(demoStorageKey(draftId));
          if (isStale || !stored) return;
          savedBodyRef.current = stored;
          if (!metaRef.current.body.trim()) {
            onRestoreRef.current(stored);
            if (isMountedRef.current) setStatus("restored");
          }
          return;
        }
        const draft = await getForumDraft(draftId);
        if (isStale || !draft) return;
        versionRef.current = draft.version;
        savedBodyRef.current = draft.desc;
        // Never clobber text the member has already typed in this session.
        if (draft.desc.trim() && !metaRef.current.body.trim()) {
          onRestoreRef.current(draft.desc);
          if (isMountedRef.current) setStatus("restored");
        }
      } catch (error) {
        logError(error, { scope: "forum.draft.restore" });
      }
    }
    void restore();
    return () => {
      isStale = true;
    };
  }, [draftId, demoMode, isEnabled]);

  // ── Debounced save ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEnabled) return;
    if (body === savedBodyRef.current) return;
    const timer = window.setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);

    async function save() {
      const input = metaRef.current;
      const trimmedBody = input.body.trim();
      if (isMountedRef.current) setStatus("saving");
      try {
        if (demoMode) {
          const key = demoStorageKey(draftId);
          if (trimmedBody) window.localStorage.setItem(key, input.body);
          else window.localStorage.removeItem(key);
          savedBodyRef.current = input.body;
          if (isMountedRef.current) setStatus(trimmedBody ? "saved" : "idle");
          return;
        }
        // An emptied composer discards its draft rather than storing a blank
        // row on the member's drafts list.
        if (!trimmedBody) {
          if (versionRef.current !== null) {
            await deleteForumDraft(draftId);
            versionRef.current = null;
          }
          savedBodyRef.current = input.body;
          if (isMountedRef.current) setStatus("idle");
          return;
        }
        const payload: ForumDraftInput = {
          ...input,
          // The server requires a non-empty title, and an untitled row is
          // unfindable on the drafts list.
          title: input.title.trim() || input.kind,
        };
        const saved =
          versionRef.current === null
            ? await createForumDraft(draftId, payload)
            : await updateForumDraft(draftId, payload, versionRef.current);
        versionRef.current = saved.version;
        savedBodyRef.current = input.body;
        if (isMountedRef.current) setStatus("saved");
      } catch (error) {
        logError(error, { scope: "forum.draft.save" });
        if (isMountedRef.current) setStatus("idle");
      }
    }
  }, [body, draftId, demoMode, isEnabled]);

  /** Discards the draft — call once the post it holds has really published. */
  const clearDraft = useCallback(async () => {
    savedBodyRef.current = "";
    setStatus("idle");
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
  }, [draftId, demoMode]);

  return { status, clearDraft };
}
