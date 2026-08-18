import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { closeBoardItem } from "./members.api";

export interface CloseBoardItemVariables {
  slug: string;
  /** Optional note left when marking the post found ("Found it via Rui!"). */
  note?: string;
}

/** The bit of a `BoardItem` that changes once a post is closed — enough for
 *  the caller to merge into its local optimistic view of the item without
 *  waiting on the profile query's refetch. */
export interface ClosedBoardItem {
  slug: string;
  status: "closed";
  closedNote?: string;
  closedAt?: string;
}

/**
 * Mark one of the caller's own barter-board posts closed/found — the
 * dedicated `PATCH /profiles/me/board/:slug/close` action (never the general
 * board editor's full-replace `PUT /profiles/me/board`, which never touches
 * `status`).
 *
 * Demo mode never hits the network: it fabricates the same closed shape
 * locally so the calling component can merge it in optimistically, same as
 * the live branch's response. Live mode invalidates the profile query on
 * success so `ProfileProvider`'s own-profile fetch (and any other profile
 * read) picks up the persisted close on its next refetch; the caller is
 * still responsible for its own immediate optimistic merge, since neither
 * branch here writes into any shared cache directly.
 */
export function useCloseBoardItem() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<ClosedBoardItem, Error, CloseBoardItemVariables>({
    mutationFn: async ({ slug, note }) => {
      if (demoMode) {
        return {
          slug,
          status: "closed",
          closedNote: note?.trim() || undefined,
          closedAt: new Date().toISOString(),
        };
      }
      const dto = await closeBoardItem(slug, note);
      return {
        slug: dto.slug,
        status: "closed",
        closedNote: dto.closedNote ?? undefined,
        closedAt: dto.closedAt ?? undefined,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
