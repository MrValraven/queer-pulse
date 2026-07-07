import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getRoster } from "./communities.api";
import { rosterEntryToRosterMember } from "./communities.adapters";
import { getLiving } from "../livingCommunities.data";
import type { RosterMember } from "../community.model";

/**
 * A community's roster. Demo returns the flagship's mock roster synchronously
 * (byte-for-byte today's render, no async flash); live calls GET
 * /communities/:slug/roster and adapts each entry. Private-community 404s
 * surface as an empty roster — the not-found gate lives in `useCommunity`.
 */
export function useRoster(slug: string | undefined): RosterMember[] {
  const { demoMode } = useDemoMode();
  const query = useQuery<RosterMember[]>({
    queryKey: ["roster", slug],
    enabled: !demoMode && Boolean(slug),
    queryFn: async () =>
      (await getRoster(slug!)).map(rosterEntryToRosterMember),
  });
  if (demoMode) return getLiving(slug)?.roster ?? [];
  return query.data ?? [];
}
