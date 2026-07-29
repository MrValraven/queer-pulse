import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToggle } from "./ui";
import type { HousingCoopDTO } from "../economy/api/housingCoop.api";
import styles from "./AdminHousingCoopsPage.module.css";

// Canonical phase id → catalog key (short badge form). The id is the stored
// value; only the label resolves via t() at render.
const PHASE_BADGE_KEY: Record<HousingCoopDTO["phase"], string> = {
  forming: "housingCoop.phaseBadge.forming",
  legal: "housingCoop.phaseBadge.legal",
  finance: "housingCoop.phaseBadge.finance",
  property: "housingCoop.phaseBadge.property",
  daily: "housingCoop.phaseBadge.daily",
};

/** One row per coop: name, phase, city/household meta, a published toggle,
 *  and edit/delete actions. */
export function AdminHousingCoopRows({
  coops,
  onTogglePublished,
  onEdit,
  onDelete,
}: {
  coops: HousingCoopDTO[];
  onTogglePublished: (coop: HousingCoopDTO) => void;
  onEdit: (coop: HousingCoopDTO) => void;
  onDelete: (coop: HousingCoopDTO) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.rows}>
      {coops.map((coop) => (
        <div className={styles.row} key={coop.id}>
          <div className={styles.rowMain}>
            <div className={styles.rowTop}>
              <span className={styles.rowName}>{coop.name}</span>
              <span className={styles.phaseTag}>
                {t(`admin:${PHASE_BADGE_KEY[coop.phase]}`)}
              </span>
            </div>
            <div className={styles.rowMeta}>
              {coop.city} ·{" "}
              {t("admin:housingCoop.row.households", {
                count: coop.householdCount,
              })}
            </div>
          </div>
          <AdminToggle
            checked={coop.published}
            onChange={() => onTogglePublished(coop)}
            label={t("admin:common.publishedToggleLabel", { name: coop.name })}
          />
          <div className={styles.rowActions}>
            <Button variant="ghost" size="md" onClick={() => onEdit(coop)}>
              {t("admin:common.edit")}
            </Button>
            <Button variant="ghost" size="md" onClick={() => onDelete(coop)}>
              {t("admin:common.delete")}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
