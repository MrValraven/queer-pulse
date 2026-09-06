import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import { Avatar, Button, ImageSlot, Outro } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { MagazineMasthead } from "./MagazineMasthead";
import { defaultArticleId, firstPlainText } from "./data/articles";
import { ArticleReaderBody } from "./ArticleReaderBody";
import { ArticleToolbar, type TextSize } from "./ArticleToolbar";
import { AuthorLink } from "./AuthorLink";
import { ArticleHeader } from "./ArticleHeader";
import { useArticle } from "./api/useArticle";
import { ApiError } from "../../shared/api/client";
import {
  ArticleLoadFailed,
  ArticleNotFound,
  ArticleSignInRequired,
} from "./ArticleStates";
import { ArticleContentNotes, ArticleCorrections } from "./ArticleNotes";
import { ArticleLifecycleBanner } from "./ArticleLifecycleBanner";
import { ArticleRelatedRail } from "./ArticleRelatedRail";
import { clampDescription, nodeToText } from "./nodeText";
import { ArticleComments } from "./comments/ArticleComments";
import { ArticleReadingAids } from "./ArticleReadingAids";

import styles from "./ArticlePage.module.css";

export function ArticlePage() {
  const { t, language } = useTranslation();
  const { demoMode } = useDemoMode();
  const [params, setParams] = useSearchParams();
  const [textSize, setTextSize] = useState<TextSize>("md");
  // PRD-113: the element the reading aids measure: progress, the resume
  // point and the contents list all address the body, never the whole page.
  const bodyRef = useRef<HTMLDivElement>(null);
  const simLoading = useSimulatedLoad();
  // PRD-101 — a bare `/magazine/article` with no `?id=`. Demo mode keeps the
  // curated default piece, which is the prototype's own front door. Live mode
  // has no such piece: falling back to the mock slug asked the API for
  // "city-changed" and painted an "Article not found" wall at a URL a reader
  // can plausibly reach. It redirects to the magazine front instead.
  const requestedId = params.get("id");
  const id = requestedId ?? (demoMode ? defaultArticleId : "");
  // CON-16 — the reader's chosen content language. It lives in the URL so a
  // Portuguese link stays Portuguese when it is shared, and it falls back to
  // the chrome language so a member who has set the interface to Portuguese
  // gets the Portuguese piece without asking twice.
  const lang = params.get("lang") ?? language;
  const { data, error, isLoading, isError, refetch } = useArticle(id, lang);
  // CON-16 — the server can answer with a TRANSLATION of the piece the URL
  // names, since a translation is a first-class article at its own slug. Point
  // the URL at the piece actually on screen, so refreshing, bookmarking or
  // sharing it lands on the same text rather than resolving again.
  const servedSlug = data?.article?.id ?? null;
  useEffect(() => {
    if (!servedSlug || servedSlug === id) return;
    const nextParams = new URLSearchParams(params);
    nextParams.set("id", servedSlug);
    setParams(nextParams, { replace: true });
  }, [servedSlug, id, params, setParams]);
  // The hook resolves the article in both modes — demo from the code-split mock
  // registry (dynamically imported, never statically bundled into live), live
  // from GET /magazine/articles/:slug. It never leaks demo articles into live.
  const article = data?.article ?? null;
  // Demo also waits on the hook now (the mock loads on a microtask), so gate on
  // the query too — otherwise the simulated beat can clear before it resolves.
  const loading = demoMode ? simLoading || isLoading : isLoading;

  // PRD-101 — nothing was addressed and there is no curated default to fall
  // back on (live mode). Send the reader to the magazine front, which is a
  // real page, instead of a not-found wall for a slug they never asked for.
  if (!id) return <Navigate to={routes.magazine} replace />;

  // A failed request is NOT a missing article (FE-CNT-08): offer a retry
  // rather than telling the reader the piece does not exist. And a 401 is not
  // a failure at all (CON-07) — every magazine read sits behind
  // `ActiveMemberGuard`, so a logged-out visitor following a shared link lands
  // here. They get the members-only wall with a `?next=` back to this article
  // rather than a retry button that can never succeed.
  if (isError) {
    if (error instanceof ApiError && error.status === 401) {
      return <ArticleSignInRequired />;
    }
    return <ArticleLoadFailed onRetry={() => void refetch()} />;
  }
  if (!article) return <ArticleNotFound isLoading={loading} />;

  const related = data?.related ?? [];

  // First plain-text paragraph doubles as the saved-card blurb; the desk's own
  // dek is a better one when the piece carries it (PRD-102).
  const blurb = article.dek ?? firstPlainText(article.body);

  // PRD-102 — the line under the headline: the standfirst the desk wrote for
  // exactly this slot, or the dek when there is no standfirst.
  const standfirst = article.standfirst?.trim() || article.dek?.trim() || "";

  const plainTitle = nodeToText(article.title).replace(/\s+/g, " ").trim();

  // CON-17 — the SEO rail's three fields, each falling back to what the page
  // derived before they were served: the first paragraph, the hero image, and
  // the article's own route.
  const metaDescription = article.metaDescription?.trim();
  const canonicalUrl = article.canonicalUrl?.trim();

  return (
    <PageShell>
      <PageMeta
        title={`${plainTitle}${t("magazine:article.pageTitleSuffix")}`}
        description={
          metaDescription || (blurb ? clampDescription(blurb) : undefined)
        }
        canonical={canonicalUrl || `${routes.article}?id=${id}`}
        image={article.socialImage ?? article.image}
        type="article"
      />
      <MagazineMasthead />
      <ArticleHeader article={article} standfirst={standfirst} />

      <div className={styles.hero}>
        <ImageSlot
          tint={article.tint === "auth" ? "plum" : article.tint}
          height={480}
          radius={0}
          src={article.image}
          alt={article.imgDesc}
          placeholder={article.imgDesc}
          // CON-04 — `focus`, never `crop`: this band is full-bleed and 480px
          // tall, so its aspect never matches the editor's saved rect and the
          // exact-frame prop would stretch the art. `focus` keeps the cover
          // fit and only pans to what the editor framed.
          focus={article.imageFocus}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.heroStrip} />
      </div>

      <div className={styles.bodyWrap}>
        <article className={styles.bodyInner}>
          <ArticleToolbar
            textSize={textSize}
            onTextSize={setTextSize}
            articleId={id}
            articleTitle={
              typeof article.title === "string" ? article.title : undefined
            }
            articleMeta={`${article.byline} · ${article.readTime}`}
            articleDescription={blurb}
            articleReadTime={article.readTime}
          />
          {/* CON-16 — where the desk stands on this piece today. A live piece
              draws nothing; an archived or superseded one stays readable and
              carries a dated note instead of disappearing. */}
          <ArticleLifecycleBanner
            lifecycle={article.lifecycle}
            notice={article.lifecycleNotice}
            publishedLabel={article.date}
          />
          <ArticleContentNotes notes={article.contentNotes ?? []} />
          {/* PRD-113: the long-read aids: a progress bar, a contents list
              built from the piece's own headings, and the point this reader
              left off at. Above the body so a returning reader meets the
              resume prompt before the first paragraph. */}
          <ArticleReadingAids article={article} bodyRef={bodyRef} />
          {/* DES-102: the chosen size rides a data attribute and the CSS maps
              it onto rem tokens. Writing px here ignored the reader's own
              browser font size and capped "A+" at 22px. */}
          <div className={styles.body} data-text-size={textSize} ref={bodyRef}>
            <ArticleReaderBody article={article} />
          </div>

          <ArticleCorrections corrections={article.corrections ?? []} />

          <div className={styles.bio}>
            <Avatar initials={article.initials} tint={article.tint} size={48} />
            <div>
              <div className={styles.bioName}>
                <AuthorLink name={article.byline} />
              </div>
              <p className={styles.bioText}>{article.authorBio}</p>
            </div>
          </div>
        </article>
      </div>

      <ArticleRelatedRail
        article={article}
        related={related}
        isLoading={loading}
      />

      <ArticleComments articleSlug={article.id} />

      {article.outro && (
        <Outro
          title={
            <Translation
              i18nKey={article.outro.titleKey}
              components={{ em: <em /> }}
            />
          }
          sub={t(article.outro.subKey)}
        >
          <Button to={article.outro.ctaTo} variant="primary" size="lg">
            {t(article.outro.ctaLabelKey)}
          </Button>
        </Outro>
      )}
    </PageShell>
  );
}
