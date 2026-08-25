import { Link, Navigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";
import { PageShell } from "../../shared/components/layout";
import {
  Button,
  Outro,
  SkeletonAvatar,
  SkeletonLine,
} from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { type Tint } from "./changemakerStories";
import { useChangemaker } from "./api/useChangemaker";
import { useChangemakers } from "./api/useChangemakers";
import styles from "./ChangemakerStoryPage.module.css";

const HERO_GRADIENT: Record<Tint, string> = {
  coral:
    "linear-gradient(135deg, rgba(var(--accent-rgb),.42), rgba(var(--plum-rgb), .5))",
  jade: "linear-gradient(135deg, rgba(var(--jade-rgb),.42), rgba(var(--plum-rgb), .5))",
  plum: "linear-gradient(135deg, rgba(var(--plum-rgb), .55), rgba(var(--plum-rgb), .35))",
};
const AV_CLASS: Record<Tint, string> = {
  coral: "avCoral",
  jade: "avJade",
  plum: "avPlum",
};

/** Placeholder for the byline + article while the story request is in flight.
 *  Replaces an empty 80px spacer, which read as a blank page. */
function ChangemakerStorySkeleton() {
  return (
    <div
      className={`${styles.articleWrap} ${styles.skeletonStory}`}
      aria-hidden
    >
      <div className={styles.skeletonByline}>
        <SkeletonAvatar size={34} />
        <SkeletonLine width={180} height={13} />
      </div>
      <SkeletonLine width="70%" height={34} />
      <SkeletonLine width="100%" height={16} />
      <SkeletonLine width="95%" height={16} />
      <SkeletonLine width="88%" height={16} />
      <SkeletonLine width="92%" height={16} />
      <SkeletonLine width="60%" height={16} />
    </div>
  );
}

export function ChangemakerStoryPage() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { changemaker, isLoading } = useChangemaker(slug);
  const { profiles } = useChangemakers();

  if (isLoading) {
    return (
      <PageShell>
        <ChangemakerStorySkeleton />
      </PageShell>
    );
  }
  if (!changemaker) return <Navigate to={routes.changemakers} replace />;

  const others = profiles
    .filter((profile) => profile.slug !== changemaker.slug)
    .slice(0, 3);
  const [first, ...rest] = changemaker.body;
  const firstName = changemaker.name.split(" ")[0] ?? changemaker.name;

  return (
    <PageShell>
      <div className={styles.back}>
        <div className="wrap">
          <Link to={routes.changemakers} className={styles.backLink}>
            <FiArrowLeft aria-hidden />{" "}
            {t("community:changemakerStory.backCta")}
          </Link>
        </div>
      </div>

      <div
        className={styles.hero}
        style={{ background: HERO_GRADIENT[changemaker.tint] }}
      >
        <div className={styles.heroInitials}>{changemaker.initials}</div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroLabel}>
          <div className="wrap">
            <div className={styles.cat}>
              {t("community:changemakerStory.categoryLabel", {
                cause: changemaker.cause,
              })}
            </div>
            <h1 className={styles.title}>{changemaker.name}</h1>
            <div className={styles.byline}>
              <span className={styles.bylineAv}>{changemaker.initials}</span>
              <span>{changemaker.byline}</span>
              <span className={styles.bDot} />
              <span>{changemaker.readTime}</span>
              <span className={styles.bDot} />
              <span>{changemaker.date}</span>
            </div>
          </div>
        </div>
      </div>

      <article className={styles.articleWrap}>
        <p className={styles.lead}>{changemaker.lead}</p>
        <div className={styles.meta}>
          {changemaker.tags.map((tag) => (
            <span className={styles.tag} key={tag}>
              {tag}
            </span>
          ))}
          <span className={styles.metaDot} />
          <span>{changemaker.readTime}</span>
          <span className={styles.metaDot} />
          <span>{changemaker.date}</span>
        </div>

        <div className={styles.body}>
          <p>{first}</p>
          {rest[0] && <p>{rest[0]}</p>}

          <blockquote className={styles.quote}>
            <p>“{changemaker.pullQuote.text}”</p>
            <cite>{changemaker.pullQuote.cite}</cite>
          </blockquote>

          <div className={styles.impactCard}>
            <div className={styles.impactLabel}>
              {t("community:changemakerStory.impactLabel", {
                name: firstName,
              })}
            </div>
            {changemaker.impact.map((row) => (
              <div className={styles.impactRow} key={row}>
                <span className={styles.impactIc} aria-hidden>
                  <FiCheck />
                </span>
                <span>{row}</span>
              </div>
            ))}
          </div>

          {rest.slice(1).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>

      <Outro
        title={
          <Translation
            i18nKey="community:changemakerStory.outro.title"
            components={{ em: <em /> }}
            values={{ name: firstName }}
          />
        }
        sub={t("community:changemakerStory.outro.sub")}
      >
        {/* Changemaker profiles are curated editorial content with no linked
            member account (no `userId` on the entity), so there is nobody for
            a direct message to reach: opening the Connect modal with no slug
            either shows "member not found" (live) or silently addresses a
            random demo persona. Routes to Contact, the same call the
            changemakers list page makes. */}
        <Button variant="primary" to={routes.contact}>
          {t("community:changemakerStory.outro.connectCta")}{" "}
          <FiArrowRight aria-hidden />
        </Button>
        <Button variant="ghost-dark" to={routes.changemakers}>
          {t("community:changemakerStory.outro.moreCta")}
        </Button>
      </Outro>

      <div className={styles.more}>
        <div className={styles.moreLabel}>
          {t("community:changemakerStory.moreLabel")}
        </div>
        <div className={styles.moreGrid}>
          {others.map((other) => (
            <Link
              key={other.slug}
              to={`/changemaker/${other.slug}`}
              className={styles.moreCard}
            >
              <div
                className={[styles.moreAv, styles[AV_CLASS[other.tint]]].join(
                  " ",
                )}
              >
                {other.initials}
              </div>
              <div>
                <div className={styles.moreName}>{other.name}</div>
                <div className={styles.moreCause}>{other.cause}</div>
              </div>
            </Link>
          ))}
        </div>
        <div style={{ height: 60 }} />
      </div>
    </PageShell>
  );
}
