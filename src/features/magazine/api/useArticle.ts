import { useQuery } from "@tanstack/react-query";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { articles, type Article } from "../data/articles";
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

      const authorDetail = await getAuthor(dto.author.handle).catch(() => null);
      const article = articleResponseToArticle(dto, fmt, authorDetail?.bio);

      const tag = dto.tags[0];
      const relatedPage = tag
        ? await getArticles({ tag }).catch(() => null)
        : null;
      const related = (relatedPage?.items ?? [])
        .filter((item) => item.slug !== dto.slug)
        .slice(0, 3)
        .map((dtoItem) => articleListItemToArticle(dtoItem, fmt));

      return { article, related };
    },
  });
}
