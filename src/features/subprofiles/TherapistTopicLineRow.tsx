import type {
  ClipboardEvent,
  KeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { FiX } from "react-icons/fi";
import { m } from "motion/react";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SpecialtyTone } from "./skins/therapist/therapistView";
import { topicGripFocusKeys, useGripRowRef } from "./topicGrip";
import type { TopicLineKey } from "./useOrderedTopicLineKeys";
import { useReorderGlide } from "./useReorderGlide";
import type { TopicFocus } from "./useTopicFocus";
import { SkinListGrip } from "./SkinListParts";
import { TopicTextarea } from "./TherapistTopicLine";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** The page's bullet colour for each tone (`BULLET_CLASS` in
 *  TherapistSpecialties.tsx). */
const BULLET_TONE_CLASS: Record<SpecialtyTone, string | undefined> = {
  accent: undefined,
  jade: styles.bulletJade,
  violet: styles.bulletViolet,
};

/**
 * One line of a topic, drawn like the page's bullet: a grip, the tone's dot,
 * then a borderless field in the page's list type, then a quiet cross. The
 * grip rests faint and the cross hidden, and both come up on hover or focus
 * (always full on touch screens). The whole row carries the hover wash and
 * the focus ring, dot included. A topic's lone blank line has no cross,
 * since there would be nothing to remove.
 *
 * The grip drags the line, and a tap on it opens its move menu. A move
 * glides the lines into their new slots (`useReorderGlide`).
 */
export function TherapistTopicLineRow({
  value,
  lineKey,
  lineNumber,
  lineCount,
  topicName,
  tone,
  maxLength,
  placeholder,
  isRemovable,
  isDragging,
  moveCount,
  hintId,
  register,
  inputRef,
  onChange,
  onKeyDown,
  onPaste,
  onRemove,
  gripHandlers,
  onMove,
}: {
  value: string;
  lineKey: TopicLineKey | undefined;
  lineNumber: number;
  lineCount: number;
  /** The topic's heading, or "Topic 2" while it has none. */
  topicName: string;
  tone: SpecialtyTone;
  maxLength: number;
  /** Only the first line has one. */
  placeholder: string | undefined;
  isRemovable: boolean;
  isDragging: boolean;
  /** The editor's move counter: rows glide only when it changes. */
  moveCount: number;
  /** The topic's key hint ("Enter adds a line..."). */
  hintId: string;
  register: TopicFocus["register"];
  inputRef: (element: HTMLElement | null) => void;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
  onRemove: () => void;
  gripHandlers: { onPointerDown: (event: ReactPointerEvent) => void };
  /** Moves this line to a 0-based slot (the grip's menu). */
  onMove: (toIndex: number) => void;
}) {
  const { t } = useTranslation();
  const glide = useReorderGlide(isDragging, moveCount);
  const lineParams = { index: lineNumber, topic: topicName };
  const rowRef = useGripRowRef(
    register,
    lineKey ? topicGripFocusKeys.line(lineKey.id) : undefined,
    styles.lineGrip,
  );
  return (
    <m.li
      ref={rowRef}
      className={[
        styles.line,
        value.trim() === "" && styles.lineEmpty,
        lineKey?.isArriving && styles.arriving,
        isDragging && listStyles.rowDragging,
        isDragging && styles.lineDragging,
      ]
        .filter(Boolean)
        .join(" ")}
      {...glide}
    >
      <SkinListGrip
        className={styles.lineGrip}
        {...gripHandlers}
        reorder={{
          rowLabel: t("subprofiles:therapistTopics.gripLineRow", {
            topic: topicName,
          }),
          rowNumber: lineNumber,
          rowCount: lineCount,
          onMove,
        }}
      />
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
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
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
    </m.li>
  );
}
