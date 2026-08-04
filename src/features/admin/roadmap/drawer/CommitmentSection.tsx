import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  RoadmapConfidence,
  RoadmapItemUpdateBody,
  RoadmapSlipEntryDTO,
} from "../../api/roadmapAdmin.types";
import { AdminSeg, AdminToggle } from "../../ui";
import styles from "./ItemDrawer.module.css";

const CONFIDENCE_VALUES: RoadmapConfidence[] = ["likely", "maybe", "hoping"];

/**
 * Confidence (3-way) + the "this is a promise" toggle + the read-only slip
 * history — why members should believe (or not) the current target date.
 */
export function CommitmentSection({
  confidence,
  committed,
  slips,
  onFieldChange,
}: {
  confidence: RoadmapConfidence;
  committed: boolean;
  slips: RoadmapSlipEntryDTO[];
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();
  const confidenceOptions = CONFIDENCE_VALUES.map((value) => ({
    value,
    label: t(`admin:roadmap.drawer.commitment.confidence.${value}.label`),
  }));

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.commitment.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.commitment.note")}
        </p>
      </div>

      <AdminSeg
        options={confidenceOptions}
        value={confidence}
        onChange={(value) =>
          onFieldChange({ confidence: value as RoadmapConfidence })
        }
      />
      <p className={styles.confidenceHint}>
        {t(`admin:roadmap.drawer.commitment.confidence.${confidence}.desc`)}
      </p>

      <div className={styles.toggleRow}>
        <div className={styles.toggleTx}>
          <span className={styles.toggleTitle}>
            {t("admin:roadmap.drawer.commitment.promiseToggle.title")}
          </span>
          <span className={styles.toggleSub}>
            {t("admin:roadmap.drawer.commitment.promiseToggle.sub")}
          </span>
        </div>
        <AdminToggle
          checked={committed}
          onChange={(value) => onFieldChange({ committed: value })}
          label={t("admin:roadmap.drawer.commitment.promiseToggle.title")}
        />
      </div>

      <p className={styles.slipHistoryLabel}>
        {t("admin:roadmap.drawer.commitment.slipHistoryTitle", {
          count: slips.length,
        })}
      </p>
      {slips.length === 0 ? (
        <p className={styles.emptyNote}>
          {t("admin:roadmap.drawer.commitment.slipHistoryEmpty")}
        </p>
      ) : (
        <ul className={styles.slipList}>
          {slips.map((slip, index) => (
            <li
              key={`${slip.movedAt}-${index}`}
              className={styles.slipRow}
            >
              <span className={styles.slipMove}>
                {slip.from || "—"} → {slip.to || "—"}
              </span>
              {" — "}
              {slip.reason}
              <span className={styles.slipMeta}>
                {slip.movedByName} · {new Date(slip.movedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
