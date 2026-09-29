import type { Ref } from "react";
import { FiFilter } from "react-icons/fi";
import { Button } from "../../../shared/components/ui";
import { useFormat } from "../../../shared/i18n/format";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { Editor, Stage } from "../data/desk.data";
import { DeskMenu, type DeskMenuItem } from "./DeskMenu";
import {
  DESK_FORMAT_OPTIONS,
  countActiveDeskFilters,
  editorShortName,
  toggleListValue,
} from "./deskWorkbar.data";
import { viewStageLabelKey } from "./stageLabels";
import type { PieceFormatFilter } from "./useDeskState";
import styles from "./DeskWorkbar.module.css";

/** The narrowing the Filter menu owns. The active filter tokens under the
 *  workbar read the same props, so both always describe one state. */
export interface DeskFilterMenuProps {
  format: PieceFormatFilter;
  onFormat: (value: PieceFormatFilter) => void;
  /** Section names to offer, in display order. */
  sections: string[];
  /** Ticked sections. Empty means every section. */
  sectionFilter: string[];
  onSectionFilter: (value: string[]) => void;
  /** Stages to offer, in pipeline order. */
  stages: Stage[];
  /** Ticked stages. Empty means every stage. */
  stageFilter: Stage[];
  onStageFilter: (value: Stage[]) => void;
  editors: Editor[];
  /** The one editor whose pieces show, or null for anyone. */
  editorFilter: string | null;
  onEditorFilter: (value: string | null) => void;
}

/**
 * The workbar's Filter menu: format, section, stage and editor in one list.
 *
 * Format used to be a segmented control of its own, and section, stage and
 * editor had no control at all. One menu keeps the workbar to a single row,
 * and the badge on the trigger says how many filters are on while the menu is
 * closed. Section and stage are checkboxes, so ticking several keeps the menu
 * open; format and editor are radios and close it. A heading with nothing
 * under it (sections still loading) is left out.
 */
export function DeskFilterMenu({
  format,
  onFormat,
  sections,
  sectionFilter,
  onSectionFilter,
  stages,
  stageFilter,
  onStageFilter,
  editors,
  editorFilter,
  onEditorFilter,
  triggerRef,
}: DeskFilterMenuProps & {
  /** The trigger button, for the tokens row to return focus to. */
  triggerRef?: Ref<HTMLButtonElement>;
}) {
  const { t } = useTranslation();
  const formatters = useFormat();
  const activeCount = countActiveDeskFilters({
    format,
    sectionFilter,
    stageFilter,
    editorFilter,
  });
  const hasActiveFilters = activeCount > 0;

  const items: DeskMenuItem[] = [
    {
      kind: "heading",
      id: "format",
      label: t("magazine:desk.toolbar.formatAria"),
    },
    ...DESK_FORMAT_OPTIONS.map((option): DeskMenuItem => ({
      kind: "radio",
      id: `format:${option.value}`,
      label: t(option.labelKey),
      isChecked: format === option.value,
      onSelect: () => onFormat(option.value),
    })),
  ];

  if (sections.length > 0) {
    items.push(
      {
        kind: "heading",
        id: "section",
        label: t("magazine:desk.workbar.field.section"),
      },
      ...sections.map((section): DeskMenuItem => ({
        kind: "checkbox",
        id: `section:${section}`,
        label: section,
        isChecked: sectionFilter.includes(section),
        onSelect: () =>
          onSectionFilter(toggleListValue(sectionFilter, section)),
      })),
    );
  }

  if (stages.length > 0) {
    items.push(
      {
        kind: "heading",
        id: "stage",
        label: t("magazine:desk.workbar.field.stage"),
      },
      ...stages.map((stage): DeskMenuItem => ({
        kind: "checkbox",
        id: `stage:${stage}`,
        label: t(viewStageLabelKey(stage)),
        isChecked: stageFilter.includes(stage),
        onSelect: () => onStageFilter(toggleListValue(stageFilter, stage)),
      })),
    );
  }

  if (editors.length > 0) {
    items.push(
      {
        kind: "heading",
        id: "editor",
        label: t("magazine:desk.workbar.field.editor"),
      },
      {
        kind: "radio",
        id: "editor:anyone",
        label: t("magazine:desk.workbar.filter.anyone"),
        isChecked: editorFilter === null,
        onSelect: () => onEditorFilter(null),
      },
      ...editors.map((editor): DeskMenuItem => ({
        kind: "radio",
        id: `editor:${editor.id}`,
        label: editorShortName(editor),
        isChecked: editorFilter === editor.id,
        onSelect: () => onEditorFilter(editor.id),
      })),
    );
  }

  return (
    <DeskMenu
      label={t("magazine:desk.workbar.filter.menuLabel")}
      items={items}
      align="end"
      triggerRef={triggerRef}
      renderTrigger={(triggerProps) => (
        <Button
          {...triggerProps}
          variant="ghost"
          size="sm"
          className={styles.menuTrigger}
          aria-label={
            hasActiveFilters
              ? t("magazine:desk.workbar.filter.triggerAria", {
                  count: activeCount,
                })
              : undefined
          }
        >
          <FiFilter aria-hidden />
          <span className={styles.triggerLabel}>
            {t("magazine:desk.workbar.filter.trigger")}
          </span>
          {hasActiveFilters && (
            <span className={styles.countBadge} aria-hidden>
              {formatters.number(activeCount)}
            </span>
          )}
        </Button>
      )}
    />
  );
}
