import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getEndorsers, type EndorserDTO } from "./subprofiles.api";

/**
 * A persona's active endorsers list. Live reads `GET /subprofiles/:id/
 * endorsements`; demo reads the same in-memory mock `useEndorsement`'s
 * `mockSetEndorsed` writes, via a dynamic import so the mock registry is
 * never pulled into the live bundle path.
 *
 * `queryKey` intentionally matches the `["subprofile", "endorsers", id]`
 * shape already used by `useEndorsement`'s post-mutation invalidation — NOT
 * `[..., demoMode]` — so an endorse/withdraw elsewhere busts this cache too.
 *
 * This is the ONE declaration of that query. `SubprofileEndorse`,
 * `SubprofileAffiliations` and `SubprofilePeopleModal` each used to declare it
 * inline with a drifting queryFn (two of them dropping the abort `signal`), so
 * whichever observer mounted first decided whether the fetch was cancellable.
 * Read it through this hook everywhere.
 */
export function useEndorsers(id: string, enabled: boolean) {
  const { demoMode } = useDemoMode();
  return useQuery<{ count: number; endorsers: EndorserDTO[] }>({
    queryKey: ["subprofile", "endorsers", id],
    enabled: enabled && Boolean(id),
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { mockEndorsersById } = await import("../data/subprofiles.data");
        return mockEndorsersById(id) ?? { count: 0, endorsers: [] };
      }
      return getEndorsers(id, signal);
    },
  });
}
