import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { DEMO_SECTIONS } from "../magazineSections.data";
import { getSections } from "./magazine.api";

export interface MagazineSectionTile {
  id: string;
  name: string;
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
          id: section.id,
          name: section.name,
          articleCount: rows.filter((article) => article.section === section.name)
            .length,
        }));
      }
      const sections = await getSections();
      return sections.map((section) => ({
        id: section.id,
        name: section.name,
        articleCount: null,
      }));
    },
  });
  return {
    sections: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
