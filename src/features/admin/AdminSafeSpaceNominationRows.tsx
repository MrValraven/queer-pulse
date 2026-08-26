import { FadeIn } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminChip, type AdminTone } from "./ui";
import { NOMINATION_STATUS_LABEL_KEY } from "./adminSafeSpaceGovernance.data";
import type {
  AdminSafeSpaceNominationDTO,
  SafeSpaceNominationStatus,
} from "../safety/api/safeSpaceGovernance.api";
import styles from "./AdminSafeSpaceGovernance.module.css";

const STATUS_TONE: Record<SafeSpaceNominationStatus, AdminTone> = {
  pending: "amber",
  acknowledged: "violet",
  in_review: "coral",
  approved: "jade",
  rejected: "ghost",
};

/**
 * The nomination queue, one row per nomination. A row that has blown through
 * the 48-hour acknowledgement window carries a coral edge AND a labelled chip:
 * the deadline is the whole point of the queue, so it never rests on colour
 * alone.
 */
export function AdminSafeSpaceNominationRows({
  nominations,
  onOpen,
}: {
  nominations: AdminSafeSpaceNominationDTO[];
  onOpen: (nomination: AdminSafeSpaceNominationDTO) => void;
}) {
  const { t } = useTranslation();

  if (nominations.length === 0) {
    return <p className={styles.emptyLine}>{t("safety:governance.empty")}</p>;
  }

  return (
    <div className={styles.rows}>
      {nominations.map((nomination, index) => (
        <FadeIn key={nomination.id} delay={Math.min(index, 8) * 50}>
          <NominationRow nomination={nomination} onOpen={onOpen} />
        </FadeIn>
      ))}
    </div>
  );
}

function NominationRow({
  nomination,
  onOpen,
}: {
  nomination: AdminSafeSpaceNominationDTO;
  onOpen: (nomination: AdminSafeSpaceNominationDTO) => void;
}) {
  const { t } = useTranslation();
  const visits = nomination.visits;

  return (
    <button
      type="button"
      className={[
        styles.row,
        nomination.hasBreachedAcknowledgement && styles.rowBreaching,
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onOpen(nomination)}
    >
      <div className={styles.rowMain}>
        <div className={styles.rowTop}>
          <span className={styles.rowName}>{nomination.placeName}</span>
          <AdminChip tone={STATUS_TONE[nomination.status]} dot>
            {t(NOMINATION_STATUS_LABEL_KEY[nomination.status])}
          </AdminChip>
          {nomination.hasBreachedAcknowledgement && (
            <AdminChip tone="danger">
              {t("safety:governance.chip.breached", {
                hours: nomination.acknowledgementWindowHours,
              })}
            </AdminChip>
          )}
          {nomination.wasAcknowledgedLate && (
            <AdminChip tone="amber">
              {t("safety:governance.chip.acknowledgedLate")}
            </AdminChip>
          )}
        </div>

        <div className={styles.rowMeta}>
          {t("safety:governance.row.age", {
            count: nomination.ageHours,
            hours: nomination.ageHours,
          })}
          {nomination.placeType ? ` · ${nomination.placeType}` : ""}
          {nomination.address ? ` · ${nomination.address}` : ""}
        </div>

        {nomination.reason && (
          <p className={styles.rowQuote}>{nomination.reason}</p>
        )}
      </div>

      <div className={styles.rowChips}>
        {visits ? (
          <AdminChip tone={visits.hasMetVisitBar ? "jade" : "ghost"}>
            {t("safety:governance.chip.visits", {
              count: visits.independentVisitCount,
              required: visits.requiredVisitCount,
            })}
          </AdminChip>
        ) : (
          <AdminChip tone="ghost">
            {t("safety:governance.chip.unassigned")}
          </AdminChip>
        )}
      </div>
    </button>
  );
}
