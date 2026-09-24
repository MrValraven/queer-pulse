import {
  useRef,
  type ClipboardEvent,
  type KeyboardEvent,
  type TextareaHTMLAttributes,
} from "react";
import { FiX } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SpecialtyTone } from "./skins/therapist/therapistView";
import type { TopicLineKey } from "./useTopicLineKeys";
import { useAutoGrowFallback } from "./useAutoGrowTextarea";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** The page's bullet colour for each tone (`BULLET_CLASS` in
 *  TherapistSpecialties.tsx). */
const BULLET_TONE_CLASS: Record<SpecialtyTone, string | undefined> = {
  accent: undefined,
  jade: styles.bulletJade,
  violet: styles.bulletViolet,
};

/** Line breaks from a drop or an unexpected keyboard: a field holds one line,
 *  so they fold into spaces. Enter and paste are caught before this. */
const LINE_BREAKS = /\s*\r?\n\s*/g;

/**
 * A one-row textarea that grows with its text, so a long heading or line
 * wraps the way the page wraps it. `field-sizing: content` does the growing
 * where the browser has it, `useAutoGrowFallback` elsewhere. The focus
 * registry's ref rides along beside the fallback's own.
 */
export function TopicTextarea({
  value,
  fieldRef,
  onChange,
  ...fieldProps
}: Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "onChange" | "rows"
> & {
  value: string;
  fieldRef: (element: HTMLElement | null) => void;
  onChange: (value: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useAutoGrowFallback(textareaRef, value);
  return (
    <textarea
      {...fieldProps}
      ref={(element) => {
        textareaRef.current = element;
        fieldRef(element);
      }}
      rows={1}
      value={value}
      onChange={(event) =>
        onChange(event.target.value.replace(LINE_BREAKS, " "))
      }
    />
  );
}

/**
 * One line of a topic, drawn like the page's bullet: the tone's dot, then a
 * borderless field in the page's list type, then a quiet cross that shows
 * on hover or focus (always on touch screens). The whole row carries the
 * hover wash and the focus ring, dot included. A topic's lone blank line has
 * no cross, since there would be nothing to remove.
 */
export function TherapistTopicLine({
  value,
  lineKey,
  lineNumber,
  topicName,
  tone,
  maxLength,
  placeholder,
  isRemovable,
  hintId,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  onRemove,
}: {
  value: string;
  lineKey: TopicLineKey | undefined;
  lineNumber: number;
  /** The topic's heading, or "Topic 2" while it has none. */
  topicName: string;
  tone: SpecialtyTone;
  maxLength: number;
  /** Only the first line has one. */
  placeholder: string | undefined;
  isRemovable: boolean;
  /** The topic's "Press Enter for a new line" hint, left out on touch. */
  hintId: string | undefined;
  inputRef: (element: HTMLElement | null) => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const lineParams = { index: lineNumber, topic: topicName };
  return (
    <li
      className={[
        styles.line,
        value.trim() === "" && styles.lineEmpty,
        lineKey?.isArriving && styles.arriving,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        className={[styles.bullet, BULLET_TONE_CLASS[tone]]
          .filter(Boolean)
          .join(" ")}
        aria-hidden
      />
      <TopicTextarea
        fieldRef={inputRef}
        className={styles.lineInput}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-label={t("subprofiles:therapistTopics.lineLabel", lineParams)}
        aria-describedby={hintId}
        enterKeyHint="next"
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
      />
      {isRemovable && (
        <button
          type="button"
          className={`${listStyles.toolButton} ${styles.lineRemove}`}
          aria-label={t("subprofiles:therapistTopics.removeLine", lineParams)}
          onClick={onRemove}
        >
          <FiX size={15} aria-hidden />
        </button>
      )}
    </li>
  );
}
