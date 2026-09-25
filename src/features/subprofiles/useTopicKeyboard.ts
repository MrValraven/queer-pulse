import type { ClipboardEvent, KeyboardEvent } from "react";
import {
  blankLineBlockingEdit,
  hasLineBreak,
  isBlankLine,
  mergeWithPrevious,
  pasteIntoLine,
  pasteUnderHeading,
  removeLineAt,
  splitLineAt,
  splitPastedLines,
  TOPIC_HEADING_MAX_LENGTH,
} from "./therapistTopics.helpers";
import type { TherapistTopicsEditor } from "./useTherapistTopics";
import { topicFocusKeys } from "./useTopicFocus";

type FieldKeyEvent = KeyboardEvent<HTMLTextAreaElement>;
type FieldPasteEvent = ClipboardEvent<HTMLTextAreaElement>;

/** The caret or selection of the field an event came from. */
function selectionOf(field: HTMLTextAreaElement) {
  const start = field.selectionStart ?? field.value.length;
  return { start, end: field.selectionEnd ?? start };
}

const hasModifier = (event: FieldKeyEvent) =>
  event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

/** Enter or Shift+Enter: the keys that open the next line. */
const isLineEnter = (event: FieldKeyEvent) =>
  event.key === "Enter" && !event.altKey && !event.ctrlKey && !event.metaKey;

/** Whether a vertical arrow leaves the field: with the caret at its start
 *  (up) or end (down), or anywhere while its text fits on one visual line.
 *  Otherwise the browser moves the caret through the wrapped text. */
function canLeaveField(field: HTMLTextAreaElement, direction: "up" | "down") {
  const { start, end } = selectionOf(field);
  if (start !== end) return false;
  if (direction === "up" ? start === 0 : end === field.value.length) {
    return true;
  }
  const style = getComputedStyle(field);
  const textHeight =
    field.scrollHeight -
    parseFloat(style.paddingTop) -
    parseFloat(style.paddingBottom);
  return textHeight < parseFloat(style.lineHeight) * 1.5;
}

/**
 * Keyboard and paste for one topic, so its heading and lines read as one
 * short document: Enter opens the next line (splitting at the caret, or
 * going to the topic's blank line when it already has one), Enter
 * on an empty last line moves on to "Add a topic", Backspace at the start of
 * a line joins it to the line above (or leaves an empty first line for the
 * heading), the vertical arrows walk from line to line across topics once
 * the caret reaches a field's edge, Alt+arrow on a heading moves the topic,
 * and multi-line paste becomes lines. The fields are textareas that wrap, so
 * every Enter is caught here and a line break never enters one.
 */
