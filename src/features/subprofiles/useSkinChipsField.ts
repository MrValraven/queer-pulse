import { useId, useState, type FocusEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { useSkinChipsList } from "./useSkinChipsList";
import { useSkinChipKeyboard } from "./useSkinChipKeyboard";
import { useSkinChipDrag } from "./useSkinChipDrag";

/** Where focus sits inside the field, which picks the visible key hint. */
type FocusZone = "input" | "chip" | "editing" | null;

/**
 * Everything a `chips` control needs apart from its markup: the hint ids,
 * the chip list, keyboard and drag wiring, and the key hint for where focus
 * sits. `SkinChipsRefined` renders it.
 */
export function useSkinChipsField(
  control: SkinBlockControl,
  editor: SubprofileSkinBlocksEditor,
) {
  const { t } = useTranslation();
  const baseId = useId();
  const addHint = t("subprofiles:skinChips.addHint");
  const chipHint = t("subprofiles:skinChips.chipHint");

  const list = useSkinChipsList(control.path, editor);
  const keyboard = useSkinChipKeyboard(list);
  const drag = useSkinChipDrag(
    (from, to) => list.swap(from, to, false),
    (startIndex, endIndex) => {
      const moved = list.entries[endIndex];
      if (startIndex !== endIndex && moved !== undefined) {
        list.announceMoved(moved, endIndex);
      }
    },
  );
  const [focusZone, setFocusZone] = useState<FocusZone>(null);

  // The add input is found by its ref, since its id comes from the field
  // frame's label.
  const onFieldFocus = (event: FocusEvent<HTMLDivElement>) =>
    setFocusZone(
      event.target === keyboard.inputRef.current
        ? "input"
        : event.target instanceof HTMLInputElement
          ? "editing"
          : "chip",
    );
  const onFieldBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
      setFocusZone(null);
    }
  };

  const zoneHints: Record<Exclude<FocusZone, null>, string> = {
    input: addHint,
    chip: chipHint,
    editing: t("subprofiles:skinChips.editHint"),
  };
  const visibleHint = list.notice || (focusZone ? zoneHints[focusZone] : "");

  return {
    ids: {
      addHintId: `${baseId}-add-hint`,
      chipHintId: `${baseId}-chip-hint`,
    },
    label: t(control.labelKey),
    helper: control.helperKey ? t(control.helperKey) : undefined,
    addHint,
    chipHint,
    list,
    keyboard,
    drag,
    onFieldFocus,
    onFieldBlur,
    visibleHint,
  };
}

export type SkinChipsField = ReturnType<typeof useSkinChipsField>;
