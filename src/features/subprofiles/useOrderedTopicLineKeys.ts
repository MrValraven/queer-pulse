import { useCallback, useState } from "react";
import type { LineKeyChange } from "./therapistTopics.helpers";

/** A line's stable React key. `isArriving` marks a line an edit inserted, so
 *  only that one fades in; lines present at load, or grown back by a
 *  reseed, appear at rest. */
export interface TopicLineKey {
  id: string;
  isArriving: boolean;
}

let lineKeySequence = 0;
const makeLineKey = (isArriving: boolean): TopicLineKey => ({
  id: `topic-line-${(lineKeySequence += 1)}`,
  isArriving,
});

const settled = (key: TopicLineKey): TopicLineKey =>
  key.isArriving ? { ...key, isArriving: false } : key;

type KeysByTopic = Record<string, TopicLineKey[]>;

/** Keys for the topics as they are now: kept where the line count still
 *  matches, grown or cut to length where it does not, and dropped for topics
 *  that are gone. The same object back when nothing changed. */
function reconcileKeys(
  stored: KeysByTopic,
  topics: readonly { uid: string; lineCount: number }[],
): KeysByTopic {
  let hasChanged = Object.keys(stored).length !== topics.length;
  const next: KeysByTopic = {};
  for (const { uid, lineCount } of topics) {
    const keys = stored[uid] ?? [];
    if (keys.length === lineCount) {
      next[uid] = keys;
      continue;
    }
    hasChanged = true;
    next[uid] =
      keys.length > lineCount
        ? keys.slice(0, lineCount)
        : [
            ...keys,
            ...Array.from({ length: lineCount - keys.length }, () =>
              makeLineKey(false),
            ),
          ];
  }
  return hasChanged ? next : stored;
}

/**
 * Stable keys for each topic's lines, which are bare strings in the
 * description with no id of their own (the `usePositionalRowKeys` idea, per
 * topic). Keyed by index, a line inserted mid-list would rewrite every input
 * below it and the new-line fade would play on the last one. A reorder moves
 * the key with its line, so the moved line keeps its field (focus, caret,
 * glide). `applyChange`, `move` and `settleTopics` must run beside the
 * matching edit; anything else is reconciled by length.
 */
export function useOrderedTopicLineKeys(
  topics: readonly { uid: string; lineCount: number }[],
) {
  const [storedKeys, setStoredKeys] = useState<KeysByTopic>({});
  // Adjust-while-rendering, so a new topic has its keys on this same paint.
  const keysByTopic = reconcileKeys(storedKeys, topics);
  if (keysByTopic !== storedKeys) setStoredKeys(keysByTopic);

  const applyChange = useCallback((uid: string, change: LineKeyChange) => {
    setStoredKeys((previous) => {
      const next = [...(previous[uid] ?? [])];
      if (change.kind === "insert") {
        const inserted = Array.from({ length: change.count }, () =>
          makeLineKey(true),
        );
        next.splice(change.index, 0, ...inserted);
      } else {
        next.splice(change.index, 1);
      }
      return { ...previous, [uid]: next };
    });
  }, []);

  /** Move a line's key to another slot (a neighbour swap is the one-step
   *  case). Every key from one slot to the other settles: React re-inserts
   *  those rows' DOM nodes, which would otherwise replay their arrival
   *  fade. */
  const move = useCallback((uid: string, from: number, to: number) => {
    setStoredKeys((previous) => {
      const keys = previous[uid] ?? [];
      const movedKey = keys[from];
      if (!movedKey || !keys[to]) return previous;
      const next = keys.filter((_, index) => index !== from);
      next.splice(to, 0, movedKey);
      const lowIndex = Math.min(from, to);
      const highIndex = Math.max(from, to);
      return {
        ...previous,
        [uid]: next.map((key, index) =>
          index >= lowIndex && index <= highIndex ? settled(key) : key,
        ),
      };
    });
  }, []);

  /** Settle every line of these topics. A moved topic's DOM node is
   *  re-inserted with its lines inside, so a line added this session would
   *  replay its fade. */
  const settleTopics = useCallback((uids: readonly string[]) => {
    setStoredKeys((previous) => {
      let next = previous;
      for (const uid of uids) {
        const keys = previous[uid];
        if (!keys?.some((key) => key.isArriving)) continue;
        next = { ...next, [uid]: keys.map(settled) };
      }
      return next;
    });
  }, []);

  const keysFor = (uid: string): TopicLineKey[] => keysByTopic[uid] ?? [];

  return { keysFor, applyChange, move, settleTopics };
}