export function useTopicKeyboard(
  editor: TherapistTopicsEditor,
  topicIndex: number,
) {
  const { topics, focus } = editor;
  const topic = topics[topicIndex];
  const lines = topic?.lines ?? [];
  const uid = topic?.uid ?? "";
  const previousTopic = topics[topicIndex - 1];
  const nextTopic = topics[topicIndex + 1];
  const headingKey = topicFocusKeys.heading(uid);
  const lineKey = (lineIndex: number) => topicFocusKeys.line(uid, lineIndex);

  const onHeadingKeyDown = (event: FieldKeyEvent) => {
    if (event.nativeEvent.isComposing) return;
    const isPlainKey = !hasModifier(event);
    const isAltArrow =
      event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown");
    if (isAltArrow) {
      event.preventDefault();
      editor.moveTopic(topicIndex, event.key === "ArrowUp" ? -1 : 1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (isLineEnter(event)) focus.focusNow([lineKey(0)]);
    } else if (
      isPlainKey &&
      event.key === "ArrowDown" &&
      canLeaveField(event.currentTarget, "down")
    ) {
      event.preventDefault();
      focus.focusNow([lineKey(0)], "start");
    } else if (
      isPlainKey &&
      event.key === "ArrowUp" &&
      previousTopic &&
      canLeaveField(event.currentTarget, "up")
    ) {
      event.preventDefault();
      focus.focusNow([
        topicFocusKeys.line(previousTopic.uid, previousTopic.lines.length - 1),
      ]);
    }
  };

  const onHeadingPaste = (event: FieldPasteEvent) => {
    const text = event.clipboardData.getData("text/plain");
    if (!hasLineBreak(text)) return;
    event.preventDefault();
    const [firstPiece = "", ...restPieces] = splitPastedLines(text);
    const { value } = event.currentTarget;
    const { start, end } = selectionOf(event.currentTarget);
    const heading = (
      value.slice(0, start) +
      firstPiece +
      value.slice(end)
    ).slice(0, TOPIC_HEADING_MAX_LENGTH);
    if (restPieces.length === 0) {
      focus.requestFocus([headingKey], start + firstPiece.length);
      editor.setHeading(topicIndex, heading);
      return;
    }
    editor.applyLineEdit(topicIndex, pasteUnderHeading(lines, restPieces), {
      heading,
    });
  };

  const onEnter = (lineIndex: number, field: HTMLTextAreaElement) => {
    const isLastLine = lineIndex === lines.length - 1;
    if (!isLastLine || !isBlankLine(field.value)) {
      const { start, end } = selectionOf(field);
      const edit = splitLineAt(lines, lineIndex, start, end);
      const blankIndex = blankLineBlockingEdit(lines, edit);
      if (blankIndex !== null) {
        focus.focusNow([lineKey(blankIndex)]);
        return;
      }
      editor.applyLineEdit(topicIndex, edit);
      return;
    }
    // An empty last line: Enter moves on to "Add a topic" and the blank line
    // goes, unless it is the topic's only line. At the cap "Add a topic" is
    // disabled, so the next topic's heading takes focus, else the line above.
    const onwardKeys = [
      topicFocusKeys.addTopic,
      ...(nextTopic ? [topicFocusKeys.heading(nextTopic.uid)] : []),
    ];
    if (lines.length === 1) {
      focus.focusNow(onwardKeys);
      return;
    }
    editor.applyLineEdit(topicIndex, removeLineAt(lines, lineIndex), {
      focusKeys: [...onwardKeys, lineKey(lineIndex - 1)],
    });
  };

  const onBackspace = (lineIndex: number, event: FieldKeyEvent) => {
    const field = event.currentTarget;
    const { start, end } = selectionOf(field);
    if (start !== 0 || end !== 0) return;
    if (field.value === "" && lineIndex === 0) {
      event.preventDefault();
      if (lines.length === 1) {
        focus.focusNow([headingKey]);
        return;
      }
      editor.applyLineEdit(topicIndex, removeLineAt(lines, 0), {
        focusKeys: [headingKey],
        caret: "end",
      });
    } else if (lineIndex > 0) {
      event.preventDefault();
      editor.applyLineEdit(topicIndex, mergeWithPrevious(lines, lineIndex));
    }
  };

  const onLineKeyDown = (lineIndex: number) => (event: FieldKeyEvent) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter") {
      event.preventDefault();
      if (isLineEnter(event)) onEnter(lineIndex, event.currentTarget);
      return;
    }
    if (event.key === "Backspace" && !hasModifier(event)) {
      onBackspace(lineIndex, event);
      return;
    }
    if (hasModifier(event)) return;
    if (event.key === "ArrowUp") {
      if (!canLeaveField(event.currentTarget, "up")) return;
      event.preventDefault();
      focus.focusNow([lineIndex > 0 ? lineKey(lineIndex - 1) : headingKey]);
    } else if (
      event.key === "ArrowDown" &&
      canLeaveField(event.currentTarget, "down")
    ) {
      const isLastLine = lineIndex === lines.length - 1;
      const target = !isLastLine
        ? lineKey(lineIndex + 1)
        : nextTopic
          ? topicFocusKeys.heading(nextTopic.uid)
          : null;
      if (!target) return;
      event.preventDefault();
      focus.focusNow([target], "start");
    }
  };

  const onLinePaste = (lineIndex: number) => (event: FieldPasteEvent) => {
    const text = event.clipboardData.getData("text/plain");
    if (!hasLineBreak(text)) return;
    event.preventDefault();
    const pieces = splitPastedLines(text);
    if (pieces.length === 0) return;
    const { start, end } = selectionOf(event.currentTarget);
    editor.applyLineEdit(
      topicIndex,
      pasteIntoLine(lines, lineIndex, start, end, pieces),
    );
  };

  return { onHeadingKeyDown, onHeadingPaste, onLineKeyDown, onLinePaste };
}
