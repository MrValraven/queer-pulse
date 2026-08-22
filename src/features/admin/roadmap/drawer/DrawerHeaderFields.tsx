import { Select } from "../../../../shared/components/ui";
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
 * `onFieldChange`). Moving an existing item's date always routes through
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
          <Select
            id="drawer-field-category"
            value={category}
            options={categoryOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => onFieldChange({ category: value ?? "" })}
          />
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-status">
            {t("admin:roadmap.drawer.field.status")}
          </label>
          <Select
            id="drawer-field-status"
            value={column}
            options={COLUMN_VALUES.map((value) => ({
              value,
              label: t(`admin:roadmap.board.column.${value}`),
            }))}
            onChange={(value) =>
              onFieldChange({ column: (value ?? column) as RoadmapColumn })
            }
          />
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-target">
            {t("admin:roadmap.drawer.field.target")}
          </label>
          <Select
            id="drawer-field-target"
            value={targetQuarter ?? ""}
            options={[
              { value: "", label: t("admin:common.notSet") },
              ...quarterOptions.map((quarter) => ({
                value: quarter,
                label: quarter,
              })),
            ]}
            onChange={(value) => onTargetQuarterChange(value || null)}
          />
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-owner">
            {t("admin:roadmap.drawer.field.owner")}
          </label>
          <Select
            id="drawer-field-owner"
            value={ownerId ?? ""}
            options={ownerOptions.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
            onChange={(value) => onFieldChange({ ownerId: value || null })}
          />
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="drawer-field-priority">
            {t("admin:roadmap.drawer.field.priority")}
          </label>
          <Select
            id="drawer-field-priority"
            value={priority}
            options={PRIORITY_VALUES.map((value) => ({
              value,
              label: value,
            }))}
            onChange={(value) =>
              onFieldChange({ priority: (value ?? priority) as RoadmapPriority })
            }
          />
        </div>
      </div>
    </>
  );
}
