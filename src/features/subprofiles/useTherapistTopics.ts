import { useState } from "react";
import type { SubprofileSection } from "./api/subprofiles.api";
import { useSubprofileEditorContext } from "./subprofileEditorContext";
import { MAX_ITEMS_PER_SECTION } from "./subprofileEditor.data";
import {
  emptyItem,
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
import { useOrderedTopicLineKeys } from "./useOrderedTopicLineKeys";
import { useTopicReorder } from "./useTopicReorder";

/** One topic as the control draws it. */
export interface TherapistTopic {
  uid: string;
  heading: string;
  lines: string[];
  /** Added in this session and not yet moved (fades in); topics present at
   *  load do not. */
  isArriving: boolean;
}

/**
 * The topic control's model over one section's working rows in the editor
 * context. There is no local copy: every edit writes the rows straight back
 * through `setSectionRows`, and the editor's "Save all" commits them. Rows
 * keep the `emptyItem` shape, so the save graph sees ordinary section items;
 * `isFeatured` is never touched. Order is array order (see `useTopicReorder`).
 */
export function useTherapistTopics(section: SubprofileSection) {
  const { sectionRows, setSectionRows } = useSubprofileEditorContext();
  const rows = sectionRows[section] ?? [];
  const focus = useTopicFocus();
  const [settledUids, setSettledUids] = useState(
    () => new Set(rows.map((row) => row._uid)),
  );
  const topics: TherapistTopic[] = rows.map((row) => ({
    uid: row._uid,
    heading: row.title,
    lines: descriptionToLines(row.description),
    isArriving: !settledUids.has(row._uid),
  }));
  const lineKeys = useOrderedTopicLineKeys(
    topics.map((topic) => ({ uid: topic.uid, lineCount: topic.lines.length })),
  );
  const reorder = useTopicReorder({
    rows,
    writeRows: (next) => setSectionRows(section, next),
    moveLineKeys: lineKeys.move,
    settleTopics: (uids) => {
      setSettledUids((previous) => new Set([...previous, ...uids]));
      lineKeys.settleTopics(uids);
    },
  });
  const isAtCap = rows.length >= MAX_ITEMS_PER_SECTION;

  const writeRow = (
    topicIndex: number,
    patch: Partial<Pick<SubprofileEditorRow, "title" | "description">>,
  ) =>
    reorder.commitRows(
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
    reorder.commitRows([...rows, row]);
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
    reorder.commitRows(rows.filter((_, index) => index !== topicIndex));
  };

  /** Swap a topic with its neighbour (Alt+arrow from its heading). The
   *  heading keeps focus and its caret across the move. */
  const moveTopic = (topicIndex: number, direction: -1 | 1) => {
    if (!topics[topicIndex] || !topics[topicIndex + direction]) return;
    reorder.moveTopicTo(topicIndex, topicIndex + direction);
  };

  /** Move a topic to any slot (its grip's move menu), handing focus to
   *  `focusKeys` once it lands. */
  const moveTopicTo = (from: number, to: number, focusKeys: string[]) => {
    if (from === to || !topics[to]) return;
    focus.requestFocus(focusKeys);
    reorder.moveTopicTo(from, to);
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
    moveTopicTo,
    moveLine: reorder.moveLine,
    moveCount: reorder.moveCount,
    topicDrag: reorder.topicDrag,
    topicListRef: reorder.topicListRef,
  };
}

/** What the topic blocks get. The list ref stays with the control, which
 *  destructures it off before rendering (the React compiler lint reads an
 *  object holding a ref as a ref). */
export type TherapistTopicsEditor = Omit<
  ReturnType<typeof useTherapistTopics>,
  "topicListRef"
>;
