import { Link } from "react-router-dom";
import { FiCreditCard, FiUsers } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { communityPath, routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCardCommunities } from "./api/useCardCommunities";
import styles from "./MyCardsPage.module.css";

/**
 * What `/account/cards` shows a member who holds no card, which is most
 * members: cards are issued by communities, so the platform has none of its
 * own to give.
 *
 * PRD-17 — this used to be an icon and two lines with nothing to do, on a page
 * every member has in their account menu. The question a cardless member
 * actually arrives with is "why do I have no card, and can I get one?", so
 * this answers both halves: who issues cards, and which communities of theirs
 * issue them.
 *
 * The list is only ever the member's OWN communities that run a live
 * programme (`hasCardProgram` on `GET /me/communities`). A failed lookup is
 * kept distinct from an empty one: the "none of your communities run a card
 * programme" line is withheld on error, because claiming it on the strength of
 * a request that never landed would be a lie. The route onward to their
 * communities stands in both cases.
 */
export function MyCardsEmpty() {
  const { t } = useTranslation();
  const { communities, isLoading, isError } = useCardCommunities();
  const hasIssuers = communities.length > 0;
  // Only assert the negative once the lookup has actually come back empty.
  const showsNoIssuersLine = !hasIssuers && !isLoading && !isError;

  return (
    <div className={styles.empty}>
      <FiCreditCard className={styles.emptyIcon} aria-hidden="true" />
      <h3 className={styles.emptyTitle}>{t("cards:empty.title")}</h3>
      <p className={styles.emptyBody}>{t("cards:empty.body")}</p>

      {hasIssuers && (
        <div className={styles.emptyIssuers}>
          <p className={styles.emptyIssuersTitle}>
            {t("cards:empty.issuers.title")}
          </p>
          <ul className={styles.emptyIssuerList}>
            {communities.map((community) => (
              <li key={community.slug}>
                <Link
                  to={communityPath(community.slug)}
                  className={styles.emptyIssuerLink}
                >
                  <FiUsers aria-hidden="true" />
                  <span>{community.name}</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.emptyBody}>{t("cards:empty.issuers.hint")}</p>
        </div>
      )}

      {showsNoIssuersLine && (
        <p className={styles.emptyBody}>{t("cards:empty.noIssuers")}</p>
      )}

      <Button variant="ghost" to={routes.communities}>
        {t("cards:empty.cta")}
      </Button>
    </div>
  );
}
