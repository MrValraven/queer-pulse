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

export function AuthorWork({ author }: { author: Author }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const loading = useSimulatedLoad();
  const featuredMeta = [
    publishedText(fmt.date(author.featured.publishedDate), t),
    minReadText(author.featured.minutes, t),
    readsThisWeekText(author.featured.readsThisWeek, t),
  ].join(" · ");

  return (
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
        <Link to={routes.magazine}>
          {t("magazine:author.work.allArticlesCta", {
            count: author.articles.length,
          })}{" "}
          <FiArrowRight aria-hidden />
        </Link>
      </div>
      <div className={styles.articles}>
        {loading
          ? Array.from({ length: author.articles.length }).map((_, i) => (
              <ArtCardSkeleton key={i} />
            ))
          : author.articles.map((article, index) => (
              <FadeIn
                as={Link}
                key={index}
                to={`${routes.article}?id=${article.id}`}
                className={styles.art}
                delay={Math.min(index, 8) * 60}
              >
                {/* Content: per-article kicker/title/dek/meta — the writer's
                    own back-catalogue fields. */}
                <div className={styles.artKicker}>{article.kicker}</div>
                <div className={styles.artTitle}>{article.title}</div>
                <div className={styles.artDek}>{article.dek}</div>
                <div className={styles.artMeta}>{article.meta}</div>
              </FadeIn>
            ))}
      </div>

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
  );
}
