import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../../../shared/api/client";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";

/**
 * Why a community is paused, and since when — the fields the frozen banner
 * needs to stop narrating every pause as a report review.
 *
 * Read with its own narrow request rather than off `useCommunity`, which maps
 * the detail DTO straight into view-models and drops these three columns
 * before any component can see them. Only ever mounted by
 * `CommunityFrozenBanner`, which itself only renders while the community is
 * actually frozen, so this is one extra GET on a rare page state, never on the
 * common path.
 *
 * Every field is optional: a backend that has not yet widened
 * `CommunityDetailDTO` simply answers without them, and the banner falls back
 * to its neutral "paused" wording instead of inventing a reason.
 */

/** Why the pause happened.
 *  - `manual` — a moderator paused the community deliberately. No report
 *    exists, so the copy must not mention one.
 *  - `emergency_report` — a single severe report tripped an immediate pause.
 *  - `report_pileup` — enough reports arrived at once to trip a pause. */
export type CommunityFrozenReason =
  "manual" | "emergency_report" | "report_pileup";

interface FrozenDetailResponse {
  frozenAt?: string | null;
  frozenReason?: CommunityFrozenReason | null;
  frozenNote?: string | null;
}

export interface CommunityFreezeDetail {
  /** ISO timestamp the pause started, when the backend reports one. */
  frozenAt: string | null;
  frozenReason: CommunityFrozenReason | null;
  /** The moderator's short PUBLIC note about the pause, when one was left. */
  frozenNote: string | null;
}

const NO_DETAIL: CommunityFreezeDetail = {
  frozenAt: null,
  frozenReason: null,
  frozenNote: null,
};

export function useCommunityFreezeDetail(
  slug: string | undefined,
): CommunityFreezeDetail {
  const { demoMode } = useDemoMode();
  const query = useQuery<FrozenDetailResponse>({
    queryKey: ["community-freeze-detail", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: () => apiGet<FrozenDetailResponse>(`/communities/${slug}`),
  });

  if (demoMode || !query.data) return NO_DETAIL;
  return {
    frozenAt: query.data.frozenAt ?? null,
    frozenReason: query.data.frozenReason ?? null,
    frozenNote: query.data.frozenNote ?? null,
  };
}
