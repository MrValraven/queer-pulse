import { useId } from "react";
import { AnimatePresence } from "motion/react";
import { useAuth } from "../../../app/providers/authContext";
import { useDemoMode } from "../../../app/providers/DemoModeProvider";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useStudioLanding } from "../api/useStudioLanding";
import { StudioLandingArtistCard } from "./StudioLandingArtistCard";
import styles from "./StudioLandingArtists.module.css";

/**
 * Meet the artists: up to six cards our team added with the artist's consent,
 * founding artists first in the order the read gives. The section stays hidden
 * until the read holds at least two cards, and folds in or out with the data.
 * Demo shows a note that the artists and quotes are samples; live never does.
 */
export function StudioLandingArtists() {
  const { t } = useTranslation();
  const headingId = useId();
  const { landing } = useStudioLanding();
  const { loggedIn } = useAuth();
  const { demoMode } = useDemoMode();

  return (
    <Collapse isOpen={landing?.isArtistsShown === true}>
      <section className={styles.section} aria-labelledby={headingId}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            {t("studio:landing.artists.eyebrow")}
          </p>
          <h2 id={headingId} className={styles.title}>
            <Translation
              i18nKey="studio:landing.artists.title"
              components={{ em: <em /> }}
            />
          </h2>
        </header>
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles -- grid with list-style none loses the list role in Safari */}
        <ul
          className={styles.grid}
          role="list"
          aria-label={t("studio:landing.artists.listLabel")}
        >
          <AnimatePresence initial={false}>
            {(landing?.artists ?? []).map((card) => (
              <StudioLandingArtistCard
                key={card.id}
                card={card}
                isMember={loggedIn}
              />
            ))}
          </AnimatePresence>
        </ul>
        <Collapse isOpen={demoMode}>
          <p className={styles.sampleNote}>
            {t("studio:landing.demoSampleNote")}
          </p>
        </Collapse>
      </section>
    </Collapse>
  );
}
