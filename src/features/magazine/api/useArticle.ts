import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Article } from "../data/articles";
import {
  articleListItemToArticle,
  articleResponseToArticle,
} from "./magazine.adapters";
import { getArticle, getArticles, getAuthor } from "./magazine.api";

export interface ArticleData {
  article: Article | null;
  related: Article[];
}

/**
 * `ArticlePage.tsx`'s article + "keep reading" rail. Demo mode resolves the
 * `id` against the colocated `data/articles.tsx` mock exactly as before —
 * unchanged behaviour, no network. Live mode calls GET
 * /magazine/articles/:slug for the piece and GET
 * /magazine/articles?tag=<firstTag> for the related rail (the same
 * ListArticlesQuery filter the backend already exposes), excluding the
 * current slug.
 *
 * i18n: `language` joins the query key because the adapters locale-format
 * each article's `date` via `fmt` — switching language must re-derive it.
 */
export function useArticle(id: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { language } = useTranslation();
  return useQuery<ArticleData>({
    queryKey: ["magazine-article", demoMode, language, id],
    queryFn: async () => {
      if (demoMode) {
        // Demo-only mock registry — dynamically imported so it never ships in
        // the live bundle (live mode fetches from the API below).
        const { articles } = await import("../data/articles.mock");
        const article = articles[id] ?? null;
        const related = article
          ? article.related
              .map((relatedId) => articles[relatedId])
              .filter((a): a is Article => Boolean(a))
          : [];
        return { article, related };
      }

      const dto = await getArticle(id).catch(() => null);
      if (!dto) return { article: null, related: [] };

      // CNT-17 fix: the author lookup and the related-articles lookup only
      // depend on `dto` (just resolved above), not on each other — they used
      // to run as a serial waterfall (author, then related) for no reason.
      const tag = dto.tags[0];
      const [authorDetail, relatedPage] = await Promise.all([
        getAuthor(dto.author.handle).catch(() => null),
        tag ? getArticles({ tag }).catch(() => null) : Promise.resolve(null),
      ]);

      const article = articleResponseToArticle(dto, fmt, authorDetail?.bio);
      const related = (relatedPage?.items ?? [])
        .filter((item) => item.slug !== dto.slug)
        .slice(0, 3)
        .map((dtoItem) => articleListItemToArticle(dtoItem, fmt));

      return { article, related };
    },
  });
}
