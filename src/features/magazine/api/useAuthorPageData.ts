import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Author } from "../authorContent.data";
import { authorFromDto, mergeAuthor } from "./magazine.adapters";
import { ignoreEnrichmentError, nullOnNotFound } from "./loadErrors";
import { getArticles, getAuthor } from "./magazine.api";

/**
 * `AuthorPage.tsx`. Demo mode is the existing `AUTHORS[slug]` lookup,
 * unchanged. Live mode fetches GET /magazine/authors/:slug and GET
 * /magazine/articles?author=:slug for ANY slug (CNT-9 fix — this used to
 * only resolve the 8 curated demo slugs even in live mode, so a live reader
 * following a real byline to a non-curated writer hit the "not found" wall
 * despite `GET /magazine/authors/:slug` being real). When the slug also has
 * a curated mock profile, the live data overlays onto it (`mergeAuthor`,
 * unchanged); otherwise a fresh record is built entirely from the API
 * (`authorFromDto`), with no backend analogue left honestly blank rather
 * than fabricated. A genuinely unknown slug still 404s (`getAuthor` throws).
 *
 * i18n: `language` joins the query key because the adapters locale-format
 * the featured article's meta via `fmt` — switching language must re-derive it.
 */
export function useAuthorPageData(slug: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { t, language } = useTranslation();
  return useQuery<Author | null>({
    queryKey: ["magazine-author", demoMode, language, slug],
    queryFn: async () => {
      if (demoMode) return null;

      const [dto, articlesPage] = await Promise.all([
        // The author is the page (404 becomes the not-found wall, anything
        // else is rethrown and retried); their article list only enriches it.
        getAuthor(slug).catch(nullOnNotFound),
        getArticles({ author: slug }).catch(ignoreEnrichmentError),
      ]);
      if (!dto) return null;

      const liveArticles = articlesPage?.items ?? [];
      // Curated mock profiles — dynamically imported so they never ship in
      // the live bundle. Only used to enrich the page furniture the backend
      // doesn't model (stats, reading list, ...) when this slug happens to
      // match one of the 8 curated writers; any other real author still
      // renders in full, just without that extra furniture.
      const { AUTHORS } = await import("../authorContent.data");
      const base = AUTHORS[slug];

      return base
        ? mergeAuthor(base, dto, liveArticles, fmt, t)
        : authorFromDto(dto, liveArticles, fmt, t);
    },
  });
}
