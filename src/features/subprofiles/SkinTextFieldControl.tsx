import { useRef, useState, type KeyboardEvent } from "react";
import { FiAlertCircle } from "react-icons/fi";
import { FormField } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { renderEmphasis } from "./skins/therapist/renderEmphasis";
import {
  emailHref,
  websiteHref,
} from "./skins/therapist/therapistContactLinks";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import styles from "./SkinScalarControls.module.css";

const LINE_BREAKS = /\r\n|\r|\n/g;

/** An `isWrapping` field never stores a newline: Enter does nothing (outside
 *  an IME composition), and a pasted line break arrives as a space. */
function blockEnterKey(event: KeyboardEvent<HTMLTextAreaElement>) {
  if (event.key === "Enter" && !event.nativeEvent.isComposing) {
    event.preventDefault();
  }
}

type SkinTextCheck = NonNullable<SkinBlockControl["validate"]>;

/** The public page's own parsers: each returns null for a value it drops. */
const CHECK_PARSER: Record<SkinTextCheck, (value: string) => string | null> = {
  email: emailHref,
  url: websiteHref,
};

const CHECK_MESSAGE_KEY: Record<SkinTextCheck, string> = {
  email: "subprofiles:skinControl.validate.email",
  url: "subprofiles:skinControl.validate.url",
};

/**
 * Warn after blur, never while typing: leaving the field with a value the
 * page would drop shows the warning, and it clears the moment the value
 * becomes valid (or empty). A value reset from outside, such as "Discard
 * all", clears it too, since the check re-runs on every render.
 */
function useBlurCheck(check: SkinTextCheck | undefined, value: string) {
  const [isArmed, setIsArmed] = useState(false);
  const isInvalid = (text: string) =>
    Boolean(check) &&
    text.trim() !== "" &&
    CHECK_PARSER[check as SkinTextCheck](text) === null;

  return {
    isWarningShown: isArmed && isInvalid(value),
    onBlur: () => setIsArmed(isInvalid(value)),
    onEdit: (next: string) => {
      if (isArmed && !isInvalid(next)) setIsArmed(false);
    },
  };
}

/** The amber line under a field whose value the page will leave out. */
function CheckWarning({ check }: { check: SkinTextCheck }) {
  const { t } = useTranslation();
  return (
    <span className={styles.fieldWarning}>
      <FiAlertCircle aria-hidden className={styles.fieldWarningIcon} />
      {t(CHECK_MESSAGE_KEY[check])}
    </span>
  );
}

/**
 * How the text will read on the public page: `*word*` becomes the coral
 * italic of the therapist hero quote. It is hidden from screen readers
 * because the field above already holds the same words, and the field's
 * helper explains the `*word*` syntax.
 */
function EmphasisPreview({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <div className={styles.preview} aria-hidden>
      <p className={styles.previewEyebrow}>
        {t("subprofiles:skinControl.emphasisPreview.eyebrow")}
      </p>
      <p className={styles.previewQuote}>{renderEmphasis(text)}</p>
    </div>
  );
}

/**
 * A `text` or `textarea` control. The textarea grows with its content from
 * three rows. An `isWrapping` text control is a one-row textarea that looks
 * like the single-line input at rest and wraps a long value onto more lines.
 * With `hasEmphasisPreview`, a non-empty value is echoed under the field as
 * the page will show it. With the label hidden (the group heading already
 * says it), the field carries it as its accessible name. With `validate`, a
 * value the page would drop is flagged after blur; the warning rides in the
 * helper slot, so FormField links it to the field through `aria-describedby`.
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

  const isParagraph = control.kind === "textarea";
  const isWrapping = !isParagraph && Boolean(control.isWrapping);
  const label = t(control.labelKey);
  const helperText = control.helperKey ? t(control.helperKey) : undefined;
  const hasHelper = Boolean(helperText) || blurCheck.isWarningShown;
  const onEdit = (next: string) => {
    const cleaned = isWrapping ? next.replace(LINE_BREAKS, " ") : next;
    blurCheck.onEdit(cleaned);
    editor.setValue(control.path, cleaned);
  };
  const sharedProps = {
    value,
    placeholder: control.placeholderKey ? t(control.placeholderKey) : undefined,
    "aria-label": isLabelHidden ? label : undefined,
    "aria-invalid": blurCheck.isWarningShown || undefined,
    onBlur: blurCheck.onBlur,
  };
  const isPreviewShown =
    Boolean(control.hasEmphasisPreview) && value.trim() !== "";

  return (
    <>
      <FormField
        className={styles.textField}
        label={isLabelHidden ? undefined : label}
        helper={
          hasHelper ? (
            <>
              {helperText}
              {blurCheck.isWarningShown && control.validate && (
                <CheckWarning check={control.validate} />
              )}
            </>
          ) : undefined
        }
      >
        {isParagraph || isWrapping ? (
          <textarea
            {...sharedProps}
            ref={textareaRef}
            rows={isWrapping ? 1 : 3}
            className={[
              styles.control,
              isWrapping ? styles.wrapping : styles.autoGrow,
            ]
              .filter(Boolean)
              .join(" ")}
            onKeyDown={isWrapping ? blockEnterKey : undefined}
            onChange={(event) => onEdit(event.target.value)}
          />
        ) : (
          <input
            {...sharedProps}
            className={styles.control}
            onChange={(event) => onEdit(event.target.value)}
          />
        )}
      </FormField>
      {isPreviewShown && <EmphasisPreview text={value} />}
    </>
  );
}
