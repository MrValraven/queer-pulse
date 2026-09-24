import { useId } from "react";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";
import { useMediaQuery } from "../../shared/hooks/useMediaQuery";
import { useTranslation } from "../../shared/i18n/useTranslation";
import {
  appendLine,
  lineMaxLength,
  removeLineAt,
  TOPIC_HEADING_MAX_LENGTH,
  topicTone,
} from "./therapistTopics.helpers";
import {
  suggestionIdForHeading,
  therapistTopicSuggestionExampleKey,
} from "./therapistTopicSuggestions.data";
import type { TherapistTopicsEditor } from "./useTherapistTopics";
import { topicFocusKeys } from "./useTopicFocus";
import { useTopicKeyboard } from "./useTopicKeyboard";
import { TherapistTopicLine, TopicTextarea } from "./TherapistTopicLine";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** Move up, move down and remove for one topic: the list controls' tool
 *  buttons, named with the heading. They sit at the right end of the heading
 *  row, or beside "Add a line" where the heading needs the full width. */
function TopicTools({
  editor,
  topicIndex,
  uid,
  name,
}: {
  editor: TherapistTopicsEditor;
  topicIndex: number;
  uid: string;
  name: string;
}) {
  const { t } = useTranslation();
  const { register } = editor.focus;
  return (
    <div className={`${listStyles.tools} ${styles.topicTools}`}>
      <button
        ref={register(topicFocusKeys.moveUp(uid))}
        type="button"
        className={listStyles.toolButton}
        disabled={topicIndex === 0}
        aria-label={t("subprofiles:therapistTopics.moveUp", { name })}
        onClick={() => editor.moveTopic(topicIndex, -1)}
      >
        <FiArrowUp size={15} aria-hidden />
      </button>
      <button
        ref={register(topicFocusKeys.moveDown(uid))}
        type="button"
        className={listStyles.toolButton}
        disabled={topicIndex === editor.topics.length - 1}
        aria-label={t("subprofiles:therapistTopics.moveDown", { name })}
        onClick={() => editor.moveTopic(topicIndex, 1)}
      >
        <FiArrowDown size={15} aria-hidden />
      </button>
      <button
        type="button"
        className={listStyles.toolButton}
        aria-label={t("subprofiles:therapistTopics.removeTopic", { name })}
        onClick={() => editor.removeTopic(topicIndex)}
      >
        <FiTrash2 size={15} aria-hidden />
      </button>
    </div>
  );
}

/**
 * One topic, laid out the way the page shows it: the heading in the page's
 * group-heading type, then its lines behind the topic's bullet colour, then
 * "Add a line" in the bullet column. No box of its own: topics are split by
 * the list's hairline. The Enter hint on the add row shows only while one
 * of this topic's lines has focus, and never on touch, where the key reads
 * "Next". A heading that names a suggestion gives the first line that
 * suggestion's example as its placeholder.
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
  const topic = editor.topics[topicIndex];
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
    const lastIndex = lines.length - 1;
    if (lines[lastIndex]?.trim() === "") {
      editor.focus.focusNow([topicFocusKeys.line(uid, lastIndex)]);
      return;
    }
    editor.applyLineEdit(topicIndex, appendLine(lines));
  };

  return (
    <div
      className={[
        listStyles.row,
        styles.topic,
        topic.isArriving && styles.arriving,
      ]
        .filter(Boolean)
        .join(" ")}
    >
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
      <TopicTools
        editor={editor}
        topicIndex={topicIndex}
        uid={uid}
        name={heading || t("subprofiles:therapistTopics.removeTopicFallback")}
      />
      <ul className={styles.lines}>
        {lines.map((line, lineIndex) => (
          <TherapistTopicLine
            key={lineKeys[lineIndex]?.id ?? lineIndex}
            value={line}
            lineKey={lineKeys[lineIndex]}
            lineNumber={lineIndex + 1}
            topicName={heading || topicLabel}
            tone={tone}
            maxLength={lineMaxLength(lines, lineIndex)}
            placeholder={lineIndex === 0 ? firstLinePlaceholder : undefined}
            isRemovable={!isLoneBlank}
            hintId={isCoarsePointer ? undefined : hintId}
            inputRef={register(topicFocusKeys.line(uid, lineIndex))}
            onChange={(value) => editor.setLine(topicIndex, lineIndex, value)}
            onKeyDown={keyboard.onLineKeyDown(lineIndex)}
            onPaste={keyboard.onLinePaste(lineIndex)}
            onRemove={() =>
              editor.applyLineEdit(topicIndex, removeLineAt(lines, lineIndex))
            }
          />
        ))}
      </ul>
      <div className={styles.lineFooter}>
        <button type="button" className={styles.addLine} onClick={addLine}>
          <FiPlus size={14} aria-hidden />
          {t("subprofiles:therapistTopics.addLine")}
        </button>
        <span id={hintId} className={styles.enterHint} aria-hidden>
          {t("subprofiles:therapistTopics.enterHint")}
        </span>
      </div>
    </div>
  );
}
