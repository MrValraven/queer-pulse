import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Button,
  FadeIn,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useSimulatedLoad } from "../../shared/hooks";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import type { Author } from "./authorContent.data";
import {
  minReadText,
  publishedText,
  readsThisWeekText,
} from "./magazineFormat";
import styles from "./AuthorPage.module.css";

function ArtCardSkeleton() {
  return (
    <div className={styles.art} aria-hidden>
      <SkeletonLine width="35%" height={11} />
      <SkeletonLine width="90%" height={21} />
      <SkeletonLine width="60%" height={21} />
      <SkeletonLine width="100%" height={14} style={{ marginTop: 2 }} />
      <SkeletonLine width="80%" height={14} />
      <SkeletonLine width="40%" height={12} style={{ marginTop: 8 }} />
    </div>
  );
}

/**
 * A writer's featured piece, their selected work and their reading list.
 *
 * PRD-112: two fixes live here. "All {count} articles" used to link to the
 * magazine FRONT, which is not this writer's work at all; it now opens their
 * real back catalogue at `/magazine/search?author=<slug>`, which pages through
 * every piece (the author page itself can only hold the backend's first 20).
 * The count is the byline's true `pieceCount` rather than the length of the
 * one page that reached this component. And `useSimulatedLoad` is a DEMO
 * device: on a live author page it painted 600ms of fake skeleton over data
 * that had already arrived, so it is gated to demo mode.
 */
export function AuthorWork({ author }: { author: Author }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const isSimulatedLoading = useSimulatedLoad();
  // Demo only. Live data is already resolved by the time this renders (the
  // page holds its own skeleton while `useAuthorPageData` is in flight), so a
  // simulated delay there is a skeleton over content, not a loading state.
  const shouldShowSkeletons = demoMode && isSimulatedLoading;
  // A freshly live-only author (CNT-9: no curated mock profile to fall back
  // on) may genuinely have zero published pieces yet — the backend's authors
  // table isn't gated on having a byline. Show an honest empty state instead
  // of a broken featured block with nothing to point at.
  const hasArticles = author.articles.length > 0;
  // The byline's full published count, which can exceed the page of articles
  // this component was handed. Demo mode has no paginated catalogue behind it,
  // and its grid below already lists every curated piece, so the link is a
  // live-mode affordance.
  const totalPieces = author.pieceCount ?? author.articles.length;
  const shouldShowAllArticlesLink = !demoMode;
  const featuredMeta = [
    publishedText(fmt.date(author.featured.publishedDate), t),
    minReadText(author.featured.minutes, t),
    readsThisWeekText(author.featured.readsThisWeek, t),
  ].join(" · ");

  return (
    <>
      {hasArticles ? (
        <>
          <div className={styles.sec}>
            <h2>
              <Translation
                i18nKey="magazine:author.work.mostRecentHeading"
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <div className={styles.featured}>
            <div>
              {/* Content: kicker/title/dek are the writer's own article fields. */}
              <div className={styles.featKicker}>{author.featured.kicker}</div>
              <h3 className={styles.featTitle}>
                <Link to={`${routes.article}?id=${author.featured.articleId}`}>
                  {author.featured.title}
                </Link>
              </h3>
              <p className={styles.featDek}>{author.featured.dek}</p>
              <p className={styles.featMeta}>{featuredMeta}</p>
            </div>
            <ImageSlot
              tint="jade"
              className={styles.featImg}
              radius={18}
              src={author.featured.image}
              alt={t("magazine:author.work.featuredImageAlt", {
                name: author.firstName,
              })}
              placeholder={t("magazine:author.work.featuredImagePlaceholder")}
              style={{ height: "auto" }}
            />
          </div>

          <div className={styles.sec}>
            <h2>{t("magazine:author.work.selectedWorkHeading")}</h2>
            {shouldShowAllArticlesLink && (
              <Link
                to={`${routes.magazineSearch}?author=${encodeURIComponent(
                  author.slug,
                )}`}
              >
                {t("magazine:author.work.allArticlesCta", {
                  count: totalPieces,
                })}{" "}
                <FiArrowRight aria-hidden />
              </Link>
            )}
          </div>
          <div className={styles.articles}>
            {shouldShowSkeletons
              ? Array.from({ length: author.articles.length }).map(
                  (_, index) => <ArtCardSkeleton key={index} />,
                )
              : author.articles.map((article, index) => (
                  <FadeIn
                    as={Link}
                    key={index}
                    to={`${routes.article}?id=${article.id}`}
                    className={styles.art}
                    delay={Math.min(index, 8) * 60}
                  >
                    {/* Content: per-article kicker/title/dek/meta — the
                        writer's own back-catalogue fields. */}
                    <div className={styles.artKicker}>{article.kicker}</div>
                    <div className={styles.artTitle}>{article.title}</div>
                    <div className={styles.artDek}>{article.dek}</div>
                    <div className={styles.artMeta}>{article.meta}</div>
                  </FadeIn>
                ))}
          </div>
        </>
      ) : (
        <div className={styles.sec}>
          <p className={styles.featDek}>
            {t("magazine:author.work.noArticlesYet", {
              name: author.firstName,
            })}
          </p>
        </div>
      )}

      {author.reading.length > 0 && (
        <div className={styles.readlist}>
          <div>
            <h3>{author.readingTitle}</h3>
            <p>{author.readingBlurb}</p>
            <Button to={routes.library} style={{ marginTop: 8 }}>
              {t("magazine:author.work.seeAllPicksCta")}{" "}
              <FiArrowRight aria-hidden />
            </Button>
          </div>
          <ol>
            {author.reading.map((item, index) => (
              <li key={index}>
                {item.title} <span>{item.tag}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {author.elsewhere.length > 0 && (
        <>
          <div className={styles.sec}>
            <h2>
              <Translation
                i18nKey="magazine:author.work.findElsewhereHeading"
                values={{ name: author.firstName }}
                components={{ em: <em /> }}
              />
            </h2>
          </div>
          <div className={styles.elsewhere}>
            {author.elsewhere.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to}>
                  {link.label} <span>{link.note}</span>
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  {...(link.href?.startsWith("mailto:")
                    ? {}
                    : { target: "_blank", rel: "noreferrer" })}
                >
                  {link.label} <span>{link.note}</span>
                </a>
              ),
            )}
          </div>
        </>
      )}
    </>
  );
}
