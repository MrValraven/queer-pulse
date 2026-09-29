import { FiSliders } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";
import {
  DESK_DENSITY_OPTIONS,
  DESK_GROUP_OPTIONS,
  DESK_SORT_OPTIONS,
  optionLabelKey,
  type DeskWorkbarOption,
} from "./deskWorkbar.data";
import type { DeskGroupBy } from "./pipelineGroups";
import type { DeskDensity, PieceSortOption } from "./useDeskState";
import styles from "./DeskWorkbar.module.css";

/** How the table is ordered, grouped and spaced. */
export interface DeskSortMenuProps {
  sort: PieceSortOption;
  onSort: (value: PieceSortOption) => void;
  groupBy: DeskGroupBy;
  onGroupBy: (value: DeskGroupBy) => void;
  density: DeskDensity;
  onDensity: (value: DeskDensity) => void;
}

/**
 * The workbar's Sort menu: sort key, grouping and row density.
 *
 * All three change how the same pieces are laid out and none of them hides a
 * piece, which is why they share a menu apart from Filter. The trigger names
 * the current sort in muted text so the order of the table is readable
 * without opening anything. Every item is a radio, so each choice closes the
 * menu.
 */
export function DeskSortMenu({
  sort,
  onSort,
  groupBy,
  onGroupBy,
  density,
  onDensity,
}: DeskSortMenuProps) {
  const { t } = useTranslation();
  const currentSortKey = optionLabelKey(DESK_SORT_OPTIONS, sort);

  /** A heading followed by one radio per option, ids prefixed by `groupId`. */
  const radioGroup = <Value extends string>(
    groupId: string,
    headingKey: string,
    options: DeskWorkbarOption<Value>[],
    currentValue: Value,
    onChoose: (value: Value) => void,
  ): DeskMenuItem[] => [
    { kind: "heading", id: groupId, label: t(headingKey) },
    ...options.map((option): DeskMenuItem => ({
      kind: "radio",
      id: `${groupId}:${option.value}`,
      label: t(option.labelKey),
      isChecked: currentValue === option.value,
      onSelect: () => onChoose(option.value),
    })),
  ];

  const items: DeskMenuItem[] = [
    ...radioGroup(
      "sort",
      "magazine:desk.workbar.sort.sortBy",
      DESK_SORT_OPTIONS,
      sort,
      onSort,
    ),
    ...radioGroup(
      "group",
      "magazine:desk.workbar.sort.groupBy",
      DESK_GROUP_OPTIONS,
      groupBy,
      onGroupBy,
    ),
    ...radioGroup(
      "density",
      "magazine:desk.workbar.sort.density",
      DESK_DENSITY_OPTIONS,
      density,
      onDensity,
    ),
  ];

  return (
    <DeskMenu
      label={t("magazine:desk.workbar.sort.menuLabel")}
      items={items}
      align="end"
      renderTrigger={(triggerProps) => (
        <Button
          {...triggerProps}
          variant="ghost"
          size="sm"
          className={styles.menuTrigger}
        >
          <FiSliders aria-hidden />
          <span className={styles.triggerLabel}>
            {t("magazine:desk.toolbar.sortAria")}
          </span>
          {currentSortKey !== undefined && (
            <span className={`${styles.triggerValue} ${styles.sortValue}`}>
              {t(currentSortKey)}
            </span>
          )}
        </Button>
      )}
    />
  );
}
