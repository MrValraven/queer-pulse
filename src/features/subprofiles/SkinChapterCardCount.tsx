import type { ReactNode } from "react";
import { FiCheck } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { isControlFilled } from "./skinChapterFill";
import { isControlValueValid } from "./skinTextCheck";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import styles from "./SkinChapterEditor.module.css";

/** A card's quiet fill count: "2 of 5", or a jade "Done" once every visible
 *  control is filled. A value the page drops (an email or link that fails
 *  its check) counts as unfilled, the same rule as the field's fill check.
 *  Plain text beside the heading, read after it: a screen reader hears "2 of
 *  5 filled" from a visually hidden twin, since the bare count says little. */
function SkinChapterCardCount({
  controls,
  editor,
}: {
  controls: SkinBlockControl[];
  editor: SubprofileSkinBlocksEditor;
}) {
  const { t } = useTranslation();
  const total = controls.length;
  const filled = controls.filter(
    (control) =>
      isControlFilled(control, editor) &&
      isControlValueValid(control, editor.getValue(control.path)),
  ).length;

  if (filled >= total) {
    return (
      <span className={`${styles.cardCount} ${styles.cardCountDone}`}>
        <FiCheck size={14} aria-hidden focusable="false" />
        {t("subprofiles:skinChapter.cardDone")}
      </span>
    );
  }
  return (
    <span className={styles.cardCount}>
      <span aria-hidden>
        {t("subprofiles:skinChapter.cardCount", { filled, total })}
      </span>
      <span className="visuallyHidden">
        {t("subprofiles:skinChapter.cardCountSpoken", { filled, total })}
      </span>
    </span>
  );
}

/**
 * The card heading on the left and its fill count on the right, over every
 * visible control folded into the card (a control whose
 * label the heading carries counts too). The row never wraps: the heading
 * flexes and wraps within its own column, and the count stays at the right
 * of the heading's first line, on a narrow phone too.
 */
export function SkinChapterCardHeadingRow({
  heading,
  controls,
  editor,
}: {
  heading: ReactNode;
  controls: SkinBlockControl[];
  editor: SubprofileSkinBlocksEditor;
}) {
  return (
    <div className={styles.cardHeadingRow}>
      {heading}
      <SkinChapterCardCount controls={controls} editor={editor} />
    </div>
  );
}
