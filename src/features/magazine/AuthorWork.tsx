import { Link } from "react-router-dom";
import {
  Button,
  FadeIn,
  ImageSlot,
  SkeletonLine,
} from "../../shared/components/ui";
import { useSimulatedLoad } from "../../shared/hooks";
import { routes } from "../../app/routeMap";
import { AUTHOR_FEATURE_IMG } from "./authorPage.data";
import { ARTICLES, READING } from "./authorContent.data";
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

export function AuthorWork() {
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
          <div className={styles.featKicker}>
            Cover story · Issue 09 · Health
          </div>
          <h3 className={styles.featTitle}>
            <Link to={`${routes.article}?id=city-changed`}>
              Five things I learned{" "}
              <em>navigating Lisbon's trans health system.</em>
            </Link>
          </h3>
          <p className={styles.featDek}>
            From the SNS to private clinics, what nobody tells you about waiting
            lists, referrals, and how to actually get a hormone prescription
            without losing a year of your life.
          </p>
          <p className={styles.featMeta}>
            Published 6 Jun 2026 · 8 min read · 284 reads this week
          </p>
        </div>
        <ImageSlot
          tint="jade"
          className={styles.featImg}
          radius={18}
          src={AUTHOR_FEATURE_IMG}
          alt="Hero image: cover story 09"
          placeholder="Hero image: cover story 09"
          style={{ height: "auto" }}
        />
      </div>

      <div className={styles.sec}>
        <h2>Selected work</h2>
        <Link to={routes.magazine}>All 14 articles →</Link>
      </div>
      <div className={styles.articles}>
        {loading
          ? Array.from({ length: ARTICLES.length }).map((_, i) => (
              <ArtCardSkeleton key={i} />
            ))
          : ARTICLES.map((article, index) => (
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
          <h3>
            What Sara is <em>reading.</em>
          </h3>
          <p>
            Curated by the writer herself — books, longforms, and resources she
            returns to when reporting.
          </p>
          <Button to={routes.library} style={{ marginTop: 8 }}>
            See all 22 picks →
          </Button>
        </div>
        <ol>
          {READING.map((item, index) => (
            <li key={index}>
              <span>{item.title}</span> <span>{item.tag}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.sec}>
        <h2>
          Find Sara <em>elsewhere</em>
        </h2>
      </div>
      <div className={styles.elsewhere}>
        <a href="mailto:sara@queerpulse.app">
          sara@queerpulse.app <span>· pitch direct</span>
        </a>
        <a
          href="https://www.are.na/sara-pinheiro"
          target="_blank"
          rel="noreferrer"
        >
          Are.na <span>· /sara-pinheiro</span>
        </a>
        <a
          href="https://bsky.app/profile/sarapinheiro.bsky.social"
          target="_blank"
          rel="noreferrer"
        >
          Bluesky <span>· @sarapinheiro</span>
        </a>
        <Link to={routes.members}>
          Member profile <span>· in Lisbon</span>
        </Link>
      </div>
    </>
  );
}
