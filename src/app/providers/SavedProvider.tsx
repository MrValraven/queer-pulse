import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useScopedLocalStorage } from "./useScopedLocalStorage";
import { useStorageScope } from "./useStorageScope";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "./DemoModeProvider";
import { useAuth } from "./authContext";
import { useSessionBootstrap } from "../../shared/api/useSessionBootstrap";
import {
  getSaved,
  putSaved,
  deleteSaved,
  dtoToSavedItem,
  savedItemToBody,
} from "../../features/members/api/saved.api";
import {
  SavedContext,
  type SavedItem,
  type SavedKind,
} from "./useSaved";

const STORAGE_KEY = "qp.saved.v1";

const isSavedItemArray = (v: unknown): v is SavedItem[] => Array.isArray(v);

/**
 * App-wide store of "saved" things (articles, films, jobs, posts…). Persists to
 * localStorage so the Collections page and every save toggle stay in sync.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, byte-for-byte as
 * before and never touching the network. Live, the same localStorage store acts
 * as an optimistic/offline cache — a hydration effect seeds it from the server,
 * and each mutator applies the local change first, then syncs to the API and
 * rolls the local state back on failure.
 */
export function SavedProvider({ children }: { children: ReactNode }) {
  // Per-user bucket: a shared device must never surface one member's saved
  // items to the next before server hydration lands. `scopeId` is the live
  // user's id (or "demo" for the single mock persona; `null` while signed out,
  // which resets this to empty). See `useStorageScope`/`useScopedLocalStorage`.
  const scopeId = useStorageScope();
  const [items, setItems] = useScopedLocalStorage<SavedItem[]>(
    STORAGE_KEY,
    scopeId,
    [],
    isSavedItemArray,
  );
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Live-only: hydrate the store from the session bootstrap payload. Shares the
  // one ["bootstrap"] request mounted by SessionBootstrapProvider — this hook
  // call adds a subscriber, not a request. Demo mode and logged-out both leave
  // the query disabled, so this never fires there.
  const { data: bootstrap, isError: bootstrapErrored } = useSessionBootstrap();

  useEffect(() => {
    if (demoMode || !loggedIn) return;

    if (bootstrap) {
      // Bootstrap warmed the cache — use it and skip the standalone fetch.
      setItems(bootstrap.saved.items.map(dtoToSavedItem));
      return;
    }

    // Bootstrap is a cache-warmer, never a dependency: only fall back once it
    // has settled WITHOUT data (404/500/rejected-payload, or the endpoint isn't
    // deployed yet). While it's still in flight, wait for it rather than racing
    // a duplicate request.
    if (!bootstrapErrored) return;

    let active = true;
    getSaved()
      .then((res) => {
        if (active) setItems(res.items.map(dtoToSavedItem));
      })
      .catch(() => {
        /* unauthorized / offline — keep the cached local list */
      });
    return () => {
      active = false;
    };
  }, [demoMode, loggedIn, bootstrap, bootstrapErrored, setItems]);

  const isSaved = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items],
  );

  const save = useCallback(
    (item: SavedItem) => {
      let existed = false;
      setItems((prev) => {
        existed = prev.some((it) => it.id === item.id);
        return existed ? prev : [item, ...prev];
      });
      if (demoMode || existed) return;
      putSaved(item.id, savedItemToBody(item)).catch(() => {
        // Roll back the optimistic add on failure, and tell the user — the
        // change silently disappears otherwise.
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        showToast(t("common:toast.saveFailed"), "error");
      });
    },
    [setItems, demoMode, showToast, t],
  );

  const unsave = useCallback(
    (id: string) => {
      let removed: SavedItem | undefined;
      setItems((prev) => {
        removed = prev.find((it) => it.id === id);
        return prev.filter((it) => it.id !== id);
      });
      if (demoMode || !removed) return;
      const restore = removed;
      deleteSaved(id).catch(() => {
        // Roll back the optimistic removal on failure (restore most-recent-first),
        // and tell the user — the item silently reappears otherwise.
        setItems((prev) =>
          prev.some((it) => it.id === id) ? prev : [restore, ...prev],
        );
        showToast(t("common:toast.removeFailed"), "error");
      });
    },
    [setItems, demoMode, showToast, t],
  );

  const toggleSave = useCallback(
    (item: SavedItem) => {
      // Decide from the current snapshot so the returned boolean is correct
      // synchronously — callers use it to pick "Saved"/"Removed" toast copy.
      // (A state updater function isn't run synchronously, so a flag mutated
      // inside one can't be returned reliably.)
      const wasSaved = items.some((it) => it.id === item.id);
      setItems((prev) =>
        wasSaved ? prev.filter((it) => it.id !== item.id) : [item, ...prev],
      );
      if (!demoMode) {
        const op = wasSaved
          ? deleteSaved(item.id)
          : putSaved(item.id, savedItemToBody(item));
        op.catch(() => {
          // Roll back to the pre-toggle state for this id, and tell the user —
          // the toggle silently snaps back otherwise.
          setItems((prev) => {
            if (wasSaved) {
              return prev.some((it) => it.id === item.id)
                ? prev
                : [item, ...prev];
            }
            return prev.filter((it) => it.id !== item.id);
          });
          showToast(
            t(wasSaved ? "common:toast.removeFailed" : "common:toast.saveFailed"),
            "error",
          );
        });
      }
      return !wasSaved;
    },
    [items, setItems, demoMode, showToast, t],
  );

  const byKind = useCallback(
    (kind: SavedKind) => items.filter((it) => it.kind === kind),
    [items],
  );

  const value = useMemo(
    () => ({ items, isSaved, toggleSave, save, unsave, byKind }),
    [items, isSaved, toggleSave, save, unsave, byKind],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}
