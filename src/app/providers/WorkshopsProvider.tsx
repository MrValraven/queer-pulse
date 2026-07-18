import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WORKSHOPS,
  type Workshop,
} from "../../features/economy/workshops.data";
import {
  applyWorkshopDraft,
  buildWorkshop,
  type WorkshopDraft,
} from "../../features/economy/addWorkshop.build";
import { useWorkshops as useWorkshopsQuery } from "../../features/economy/api/useWorkshops";
import {
  createWorkshop,
  deleteWorkshop as deleteWorkshopRequest,
  updateWorkshop as updateWorkshopRequest,
} from "../../features/economy/api/workshops.api";
import {
  workshopDraftToCreateDto,
  workshopDtoToWorkshop,
} from "../../features/economy/api/workshops.adapters";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { useDemoMode } from "./DemoModeProvider";

interface WorkshopsContextValue {
  /** The catalogue: locally-listed workshops first, then the loaded pages. */
  workshops: Workshop[];
  /** Server-reported total (demo: the fixture's length). */
  total: number;
  /** True while the first page is in flight (live mode only). */
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  getWorkshop: (id: string) => Workshop | undefined;
  /**
   * List a workshop from the form draft. Resolves the created workshop, or
   * `null` when the write failed — callers must not show a success panel on
   * `null`.
   */
  addWorkshop: (draft: WorkshopDraft) => Promise<Workshop | null>;
  /**
   * Edit a workshop you host. Resolves the updated workshop, or `null` when the
   * write failed — callers must not show a success state on `null`.
   */
  updateWorkshop: (
    id: string,
    draft: WorkshopDraft,
  ) => Promise<Workshop | null>;
  /** Delete a workshop you host. Resolves false when the write failed. */
  deleteWorkshop: (id: string) => Promise<boolean>;
}

const WorkshopsContext = createContext<WorkshopsContextValue | null>(null);

/**
 * The workshops catalogue.
 *
 * Dual-mode: demo mode shows the seeded `WORKSHOPS` fixture plus anything the
 * member lists in this session, and never touches the network — listing a
 * workshop just runs the client-side `buildWorkshop`. Live mode pages through
 * GET /workshops (see `useWorkshops`) and POSTs new listings, prepending the
 * server's own response optimistically until the refetch catches up.
 *
 * Category filtering stays client-side over the loaded pages, exactly as before
 * — `SkillsPage` owns the active filter and needs the unfiltered count for its
 * empty state, so the provider holds one unfiltered query. The endpoint's `cat`
 * param is supported in `workshops.api.ts` for a future per-category board.
 */
