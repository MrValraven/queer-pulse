import type { ReactNode } from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { SkinBlockControl } from "./skinBlockFields.data";
import { SkinRefinedField } from "./SkinRefinedField";
import { unpickedSuggestionIds } from "./therapistTopicSuggestions.data";
import { useTherapistTopics } from "./useTherapistTopics";
import { topicFocusKeys } from "./useTopicFocus";
import { TherapistTopicBlock } from "./TherapistTopicBlock";
import { TherapistTopicSuggestions } from "./TherapistTopicSuggestions";
import editorStyles from "./SubprofileEditor.module.css";
import listStyles from "./SkinListControls.module.css";
import styles from "./TherapistTopicsControl.module.css";

/** The control's group in the chapter field frame, named by its label (kept
 *  for assistive tech when the card heading already says it) and described
 *  by its helper. */
function TopicsFrame({
  control,
  isLabelHidden,
  children,
}: {
  control: SkinBlockControl;
  isLabelHidden: boolean;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const label = t(control.labelKey);
  const helper = control.helperKey ? t(control.helperKey) : undefined;

  return (
    <SkinRefinedField
      label={label}
      isLabelHidden={isLabelHidden}
      labelMode="span"
      helper={helper}
      helperTone={control.helperTone}
    >
      {(field) => (
        <div
          className={`${styles.control} ${styles.refined}`}
          role="group"
          aria-labelledby={field.labelId}
          aria-describedby={field.describedBy}
        >
          {children}
        </div>
      )}
    </SkinRefinedField>
  );
}

/** Starter topics stay on offer until a therapist has this many. */
const SUGGESTIONS_TOPIC_LIMIT = 4;

/** Once a topic exists, "More ideas" offers only this many, so the row stays
 *  a quiet nudge under the list. The empty state shows them all. */
const MORE_IDEAS_LIMIT = 4;

/**
 * "What you help with" for a therapist: the persona's `control.section` items
 * edited in place, drawn the way the page shows them. Each topic is a heading
 * over bulleted lines; the item's `title` is the heading and its
 * `description` the lines, one per line break. Rows live in the editor
 * context and save with the editor's "Save all", so there is no save button
 * here. Typing flows like a short document (see `useTopicKeyboard`).
 * Topics and the lines inside each reorder by a grip (drag it, or tap it
 * for a move menu), by Alt with an arrow key from their fields, or (topics)
 * by the arrow buttons, and glide into place (see `useTopicReorder`).
 *
 * The inputs mirror the page. The frame (label and helper), the heading
 * underline and the suggestion chips share the chapter fields' look.
 */
export function TherapistTopicsControl({
  control,
  isLabelHidden,
}: {
  control: SkinBlockControl;
  isLabelHidden: boolean;
}) {
  const { t } = useTranslation();
  // `section` is set on every `sectionItems` control; the page reads its
  // topics from "specialisms", so that is the fallback.
  const { topicListRef, ...editor } = useTherapistTopics(
    control.section ?? "specialisms",
  );
  const { topics, isAtCap } = editor;
  const isEmpty = topics.length === 0;
  const unpickedIds =
    topics.length < SUGGESTIONS_TOPIC_LIMIT
      ? unpickedSuggestionIds(
          topics.map((topic) => topic.heading),
          t,
        )
      : [];
  const suggestionIds = isEmpty
    ? unpickedIds
    : unpickedIds.slice(0, MORE_IDEAS_LIMIT);

  return (
    <TopicsFrame control={control} isLabelHidden={isLabelHidden}>
      {isEmpty ? (
        <p className={styles.emptyLead}>
          {t("subprofiles:therapistTopics.emptyLead")}
        </p>
      ) : (
        // Wraps only the topics: the topic drag's swap math reads its
        // children, so nothing else may sit in here.
        <div className={listStyles.rows} ref={topicListRef}>
          {topics.map((topic, topicIndex) => (
            <TherapistTopicBlock
              key={topic.uid}
              editor={editor}
              topicIndex={topicIndex}
            />
          ))}
        </div>
      )}
      <Button
        ref={editor.focus.register(topicFocusKeys.addTopic)}
        variant="ghost"
        size="sm"
        className={`${listStyles.addButton} ${styles.addTopic}`}
        disabled={isAtCap}
        onClick={() => editor.addTopic()}
      >
        <FiPlus size={15} aria-hidden />
        {t("subprofiles:therapistTopics.addTopic")}
      </Button>
      {suggestionIds.length > 0 && (
        <TherapistTopicSuggestions
          suggestionIds={suggestionIds}
          leadKey={
            isEmpty
              ? "subprofiles:therapistTopics.suggestionsLead"
              : "subprofiles:therapistTopics.moreSuggestionsLead"
          }
          isDisabled={isAtCap}
          onPick={editor.addTopic}
        />
      )}
      {isAtCap && (
        <p className={`${editorStyles.capHint} ${styles.capHint}`}>
          {t("subprofiles:therapistTopics.capHint")}
        </p>
      )}
    </TopicsFrame>
  );
}
