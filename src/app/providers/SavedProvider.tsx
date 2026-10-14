import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
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
  type SavedRememberOptions,
  type SavedToggleOptions,
} from "./useSaved";

const STORAGE_KEY = "qp.saved.v1";

const isSavedItemArray = (v: unknown): v is SavedItem[] => Array.isArray(v);

/**
 * The saves `remember` added this session, by id. Hydration reads one page
 * of saves from the server, so `withServerItems` keeps these after the
 * server's own items: a like a later Liked songs page brought in stays.
 *
 * An unsave tombstones its id and drops its remembered copy; a save clears
 * the tombstone (`mark`; a failed DELETE runs the undo it returns). `accept`
 * drops tombstoned ids, so `remember` can't bring a remembered copy back from
 * a Liked songs read that left the server before the unsave. Hydration still
 * takes whatever the server's own page lists. `accept` also drops a batch
 * read under an earlier member (`scopeAtRead` against `readScope`).
 *
 * A new member on this device starts empty with a new scope. The reset is a
 * layout effect, so it lands before any passive effect: the hydration
 * below, and a child's query starting its first read.
 */
function useRememberedSaves(scopeId: string | null) {
  const rememberedRef = useRef(new Map<string, SavedItem>());
  const tombstonedIdsRef = useRef(new Set<string>());
  const scopeRef = useRef({ scopeId, generation: 0 });
  useLayoutEffect(() => {
    if (scopeRef.current.scopeId === scopeId) return;
    scopeRef.current = {
      scopeId,
      generation: scopeRef.current.generation + 1,
    };
    rememberedRef.current = new Map();
    tombstonedIdsRef.current = new Set();
  }, [scopeId]);
  return useMemo(
    () => ({
      readScope: (): number => scopeRef.current.generation,
      accept: (savedItems: SavedItem[], scopeAtRead?: number): SavedItem[] => {
        if (
          scopeAtRead !== undefined &&
          scopeAtRead !== scopeRef.current.generation
        ) {
          return [];
        }
        const acceptedItems = savedItems.filter(
          (savedItem) => !tombstonedIdsRef.current.has(savedItem.id),
        );
        for (const savedItem of acceptedItems) {
          rememberedRef.current.set(savedItem.id, savedItem);
        }
        return acceptedItems;
      },
      // The undo returns whether the same member still holds the store, so
      // a caller rolls its items back only then.
      mark: (id: string, isNowSaved: boolean): (() => boolean) => {
        const generationAtMark = scopeRef.current.generation;
        const isSameScope = () =>
          scopeRef.current.generation === generationAtMark;
        if (isNowSaved) {
          // A failed save leaves the tombstone cleared: the server may well
          // still hold the save (a failed DELETE before it, say).
          tombstonedIdsRef.current.delete(id);
          return isSameScope;
        }
        const rememberedCopy = rememberedRef.current.get(id);
        tombstonedIdsRef.current.add(id);
        rememberedRef.current.delete(id);
        // A failed DELETE means the server still holds the save.
        return () => {
          if (!isSameScope()) return false;
          tombstonedIdsRef.current.delete(id);
          if (rememberedCopy) rememberedRef.current.set(id, rememberedCopy);
          return true;
        };
      },
      withServerItems: (serverItems: SavedItem[]): SavedItem[] => {
        const serverIds = new Set(serverItems.map((savedItem) => savedItem.id));
        const keptItems = [...rememberedRef.current.values()].filter(
          (savedItem) => !serverIds.has(savedItem.id),
        );
        return keptItems.length === 0
          ? serverItems
          : [...serverItems, ...keptItems];
      },
    }),
    [],
  );
}

type RememberedSaves = ReturnType<typeof useRememberedSaves>;

/**
 * The context's `remember`. Local only: the items came from the server, so
 * there is nothing to send. Functional, so it never depends on `items` and
 * stays one stable function.
 */
function useRememberCallback(
  remembered: RememberedSaves,
  setItems: Dispatch<SetStateAction<SavedItem[]>>,
) {
  return useCallback(
    (incoming: SavedItem[], options?: SavedRememberOptions) => {
      const acceptedItems = remembered.accept(incoming, options?.scopeAtRead);
      if (acceptedItems.length === 0) return;
      setItems((previousItems) => {
        const knownIds = new Set(
          previousItems.map((savedItem) => savedItem.id),
        );
        const additions: SavedItem[] = [];
        for (const savedItem of acceptedItems) {
          if (knownIds.has(savedItem.id)) continue;
          knownIds.add(savedItem.id);
          additions.push(savedItem);
        }
        return additions.length === 0
          ? previousItems
          : [...previousItems, ...additions];
      });
    },
    [setItems, remembered],
  );
}

