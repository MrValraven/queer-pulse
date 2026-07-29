import { useCallback, useMemo, useState, type ReactNode } from "react";
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
import {
  createWorkshop,
  deleteWorkshop as deleteWorkshopRequest,
  updateWorkshop as updateWorkshopRequest,
} from "../../features/economy/api/workshops.api";
import {
  workshopDraftToCreateDto,
  workshopDtoToWorkshop,
} from "../../features/economy/api/workshops.adapters";
import { useWorkshopRsvpStore } from "../../features/economy/api/workshopRsvp.hooks";
import {
  currentUser,
  currentUserSlug,
} from "../../features/members/data/members";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { logError } from "../../shared/observability/logger";
import { useDemoMode } from "./DemoModeProvider";
import { WorkshopsContext, type WorkshopsActions } from "./useWorkshops";

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
        void queryClient.invalidateQueries({ queryKey: ["workshops"] });
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
      void queryClient.invalidateQueries({ queryKey: ["workshops"] });
      void queryClient.invalidateQueries({ queryKey: ["workshop", id] });
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
        void queryClient.invalidateQueries({ queryKey: ["workshops"] });
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
