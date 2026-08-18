import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { CommunityEvent } from "../community.model";
import {
  pulseEventToCommunityEvent,
  pulseOpportunityToCard,
  pulseThreadToCard,
  type CommunityPulseOpportunity,
  type CommunityPulseThread,
} from "./communities.adapters";
import { getCommunityPulse } from "./communities.api";

export interface CommunityPulseResult {
  /** Upcoming events filed to this community — populates the Events tab in
   *  live mode. Always `[]` in demo mode; the Events tab keeps reading the
   *  mock `nextEventFromGathering`-derived `living.events` there instead
   *  (see `useCommunityDetailState`) — that's correct and intentional. */
  events: CommunityEvent[];
  /** Recent discussion threads filed to this community — the sidebar's
   *  "Recent discussions" card. A wholly new surface with no demo mock
   *  equivalent, so always `[]` in demo mode. */
  threads: CommunityPulseThread[];
  /** Open volunteer opportunities filed to this community — the sidebar's
   *  "Open opportunities" card. Same demo caveat as `threads`. */
  opportunities: CommunityPulseOpportunity[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

const NOOP = () => {};
const EMPTY: CommunityPulseResult = {
  events: [],
  threads: [],
  opportunities: [],
  isLoading: false,
  isError: false,
  refetch: NOOP,
};

/**
 * A community's own "pulse": upcoming events, recent discussion threads, and
 * open volunteer opportunities filed to it (`GET /communities/:slug/pulse`,
 * any roster member — see `CommunityPulseController`). Feeds two surfaces off
 * one shared query rather than doubling the network call: the Events tab
 * (`events`, threaded through `useCommunityDetailState`) and the sidebar's
 * "From this community" cards (`threads`/`opportunities`, threaded through
 * `CommunitySidebar`).
 *
 * `options.enabled` should be `false` for a non-member — the endpoint 403s
 * otherwise — and this hook always short-circuits to `EMPTY` in demo mode,
 * where the underlying "things attached to a community" concept has no mock
 * registry to read from.
 */
export function useCommunityPulse(
  slug: string | undefined,
  options: { enabled?: boolean } = {},
): CommunityPulseResult {
  const { enabled = true } = options;
  const { demoMode } = useDemoMode();
  const { t } = useTranslation();
  const fmt = useFormat();
  const query = useQuery({
    queryKey: ["community-pulse", slug],
    enabled: !demoMode && enabled && Boolean(slug),
    queryFn: () => getCommunityPulse(slug!),
  });

  if (demoMode) return EMPTY;
  if (!query.data) {
    return { ...EMPTY, isLoading: query.isLoading, isError: query.isError };
  }

  const onlineLabel = t("gatherings:spots.online");
  return {
    events: query.data.upcomingEvents.map((event) =>
      pulseEventToCommunityEvent(
        event,
        fmt,
        event.goingCount > 0
          ? t("gatherings:spots.going", { count: event.goingCount })
          : t("gatherings:spots.openToAll"),
        onlineLabel,
      ),
    ),
    threads: query.data.recentThreads.map(pulseThreadToCard),
    opportunities: query.data.openOpportunities.map(pulseOpportunityToCard),
    isLoading: false,
    isError: false,
    refetch: () => void query.refetch(),
  };
}