/**
 * App-wide store of "saved" things (articles, films, jobs, posts…). Persists to
 * localStorage so the Collections page and every save toggle stay in sync.
 *
 * Dual-mode (spec 09): in demo mode this is a pure local store, byte-for-byte as
 * before and never touching the network. Live, the same localStorage store acts
 * as an optimistic/offline cache: a hydration effect seeds it from the server,
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
  // one session-bootstrap request mounted by SessionBootstrapProvider: this hook
  // call adds a subscriber, not a request. Demo mode and logged-out both leave
  // the query disabled, so this never fires there.
  const { data: bootstrap, isError: bootstrapErrored } = useSessionBootstrap();

  const remembered = useRememberedSaves(scopeId);

  useEffect(() => {
    if (demoMode || !loggedIn) return;

    if (bootstrap) {
      // Bootstrap warmed the cache, so use it and skip the standalone fetch.
      setItems(
        remembered.withServerItems(bootstrap.saved.items.map(dtoToSavedItem)),
      );
      return;
    }

    // Bootstrap is a cache-warmer, never a dependency: only fall back once it
    // has settled WITHOUT data (404/500/rejected-payload, or the endpoint isn't
    // deployed yet). While it's still in flight, wait for it rather than racing
    // a duplicate request.
    if (!bootstrapErrored) return;

    let active = true;
    getSaved()
      .then((response) => {
        if (active) {
          setItems(
            remembered.withServerItems(response.items.map(dtoToSavedItem)),
          );
        }
      })
      .catch(() => {
        /* unauthorized / offline: keep the cached local list */
      });
    return () => {
      active = false;
    };
  }, [demoMode, loggedIn, bootstrap, bootstrapErrored, setItems, remembered]);

  const isSaved = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items],
  );

  const save = useCallback(
    (item: SavedItem) => {
      // Decide from the current snapshot, the way `toggleSave` below already
      // does. A flag assigned inside a state updater is only set synchronously
      // when React takes its eager fast path (an empty update queue); with any
      // pending update on this component the updater is deferred, `existed`
      // stays false, and the PUT below never fires: the heart fills and
      // nothing persists.
      const existed = items.some((it) => it.id === item.id);
      const undoMark = remembered.mark(item.id, true);
      setItems((prev) =>
        prev.some((it) => it.id === item.id) ? prev : [item, ...prev],
      );
      if (demoMode || existed) return;
      putSaved(item.id, savedItemToBody(item)).catch(() => {
        // Another member signed in meanwhile: their store has nothing to undo.
        if (!undoMark()) return;
        // Roll back the optimistic add on failure, and tell the user: the
        // change silently disappears otherwise.
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        showToast(t("common:toast.saveFailed"), "error");
      });
    },
    [items, setItems, demoMode, showToast, t, remembered],
  );

  const unsave = useCallback(
    (id: string) => {
      // Same rule as `save` above: read the current snapshot, then apply.
      const removed = items.find((it) => it.id === id);
      const undoMark = remembered.mark(id, false);
      setItems((prev) => prev.filter((it) => it.id !== id));
      if (demoMode || !removed) return;
      const restore = removed;
      deleteSaved(id).catch(() => {
        if (!undoMark()) return;
        // Roll back the optimistic removal on failure (restore most-recent-first),
        // and tell the user: the item silently reappears otherwise.
        setItems((prev) =>
          prev.some((it) => it.id === id) ? prev : [restore, ...prev],
        );
        showToast(t("common:toast.removeFailed"), "error");
      });
    },
    [items, setItems, demoMode, showToast, t, remembered],
  );

  const toggleSave = useCallback(
    (item: SavedItem, options?: SavedToggleOptions) => {
      // Decide from the current snapshot so the returned boolean is correct
      // synchronously: callers use it to pick "Saved"/"Removed" toast copy.
      // (A state updater function isn't run synchronously, so a flag mutated
      // inside one can't be returned reliably.)
      const wasSaved = items.some((it) => it.id === item.id);
      const undoMark = remembered.mark(item.id, !wasSaved);
      setItems((prev) =>
        wasSaved ? prev.filter((it) => it.id !== item.id) : [item, ...prev],
      );
      if (!demoMode) {
        const op = wasSaved
          ? deleteSaved(item.id)
          : putSaved(item.id, savedItemToBody(item));
        // `onSynced` waits for the server, so a caller's refetch reads the
        // change. The rejection handler below never sees an error it throws.
        op.then(
          () => options?.onSynced?.(),
          () => {
            if (!undoMark()) return;
            // Roll back to the pre-toggle state for this id, and tell the
            // user: the toggle silently snaps back otherwise.
            setItems((prev) => {
              if (wasSaved) {
                return prev.some((it) => it.id === item.id)
                  ? prev
                  : [item, ...prev];
              }
              return prev.filter((it) => it.id !== item.id);
            });
            showToast(
              t(
                wasSaved
                  ? "common:toast.removeFailed"
                  : "common:toast.saveFailed",
              ),
              "error",
            );
          },
        );
      }
      return !wasSaved;
    },
    [items, setItems, demoMode, showToast, t, remembered],
  );

  const byKind = useCallback(
    (kind: SavedKind) => items.filter((it) => it.kind === kind),
    [items],
  );

  const remember = useRememberCallback(remembered, setItems);
  const readSaveScope = remembered.readScope;

  const value = useMemo(
    () => ({
      items,
      isSaved,
      toggleSave,
      save,
      unsave,
      byKind,
      remember,
      readSaveScope,
    }),
    [items, isSaved, toggleSave, save, unsave, byKind, remember, readSaveScope],
  );

  return (
    <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
  );
}
