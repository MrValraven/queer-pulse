import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Article } from "../data/articles";
import type { ReaderArticle } from "../readerArticle";
import {
  articleListItemToArticle,
  articleResponseToArticle,
} from "./magazine.adapters";
import { ignoreEnrichmentError, nullOnNotFound } from "./loadErrors";
import { getArticle, getArticles, getAuthor } from "./magazine.api";

export interface ArticleData {
  /** PRD-102 — a `ReaderArticle`, so the desk's dek and standfirst reach the
   *  page. A demo mock is a plain `Article` and is assignable as-is. */
  article: ReaderArticle | null;
  related: ReaderArticle[];
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
export function useArticle(id: string, lang?: string) {
  const { demoMode } = useDemoMode();
  const fmt = useFormat();
  const { t, language } = useTranslation();
  return useQuery<ArticleData>({
    // PRD-101 — an empty `id` is "the caller has no slug to resolve" (a bare
    // `/magazine/article` with no `?id=`), which is a redirect, never a
    // request. Firing it would ask the API for `/magazine/articles/` and paint
    // a not-found wall on the way out.
    enabled: id !== "",
    // CON-16: `lang` is part of the key because it changes WHICH article the
    // server returns (a published translation in place of the addressed
    // piece), not merely how it is formatted.
    queryKey: ["magazine-article", demoMode, language, id, lang ?? null],
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

      // Only a real 404 renders the not-found wall — every other failure is
      // rethrown so react-query retries and the page shows a retry state
      // (FE-CNT-08). An API blip must never be reported as "no such article".
      const dto = await getArticle(id, lang).catch(nullOnNotFound);
      if (!dto) return { article: null, related: [] };

      // CNT-17 fix: the author lookup and the related-articles lookup only
      // depend on `dto` (just resolved above), not on each other — they used
      // to run as a serial waterfall (author, then related) for no reason.
      const tag = dto.tags[0];
      const [authorDetail, relatedPage] = await Promise.all([
        // Both are enrichment: the bio and the rail degrade to absent rather
        // than failing an article that already loaded.
        getAuthor(dto.author.handle).catch(ignoreEnrichmentError),
        tag
          ? // The rail follows the reader's language too: a Portuguese reader
            // finishing a Portuguese piece should be offered the Portuguese
            // version of what comes next where one exists.
            getArticles({ tag, lang }).catch(ignoreEnrichmentError)
          : Promise.resolve(null),
      ]);

      const article = articleResponseToArticle(dto, fmt, t, authorDetail?.bio);
      const related = (relatedPage?.items ?? [])
        .filter((item) => item.slug !== dto.slug)
        .slice(0, 3)
        .map((dtoItem) => articleListItemToArticle(dtoItem, fmt, t));

      return { article, related };
    },
  });
}
