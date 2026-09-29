import {
  ActiveFilters,
  type ActiveFilter,
} from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { DeskFilterMenuProps } from "./DeskFilterMenu";
import {
  DESK_FORMAT_OPTIONS,
  editorShortName,
  optionLabelKey,
} from "./deskWorkbar.data";
import { viewStageLabelKey } from "./stageLabels";
import styles from "./DeskWorkbar.module.css";

export type DeskActiveFiltersProps = Omit<
  DeskFilterMenuProps,
  "sections" | "stages"
> & {
  /** Whether the editor directory (`editors`) is still loading. An editor
   *  filter with no match yet reads as a neutral "Editor" while true, and as
   *  "Former editor" once the directory has settled with no match. */
  isEditorDirectoryLoading?: boolean;
  /** Called when the pressed token (or the whole row) unmounted and took
   *  focus with it; the workbar moves focus to the Filter trigger. */
  onFocusLost?: () => void;
};

/**
 * The Filter menu's state, spelled out under the workbar as removable tokens
 * ("Section: Culture") plus Clear all.
 *
 * The menu's badge only says how many filters are on; these say which, and
 * take one press each to undo. Only the Filter menu's four narrowings appear
 * here. The focus bar's chips are their own on/off state above the table, so
 * repeating them here would say the same fact twice. Renders nothing while no
 * filter is on.
 */
export function DeskActiveFilters({
  format,
  onFormat,
  sectionFilter,
  onSectionFilter,
  stageFilter,
  onStageFilter,
  editors,
  editorFilter,
  onEditorFilter,
  isEditorDirectoryLoading = false,
  onFocusLost,
}: DeskActiveFiltersProps) {
  const { t } = useTranslation();

  // A pressed token removes itself, and Clear all removes the row, so the
  // focused button unmounts and focus would drop to <body>. Once the update
  // has committed, a stranded focus is handed back to the caller.
  const keepFocus = (remove: () => void) => () => {
    remove();
    requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (focused === null || focused === document.body) {
        onFocusLost?.();
      }
    });
  };

  const token = (labelKey: string, value: string) =>
    t("magazine:desk.workbar.token", { label: t(labelKey), value });

  const filters: ActiveFilter[] = [];

  const formatKey = optionLabelKey(DESK_FORMAT_OPTIONS, format);
  if (format !== "all" && formatKey !== undefined) {
    filters.push({
      key: "format",
      label: token("magazine:desk.toolbar.formatAria", t(formatKey)),
      onRemove: keepFocus(() => onFormat("all")),
    });
  }

  for (const section of sectionFilter) {
    filters.push({
      key: `section:${section}`,
      label: token("magazine:desk.workbar.field.section", section),
      onRemove: keepFocus(() =>
        onSectionFilter(sectionFilter.filter((entry) => entry !== section)),
      ),
    });
  }

  for (const stage of stageFilter) {
    filters.push({
      key: `stage:${stage}`,
      label: token(
        "magazine:desk.workbar.field.stage",
        t(viewStageLabelKey(stage)),
      ),
      onRemove: keepFocus(() =>
        onStageFilter(stageFilter.filter((entry) => entry !== stage)),
      ),
    });
  }

  if (editorFilter !== null) {
    const editor = editors.find((candidate) => candidate.id === editorFilter);
    // The directory can still be loading in live mode: the token reads as a
    // neutral "Editor" until it arrives, keeping the raw id out of view.
    // Once loaded with no match, the id names someone who has left (a saved
    // view can still name them), so the token says that plainly.
    const editorLabel = editor
      ? token("magazine:desk.workbar.field.editor", editorShortName(editor))
      : isEditorDirectoryLoading
        ? t("magazine:desk.workbar.field.editor")
        : t("magazine:desk.workbar.field.editorFormer");
    filters.push({
      key: "editor",
      label: editorLabel,
      onRemove: keepFocus(() => onEditorFilter(null)),
    });
  }

  const clearFilters = keepFocus(() => {
    onFormat("all");
    onSectionFilter([]);
    onStageFilter([]);
    onEditorFilter(null);
  });

  return (
    <ActiveFilters
      filters={filters}
      onClearFilters={clearFilters}
      className={styles.activeFilters}
    />
  );
}
