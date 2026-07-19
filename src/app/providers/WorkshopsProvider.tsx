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
  useWorkshopRsvpStore,
  type WorkshopRsvpStore,
} from "../../features/economy/api/workshopRsvp.hooks";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { useDemoMode } from "./DemoModeProvider";

/**
 * The session overlay: workshops listed, edited or deleted in this browser
 * session, plus the mutators. Deliberately carries NO catalogue and no query
 * state — those come from `useWorkshops()`, the composition hook below.
 */
interface WorkshopsContextValue {
  /** Workshops listed in this session, newest first. */
  added: Workshop[];
  /** Session-local edits, by workshop id. */
  edited: Record<string, Workshop>;
  /** Ids deleted in this session. */
  removed: string[];
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
  updateWorkshop: (id: string, draft: WorkshopDraft) => Promise<Workshop | null>;
  /** Delete a workshop you host. Resolves false when the write failed. */
  deleteWorkshop: (id: string) => Promise<boolean>;
}

/** Overlay + bookings: everything a component can do without reading the
 *  catalogue, and therefore without triggering GET /workshops. */
export type WorkshopsActions = WorkshopsContextValue & WorkshopRsvpStore;

/** The catalogue joined to the overlay — the shape readers have always had. */
export interface WorkshopsValue extends WorkshopsActions {
  /** The catalogue: locally-listed workshops first, then the loaded pages. */
  workshops: Workshop[];
  /** Server-reported total (demo: the fixture's length), overlay-adjusted. */
  total: number;
  /** True while the first page is in flight (live mode only). */
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  getWorkshop: (id: string) => Workshop | undefined;
}

const WorkshopsContext = createContext<WorkshopsActions | null>(null);

/**
 * The provider holds only the session overlay — workshops listed, edited or
 * deleted in this browser session, plus this session's RSVPs — because those
 * have to outlive navigating off the board. The catalogue itself is a
 * react-query query (`src/features/economy/api/useWorkshops.ts`) subscribed by
 * `useWorkshops()` below, so GET /workshops fires when a component that renders
 * the catalogue mounts. Components that only act on a workshop call
 * `useWorkshopsActions()` and fire nothing.
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
  // Reservations: this session's bookings over whatever each row arrived with.
  const rsvpStore = useWorkshopRsvpStore();

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
        // edit rather than from the original. The last fallback is the fixture
        // itself: in demo the catalogue query resolves to exactly `WORKSHOPS`,
        // so this is the same row it used to find via the query result.
        const current =
          edited[id] ??
          added.find((w) => w.id === id) ??
          WORKSHOPS.find((w) => w.id === id);
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
    [demoMode, t, fmt, edited, added, invalidateWorkshop],
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

  const value = useMemo<WorkshopsActions>(
    () => ({
      added,
      edited,
      removed,
      addWorkshop,
      updateWorkshop,
      deleteWorkshop,
      ...rsvpStore,
    }),
    [added, edited, removed, addWorkshop, updateWorkshop, deleteWorkshop, rsvpStore],
  );

  return (
    <WorkshopsContext.Provider value={value}>
      {children}
    </WorkshopsContext.Provider>
  );
}

/**
 * The session overlay and mutators, with NO catalogue subscription — so calling
 * this never triggers GET /workshops. Use it from anything that acts on a
 * workshop (RSVP, edit, delete) rather than rendering the catalogue.
 */
export function useWorkshopsActions(): WorkshopsActions {
  const ctx = useContext(WorkshopsContext);
  if (!ctx) {
    throw new Error("useWorkshops must be used within WorkshopsProvider");
  }
  return ctx;
}

/**
 * The catalogue — the loaded pages with this session's listings, edits and
 * deletions applied over them.
 *
 * Calling this SUBSCRIBES to GET /workshops. That subscription is what replaced
 * the `useMatch` route gate this hook's query used to carry: the request fires
 * because a component that renders the catalogue mounted, not because someone
 * remembered to add a route to a list. Anything that does not render the
 * catalogue must call `useWorkshopsActions()` instead — leaving a write-only
 * consumer here would silently reintroduce an app-wide fetch.
 *
 * Category filtering stays client-side over the loaded pages: `SkillsPage` owns
 * the active filter and needs the unfiltered count for its empty state, so this
 * holds one unfiltered query. The endpoint's `cat` param is supported in
 * `workshops.api.ts` for a future per-category board.
 */
export function useWorkshops(): WorkshopsValue {
  const actions = useWorkshopsActions();
  const {
    workshops: fetched,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useWorkshopsQuery();
  const { added, edited, removed } = actions;
  const { demoMode } = useDemoMode();

  return useMemo<WorkshopsValue>(() => {
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
      ...actions,
      workshops,
      // Deleted rows are already out of `workshops`; keep the count honest so
      // the catalogue header doesn't promise a listing that isn't there.
      total: Math.max(0, base - removed.length),
      isLoading,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
    };
  }, [
    actions,
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
  ]);
}
