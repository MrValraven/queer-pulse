import { useId, useRef, type RefObject, type UIEvent } from "react";
import { FiItalic } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import type { SubprofileSkinBlocksEditor } from "./useSubprofileSkinBlocksEditor";
import { QUOTE_LENGTH_GUIDE, visibleQuoteLength } from "./quoteEmphasis";
import { useRefinedPlaceholder } from "./refinedFieldSurface";
import { SkinQuoteMirror } from "./SkinQuoteMirror";
import { SkinRefinedField } from "./SkinRefinedField";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import { useQuoteEmphasis, type QuoteEmphasis } from "./useQuoteEmphasis";
import styles from "./SkinQuoteControl.module.css";

/**
 * The Emphasise action at the right end of the quote's label row. It is
 * always there, so the owner finds it before selecting anything: it rests
 * `aria-disabled` (still focusable, described by the helper that explains
 * it) until words are selected, and reads "Remove emphasis" while the
 * selection already sits in `*...*`. The label carries that state, so the
 * button has no `aria-pressed` (a toggle's name stays fixed when it has one).
 */
function EmphasiseAction({
  emphasis,
  actionRef,
  describedBy,
}: {
  emphasis: QuoteEmphasis;
  actionRef: RefObject<HTMLButtonElement | null>;
  describedBy: string;
}) {
  const { t } = useTranslation();
  const isEnabled = emphasis.isActionEnabled;
  return (
    <button
      ref={actionRef}
      type="button"
      data-tap-target
      data-emphasised={emphasis.isEmphasised || undefined}
      className={styles.action}
      aria-disabled={isEnabled ? undefined : true}
      aria-describedby={describedBy}
      // Keep the textarea's focus and selection on a pointer press.
      onMouseDown={(event) => event.preventDefault()}
      onClick={isEnabled ? emphasis.toggle : undefined}
      onBlur={emphasis.onActionBlur}
    >
      <FiItalic aria-hidden focusable="false" className={styles.actionIcon} />
      {emphasis.isEmphasised
        ? t("subprofiles:skinControl.quote.removeEmphasis")
        : t("subprofiles:skinControl.quote.emphasise")}
    </button>
  );
}

/**
 * The quote (a control with `hasEmphasisPreview`) gets its own writing
 * surface: a serif surface where `*word*` shows as coral italics right in
 * the field. Selecting words enables the Emphasise action in the label row
 * (Cmd/Ctrl+I does the same), which wraps the selection in asterisks or
 * lifts them again. A soft guide under the field asks for one or two lines
 * and turns amber past `QUOTE_LENGTH_GUIDE` characters, announced once as it
 * crosses; it never blocks typing. SkinTextFieldControl renders every other
 * text control.
 */
export function SkinQuoteControl({
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
  const actionRef = useRef<HTMLButtonElement>(null);
  const helperTextId = useId();
  const mirrorRef = useRef<HTMLDivElement>(null);
  const stored = editor.getValue(control.path);
  const value = typeof stored === "string" ? stored : "";
  useAutoGrowFallback(textareaRef, value);
  const placeholder = useRefinedPlaceholder(control.placeholderKey);
  const emphasis = useQuoteEmphasis({
    textareaRef,
    actionRef,
    value,
    onChange: (next) => editor.setValue(control.path, next),
  });

  const isOverGuide = visibleQuoteLength(value) > QUOTE_LENGTH_GUIDE;
  const overGuideText = t("subprofiles:skinControl.quote.lengthOver", {
    limit: QUOTE_LENGTH_GUIDE,
  });
  const followScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    mirror.scrollTop = event.currentTarget.scrollTop;
    mirror.scrollLeft = event.currentTarget.scrollLeft;
  };

  return (
    <SkinRefinedField
      label={t(control.labelKey)}
      isLabelHidden={isLabelHidden}
      helper={
        <span id={helperTextId}>
          {t("subprofiles:skinControl.quote.helper")}
        </span>
      }
      labelAside={
        <EmphasiseAction
          emphasis={emphasis}
          actionRef={actionRef}
          describedBy={helperTextId}
        />
      }
      footer={
        <span className={isOverGuide ? styles.guideOver : undefined}>
          {isOverGuide
            ? overGuideText
            : t("subprofiles:skinControl.quote.lengthGuide")}
        </span>
      }
    >
      {(field) => (
        <div className={styles.writing}>
          <textarea
            ref={textareaRef}
            id={field.controlId}
            rows={2}
            value={value}
            placeholder={placeholder}
            aria-describedby={
              [field.helperId, field.footerId].filter(Boolean).join(" ") ||
              undefined
            }
            className={`${field.textareaClassName} ${styles.type}`}
            onChange={(event) =>
              editor.setValue(control.path, event.target.value)
            }
            onScroll={followScroll}
            {...emphasis.textareaHandlers}
          />
          <SkinQuoteMirror value={value} mirrorRef={mirrorRef} />
          {/* Speaks once when the quote crosses the guide, and stays quiet
              on every other keystroke. */}
          <span className="visuallyHidden" aria-live="polite">
            {isOverGuide ? overGuideText : ""}
          </span>
        </div>
      )}
    </SkinRefinedField>
  );
}
