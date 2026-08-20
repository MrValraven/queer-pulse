import {
  isValidElement,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import {
  Avatar,
  Button,
  FadeIn,
  ImageSlot,
  Outro,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useSimulatedLoad } from "../../shared/hooks";
import { MagazineMasthead } from "./MagazineMasthead";
import { defaultArticleId, firstPlainText, relationReason } from "./data/articles";
import { ArticleReaderBody } from "./ArticleReaderBody";
import { ArticleToolbar, type TextSize } from "./ArticleToolbar";
import { AuthorLink } from "./AuthorLink";
import { useArticle } from "./api/useArticle";
import { ArticleComments } from "./comments/ArticleComments";

import styles from "./ArticlePage.module.css";

const SIZE_PX: Record<TextSize, number> = { sm: 17, md: 19, lg: 22 };

/** Flatten a ReactNode headline into plain text for <title>/OG metadata. */
function nodeToText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    const { children } = node.props as { children?: ReactNode };
    return nodeToText(children);
  }
  return "";
}

/** Truncate a blurb to a sensible social-description length. */
function clampDescription(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 200 ? `${clean.slice(0, 197).trimEnd()}…` : clean;
}

function RelatedCardSkeleton({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden>
      <SkeletonLine width="40%" height={11} />
      <SkeletonLine width="90%" height={17} style={{ marginTop: 2 }} />
      <SkeletonLine width="65%" height={13} style={{ marginTop: 2 }} />
      <SkeletonLine
        width={90}
        height={22}
        style={{ borderRadius: 999, marginTop: 4 }}
      />
    </div>
  );
}

export function ArticlePage() {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const [params] = useSearchParams();
  const [textSize, setTextSize] = useState<TextSize>("md");
  const simLoading = useSimulatedLoad();
  const id = params.get("id") ?? defaultArticleId;
  const { data, isLoading } = useArticle(id);
  // The hook resolves the article in both modes — demo from the code-split mock
  // registry (dynamically imported, never statically bundled into live), live
  // from GET /magazine/articles/:slug. It never leaks demo articles into live.
  const article = data?.article ?? null;
  // Demo also waits on the hook now (the mock loads on a microtask), so gate on
  // the query too — otherwise the simulated beat can clear before it resolves.
  const loading = demoMode ? simLoading || isLoading : isLoading;

  if (!article) {
    // Live mode has no article until the fetch resolves — show a skeleton while
    // it loads, then a real "not found" state if the slug resolves to nothing.
    return (
      <PageShell>
        <PageMeta title={t("magazine:article.notFoundMetaTitle")} noIndex />
        <div className={`${styles.notFound} wrap`}>
          {loading ? (
            <>
              <SkeletonLine width="40%" height={20} />
              <SkeletonLine width="70%" height={32} style={{ marginTop: 12 }} />
              <SkeletonLine width="90%" height={16} style={{ marginTop: 12 }} />
            </>
          ) : (
            <>
              <h2>{t("magazine:article.notFoundTitle")}</h2>
              <p>{t("magazine:article.notFoundBody")}</p>
              <Button to={routes.magazine}>
                {t("magazine:article.notFoundCta")}
              </Button>
            </>
          )}
        </div>
      </PageShell>
    );
  }

  const related = data?.related ?? [];

  // First plain-text paragraph doubles as the saved-card blurb.
  const blurb = firstPlainText(article.body);

  const plainTitle = nodeToText(article.title).replace(/\s+/g, " ").trim();

  return (
    <PageShell>
      <PageMeta
        title={`${plainTitle}${t("magazine:article.pageTitleSuffix")}`}
        description={blurb ? clampDescription(blurb) : undefined}
        canonical={`${routes.article}?id=${id}`}
        image={article.image}
        type="article"
      />
      <MagazineMasthead />
      <div className={styles.header}>
        <div className="wrap">
          <Link to={routes.magazine} className={styles.back}>
            <FiArrowLeft aria-hidden /> {t("magazine:article.backToMagazine")}{" "}
            <span style={{ opacity: 0.5 }}>·</span> {article.section}
          </Link>
          <div className={styles.kicker}>{article.kicker}</div>
          <h1 className={styles.title}>{article.title}</h1>
          <div className={styles.bylineRow}>
            <Avatar initials={article.initials} tint={article.tint} size={36} />
            <div>
              <div className={styles.author}>
                <AuthorLink name={article.byline} />
              </div>
              {article.role && (
                <div className={styles.role}>{article.role}</div>
              )}
            </div>
            <div className={styles.pills}>
              <span className={styles.pill}>{article.date}</span>
              <span className={styles.pill}>{article.readTime}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.hero}>
        <ImageSlot
          tint={article.tint === "auth" ? "plum" : article.tint}
          height={480}
          radius={0}
          src={article.image}
          alt={article.imgDesc}
          placeholder={article.imgDesc}
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
          <div
            className={styles.body}
            style={
              {
                "--article-body-size": `${SIZE_PX[textSize]}px`,
              } as CSSProperties
            }
          >
            <ArticleReaderBody article={article} />
          </div>

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

      {related.length > 0 && (
        <div className={styles.related}>
          <div className="wrap">
            <div className={styles.relatedHead}>
              <Translation
                i18nKey="magazine:article.relatedHeading"
                components={{ em: <em /> }}
              />
            </div>
            <div className={styles.relGrid}>
              {loading
                ? related.map((rel) => (
                    <RelatedCardSkeleton
                      key={rel.id}
                      className={styles.relCard!}
                    />
                  ))
                : related.map((rel, i) => (
                    <FadeIn
                      as={Link}
                      key={rel.id}
                      to={`${routes.article}?id=${rel.id}`}
                      className={styles.relCard}
                      delay={Math.min(i, 8) * 60}
                    >
                      <div className={styles.relKicker}>{rel.section}</div>
                      <div className={styles.relTitle}>{rel.title}</div>
                      <div className={styles.relMeta}>
                        {rel.byline} · {rel.readTime}
                      </div>
                      <Tag className={styles.relReason}>
                        {relationReason(article, rel, t)}
                      </Tag>
                    </FadeIn>
                  ))}
            </div>
          </div>
        </div>
      )}

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
