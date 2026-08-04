import { Link } from "react-router-dom";
import { routes } from "../../app/routeMap";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import type { SlideDeck } from "./data/decks";
// Reuses ArticlePage's related-card visual language — the classes below live
// there (.related/.relatedHead/.relGrid/.relCard/…), not in DeckPage.module.css.
import styles from "./ArticlePage.module.css";

/**
 * The "keep reading" rail beneath the deck stage. The related ids on a deck
 * point at other decks, so each card links to the deck route by id.
 */
export function DeckRelatedRail({ related }: { related: SlideDeck[] }) {
  return (
    <div className={styles.related}>
      <div className="wrap">
        <div className={styles.relatedHead}>
          <Translation
            i18nKey="magazine:article.relatedHeading"
            components={{ em: <em /> }}
          />
        </div>
        <div className={styles.relGrid}>
          {related.map((rel, index) => (
            <FadeIn
              as={Link}
              key={rel.id}
              to={`${routes.deck}?id=${rel.id}`}
              className={styles.relCard}
              delay={Math.min(index, 8) * 60}
            >
              <div className={styles.relKicker}>{rel.section}</div>
              <div className={styles.relTitle}>{rel.title}</div>
              <div className={styles.relMeta}>
                {rel.byline} · {rel.readTime}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