export function WorkshopsProvider({ children }: { children: ReactNode }) {
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const queryClient = useQueryClient();
  const [added, setAdded] = useState<Workshop[]>([]);
  // Session-local edit/delete overlays. Keeping them separate from `added` means
  // a member can edit or delete a workshop that came off the fixture (demo) or
  // off a fetched page (live) without the catalogue query having to re-resolve
  // first — the overlay is applied on every read below.
  const [edited, setEdited] = useState<Record<string, Workshop>>({});
  const [removed, setRemoved] = useState<string[]>([]);

  const {
    workshops: fetched,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkshopsQuery();

  const { mutateAsync: postWorkshop } = useMutation({
    mutationKey: ["workshops", "create"],
    mutationFn: createWorkshop,
  });

  const addWorkshop = useCallback(
    async (draft: WorkshopDraft): Promise<Workshop | null> => {
      const tutor = {
        name: `${currentUser.first} ${currentUser.last}`,
        initials: currentUser.initials,
        tint: currentUser.tint,
        role: t("economy:addWorkshop.build.tutorRole"),
        memberSlug: currentUserSlug,
      };

      if (demoMode) {
        const workshop = buildWorkshop(draft, tutor, t, fmt);
        setAdded((prev) => [workshop, ...prev]);
        return workshop;
      }

      try {
        const dto = await postWorkshop(workshopDraftToCreateDto(draft));
        const workshop = workshopDtoToWorkshop(dto, t, fmt);
        // Optimistic prepend so the new listing is visible immediately; the
        // invalidated query replaces it with the canonical row shortly after.
        setAdded((prev) => [
          workshop,
          ...prev.filter((w) => w.id !== workshop.id),
        ]);
        queryClient.invalidateQueries({ queryKey: ["workshops"] });
        return workshop;
      } catch (err) {
        logError(err, { scope: "workshops.create" });
        return null;
      }
    },
    [demoMode, t, fmt, postWorkshop, queryClient],
  );

  // Live-mode workshops are keyed by slug, which is also the FE's `id`.
  const invalidateWorkshop = useCallback(
    (id: string) => {
      queryClient.invalidateQueries({ queryKey: ["workshops"] });
      queryClient.invalidateQueries({ queryKey: ["workshop", id] });
    },
    [queryClient],
  );

  const updateWorkshop = useCallback(
    async (id: string, draft: WorkshopDraft): Promise<Workshop | null> => {
      if (demoMode) {
        // Demo has no server to answer with the updated row, so it rebuilds
        // from the one it already has. Read through the same overlays the
        // consumers see, so editing twice in a row starts from the previous
        // edit rather than from the original.
        const current =
          edited[id] ??
          added.find((w) => w.id === id) ??
          fetched.find((w) => w.id === id);
        if (!current) return null;
        const next = applyWorkshopDraft(current, draft, t, fmt);
        setEdited((prev) => ({ ...prev, [id]: next }));
        return next;
      }

      // Live mode needs no local row: the PATCH response is the updated
      // workshop, and it's authoritative even for a slug this session never
      // paged in (a deep link straight to the workshop's own page).
      try {
        const dto = await updateWorkshopRequest(
          id,
          workshopDraftToCreateDto(draft),
        );
        const next = workshopDtoToWorkshop(dto, t, fmt);
        // Show the edit immediately; the invalidated queries replace this with
        // the canonical row a moment later.
        setEdited((prev) => ({ ...prev, [id]: next }));
        invalidateWorkshop(id);
        return next;
      } catch (err) {
        logError(err, { scope: "workshops.update" });
        return null;
      }
    },
    [demoMode, t, fmt, edited, added, fetched, invalidateWorkshop],
  );

  const deleteWorkshop = useCallback(
    async (id: string): Promise<boolean> => {
      if (demoMode) {
        setRemoved((prev) => (prev.includes(id) ? prev : [...prev, id]));
        return true;
      }

      try {
        await deleteWorkshopRequest(id);
        // Hide it locally too, so the member doesn't see the row they just
        // deleted still sitting there while the refetch is in flight.
        setRemoved((prev) => (prev.includes(id) ? prev : [...prev, id]));
        // Drop the detail cache rather than invalidating it: refetching a slug
        // that now 404s would leave the last successful response as `data` and
        // the page would keep rendering the deleted workshop.
        queryClient.removeQueries({ queryKey: ["workshop", id] });
        queryClient.invalidateQueries({ queryKey: ["workshops"] });
        return true;
      } catch (err) {
        logError(err, { scope: "workshops.delete" });
        return false;
      }
    },
    [demoMode, queryClient],
  );

  const value = useMemo<WorkshopsContextValue>(() => {
    // `fetched` already carries the seeded catalogue in demo mode (the query's
    // demo branch returns WORKSHOPS) — locally-listed ones go in front of it.
    const seen = new Set(added.map((w) => w.id));
    const gone = new Set(removed);
    const workshops = [...added, ...fetched.filter((w) => !seen.has(w.id))]
      .filter((w) => !gone.has(w.id))
      .map((w) => edited[w.id] ?? w);
    const base = demoMode
      ? WORKSHOPS.length + added.length
      : total + added.length;
    return {
      workshops,
      // Deleted rows are already out of `workshops`; keep the count honest so
      // the catalogue header doesn't promise a listing that isn't there.
      total: Math.max(0, base - removed.length),
      isLoading,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
      addWorkshop,
      updateWorkshop,
      deleteWorkshop,
    };
  }, [
    added,
    edited,
    removed,
    fetched,
    demoMode,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    addWorkshop,
    updateWorkshop,
    deleteWorkshop,
  ]);

  return (
    <WorkshopsContext.Provider value={value}>
      {children}
    </WorkshopsContext.Provider>
  );
}

export function useWorkshops() {
  const ctx = useContext(WorkshopsContext);
  if (!ctx) {
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  }
  return ctx;
}
