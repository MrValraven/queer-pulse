import { useRef, type KeyboardEvent, type RefObject } from "react";
import { useAutoGrowTextarea } from "../../../shared/hooks/useAutoGrowTextarea";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import type { ComposeTitleTip } from "./composeChecklist";
import { COMPOSE_KIND_FALLBACK, composeKindById } from "./composeKinds.data";
import { COMPOSE_TITLE_MAX_LENGTH, type PostKind } from "./composeThread.types";
import { ComposeHeightFrame } from "./ComposeHeightFrame";
import { ComposeSwapText } from "./ComposeSwapText";
import styles from "./ComposeTitleField.module.css";

// ── The title, as a serif line rather than a form field ─────────────────────
// A textarea rather than an input, so a long title wraps and grows instead of
// scrolling sideways out of sight, and Enter moves to the body: a thread title
// has no second line, and a newline here would be silently stripped anyway.
//
// Growing happens through `field-sizing: content` where the browser has it,
// and through the shared auto-grow hook where it does not. The hook is only
// switched on in the second case: it sets an explicit `height`, which would
// override the native behaviour it is standing in for.

/** Past this many characters the counter turns accent, so the cap stops being
 *  a surprise. */
const TITLE_COUNTER_WARN_LENGTH = 90;

/**
 * True when this browser sizes a textarea to its own content, so the JS
 * fallback can stay switched off. Read once at module load and guarded for
 * environments with no `CSS` object at all (jsdom, prerender).
 */
const HAS_FIELD_SIZING =
  typeof CSS !== "undefined" &&
  typeof CSS.supports === "function" &&
  CSS.supports("field-sizing", "content");

export interface ComposeTitleFieldProps {
  /** The draft title. */
  title: string;
  /** Wire to `setters.setTitle`, which applies the hard cap itself. */
  onTitleChange: (title: string) => void;
  /** Chooses the placeholder. Null before a kind is picked. */
  kind: PostKind | null;
  /** The live advice under the field, from `useComposeThreadPage`. */
  titleTip: ComposeTitleTip;
  /** Called when Enter is pressed. The page moves focus to the body. */
  onEnterKey?: () => void;
  /** Lets the page focus the title after a starter prompt seeds it. */
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
}

export function ComposeTitleField({
  title,
  onTitleChange,
  kind,
  titleTip,
  onEnterKey,
  textareaRef,
}: ComposeTitleFieldProps) {
  const { t } = useTranslation();
  const internalRef = useRef<HTMLTextAreaElement | null>(null);
  const ref = textareaRef ?? internalRef;
  useAutoGrowTextarea(ref, title, !HAS_FIELD_SIZING);

  const placeholderKey =
    composeKindById(kind)?.titlePlaceholderKey ??
    COMPOSE_KIND_FALLBACK.titlePlaceholderKey;
  const isNearCap = title.length > TITLE_COUNTER_WARN_LENGTH;

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    onEnterKey?.();
  }

  return (
    <div className={styles.titleField}>
      {/* An empty title is sized by its placeholder, which changes with the
          kind and can need a second line, so the frame eases that change.
          Once the member types, a new line lands at once: the first letter
          (length 1) still eases the placeholder's height away. */}
      <ComposeHeightFrame isAnimated={title.length <= 1}>
        <textarea
          ref={ref}
          className={styles.titleInput}
          rows={1}
          value={title}
          // The cap also lives in `setTitle`, so a paste is bounded either way.
          maxLength={COMPOSE_TITLE_MAX_LENGTH}
          placeholder={t(placeholderKey)}
          aria-label={t("forum:composePage.title.ariaLabel")}
          autoComplete="off"
          onKeyDown={handleKeyDown}
          // A pasted newline would leave an unreachable second line behind.
          onChange={(event) =>
            onTitleChange(event.target.value.replace(/\n/g, " "))
          }
        />
      </ComposeHeightFrame>
      <div className={styles.titleRow}>
        <span
          className={[styles.tip, titleTip.isPositive && styles.tipPositive]
            .filter(Boolean)
            .join(" ")}
          aria-live="polite"
        >
          <ComposeSwapText swapKey={titleTip.messageKey ?? ""}>
            {titleTip.messageKey ? t(titleTip.messageKey) : ""}
          </ComposeSwapText>
        </span>
        <span
          className={[styles.counter, isNearCap && styles.counterWarn]
            .filter(Boolean)
            .join(" ")}
        >
          {title.length}/{COMPOSE_TITLE_MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
