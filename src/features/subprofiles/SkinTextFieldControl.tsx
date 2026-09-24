import { useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { SkinRefinedTextField } from "./SkinRefinedTextField";
import { isControlValueValid, type SkinTextCheck } from "./skinTextCheck";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";

const LINE_BREAKS = /\r\n|\r|\n/g;

/** An `isWrapping` field never stores a newline: Enter does nothing (outside
 *  an IME composition), and a pasted line break arrives as a space. */
function blockEnterKey(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
    event.preventDefault();
  }
}

const CHECK_MESSAGE_KEY: Record<SkinTextCheck, string> = {
  email: "subprofiles:skinControl.validate.email",
  url: "subprofiles:skinControl.validate.url",
};

/**
 * Warn after blur and stay quiet while typing: leaving the field with a
 * value the page would drop shows the warning, and it clears the moment the
 * value becomes valid (or empty). A value reset from outside, such as "Discard
 * all", clears it too, since the check re-runs on every render.
 */
function useBlurCheck(check: SkinTextCheck | undefined, value: string) {
  const [isArmed, setIsArmed] = useState(false);
  const isInvalid = (text: string) =>
    !isControlValueValid({ validate: check }, text);

  return {
    isWarningShown: isArmed && isInvalid(value),
    onBlur: () => setIsArmed(isInvalid(value)),
    onEdit: (next: string) => {
      if (isArmed && !isInvalid(next)) setIsArmed(false);
    },
  };
}

/**
 * A `text` or `textarea` control. This owns the behaviour and
 * SkinRefinedTextField draws the field. A paragraph grows with its content
 * from three rows. An `isWrapping` text control is a one-row textarea that
 * looks like the single-line input at rest and wraps a long value onto more
 * lines. With the label hidden (the group heading already says it), the
 * field's visually hidden label names it. With `validate`, a value the page
 * would drop is flagged after blur, and the warning under the field reaches
 * it through `aria-describedby`.
 */
export function SkinTextFieldControl({
  control,
  editor,
  isLabelHidden = false,
}: {
  control: SkinBlockControl;
  editor: SubprofileSkinBlocksEditor;
  isLabelHidden?: boolean;
}) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stored = editor.getValue(control.path);
  const value = typeof stored === "string" ? stored : "";
  useAutoGrowFallback(textareaRef, value);
  const blurCheck = useBlurCheck(control.validate, value);

  const isWrapping = control.kind !== "textarea" && Boolean(control.isWrapping);
  const onEdit = (next: string) => {
    const cleaned = isWrapping ? next.replace(LINE_BREAKS, " ") : next;
    blurCheck.onEdit(cleaned);
    editor.setValue(control.path, cleaned);
  };
  const warning =
    blurCheck.isWarningShown && control.validate
      ? t(CHECK_MESSAGE_KEY[control.validate])
      : undefined;

  return (
    <SkinRefinedTextField
      control={control}
      isLabelHidden={isLabelHidden}
      value={value}
      warning={warning}
      textareaRef={textareaRef}
      onBlur={blurCheck.onBlur}
      onKeyDown={blockEnterKey}
      onEdit={onEdit}
    />
  );
}
