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
  buildWorkshop,
  type WorkshopDraft,
} from "../../features/economy/addWorkshop.build";
import { useWorkshops as useWorkshopsQuery } from "../../features/economy/api/useWorkshops";
import { createWorkshop } from "../../features/economy/api/workshops.api";
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

  const value = useMemo<WorkshopsContextValue>(() => {
    // `fetched` already carries the seeded catalogue in demo mode (the query's
    // demo branch returns WORKSHOPS) — locally-listed ones go in front of it.
    const seen = new Set(added.map((w) => w.id));
    const workshops = [...added, ...fetched.filter((w) => !seen.has(w.id))];
    return {
      workshops,
      total: demoMode ? WORKSHOPS.length + added.length : total + added.length,
      isLoading,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      getWorkshop: (id) => workshops.find((w) => w.id === id),
      addWorkshop,
    };
  }, [
    added,
    fetched,
    demoMode,
    total,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    addWorkshop,
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
