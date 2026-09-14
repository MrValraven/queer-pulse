import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { renewBoardItem } from "./members.api";
import { BOARD_WINDOW_DAYS } from "../board/boardLifespan";
import { DEMO_BOARD_NOW_MS } from "../board/boardInsights.demo";
import type { BoardItem } from "../data/members";

export interface RenewBoardItemVariables {
  slug: string;
  kind: BoardItem["kind"];
  /** The post's renew count BEFORE this renewal. Demo mode has no server to
   *  ask, so it derives the bumped figure from whatever the caller already
   *  holds; live mode ignores this and trusts the server's own count. */
  renewCount: number;
}

/** The part of a `BoardItem` a renewal changes, enough for the caller to merge
 *  optimistically without waiting on the profile refetch. */
export interface RenewedBoardItem {
  slug: string;
  expiresAt: string;
  renewCount: number;
}

/**
 * Push one of the caller's own board posts out by its kind's full window.
 *
 * The same mutation backs "Renew 30 days" and "Repost": the backend measures
 * the fresh window from now either way, so an expired post gets a full run.
 *
 * Demo mode never hits the network and fabricates the same shape locally, so
 * the walkthrough shows the renewal land. Live mode invalidates the profile
 * query; the caller still does its own optimistic merge, exactly as
 * `useCloseBoardItem` does.
 */
export function useRenewBoardItem() {
  const { demoMode } = useDemoMode();
  const queryClient = useQueryClient();
  return useMutation<RenewedBoardItem, Error, RenewBoardItemVariables>({
    mutationFn: async ({ slug, kind, renewCount }) => {
      if (demoMode) {
        // Measured from the pinned demo clock, same as every other lifespan
        // figure the board section renders (see DEMO_BOARD_NOW_MS). A real
        // Date.now() here would drift the meter past 100% and past the
        // window's own day count as the pinned reference date ages.
        const windowMs = BOARD_WINDOW_DAYS[kind] * 24 * 60 * 60 * 1000;
        return {
          slug,
          expiresAt: new Date(DEMO_BOARD_NOW_MS + windowMs).toISOString(),
          renewCount: renewCount + 1,
        };
      }
      const dto = await renewBoardItem(slug);
      return {
        slug: dto.slug,
        expiresAt: dto.expiresAt ?? new Date().toISOString(),
        renewCount: dto.renewCount ?? 0,
      };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
