import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { sampleJoinRequests } from "../../auth/api/joinRequest.api";
import { dtoToView, type JoinRequestView } from "./useJoinRequests";

/**
 * The range `SampleJoinRequestsQuery` allows on the server (`@Min(1) @Max(50)`
 * on `n`). Mirrored here so the picker below can only ever offer a size the
 * backend will accept, and a hand-passed number is clamped rather than 400ing.
 */
export const MIN_SAMPLE_SIZE = 1;
export const MAX_SAMPLE_SIZE = 50;

/** The sizes the reviewer picks between. Every one sits inside the range above. */
export const SAMPLE_SIZES = [5, 10, 25, 50] as const;

export function clampSampleSize(requested: number): number {
  if (!Number.isFinite(requested)) return 10;
  return Math.min(
    MAX_SAMPLE_SIZE,
    Math.max(MIN_SAMPLE_SIZE, Math.round(requested)),
  );
}

/**
 * A deterministic shuffle for demo mode, so "show a different sample" actually
 * shows a different one. `rerollToken` is the seed: the same token gives the
 * same order (a re-render is not a re-roll), and bumping it reorders the pool.
 * Live mode needs none of this, since the server orders by `RANDOM()`.
 */
function seededShuffle<Item>(items: Item[], seed: number): Item[] {
  const shuffled = [...items];
  let state = seed * 2654435761 + 1;
  for (let index = shuffled.length - 1; index > 0; index--) {
    state = (state * 1103515245 + 12345) >>> 0;
    const swapWith = state % (index + 1);
    const held = shuffled[index]!;
    shuffled[index] = shuffled[swapWith]!;
    shuffled[swapWith] = held;
  }
  return shuffled;
}

/**
 * A random sample of past-decided join requests, for the periodic peer quality
 * pass (`GET /admin/join-requests/sample`). Read-only by construction: this
 * hook exposes no mutation, and nothing downstream can change a decision from
 * what it returns.
 *
 * `rerollToken` is part of the query key rather than a `refetch()` call, so a
 * re-roll is a genuinely new draw in BOTH modes: live mode asks the server for
 * a fresh `RANDOM()` slice, and demo mode reshuffles the colocated mock queue's
 * already-decided rows instead of handing back the same first n every time.
 */
export function useJoinRequestSample(requestedSize = 10, rerollToken = 0) {
  const { demoMode } = useDemoMode();
  const { t, language } = useTranslation();
  const size = clampSampleSize(requestedSize);
  return useQuery<JoinRequestView[]>({
    queryKey: ["join-requests-sample", demoMode, size, rerollToken, language],
    queryFn: async () => {
      if (demoMode) {
        const { JOIN_REQUESTS } = await import("./joinRequests.data");
        const decided = JOIN_REQUESTS.filter(
          (row) => row.status === "approved" || row.status === "declined",
        );
        return seededShuffle(decided, rerollToken)
          .slice(0, size)
          .map((row) => dtoToView(row, t, language));
      }
      const rows = await sampleJoinRequests(size);
      return rows.map((row) => dtoToView(row, t, language));
    },
  });
}
