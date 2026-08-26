import { Link } from "react-router-dom";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";
import { useAuth } from "../../app/providers/authContext";
import { Reveal } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { ArrivingLink } from "./arrivingPage.data";
import { TONE_CLASS } from "./arrivingTone";
import type { InfoCard } from "./arrivingPageCards.data";
import styles from "./ArrivingPage.module.css";

interface ArrivingCardLinkProps {
  link: ArrivingLink;
  /** Already-translated label. */
  label: string;
}

/**
 * One destination on this page. Internal routes use the router; an
 * organisation's own site opens in a new tab with the external-link icon.
 *
 * Several of the in-app destinations sit behind the member gate. A logged-out
 * reader is told so up front rather than discovering it at a sign-in wall,
 * which is the whole point of a page written for someone who just landed.
 */
export function ArrivingCardLink({ link, label }: ArrivingCardLinkProps) {
  const { t } = useTranslation();
  const { loggedIn } = useAuth();
  const shouldFlagMemberOnly = Boolean(link.isMemberOnly) && !loggedIn;

  const hint = shouldFlagMemberOnly ? (
    <span className={styles.memberOnly}>
      {t("marketing:arriving.memberOnly")}
    </span>
  ) : null;

  if (link.isExternal) {
    return (
      <span className={styles.linkRow}>
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.icLink}
        >
          {label} <FiExternalLink aria-hidden />
        </a>
        {hint}
      </span>
    );
  }

  return (
    <span className={styles.linkRow}>
      <Link to={link.href} className={styles.icLink}>
        {label} <FiArrowRight aria-hidden />
      </Link>
      {hint}
    </span>
  );
}

/** The health/housing card grid. Every string resolves from the card's
 *  `keyPrefix`, so the whole grid translates. */
export function InfoCards({ cards }: { cards: InfoCard[] }) {
  const { t } = useTranslation();
  return (
    <div className={styles.infoGrid}>
      {cards.map((card, index) => (
        <Reveal
          as="div"
          className={styles.infoCard}
          key={card.keyPrefix}
          delay={index * 55}
        >
          <div className={styles.icHead}>
            <div className={`${styles.icIcon} ${TONE_CLASS[card.tone]}`}>
              <card.icon aria-hidden />
            </div>
            <h3 className={styles.icTitle}>{t(`${card.keyPrefix}.title`)}</h3>
          </div>
          <p className={styles.icBody}>{t(`${card.keyPrefix}.body`)}</p>
          {card.link && (
            <ArrivingCardLink
              link={card.link}
              label={t(`${card.keyPrefix}.linkLabel`)}
            />
          )}
        </Reveal>
      ))}
    </div>
  );
}
