import { useId } from "react";
import { FiPlus } from "react-icons/fi";
import { m } from "motion/react";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  appendLine,
  blankLineBlockingEdit,
  lineMaxLength,
  removeLineAt,
  TOPIC_HEADING_MAX_LENGTH,
  topicTone,
} from "./therapistTopics.helpers";
import {
  suggestionIdForHeading,
  therapistTopicSuggestionExampleKey,
} from "./therapistTopicSuggestions.data";
import { topicGripFocusKeys, useGripRowRef } from "./topicGrip";
import { useReorderGlide } from "./useReorderGlide";
import type { TherapistTopicsEditor } from "./useTherapistTopics";
import { topicFocusKeys } from "./useTopicFocus";
import { useTopicKeyboard } from "./useTopicKeyboard";
import { useTopicLineReorder } from "./useTopicLineReorder";
import { MdDragIndicator } from "react-icons/md";
import { SkinListGrip } from "./SkinListParts";
import { TopicTextarea } from "./TherapistTopicLine";
import { TherapistTopicLineRow } from "./TherapistTopicLineRow";
import { TherapistTopicTools } from "./TherapistTopicTools";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/**
 * One topic, laid out the way the page shows it: the heading in the page's
 * group-heading type, then its lines behind the topic's bullet colour, then
 * "Add a line" in the bullet column. No box of its own: topics are split by
 * the list's hairline. The topic and each line carry a grip in a column of
 * their own (a tap on it opens its move menu), and both glide when they
 * move (`useReorderGlide`). The row is drawn here, with `SkinListRow`'s
 * classes, so its glide can follow the move counter. The key hint on the
 * add row shows only while one of this topic's lines has focus; touch gets
 * its own wording, since the key reads "Next" there. A heading that names a
 * suggestion gives the first line that suggestion's example as its
 * placeholder.
 */
export function TherapistTopicBlock({
  editor,
  topicIndex,
}: {
  editor: TherapistTopicsEditor;
  topicIndex: number;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const isCoarsePointer = useMediaQuery("(pointer: coarse)");
  const keyboard = useTopicKeyboard(editor, topicIndex);
  const isDragging = editor.topicDrag.draggingIndex === topicIndex;
  const glide = useReorderGlide(isDragging, editor.moveCount);
  const { listRef: linesListRef, ...lineReorder } = useTopicLineReorder(
    editor,
    topicIndex,
    keyboard.onLineKeyDown,
  );
  const topic = editor.topics[topicIndex];
  const gripFocusKey = topicGripFocusKeys.topic(topic?.uid ?? "");
  const rowRef = useGripRowRef(
    editor.focus.register,
    gripFocusKey,
    styles.topicGrip,
  );
  if (!topic) return null;
  const { uid, lines } = topic;
  const { register } = editor.focus;
  const tone = topicTone(topicIndex);
  const heading = topic.heading.trim();
  const topicLabel = t("subprofiles:therapistTopics.topicLabel", {
    index: topicIndex + 1,
  });
  const lineKeys = editor.lineKeysFor(uid);
  const isLoneBlank = lines.length === 1 && lines[0] === "";
  const suggestionId = suggestionIdForHeading(topic.heading, t);
  const firstLinePlaceholder = t(
    suggestionId
      ? therapistTopicSuggestionExampleKey(suggestionId)
      : "subprofiles:therapistTopics.linePlaceholder",
  );

  const addLine = () => {
    const edit = appendLine(lines);
    const blankIndex = blankLineBlockingEdit(lines, edit);
    if (blankIndex !== null) {
      editor.focus.focusNow([topicFocusKeys.line(uid, blankIndex)]);
      return;
    }
    editor.applyLineEdit(topicIndex, edit);
  };

  return (
    <m.div
      ref={rowRef}
      data-skin-list-row=""
      className={[
        listStyles.row,
        styles.topic,
        topic.isArriving && styles.arriving,
        isDragging && listStyles.rowDragging,
      ]
        .filter(Boolean)
        .join(" ")}
      {...glide}
    >
      <SkinListGrip
        className={styles.topicGrip}
        icon={MdDragIndicator}
        {...editor.topicDrag.gripHandlers(topicIndex)}
        reorder={{
          rowLabel: heading || t("subprofiles:therapistTopics.gripTopicRow"),
          isLabelUnique: Boolean(heading),
          rowNumber: topicIndex + 1,
          rowCount: editor.topics.length,
          onMove: (toIndex) =>
            editor.moveTopicTo(topicIndex, toIndex, [gripFocusKey]),
        }}
      />
      <TopicTextarea
        fieldRef={register(topicFocusKeys.heading(uid))}
        className={styles.headingInput}
        value={topic.heading}
        maxLength={TOPIC_HEADING_MAX_LENGTH}
        placeholder={t("subprofiles:therapistTopics.topicPlaceholder")}
        aria-label={topicLabel}
        aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown"
        enterKeyHint="next"
        onChange={(value) => editor.setHeading(topicIndex, value)}
        onKeyDown={keyboard.onHeadingKeyDown}
        onPaste={keyboard.onHeadingPaste}
      />
      <TherapistTopicTools
        editor={editor}
        topicIndex={topicIndex}
        name={heading || t("subprofiles:therapistTopics.removeTopicFallback")}
      />
      <ul ref={linesListRef} className={styles.lines}>
        {lines.map((line, lineIndex) => (
          <TherapistTopicLineRow
            key={lineKeys[lineIndex]?.id ?? lineIndex}
            value={line}
            lineKey={lineKeys[lineIndex]}
            lineNumber={lineIndex + 1}
            lineCount={lines.length}
            topicName={heading || topicLabel}
            tone={tone}
            maxLength={lineMaxLength(lines, lineIndex)}
            placeholder={lineIndex === 0 ? firstLinePlaceholder : undefined}
            isRemovable={!isLoneBlank}
            isDragging={lineReorder.draggingIndex === lineIndex}
            moveCount={editor.moveCount}
            hintId={hintId}
            register={register}
            inputRef={register(topicFocusKeys.line(uid, lineIndex))}
            onChange={(value) => editor.setLine(topicIndex, lineIndex, value)}
            onKeyDown={lineReorder.onLineKeyDown(lineIndex)}
            onPaste={keyboard.onLinePaste(lineIndex)}
            onRemove={() =>
              editor.applyLineEdit(topicIndex, removeLineAt(lines, lineIndex))
            }
            gripHandlers={lineReorder.gripHandlers(lineIndex)}
            onMove={lineReorder.moveLineTo(lineIndex)}
          />
        ))}
      </ul>
      <div className={styles.lineFooter}>
        <button type="button" className={styles.addLine} onClick={addLine}>
          <FiPlus size={14} aria-hidden />
          {t("subprofiles:therapistTopics.addLine")}
        </button>
        <span id={hintId} className={styles.enterHint} aria-hidden>
          {t(
            isCoarsePointer
              ? "subprofiles:therapistTopics.enterHintTouch"
              : "subprofiles:therapistTopics.enterHint",
          )}
        </span>
      </div>
    </m.div>
  );
}
