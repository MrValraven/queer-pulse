import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import {
  Avatar,
  Button,
  ImageSlot,
  Reveal,
  SkeletonCard,
  Tag,
} from "../../shared/components/ui";
import { MagazineComingSoon } from "./MagazineComingSoon";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { useMagazineHome } from "./api/useMagazineHome";
import { useIssues } from "./api/useIssues";
import { initialsFor, tintFor } from "./api/magazine.adapters";
import type { ArticleListItemDTO, DeckListItemDTO } from "./api/magazine.api";
import styles from "./MagazinePage.module.css";

/**
 * CNT-3 fix: the live-mode content of the magazine front, straight off the
 * public `GET /magazine/articles` / `GET /magazine/decks` / `GET
 * /magazine/issues` endpoints (`useMagazineHome`/`useIssues`) — previously
 * `MagazineSections` rendered `MagazineComingSoon` for the entire front
 * whenever `!demoMode`, regardless of whether anything had actually been
 * published, so a live reader had no way to discover the magazine at all.
 * Extracted into its own file (rather than growing `MagazineSections.tsx`
 * past the 200-line-per-component cap) — the demo-mode sections stay there
 * untouched.
 */
export function MagazineLiveSections() {
  const home = useMagazineHome();

  if (home.isLoading) {
    return (
      <div className={styles.body}>
        <div className="wrap">
          <div className={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  const articles = home.data?.articles ?? [];
  const decks = home.data?.decks ?? [];
  const hasContent = articles.length > 0 || decks.length > 0;

  // Honest empty state — no published articles or decks yet — rather than
  // fake demo content. Also the fallback when the live fetch itself failed.
  if (home.isError || !hasContent) {
    return (
      <div className={styles.body}>
        <div className="wrap">
          <MagazineComingSoon />
        </div>
      </div>
    );
  }

  const [featuredDeck] = decks;

  return (
    <div className={styles.body}>
      <div className="wrap">
        {articles.length > 0 && (
          <section className={styles.section}>
            <div className={styles.asHead} id="latest">
              <div className={styles.asTitle}>
                <Translation
                  i18nKey="magazine:sections.live.title"
                  components={{ em: <em /> }}
                />
              </div>
            </div>
            <div className={styles.grid}>
              {articles.slice(0, 9).map((article) => (
                <LiveArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </section>
        )}

        {featuredDeck && <LiveFeaturedDeck deck={featuredDeck} />}

        <LiveArchiveSection />
        <LiveSubmitBanner />
      </div>
    </div>
  );
}

function LiveArticleCard({ article }: { article: ArticleListItemDTO }) {
  const { t } = useTranslation();
  const tint = tintFor(article.author.handle);
  // `tintFor` returns the broader `AvatarTint` (for the byline `<Avatar>`
  // below); `ImageSlot` only accepts the narrower `ImageSlotTint` (no
  // "auth"/"default") — `tintFor` never actually returns those two, but the
  // declared return type does, so narrow explicitly rather than widening
  // `ImageSlotTint` itself just for this one call site.
  const imageTint = tint === "default" || tint === "auth" ? "plum" : tint;
  return (
    <Reveal as={Link} to={`/article?id=${article.slug}`} className={styles.ac}>
      <div className={styles.acImg}>
        <ImageSlot
          tint={imageTint}
          height="100%"
          radius={14}
          alt={article.title}
          placeholder={article.title}
        />
      </div>
      <div className={styles.acKicker}>
        {article.issueNumber
          ? `Issue ${article.issueNumber}`
          : "From the magazine"}
      </div>
      <div className={styles.acTitle}>{article.title}</div>
      <div className={styles.acExcerpt}>{article.dek}</div>
      <div className={styles.acMeta}>
        <Avatar
          initials={initialsFor(article.author.displayName)}
          tint={tint}
          size={22}
        />
        {article.author.displayName}
        {" · "}
        {t("magazine:format.minRead", { count: article.readMinutes })}
      </div>
    </Reveal>
  );
}

function LiveFeaturedDeck({ deck }: { deck: DeckListItemDTO }) {
  const { t } = useTranslation();
  return (
    <Reveal className={styles.featuredDeck}>
      <div className={styles.fdMedia}>
        <ImageSlot
          src={deck.cover}
          alt={deck.coverDesc}
          tint="jade"
          height={220}
          radius={16}
          placeholder={deck.coverDesc}
        />
      </div>
      <div>
        <Tag>{t("magazine:deck.badge")}</Tag>
        <h2 className={styles.fdTitle}>{deck.title}</h2>
        <div className={styles.feByline}>{deck.byline}</div>
        <p className={styles.feExcerpt}>{deck.kicker}</p>
        <Link className={styles.feRead} to={`${routes.deck}?id=${deck.slug}`}>
          {t("magazine:deck.start")} <FiArrowRight aria-hidden />
        </Link>
      </div>
    </Reveal>
  );
}

/** Real past issues (`GET /magazine/issues`) — renders nothing until at
 *  least one issue has actually shipped. */
function LiveArchiveSection() {
  const { data: issues } = useIssues();
  if (!issues || issues.length === 0) return null;

  return (
    <section className={styles.section} id="archive">
      <div className={styles.asHead} id="archive-head">
        <div className={styles.asTitle}>
          <Translation
            i18nKey="magazine:sections.archive.title"
            components={{ em: <em /> }}
          />
        </div>
      </div>
      <div className={styles.archiveRow}>
        {issues.slice(0, 4).map((issue) => (
          <Link
            key={issue.number}
            to={`${routes.issue}/${issue.number}`}
            className={styles.archiveIssue}
          >
            <div className={styles.aiCover}>
              <div className={styles.aiCoverTitle}>{issue.numberLabel}</div>
            </div>
            <div className={styles.aiMonth}>{issue.date}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function LiveSubmitBanner() {
  const { t } = useTranslation();
  return (
    <div className={styles.submit}>
      <div className={styles.ssBody}>
        <h3>
          <Translation
            i18nKey="magazine:sections.submit.title"
            components={{ em: <em /> }}
          />
        </h3>
        <p>{t("magazine:sections.submit.body")}</p>
      </div>
      <Button to={routes.submitStory} variant="primary" size="lg">
        {t("magazine:sections.submit.cta")}
      </Button>
    </div>
  );
}
