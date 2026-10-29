import { useId } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { Collapse } from "../../../shared/components/ui/Collapse";
import { Translation } from "../../../shared/i18n/Translation";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { useGovernanceOverview } from "../../governance/api/useGovernanceOverview";
import { CouncilSeatAvatar } from "../../governance/CouncilSeatAvatar";
import { resolveGovernanceText } from "../../governance/governanceText";
import styles from "./StudioLandingFaq.module.css";

/** The most seats the strip shows. */
const MAX_TEAM_SEATS = 8;

/**
 * Who runs QueerPulse: the advisory council from the public governance
 * overview, with a link to the page that explains how the community is run.
 * The page mounts it only after hydration, so the baked HTML holds no
 * governance result. It folds away while the overview has no seats or fails.
 */
export function StudioLandingTeam() {
  const { t, language } = useTranslation();
  const { council, error } = useGovernanceOverview();
  const headingId = useId();
  const seats = council.slice(0, MAX_TEAM_SEATS);

  return (
    <Collapse isOpen={seats.length > 0 && !error}>
      <section className={styles.section} aria-labelledby={headingId}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{t("studio:landing.team.eyebrow")}</p>
          <h2 id={headingId} className={`${styles.title} ${styles.titleTight}`}>
            <Translation
              i18nKey="studio:landing.team.title"
              components={{ em: <em /> }}
            />
          </h2>
          <p className={styles.teamBody}>{t("studio:landing.team.body")}</p>
          <ul
            className={styles.seats}
            aria-label={t("studio:landing.team.listLabel")}
          >
            {seats.map((seat) => (
              <li key={seat.slug} className={styles.seat}>
                <CouncilSeatAvatar seat={seat} />
                <div className={styles.seatText}>
                  <span className={styles.seatName}>{seat.name}</span>
                  <span className={styles.seatRole}>
                    {resolveGovernanceText(seat.role, t, language)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          <Link to={routes.governance} className={styles.teamLink}>
            {t("studio:landing.team.link")}
            <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </Collapse>
  );
}
