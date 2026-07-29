import { useCallback, useMemo, type ReactNode } from "react";
import { type Draft } from "../../features/members/drafts.data";
import { useLocalStorage } from "../../shared/hooks";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "./DemoModeProvider";
import {
  createDraft,
  deleteDraft,
  draftToDto,
} from "../../features/members/api/drafts.api";
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
  const [drafts, setDrafts] = useLocalStorage<Draft[]>(
    STORAGE_KEY,
    [],
    (v): v is Draft[] => Array.isArray(v),
  );
  const { demoMode } = useDemoMode();
  const { showToast } = useToast();
  const { t } = useTranslation();

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
