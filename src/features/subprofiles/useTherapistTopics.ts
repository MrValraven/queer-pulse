import { useState } from "react";
import type { SubprofileSection } from "./api/subprofiles.api";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import {
  emptyItem,
  moveRow,
  withUid,
  type SubprofileEditorRow,
} from "./subprofileSectionEditorRows";
import {
  descriptionToLines,
  linesToDescription,
  type LineEdit,
} from "./therapistTopics.helpers";
import {
  topicFocusKeys,
  useTopicFocus,
  type TopicCaret,
} from "./useTopicFocus";
import { useTopicLineKeys } from "./useTopicLineKeys";

/** One topic as the control draws it. */
export interface TherapistTopic {
  uid: string;
  heading: string;
  lines: string[];
  /** Added in this session (fades in); topics present at load do not. */
  isArriving: boolean;
}

/**
 * The topic control's model over one section's working rows in the editor
 * context. There is no local copy: every edit writes the rows straight back
 * through `setSectionRows`, and the editor's "Save all" commits them. Rows
 * keep the `emptyItem` shape, so the save graph sees ordinary section items;
 * `isFeatured` is never touched.
 */
export function useTherapistTopics(section: SubprofileSection) {
  const { sectionRows, setSectionRows } = useSubprofileEditorContext();
  const rows = sectionRows[section] ?? [];
  const focus = useTopicFocus();
  const [loadedUids] = useState(() => new Set(rows.map((row) => row._uid)));
  const topics: TherapistTopic[] = rows.map((row) => ({
    uid: row._uid,
    heading: row.title,
    lines: descriptionToLines(row.description),
    isArriving: !loadedUids.has(row._uid),
  }));
  const lineKeys = useTopicLineKeys(
    topics.map((topic) => ({ uid: topic.uid, lineCount: topic.lines.length })),
  );
  const isAtCap = rows.length >= MAX_ITEMS_PER_SECTION;

  const writeRow = (
    topicIndex: number,
    patch: Partial<Pick<SubprofileEditorRow, "title" | "description">>,
  ) =>
    setSectionRows(
      section,
      rows.map((row, index) =>
        index === topicIndex ? { ...row, ...patch } : row,
      ),
    );

  const setHeading = (topicIndex: number, heading: string) =>
    writeRow(topicIndex, { title: heading });

  /** Apply a line edit, keep the line keys in step, and focus its caret
   *  (or `focusKeys` at `caret`). A paste into the heading sets `heading` in
   *  the same write. */
  const applyLineEdit = (
    topicIndex: number,
    edit: LineEdit,
    options: {
      heading?: string;
      focusKeys?: string[];
      caret?: TopicCaret;
    } = {},
  ) => {
    const topic = topics[topicIndex];
    if (!topic) return;
    if (edit.keyChange) lineKeys.applyChange(topic.uid, edit.keyChange);
    focus.requestFocus(
      options.focusKeys ?? [topicFocusKeys.line(topic.uid, edit.focusIndex)],
      options.caret ?? edit.caret,
    );
    writeRow(topicIndex, {
      description: linesToDescription(edit.lines),
      ...(options.heading === undefined ? {} : { title: options.heading }),
    });
  };

  /** A typed change inside one line: no keys move, the caret stays put. */
  const setLine = (topicIndex: number, lineIndex: number, value: string) => {
    const lines = [...(topics[topicIndex]?.lines ?? [])];
    lines[lineIndex] = value;
    writeRow(topicIndex, { description: linesToDescription(lines) });
  };

  /** Append a topic. With a heading (a suggestion) its first line takes
   *  focus; without one, its heading does. */
  const addTopic = (heading = "") => {
    if (isAtCap) return;
    const row = withUid({ ...emptyItem(section), title: heading });
    focus.requestFocus([
      heading === ""
        ? topicFocusKeys.heading(row._uid)
        : topicFocusKeys.line(row._uid, 0),
    ]);
    setSectionRows(section, [...rows, row]);
  };

  /** Remove a topic. Focus moves to the next topic's heading, else the
   *  previous one's, else "Add a topic". No confirm: "Discard all" restores. */
  const removeTopic = (topicIndex: number) => {
    const neighbours = [topics[topicIndex + 1], topics[topicIndex - 1]];
    focus.requestFocus([
      ...neighbours.flatMap((topic) =>
        topic ? [topicFocusKeys.heading(topic.uid)] : [],
      ),
      topicFocusKeys.addTopic,
    ]);
    setSectionRows(
      section,
      rows.filter((_, index) => index !== topicIndex),
    );
  };

  /** Swap a topic with its neighbour. Focus rides along: on the heading for
   *  Alt+arrow, else on the pressed arrow, or the other one once the block
   *  reaches an end. */
  const moveTopic = (
    topicIndex: number,
    direction: -1 | 1,
    focusTarget: "arrow" | "heading" = "arrow",
  ) => {
    const topic = topics[topicIndex];
    const neighbour = topics[topicIndex + direction];
    if (!topic || !neighbour) return;
    const pressed = direction < 0 ? "moveUp" : "moveDown";
    const other = direction < 0 ? "moveDown" : "moveUp";
    focus.requestFocus(
      focusTarget === "heading"
        ? [topicFocusKeys.heading(topic.uid)]
        : [
            topicFocusKeys[pressed](topic.uid),
            topicFocusKeys[other](topic.uid),
          ],
    );
    setSectionRows(section, moveRow(rows, topic.uid, direction));
  };

  return {
    topics,
    isAtCap,
    lineKeysFor: lineKeys.keysFor,
    focus,
    setHeading,
    setLine,
    applyLineEdit,
    addTopic,
    removeTopic,
    moveTopic,
  };
}

export type TherapistTopicsEditor = ReturnType<typeof useTherapistTopics>;
