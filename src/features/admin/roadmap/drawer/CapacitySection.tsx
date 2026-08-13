import { Select } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapItemDTO,
  RoadmapCost,
  RoadmapItemUpdateBody,
  RoadmapPaidKind,
  RoadmapTeamMemberDTO,
} from "../../api/roadmapAdmin.types";
import { AdminSeg } from "../../ui";
import { computeOwnerLoadHours } from "./itemDrawer.data";
import styles from "./ItemDrawer.module.css";

const PAID_KIND_VALUES: RoadmapPaidKind[] = ["paid", "volunteer"];
const COST_VALUES: RoadmapCost[] = ["none", "small", "funded", "needs"];

/**
 * Who's doing the work, how many hours a week, what it costs — plus a
 * read-only "owner load" line (this owner's total `weeklyHours` across
 * everything currently in Building) so committing more work to someone
 * already over capacity is visible right where you'd do it.
 */
export function CapacitySection({
  paidKind,
  weeklyHours,
  cost,
  ownerId,
  team,
  items,
  onFieldChange,
}: {
  paidKind: RoadmapPaidKind;
  weeklyHours: number;
  cost: RoadmapCost;
  ownerId: string | null;
  team: RoadmapTeamMemberDTO[];
  items: AdminRoadmapItemDTO[];
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
}) {
  const { t } = useTranslation();
  const owner = team.find((member) => member.userId === ownerId);
  const loadHours = computeOwnerLoadHours(items, ownerId);
  const capHours = owner?.weeklyCapHours ?? 0;
  const loadPercent =
    capHours > 0 ? Math.min(100, Math.round((loadHours / capHours) * 100)) : 0;

  const paidOptions = PAID_KIND_VALUES.map((value) => ({
    value,
    label: t(
      value === "paid"
        ? "admin:roadmap.drawer.capacity.paidOption"
        : "admin:roadmap.drawer.capacity.volunteerOption",
    ),
  }));
  const costOptions = COST_VALUES.map((value) => ({
    value,
    label: t(`admin:roadmap.drawer.capacity.cost.${value}`),
  }));

  return (
    <div className={styles.section}>
      <div className={styles.sectionHead}>
        <h3 className={styles.sectionTitle}>
          {t("admin:roadmap.drawer.capacity.title")}
        </h3>
        <p className={styles.sectionNote}>
          {t("admin:roadmap.drawer.capacity.note")}
        </p>
      </div>

      <label className={styles.fieldLabel}>
        {t("admin:roadmap.drawer.capacity.whoLabel")}
      </label>
      <AdminSeg
        options={paidOptions}
        value={paidKind}
        onChange={(value) => onFieldChange({ paidKind: value as RoadmapPaidKind })}
      />

      <div className={`${styles.fieldGrid} ${styles.fieldGridSpaced}`}>
        <div>
          <label className={styles.fieldLabel} htmlFor="capacity-hours">
            {t("admin:roadmap.drawer.capacity.hoursLabel")}
          </label>
          <input
            id="capacity-hours"
            type="number"
            min={0}
            className={styles.numberInput}
            value={weeklyHours}
            onChange={(event) =>
              onFieldChange({ weeklyHours: Number(event.target.value) })
            }
          />
        </div>
        <div>
          <label className={styles.fieldLabel} htmlFor="capacity-cost">
            {t("admin:roadmap.drawer.capacity.costLabel")}
          </label>
          <Select
            id="capacity-cost"
            value={cost}
            options={costOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) =>
              onFieldChange({ cost: (value ?? cost) as RoadmapCost })
            }
          />
        </div>
      </div>

      <div className={styles.loadRow}>
        <div className={styles.loadHead}>
          <span className={styles.loadLabel}>
            {t("admin:roadmap.drawer.capacity.ownerLoadLabel")}
          </span>
          <span className={styles.loadValue}>
            {owner
              ? t("admin:roadmap.drawer.capacity.ownerLoadValue", {
                  hours: loadHours,
                  cap: capHours,
                })
              : t("admin:roadmap.drawer.capacity.noOwner")}
          </span>
        </div>
        {owner && (
          <div className={styles.loadBar}>
            <div
              className={styles.loadBarFill}
              style={{ width: `${loadPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
