import { Button } from "../../shared/components/ui";
import { AdminToggle } from "./ui";
import type { HousingCoopDTO } from "../economy/api/housingCoop.api";
import styles from "./AdminHousingCoopsPage.module.css";

const PHASE_LABEL: Record<HousingCoopDTO["phase"], string> = {
  forming: "Forming",
  legal: "Legal",
  finance: "Finance",
  property: "Property",
  daily: "Daily life",
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
  return (
    <div className={styles.rows}>
      {coops.map((coop) => (
        <div className={styles.row} key={coop.id}>
          <div className={styles.rowMain}>
            <div className={styles.rowTop}>
              <span className={styles.rowName}>{coop.name}</span>
              <span className={styles.phaseTag}>
                {PHASE_LABEL[coop.phase]}
              </span>
            </div>
            <div className={styles.rowMeta}>
              {coop.city} · {coop.householdCount} households
            </div>
          </div>
          <AdminToggle
            checked={coop.published}
            onChange={() => onTogglePublished(coop)}
            label={`Published — ${coop.name}`}
          />
          <div className={styles.rowActions}>
            <Button variant="ghost" size="md" onClick={() => onEdit(coop)}>
              Edit
            </Button>
            <Button variant="ghost" size="md" onClick={() => onDelete(coop)}>
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
