import { routes } from "../../app/routeMap";
import type { TFunction } from "../../shared/i18n/types";
import { getDocumentBaseTitle } from "../../shared/seo/documentTitleBadge";

/** Derive a stable slug + href from the current URL when props aren't passed. */
export function deriveIdentity(articleId?: string) {
  if (articleId)
    return { slug: articleId, href: `${routes.article}?id=${articleId}` };
  if (typeof window === "undefined")
    return { slug: "current", href: routes.article };
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("id") ?? "current";
  return { slug, href: `${window.location.pathname}${window.location.search}` };
}

/** The article's human title: the passed one, else the document title. */
export function resolveArticleTitle(
  articleTitle: string | undefined,
  t: TFunction,
): string {
  return (
    articleTitle ??
    (typeof document !== "undefined"
      ? getDocumentBaseTitle()
      : t("magazine:toolbar.fallbackTitle"))
  );
}
