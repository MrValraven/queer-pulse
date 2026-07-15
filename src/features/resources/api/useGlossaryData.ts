import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { BLOCKS, type LetterBlock } from "../glossary.data";
import { getGlossaryTerms } from "./resources.api";
import { glossaryTermToTerm, groupTermsIntoBlocks } from "./resources.adapters";

export interface GlossaryDataResult {
  blocks: LetterBlock[];
  /** True while the initial live fetch is in flight (demo resolves instantly). */
  loading: boolean;
}

/** Stable empty array so the "no data yet" case doesn't churn identity every render. */
const EMPTY_BLOCKS: LetterBlock[] = [];

/**
 * Data source for `GlossaryPage`.
 *
 * Demo mode returns the page's own `BLOCKS` mock (PT translations and
 * cross-reference links included) unchanged. Live mode calls GET /glossary
 * once — small and unpaginated by design, mirroring the page's own
 * render-everything-then-filter-client-side behaviour — and groups the flat
 * term list alphabetically into the same `LetterBlock[]` shape. PT
 * translations and cross-reference `meta` links have no backend contract
 * (presentation-only, not persisted — see `resources.adapters.ts`), so both
 * fall back to the English content in live mode: a documented gap rather
 * than a fake translation.
 */
export function useGlossaryData(): GlossaryDataResult {
  const { demoMode } = useDemoMode();

  const query = useQuery<LetterBlock[]>({
    queryKey: ["resources", "glossary"],
    enabled: !demoMode,
    queryFn: async () => {
      const terms = await getGlossaryTerms({});
      return groupTermsIntoBlocks(terms.map(glossaryTermToTerm));
    },
  });

  if (demoMode) {
    return { blocks: BLOCKS, loading: false };
  }
  return { blocks: query.data ?? EMPTY_BLOCKS, loading: query.isPending };
}
