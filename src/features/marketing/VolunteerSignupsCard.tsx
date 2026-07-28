import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SignupRow } from "./api/volunteering.adapters";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

/**
 * Poster-only roster of everyone who signed up (GET /volunteering/:slug/signups),
 * plus the poster's "Close opportunity" control (POST …/close). Only mounted
 * when the viewer is the poster; hidden entirely in demo mode (no live roster).
 */
export function VolunteerSignupsCard({
  signups,
  loading,
  onClose,
  closing,
  closed,
}: {
  signups: SignupRow[];
  loading: boolean;
  onClose: () => void;
  closing: boolean;
  closed: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.card}>
      <div className={styles.cardLabel}>
        <FiUsers aria-hidden style={{ verticalAlign: "-2px" }} />{" "}
        {t("marketing:volunteer.signups.title")}
      </div>
      {loading ? (
        <p className={styles.altText}>
          {t("marketing:volunteer.signups.loading")}
        </p>
      ) : signups.length === 0 ? (
        <p className={styles.altText}>
          {t("marketing:volunteer.signups.empty")}
        </p>
      ) : (
        <div className={styles.signupList}>
          {signups.map((row) => {
            const inner = (
              <>
                <span
                  className={styles.signupAv}
                  style={{ background: row.background, color: row.color }}
                >
                  {row.initials}
                </span>
                <span className={styles.signupBody}>
                  <b>{row.name}</b>
                  {row.note ? (
                    <span className={styles.signupNote}>{row.note}</span>
                  ) : (
                    row.when && (
                      <span className={styles.signupNote}>
                        {t("marketing:volunteer.signups.signedUp", {
                          when: row.when,
                        })}
                      </span>
                    )
                  )}
                </span>
              </>
            );
            return row.person ? (
              <Link
                key={row.id}
                to={`${routes.members}/${row.person.slug}`}
                className={styles.signupRow}
              >
                {inner}
              </Link>
            ) : (
              <div key={row.id} className={styles.signupRow}>
                {inner}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.posterActions}>
        {closed ? (
          <span className={styles.closedTag}>
            {t("marketing:volunteer.signups.closedTag")}
          </span>
        ) : (
          <Button
            variant="ghost"
            className={styles.ctaBtn}
            onClick={onClose}
            disabled={closing}
            aria-busy={closing}
          >
            {closing
              ? t("marketing:volunteer.signups.closing")
              : t("marketing:volunteer.signups.closeCta")}
          </Button>
        )}
      </div>
    </div>
  );
}
