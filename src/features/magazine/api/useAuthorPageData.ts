import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AUTHORS, type Author } from "../authorContent.data";
import { mergeAuthor } from "./magazine.adapters";
import { getArticles, getAuthor } from "./magazine.api";

/**
 * `AuthorPage.tsx`. Demo mode is the existing `AUTHORS[slug]` lookup,
 * unchanged. Live mode fetches GET /magazine/authors/:slug and GET
 * /magazine/articles?author=:slug and overlays them onto the same curated
 * mock profile (see `mergeAuthor`) — the prototype only has dedicated
 * magazine author pages for these 8 curated slugs, so an unknown slug never
 * hits the network; it 404s exactly as it does today.
 *
 * i18n: `language` joins the query key because `mergeAuthor` locale-formats
 * the featured article's meta via `fmt` — switching language must re-derive it.
 */
export function useAuthorPageData(slug: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<Author | null>({
    queryKey: ["magazine-author", demoMode, language, slug],
    queryFn: async () => {
      const base = AUTHORS[slug];
      if (demoMode || !base) return null;

      const [dto, articlesPage] = await Promise.all([
        getAuthor(slug).catch(() => null),
        getArticles({ author: slug }).catch(() => null),
      ]);
      if (!dto) return null;

      return mergeAuthor(base, dto, articlesPage?.items ?? [], fmt);
    },
  });
}
