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

/**
 * Real therapist-kind personas for `TherapistSection`. Demo mode surfaces the
 * demo therapist persona(s) — including linked ones, unlike the standalone
 * directory — via `therapistPersonaCardsDemo`; live mode pages through the
 * real persona directory, passing `kind: "therapist"` so the server filters
 * (also includes linked personas, mirroring the demo behaviour).
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
  const cards = query.data ?? [];
  return {
    cards,
    isLoading: query.isLoading,
    comingSoon: !demoMode && !query.isLoading && cards.length === 0,
  };
}
