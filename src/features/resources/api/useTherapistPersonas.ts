import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { getSubprofileDirectory } from "../../subprofiles/api/subprofiles.api";
import {
  vmFromCard,
  vmFromPublic,
  type TherapistCardVM,
} from "../therapistPersonaCard";

const PAGE_LIMIT = 100;
const MAX_PAGES = 20;

/** Stable empty array so a failed or empty fetch keeps its identity across
 *  renders and the caller's language-filter derivations stay stable. */
const EMPTY_CARDS: TherapistCardVM[] = [];

/**
 * Real therapist-kind personas for `TherapistSection`. Demo mode surfaces the
 * demo therapist persona(s) — including linked ones, unlike the standalone
 * directory — via `therapistPersonaCardsDemo`; live mode pages through the
 * real persona directory, passing `kind: "therapist"` so the server filters
 * (also includes linked personas, mirroring the demo behaviour).
 *
 * `comingSoon` now requires a request that actually succeeded (DES-22). A
 * failed fetch used to land in the same empty array as a real empty
 * directory, so an outage rendered "this directory is still being built" over
 * therapists who are listed and bookable. On a failure the caller renders
 * `LoadErrorState` and calls `refetch`.
 */
export function useTherapistPersonas() {
  const { demoMode } = useDemoMode();
  const query = useQuery<TherapistCardVM[]>({
    queryKey: ["therapist-personas", demoMode],
    staleTime: Infinity,
    queryFn: async ({ signal }) => {
      if (demoMode) {
        const { therapistPersonaCardsDemo } =
          await import("../../subprofiles/data/subprofiles.data");
        return therapistPersonaCardsDemo().map(vmFromPublic);
      }
      const first = await getSubprofileDirectory(
        { page: 1, limit: PAGE_LIMIT, kind: "therapist" },
        signal,
      );
      const items = [...first.items];
      const total = first.total ?? items.length;
      let page = 1;
      while (items.length < total && page < MAX_PAGES) {
        page += 1;
        const next = await getSubprofileDirectory(
          { page, limit: PAGE_LIMIT, kind: "therapist" },
          signal,
        );
        if (next.items.length === 0) break;
        items.push(...next.items);
      }
      return items.map(vmFromCard);
    },
  });
  const cards = useMemo(() => query.data ?? EMPTY_CARDS, [query.data]);
  return {
    cards,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
    comingSoon:
      !demoMode && !query.isLoading && !query.isError && cards.length === 0,
  };
}
