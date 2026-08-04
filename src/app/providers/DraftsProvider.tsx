import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { type Draft } from "../../features/members/drafts.data";
import { useScopedLocalStorage } from "./useScopedLocalStorage";
import { useStorageScope } from "./useStorageScope";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "./DemoModeProvider";
import {
  createDraft,
  deleteDraft,
  draftToDto,
} from "../../features/members/api/drafts.api";
import { setMessageDraftsScope } from "../../features/messages/drafts";
import { DraftsContext, type DraftsStore } from "./useDrafts";

const STORAGE_KEY = "qp.drafts.v1";

/**
 * App-wide store of drafts the user actually started elsewhere (e.g. saving an
 * invite as a draft) so they show up on the Drafts page. Persists to
 * localStorage. Stored drafts must use plain-string fields — the static mock
 * drafts use JSX, but anything persisted here has to be serialisable.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, unchanged and
 * never touching the network. Live, the same localStorage store is an
 * optimistic/offline cache — each mutator applies the local change first, then
 * syncs to the API, rolling the local state back on failure.
 *
 * **The provider no longer fetches** (phase 4). It used to run a keyless
 * `useEffect` + `getDrafts()` on mount, on every route, whether or not anything
 * read `drafts` — one of the seven eager provider requests the scoping work
 * removes. The fetch now lives in `useMyDrafts()`, subscribed only by the
 * `useDrafts()` composition hook below, so it fires when a READER mounts.
 * Write-only consumers use `useDraftsActions()` and fire nothing.
 */
export function DraftsProvider({ children }: { children: ReactNode }) {
  // Per-user bucket — a shared device must never surface one member's drafts to
  // the next (see `useStorageScope`/`useScopedLocalStorage`).
  const scopeId = useStorageScope();
  const [drafts, setDrafts] = useScopedLocalStorage<Draft[]>(
    STORAGE_KEY,
    scopeId,
    [],
    (v): v is Draft[] => Array.isArray(v),
  );
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Keep the message-composer drafts store (`features/messages/drafts.ts`)
  // scoped to the SAME authenticated member as the rest of the per-user caches,
  // so a shared device never surfaces one member's unsent composer text to the
  // next. Driven from here — the providers layer that already owns per-user
  // cache scoping — rather than from the messages feature, so all scoping lives
  // in one place. (The messages controller still wipes it on a demo↔live flip.)
  useEffect(() => {
    setMessageDraftsScope(scopeId);
  }, [scopeId]);

  const addDraft = useCallback(
    (draft: Draft) => {
      let existed = false;
      setDrafts((prev) => {
        existed = prev.some((d) => d.id === draft.id);
        return existed ? prev : [draft, ...prev];
      });
      if (demoMode || existed) return;
      createDraft(draftToDto(draft)).catch(() => {
        // Roll back the optimistic add on failure, and tell the user — the
        // draft silently disappears otherwise.
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
        showToast(t("common:toast.saveFailed"), "error");
      });
    },
    [setDrafts, demoMode, showToast, t],
  );

  const removeDraft = useCallback(
    (id: string) => {
      let removed: Draft | undefined;
      setDrafts((prev) => {
        removed = prev.find((d) => d.id === id);
        return prev.filter((d) => d.id !== id);
      });
      if (demoMode || !removed) return;
      const restore = removed;
      deleteDraft(id).catch(() => {
        // Roll back the optimistic removal on failure (restore newest-first),
        // and tell the user — the draft silently reappears otherwise.
        setDrafts((prev) =>
          prev.some((d) => d.id === id) ? prev : [restore, ...prev],
        );
        showToast(t("common:toast.removeFailed"), "error");
      });
    },
    [setDrafts, demoMode, showToast, t],
  );

  const value = useMemo<DraftsStore>(
    () => ({ drafts, addDraft, removeDraft, setDrafts }),
    [drafts, addDraft, removeDraft, setDrafts],
  );

  return (
    <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>
  );
}
