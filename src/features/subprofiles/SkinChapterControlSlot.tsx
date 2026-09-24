import { useMemo } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { isControlFilled } from "./skinChapterFill";
import { skinFieldAnchorId } from "./skinFieldAnchor";
import { SkinFieldSlotContext } from "./skinFieldSlotContext";
import type { SkinFieldSlot } from "./skinFieldSlotContext";
import { isControlValueValid } from "./skinTextCheck";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinChapterControl } from "./SkinChapterControl";
import styles from "./SkinChapterEditor.module.css";

/** The "still empty" mark: "(empty)" for screen readers alone. On screen the
 *  card's fill count shows what is left. */
export function EmptyMark() {
  const { t } = useTranslation();
  return (
    <span className="visuallyHidden">{t("subprofiles:skinChapter.empty")}</span>
  );
}

/** One control in its wrapper: the jump target (`skinFieldAnchorId`), the
 *  empty mark before its label (the card heading carries it when the label is
 *  hidden), the slot context the field frame (`SkinRefinedField`) reads its
 *  fill from and, for a `showWhen` control, the fade-in as it appears. */
export function ControlSlot({
  control,
  editor,
  isLabelHidden,
  extraClassName,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  /** The card heading repeats the control's label, so the control drops it. */
  isLabelHidden: boolean;
  extraClassName?: string;
}) {
  const hasValue = isControlFilled(control, editor);
  const isFilled =
    hasValue && isControlValueValid(control, editor.getValue(control.path));
  const slot = useMemo<SkinFieldSlot>(
    () => ({ isFilled, hasValue }),
    [isFilled, hasValue],
  );
  const isMarkedEmpty = !isLabelHidden && !hasValue;
  const className = [
    styles.slot,
    control.showWhen ? styles.revealed : "",
    extraClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div id={skinFieldAnchorId(control.path)} className={className}>
      {isMarkedEmpty && <EmptyMark />}
      <SkinFieldSlotContext.Provider value={slot}>
        <SkinChapterControl
          control={control}
          editor={editor}
          isLabelHidden={isLabelHidden}
        />
      </SkinFieldSlotContext.Provider>
    </div>
  );
}
