import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { gatheringRecapPath, DEMO_GATHERING_SLUGS } from "../gatherings/data";
import {
  FeedActionLink,
  FeedActions,
  FeedCardHead,
  FeedCardShell,
} from "./FeedCard";
import styles from "./FeedCard.module.css";

/**
 * Compact "light" cards for the responsive grid — a saved article and a
 * gathering recap. Both skip `FeedIdentity` entirely (no avatar to show, and
 * a `null` lead left a dead 46px gap) and go straight from the eyebrow to a
 * simple title/source block, matching the density of the other light cards
 * (member/saved) that pack two-up.
 */
export function SavedArticleCard() {
  const { t } = useTranslation();
  return (
    <FeedCardShell accent="ink">
      <FeedCardHead label={t("feed:card.savedArticle.eyebrow")} />
      {/* eslint-disable-next-line local/no-literal-string -- mock saved article's title; live mode fetches this from the article record. */}
      <div className={styles.name}>The Quiet Politics of Chosen Family</div>
      {/* eslint-disable-next-line local/no-literal-string -- mock saved article's issue/read-time metadata; live mode fetches this from the article record. */}
      <div className={styles.meta}>
        QueerPulse Magazine · Issue 17 · 6 min read
      </div>
      <FeedActions
        primary={
          <FeedActionLink to={routes.article}>
            {t("feed:action.continueReading")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}

export function RecapCard() {
  const { t } = useTranslation();
  return (
    <FeedCardShell accent="ink">
      <FeedCardHead label={t("feed:card.recap.eyebrow")} />
      {/* eslint-disable-next-line local/no-literal-string -- mock recap's event name; live mode fetches this from the gathering record. */}
      <div className={styles.name}>Pride Brunch, June Edition</div>
      {/* eslint-disable-next-line local/no-literal-string -- mock recap's attendance summary; live mode fetches this from the gathering record. */}
      <div className={styles.meta}>
        You attended · 3 days ago · 38 people were there
      </div>
      <FeedActions
        primary={
          <FeedActionLink to={gatheringRecapPath(DEMO_GATHERING_SLUGS.recap)}>
            {t("feed:action.readRecap")}
          </FeedActionLink>
        }
      />
    </FeedCardShell>
  );
}
