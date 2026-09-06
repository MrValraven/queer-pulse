import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_SECTIONS } from "../magazineSections.data";
import { getSections } from "./magazine.api";

export interface MagazineSectionTile {
  id: string;
  name: string;
  /**
   * How many pieces an issue wants in this section, and the desk's one-line
   * house rule for it. Both are real columns on `MagazineSection` and real
   * fields on `SectionResponse`, carried through so the editor desk's Issue
   * plan and commission picker can read this one hook instead of keeping
   * their own copy of the taxonomy (PRD-130). They satisfy the desk's
   * `Section` shape exactly.
   */
  target: number;
  note: string;
  orderIndex: number;
  /**
   * Only populated in demo mode, where the curated mock article registry is
   * already loaded client-side (so a client-side count is free). Live mode
   * leaves this `null` rather than fanning out one
   * `GET /magazine/articles?section=` request per tile just to show a
   * number on a page that hasn't been opened yet — the drill-down page
   * itself (`MagazineSectionArticlesPage`) is the real, unbounded count.
   */
  articleCount: number | null;
}

/**
 * CNT-20 — the magazine's section/topic taxonomy browse
 * (`MagazineSectionsPage`), the "browse by section" index the gap audit
 * flagged as missing despite `section`/`kicker` being populated fields on
 * every article. Demo mode counts the curated `articles.mock` registry
 * against the canonical `DEMO_SECTIONS` list by exact `section` name match;
 * live mode calls the real `GET /magazine/sections`
 * (`MagazineService.listSections`), already ordered by `orderIndex`.
 *
 * PRD-130 — also the editor desk's section source (the Issue plan, the
 * commission picker and the Write action). The desk used to read the demo
 * `DEMO_SECTIONS` constant unconditionally, so a live editor commissioned
 * into a hand-curated taxonomy instead of the seeded one. Callers that need
 * a picker must respect `isLoading`/`isError`: an empty list means "we do
 * not know the taxonomy", and commissioning into no section is worse than
 * a disabled control.
 */
export function useMagazineSections() {
  const { demoMode } = useDemoMode();
  const query = useQuery<MagazineSectionTile[]>({
    queryKey: ["magazine-sections", demoMode],
    queryFn: async () => {
      if (demoMode) {
        // Demo-only mock registry — dynamically imported so it never ships
        // in the live bundle (live mode fetches from the API below).
        const { articles } = await import("../data/articles.mock");
        const rows = Object.values(articles);
        return DEMO_SECTIONS.map((section) => ({
          ...section,
          articleCount: rows.filter(
            (article) => article.section === section.name,
          ).length,
        }));
      }
      const sections = await getSections();
      return sections.map((section) => ({
        id: section.id,
        name: section.name,
        target: section.target,
        note: section.note,
        orderIndex: section.orderIndex,
        articleCount: null,
      }));
    },
  });
  return {
    sections: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => void query.refetch(),
  };
}
