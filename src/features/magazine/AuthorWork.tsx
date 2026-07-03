import { Link } from "react-router-dom";
import {
  Button,
  FadeIn,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import type { Author } from "./authorContent.data";
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
  const loading = useSimulatedLoad();

  return (
    <>
      <div className={styles.sec}>
        <h2>
          Most recent · <em>featured</em>
        </h2>
      </div>
      <div className={styles.featured}>
        <div>
          <div className={styles.featKicker}>{author.featured.kicker}</div>
          <h3 className={styles.featTitle}>
            <Link to={`${routes.article}?id=${author.featured.articleId}`}>
              {author.featured.title}
            </Link>
          </h3>
          <p className={styles.featDek}>{author.featured.dek}</p>
          <p className={styles.featMeta}>{author.featured.meta}</p>
        </div>
        <ImageSlot
          tint="jade"
          className={styles.featImg}
          radius={18}
          src={author.featured.image}
          alt={`Hero image for ${author.firstName}'s featured story`}
          placeholder="Featured story"
          style={{ height: "auto" }}
        />
      </div>

      <div className={styles.sec}>
        <h2>Selected work</h2>
        <Link to={routes.magazine}>
          All {author.stats[0]?.value} articles →
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
            See all picks →
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
          Find {author.firstName} <em>elsewhere</em>
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
