import {
  isValidElement,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PageShell } from "../../shared/components/layout";
import { PageMeta } from "../../shared/seo";
import { routes } from "../../app/routeMap";
import {
  Avatar,
  Button,
  FadeIn,
  ImageSlot,
  SkeletonLine,
  Tag,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { MagazineMasthead } from "./MagazineMasthead";
import {
  articles,
  defaultArticleId,
  isPullQuote,
  relationReason,
} from "./data/articles";
import { ArticleToolbar, type TextSize } from "./ArticleToolbar";
import { AuthorLink } from "./AuthorLink";
import { useArticle } from "./api/useArticle";

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
  const [params] = useSearchParams();
  const [textSize, setTextSize] = useState<TextSize>("md");
  const loading = useSimulatedLoad();
  const id = params.get("id") ?? defaultArticleId;
  const { data } = useArticle(id);
  const article = data?.article ?? articles[id];

  if (!article) {
    return (
      <PageShell>
        <PageMeta title="Article not found — QueerPulse Magazine" noIndex />
        <div className={`${styles.notFound} wrap`}>
          <h2>We couldn't find that piece.</h2>
          <p>The article may have moved, or the link may be incomplete.</p>
          <Button to={routes.magazine}>Back to the magazine</Button>
        </div>
      </PageShell>
    );
  }

  const mockRelated = (articles[id]?.related ?? [])
    .map((relatedId) => articles[relatedId])
    .filter((value): value is NonNullable<typeof value> => Boolean(value));
  const related = data?.related ?? mockRelated;

  // First plain-text paragraph doubles as the saved-card blurb.
  const blurb = article.body.find(
    (block): block is string => typeof block === "string",
  );

  const plainTitle = nodeToText(article.title).replace(/\s+/g, " ").trim();

  return (
    <PageShell>
      <PageMeta
        title={`${plainTitle} — QueerPulse Magazine`}
        description={blurb ? clampDescription(blurb) : undefined}
        canonical={`${routes.article}?id=${id}`}
        image={article.image}
        type="article"
      />
      <MagazineMasthead />
      <div className={styles.header}>
        <div className="wrap">
          <Link to={routes.magazine} className={styles.back}>
            ← Magazine <span style={{ opacity: 0.5 }}>·</span> {article.section}
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
            {article.body.map((block, index) =>
              isPullQuote(block) ? (
                <blockquote key={index} className={styles.pull}>
                  {block.pull}
                </blockquote>
              ) : (
                <p key={index}>{block}</p>
              ),
            )}
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
              Keep <em>reading</em>
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
                        {relationReason(article, rel)}
                      </Tag>
                    </FadeIn>
                  ))}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
