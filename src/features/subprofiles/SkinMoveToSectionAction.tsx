import { FiCornerDownRight } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useToast } from "../../shared/components/feedback/useToast";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import { SECTION_META } from "./subprofile-kinds";
import { emptyItem, withUid } from "./subprofileSectionEditorRows";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";

/** The list's non-blank lines, trimmed, split into those the section has
 *  room for and those that stay behind. */
function splitLinesByRoom(stored: unknown, room: number) {
  const lines = Array.isArray(stored)
    ? stored
        .filter((line): line is string => typeof line === "string")
        .map((line) => line.trim())
        .filter((line) => line !== "")
    : [];
  return { moving: lines.slice(0, room), staying: lines.slice(room) };
}

/**
 * "Move to Credentials" on a retired list (`moveToSection`): appends one row
 * per non-blank line to that persona section, titled with the line, then
 * clears the list. Both halves stay pending, so "Save all" commits the pair
 * and "Discard all" undoes it. A section at `MAX_ITEMS_PER_SECTION` takes
 * what fits and the rest stays in the list, and the toast says so. The
 * toast is the polite announcement ("Moved 2 to Credentials."). When every
 * line moves, the list leaves the chapter and `SkinRetiredField` hands focus
 * on. Renders nothing when the loaded persona lacks the section.
 */
export function SkinMoveToSectionAction({
  control,
  editor,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { subprofile, sectionRows, setSectionRows } =
    useSubprofileEditorContext();
  const targetSection = control.moveToSection;
  const hasTargetSection = subprofile.sections.some(
    (candidate) => candidate.section === targetSection,
  );
  if (!targetSection || !hasTargetSection) return null;
  const placeLabel = t(SECTION_META[targetSection].labelKey);

  function moveLines() {
    if (!targetSection) return;
    const existingRows = sectionRows[targetSection] ?? [];
    const room = Math.max(0, MAX_ITEMS_PER_SECTION - existingRows.length);
    const { moving, staying } = splitLinesByRoom(
      editor.getValue(control.path),
      room,
    );
    if (moving.length === 0) {
      showToast(
        t("subprofiles:skinRetired.moveFull", {
          place: placeLabel,
          max: MAX_ITEMS_PER_SECTION,
        }),
        "warning",
      );
      return;
    }
    const movedRows = moving.map((line) =>
      withUid({ ...emptyItem(targetSection), title: line }),
    );
    setSectionRows(targetSection, [...existingRows, ...movedRows]);
    editor.setValue(control.path, staying);
    const movedMessage = t("subprofiles:skinRetired.moved", {
      count: moving.length,
      place: placeLabel,
    });
    const leftMessage =
      staying.length > 0
        ? t("subprofiles:skinRetired.movedLeftOver", {
            count: staying.length,
            place: placeLabel,
          })
        : "";
    showToast([movedMessage, leftMessage].filter(Boolean).join(" "));
  }

  return (
    <Button variant="ghost" size="sm" type="button" onClick={moveLines}>
      <FiCornerDownRight aria-hidden />
      {t("subprofiles:skinRetired.moveTo", { place: placeLabel })}
    </Button>
  );
}
