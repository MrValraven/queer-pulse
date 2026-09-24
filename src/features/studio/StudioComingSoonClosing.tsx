import { useId } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { routes } from "../../app/routeMap";
import { Button } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import styles from "./StudioComingSoonClosing.module.css";

/**
 * The desk's eight channel strips, used only as React keys. The names are
 * never shown: each strip's resting fader height and meter level are drawn in
 * CSS by list position, and the last strip is the master bus.
 */
const CONSOLE_CHANNEL_IDS = [
  "kick",
  "snare",
  "bass",
  "keys",
  "guitar",
  "choir",
  "vocal",
  "master",
] as const;

/**
 * Closing scene of the live-mode Studio teaser: a mixing desk at rest, with a
 * meter bridge of dim jade LEDs along its top edge and a bank of channel
 * faders along its foot, lit from behind by a soft glow. It points people to
 * the magazine, the neighbouring surface that already publishes, and back
 * home. No offer is made here: the studio has nothing on sale yet.
 */
export function StudioComingSoonClosing() {
  const { t } = useTranslation();
  const titleId = useId();
  return (
    <section className={styles.closing} aria-labelledby={titleId}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.console}>
        <div className={`${styles.strips} ${styles.bridge}`} aria-hidden="true">
          {CONSOLE_CHANNEL_IDS.map((channelId) => (
            <span key={channelId} className={styles.meter} />
          ))}
        </div>
        <h2 id={titleId} className={styles.title}>
          <Translation
            i18nKey="studio:comingSoon.closing.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.body}>{t("studio:comingSoon.closing.body")}</p>
        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            to={routes.magazine}
            className={`${styles.action} ${styles.primaryAction}`}
          >
            {t("studio:comingSoon.magazineCta")}
            <FiArrowRight aria-hidden="true" />
          </Button>
          <Button
            variant="ghost-dark"
            size="lg"
            to={routes.homepage}
            className={styles.action}
          >
            <FiArrowLeft aria-hidden="true" />
            {t("studio:comingSoon.backHome")}
          </Button>
        </div>
        <div className={`${styles.strips} ${styles.faders}`} aria-hidden="true">
          {CONSOLE_CHANNEL_IDS.map((channelId) => (
            <span key={channelId} className={styles.channel}>
              <span className={styles.faderCap} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
