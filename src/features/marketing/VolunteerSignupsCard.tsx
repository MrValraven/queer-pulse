import { Link } from "react-router-dom";
import { FiUsers } from "react-icons/fi";
import { Avatar, Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { photoOf } from "../communities/communityPeople";
import type { Tint } from "../communities/communityDetails";
import type { SignupRow } from "./api/volunteering.adapters";
import { routes } from "../../app/routeMap";
import styles from "./VolunteerOpportunityPage.module.css";

/**
 * The roster of CONFIRMED volunteers (GET /volunteering/:slug/signups, filtered
 * to `status === "accepted"`) plus the "Close opportunity" control. Pending
 * applications aren't reviewed here — a link to the manage-applicants dashboard
 * (`VolunteerApplicantsDashboardPage`) handles that.
 *
 * Mounted for the whole review tier: the poster, or an owner/mod of the
 * community the opportunity is attributed to. Closing is NOT part of that tier
 * (`canCloseOpportunity`), so a community organiser reviews and accepts
 * applicants without being able to end someone else's posting.
 */
export function VolunteerSignupsCard({
  signups,
  loading,
  onClose,
  closing,
  closed,
  canCloseOpportunity,
  opportunitySlug,
}: {
  signups: SignupRow[];
  loading: boolean;
  onClose: () => void;
  closing: boolean;
  closed: boolean;
  /** Poster-only. False for a community owner/mod reviewing this posting. */
  canCloseOpportunity: boolean;
  opportunitySlug: string;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();
  const accepted = signups.filter((row) => row.status === "accepted");
  const pendingCount = signups.filter((row) => row.status === "pending").length;

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
      ) : accepted.length === 0 ? (
        <p className={styles.altText}>
          {t("marketing:volunteer.signups.empty")}
        </p>
      ) : (
        <div className={styles.signupList}>
          {accepted.map((row) => {
            const inner = (
              <>
                <Avatar
                  initials={row.initials}
                  size={36}
                  src={
                    row.person
                      ? // `photoOf` wants the communities-local `Person` (narrower
                        // `Tint`); `row.person` is the shared `refs.Person`
                        // (`AvatarTint`, a superset). `photoOf` only reads
                        // `avatarUrl`/`slug`, never `tint`, so this narrowing is
                        // safe — same precedent as `refToPerson` in
                        // communities/api/communities.adapters.ts.
                        photoOf(
                          { ...row.person, tint: row.person.tint as Tint },
                          demoMode,
                        )
                      : undefined
                  }
                />
                <span className={styles.signupBody}>
                  <b>{row.name}</b>
                  {row.when && (
                    <span className={styles.signupNote}>
                      {t("marketing:volunteer.signups.signedUp", {
                        when: row.when,
                      })}
                    </span>
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

      {pendingCount > 0 && (
        <Link
          to={`${routes.manageVolunteerApplicants}?opportunity=${opportunitySlug}`}
          className={styles.reviewLink}
        >
          {t("marketing:volunteer.signups.reviewCta", { count: pendingCount })}
        </Link>
      )}

      <div className={styles.posterActions}>
        {closed ? (
          // The closed state is worth stating to every reviewer; only the
          // poster is offered the control that gets there.
          <span className={styles.closedTag}>
            {t("marketing:volunteer.signups.closedTag")}
          </span>
        ) : canCloseOpportunity ? (
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
        ) : null}
      </div>
    </div>
  );
}
