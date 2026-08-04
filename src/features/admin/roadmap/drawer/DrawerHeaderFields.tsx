import { useTranslation } from "../../../../shared/i18n/useTranslation";
import type {
  AdminRoadmapItemDTO,
  RoadmapColumn,
  RoadmapItemUpdateBody,
  RoadmapPriority,
  RoadmapTeamMemberDTO,
} from "../../api/roadmapAdmin.types";
import {
  buildCategoryOptions,
  buildOwnerOptions,
  buildQuarterOptions,
  COLUMN_VALUES,
  PRIORITY_VALUES,
} from "./itemDrawer.data";
import styles from "./ItemDrawer.module.css";

/**
 * The drawer's editable identity block: the title input, then a select grid
 * for category/status/target-quarter/owner/priority. `targetQuarter` is
 * special-cased by the caller (`onTargetQuarterChange`, not
 * `onFieldChange`) — moving an existing item's date always routes through
 * the Slip-reason modal (a sibling task), never a silent write.
 */
export function DrawerHeaderFields({
  name,
  category,
  column,
  targetQuarter,
  ownerId,
  priority,
  items,
  team,
  onNameChange,
  onFieldChange,
  onTargetQuarterChange,
}: {
  name: string;
  category: string;
  column: RoadmapColumn;
  targetQuarter: string | null;
  ownerId: string | null;
  priority: RoadmapPriority;
  items: AdminRoadmapItemDTO[];
  team: RoadmapTeamMemberDTO[];
  onNameChange: (value: string) => void;
  onFieldChange: (patch: RoadmapItemUpdateBody) => void;
  onTargetQuarterChange: (value: string | null) => void;
}) {
  const { t } = useTranslation();
  const categoryOptions = buildCategoryOptions(items, t);
  const quarterOptions = buildQuarterOptions(items, targetQuarter);
  const ownerOptions = buildOwnerOptions(
    team,
    t("admin:roadmap.toolbar.ownerUnassigned"),
  );

  return (
    <>
      <input
        className={styles.titleInput}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder={t("admin:roadmap.drawer.field.title")}
        aria-label={t("admin:roadmap.drawer.field.title")}
      />

      <div className={styles.fieldGrid}>
        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-category">
            {t("admin:roadmap.board.field.category")}
          </label>
          <select
            id="drawer-field-category"
            className={styles.select}
            value={category}
            onChange={(event) => onFieldChange({ category: event.target.value })}
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-status">
            {t("admin:roadmap.drawer.field.status")}
          </label>
          <select
            id="drawer-field-status"
            className={styles.select}
            value={column}
            onChange={(event) =>
              onFieldChange({ column: event.target.value as RoadmapColumn })
            }
          >
            {COLUMN_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(`admin:roadmap.board.column.${value}`)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-target">
            {t("admin:roadmap.drawer.field.target")}
          </label>
          <select
            id="drawer-field-target"
            className={styles.select}
            value={targetQuarter ?? ""}
            onChange={(event) =>
              onTargetQuarterChange(event.target.value || null)
            }
          >
            <option value="">—</option>
            {quarterOptions.map((quarter) => (
              <option key={quarter} value={quarter}>
                {quarter}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-owner">
            {t("admin:roadmap.drawer.field.owner")}
          </label>
          <select
            id="drawer-field-owner"
            className={styles.select}
            value={ownerId ?? ""}
            onChange={(event) => onFieldChange({ ownerId: event.target.value || null })}
          >
            {ownerOptions.map((option) => (
              <option key={option.value || "unassigned"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-priority">
            {t("admin:roadmap.drawer.field.priority")}
          </label>
          <select
            id="drawer-field-priority"
            className={styles.select}
            value={priority}
            onChange={(event) =>
              onFieldChange({ priority: event.target.value as RoadmapPriority })
            }
          >
            {PRIORITY_VALUES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
