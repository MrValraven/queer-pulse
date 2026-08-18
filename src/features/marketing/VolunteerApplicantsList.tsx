import { Avatar, Button } from "../../shared/components/ui";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { photoOf } from "../communities/communityPeople";
import type { Tint } from "../communities/communityDetails";
import type { SignupRow } from "./api/volunteering.adapters";
import styles from "./VolunteerApplicantsDashboardPage.module.css";

/** Right pane: every applicant (any status) for the selected opportunity,
 *  with Accept/Decline actions on pending rows only. */
export function VolunteerApplicantsList({
  rows,
  loading,
  onAccept,
  onDecline,
  deciding,
}: {
  rows: SignupRow[];
  loading: boolean;
  onAccept: (signupId: string) => void;
  onDecline: (signupId: string) => void;
  deciding: boolean;
}) {
  const { t } = useTranslation();
  const { demoMode } = useDemoMode();

  if (loading) {
    return (
      <p className={styles.altText}>
        {t("marketing:volunteerManage.loadingApplicants")}
      </p>
    );
  }
  if (rows.length === 0) {
    return (
      <p className={styles.altText}>
        {t("marketing:volunteerManage.noApplicants")}
      </p>
    );
  }

  return (
    <div className={styles.applicantList}>
      {rows.map((row) => (
        <div key={row.id} className={styles.applicantRow}>
          <Avatar
            initials={row.initials}
            size={44}
            src={
              row.person
                ? // `photoOf` wants the communities-local `Person` (narrower
                  // `Tint`); `row.person` is the shared `refs.Person`
                  // (`AvatarTint`, a superset). `photoOf` only reads
                  // `avatarUrl`/`slug`, never `tint`, so this narrowing is
                  // safe — same precedent as `VolunteerSignupsCard`.
                  photoOf({ ...row.person, tint: row.person.tint as Tint }, demoMode)
                : undefined
            }
          />
          <div className={styles.applicantBody}>
            <b>{row.name}</b>
            {row.note && <p className={styles.applicantNote}>{row.note}</p>}
            <span className={styles.applicantMeta}>
              {t(`marketing:volunteerManage.status.${row.status}`)}
              {row.when ? ` · ${row.when}` : ""}
            </span>
          </div>
          {row.status === "pending" && (
            <div className={styles.applicantActions}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAccept(row.id)}
                disabled={deciding}
              >
                {t("marketing:volunteerManage.accept")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDecline(row.id)}
                disabled={deciding}
              >
                {t("marketing:volunteerManage.decline")}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
